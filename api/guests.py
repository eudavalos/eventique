"""
Enterprise Guest Invitation Module for Eventique.

Implements personalized invitation management: creation, token-based public access,
RSVP confirmation, open tracking, CSV import/export, audit logging, and WhatsApp integration.

Router prefix: none (paths are fully qualified under /events/{event_slug}/...)
"""

import csv
import hashlib
import io
import json
import math
import secrets
import urllib.parse
from datetime import datetime
from typing import Optional, Any

import bleach
from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas
from .database import get_db
from .ratelimit import check_rate_limit, get_client_ip
from .settings import get_settings

settings = get_settings()

router = APIRouter(tags=["guests"])

# ── Constants ──────────────────────────────────────────────────────────────────

# Maximum CSV rows processed in a single import
_CSV_IMPORT_MAX_ROWS = 500
# Salt prefix for IP hashing (not a secret — just ensures domain separation)
_IP_HASH_SALT = "eventique-open-"
# Default WhatsApp template (Spanish)
_DEFAULT_WHATSAPP_TEMPLATE = (
    "Hola {display_name} 🎉\n\n"
    "Te invitamos a *{event_name}*.\n"
    "📅 Fecha: {event_date}\n"
    "🎟️ Cupos reservados para ti: {allowed_passes}\n\n"
    "Confirma tu asistencia aquí:\n{invitation_url}\n\n"
    "¡Te esperamos! 💫"
)

# CSV template columns (order matters for the downloadable template)
_CSV_TEMPLATE_COLUMNS = [
    "display_name",
    "contact_name",
    "email",
    "phone",
    "group_name",
    "guest_type",
    "allowed_passes",
    "notes",
    "tags",
]


# ── Token helpers ──────────────────────────────────────────────────────────────


def generate_invitation_token() -> str:
    """Generate a 64-character high-entropy hex token for use in invitation URLs."""
    return secrets.token_hex(32)


def _hash_string(value: str) -> str:
    """One-way hash of an arbitrary string (e.g. IP, user-agent) using SHA-256."""
    return hashlib.sha256((_IP_HASH_SALT + value).encode()).hexdigest()


# ── Auth helper ────────────────────────────────────────────────────────────────


async def _verify_guest_admin(
    event_slug: str,
    authorization: str,
    db: Session,
) -> None:
    """
    Verify that the request carries a valid admin token for the given event.
    Accepts both the global ADMIN_TOKEN and event-specific bcrypt-hashed tokens.
    Raises HTTP 403 on failure.
    """
    import bcrypt as _bcrypt  # local import to avoid circular issues

    raw_token = authorization.removeprefix("Bearer ").strip()
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token de autorización requerido")

    # Global superadmin always passes
    if secrets.compare_digest(raw_token, settings.admin_token):
        return

    event = db.query(models.Event).filter(models.Event.slug == event_slug).first()
    if not event or not event.admin_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso no autorizado")

    try:
        if event.admin_token.startswith("$2"):
            # bcrypt hash
            if _bcrypt.checkpw(raw_token.encode(), event.admin_token.encode()):
                return
        else:
            # Plain-text comparison (legacy or freshly created events)
            if secrets.compare_digest(raw_token, event.admin_token):
                return
    except Exception:
        pass

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token inválido")


# ── Serialization helpers ──────────────────────────────────────────────────────


def _parse_json_field(value: Optional[str], default: Any) -> Any:
    """Safely parse a JSON text field from the DB, returning default on error."""
    if not value:
        return default
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return default


def _sanitize(text: Optional[str], max_length: int = 500) -> Optional[str]:
    """Sanitize user-provided text using bleach and truncate to max_length."""
    if text is None:
        return None
    cleaned = bleach.clean(str(text), tags=[], attributes={}, strip=True)
    return cleaned[:max_length] if len(cleaned) > max_length else cleaned


def _invitation_to_response(
    inv: models.GuestInvitation,
    base_url: Optional[str] = None,
) -> schemas.GuestInvitationResponse:
    """Convert a GuestInvitation ORM object to a GuestInvitationResponse schema."""
    tags = _parse_json_field(inv.tags_json, [])
    flags = _parse_json_field(inv.conditional_flags_json, [])

    url: Optional[str] = None
    if base_url:
        url = f"{base_url.rstrip('/')}/e/{inv.event_slug}/i/{inv.token_lookup}"

    return schemas.GuestInvitationResponse(
        id=inv.id,
        event_slug=inv.event_slug,
        display_name=inv.display_name,
        contact_name=inv.contact_name,
        email=inv.email,
        phone=inv.phone,
        group_name=inv.group_name,
        guest_type=inv.guest_type,
        status=inv.status,
        allowed_passes=inv.allowed_passes,
        confirmed_passes=inv.confirmed_passes,
        declined_passes=inv.declined_passes,
        token_lookup=inv.token_lookup,
        notes=inv.notes,
        tags=tags,
        conditional_flags=flags,
        first_opened_at=inv.first_opened_at,
        last_opened_at=inv.last_opened_at,
        open_count=inv.open_count,
        last_rsvp_at=inv.last_rsvp_at,
        created_at=inv.created_at,
        updated_at=inv.updated_at,
        is_active=inv.is_active,
        blocked_reason=inv.blocked_reason,
        invitation_url=url,
    )


def _get_event_config_dict(event_slug: str, db: Session) -> dict[str, Any]:
    """Return parsed config_json for the given event slug, or empty dict."""
    row = db.query(models.EventConfig).filter(models.EventConfig.event_slug == event_slug).first()
    if row:
        return _parse_json_field(row.config_json, {})
    return {}


def _record_audit(
    db: Session,
    event_slug: str,
    entity_type: str,
    entity_id: int,
    action: str,
    before: Optional[dict] = None,
    after: Optional[dict] = None,
    performed_by_type: str = "admin",
    performed_by_ref: Optional[str] = None,
) -> None:
    """Insert an immutable audit log entry."""
    log = models.InvitationAuditLog(
        event_slug=event_slug,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        before_json=json.dumps(before, default=str) if before else None,
        after_json=json.dumps(after, default=str) if after else None,
        performed_by_type=performed_by_type,
        performed_by_ref=performed_by_ref,
        performed_at=datetime.utcnow(),
    )
    db.add(log)
    # Caller is responsible for db.commit()


def _record_open_event(
    db: Session,
    invitation: models.GuestInvitation,
    request: Request,
    source: Optional[str] = None,
) -> None:
    """
    Record an invitation open event and update tracking counters on the invitation.
    IP and user-agent are hashed before storage — raw values are never persisted.
    """
    now = datetime.utcnow()
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "")

    open_evt = models.InvitationOpenEvent(
        event_slug=invitation.event_slug,
        invitation_id=invitation.id,
        opened_at=now,
        ip_hash=_hash_string(client_ip) if client_ip else None,
        user_agent_hash=_hash_string(user_agent) if user_agent else None,
        source=_sanitize(source, 100),
        metadata_json="{}",
    )
    db.add(open_evt)

    # Update counters on invitation
    invitation.open_count = (invitation.open_count or 0) + 1
    invitation.last_opened_at = now
    if invitation.first_opened_at is None:
        invitation.first_opened_at = now

    # Advance status from pending/sent → opened (if not yet confirmed/declined)
    if invitation.status in ("pending", "sent"):
        invitation.status = "opened"


# ── Public endpoints ───────────────────────────────────────────────────────────


@router.get(
    "/events/{event_slug}/invitations/{token}",
    response_model=schemas.InvitationPublicResponse,
    summary="Obtener invitación personalizada (público)",
)
async def get_invitation_by_token(
    event_slug: str,
    token: str,
    source: Optional[str] = Query(None, max_length=100, description="Canal de apertura: direct|whatsapp|email|qr"),
    request: Request = None,  # type: ignore[assignment]
    db: Session = Depends(get_db),
):
    """
    Public endpoint accessed via the personalized invitation URL.
    Registers the open event and returns full event config + invitation data.
    """
    if settings.rate_limit_enabled:
        check_rate_limit(get_client_ip(request), 30, 60, f"inv-open-{event_slug}")

    inv = (
        db.query(models.GuestInvitation)
        .filter(
            models.GuestInvitation.token_lookup == token,
            models.GuestInvitation.event_slug == event_slug,
        )
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Invitación no encontrada")
    if not inv.is_active:
        raise HTTPException(status_code=403, detail="Esta invitación ha sido desactivada")
    if inv.status == "blocked":
        raise HTTPException(status_code=403, detail="Esta invitación está bloqueada")
    if inv.status == "expired":
        raise HTTPException(status_code=410, detail="Esta invitación ha expirado")

    # Register open event (respects track_invitation_opens config)
    cfg = _get_event_config_dict(event_slug, db)
    if cfg.get("track_invitation_opens", True):
        _record_open_event(db, inv, request, source=source or "direct")

    db.commit()
    db.refresh(inv)

    members = (
        db.query(models.GuestMember)
        .filter(models.GuestMember.invitation_id == inv.id)
        .all()
    )

    # Determine if already responded
    already_responded = inv.status in ("confirmed", "declined", "partial")
    rsvp_status = inv.status if already_responded else None

    invitation_public = schemas.GuestInvitationPublic(
        display_name=inv.display_name,
        allowed_passes=inv.allowed_passes,
        confirmed_passes=inv.confirmed_passes,
        status=inv.status,
        guest_type=inv.guest_type or "general",
        conditional_flags=_parse_json_field(inv.conditional_flags_json, []),
        event_slug=inv.event_slug,
    )

    return schemas.InvitationPublicResponse(
        event_config=cfg,
        invitation=invitation_public,
        members=[schemas.GuestMemberResponse.model_validate(m) for m in members],
        rsvp_status=rsvp_status,
        already_responded=already_responded,
    )


@router.post(
    "/events/{event_slug}/invitations/{token}/rsvp",
    status_code=status.HTTP_201_CREATED,
    summary="Confirmar RSVP personalizado (público)",
)
async def submit_personalized_rsvp(
    event_slug: str,
    token: str,
    data: schemas.PersonalizedRSVPCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Submit RSVP via personalized invitation token.
    Validates pass counts, updates member records, and logs audit entry.
    """
    if settings.rate_limit_enabled:
        check_rate_limit(get_client_ip(request), 5, 60, f"inv-rsvp-{event_slug}")

    inv = (
        db.query(models.GuestInvitation)
        .filter(
            models.GuestInvitation.token_lookup == token,
            models.GuestInvitation.event_slug == event_slug,
        )
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Invitación no encontrada")
    if not inv.is_active:
        raise HTTPException(status_code=403, detail="Esta invitación ha sido desactivada")
    if inv.status in ("blocked", "expired"):
        raise HTTPException(status_code=403, detail="Invitación bloqueada o expirada")

    cfg = _get_event_config_dict(event_slug, db)
    enforce_limit = cfg.get("rsvp_enforce_pass_limit", True)
    allow_self_edit = cfg.get("allow_guest_self_edit", True)

    # If already confirmed and self-edit is disabled, reject
    if inv.status in ("confirmed", "declined", "partial") and not allow_self_edit:
        raise HTTPException(status_code=409, detail="Ya confirmaste tu asistencia. No se permiten cambios.")

    # Validate guest count vs allowed passes
    if data.attending and enforce_limit:
        if data.guest_count > inv.allowed_passes:
            raise HTTPException(
                status_code=422,
                detail=f"El número de asistentes ({data.guest_count}) supera los cupos reservados ({inv.allowed_passes}).",
            )

    now = datetime.utcnow()
    before_snapshot = {
        "status": inv.status,
        "confirmed_passes": inv.confirmed_passes,
        "declined_passes": inv.declined_passes,
    }

    # Update pass counts
    if data.attending:
        inv.confirmed_passes = data.guest_count
        inv.declined_passes = 0
        new_status = "confirmed"
    else:
        inv.confirmed_passes = 0
        inv.declined_passes = inv.allowed_passes
        new_status = "declined"

    # Partial: some attending, some declined
    if data.attending and data.guest_count < inv.allowed_passes:
        inv.declined_passes = inv.allowed_passes - data.guest_count
        new_status = "partial"

    inv.status = new_status
    inv.last_rsvp_at = now

    # Upsert guest members
    if data.members:
        # Remove old members for this invitation
        db.query(models.GuestMember).filter(
            models.GuestMember.invitation_id == inv.id
        ).delete()
        for member_data in data.members[:inv.allowed_passes]:
            member = models.GuestMember(
                event_slug=event_slug,
                invitation_id=inv.id,
                full_name=_sanitize(member_data.full_name, 300) or "—",
                member_type=member_data.member_type or "adult",
                menu_preference=_sanitize(member_data.menu_preference, 200),
                dietary_restrictions=_sanitize(member_data.dietary_restrictions, 500),
                attending=member_data.attending if member_data.attending is not None else data.attending,
                notes=_sanitize(member_data.notes, 500),
                created_at=now,
                updated_at=now,
            )
            db.add(member)

    # Record audit log
    after_snapshot = {
        "status": inv.status,
        "confirmed_passes": inv.confirmed_passes,
        "declined_passes": inv.declined_passes,
        "guest_count": data.guest_count,
        "attending": data.attending,
    }
    _record_audit(
        db,
        event_slug=event_slug,
        entity_type="invitation",
        entity_id=inv.id,
        action="rsvp_submit",
        before=before_snapshot,
        after=after_snapshot,
        performed_by_type="guest",
        performed_by_ref=token[:8] + "...",
    )

    db.commit()
    db.refresh(inv)

    return {
        "ok": True,
        "status": inv.status,
        "confirmed_passes": inv.confirmed_passes,
        "message": "¡Gracias! Tu confirmación fue registrada.",
    }


@router.post(
    "/events/{event_slug}/invitations/{token}/open",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Registrar apertura explícita de invitación (pixel/redirect)",
)
async def register_invitation_open(
    event_slug: str,
    token: str,
    source: Optional[str] = Query(None, max_length=100),
    request: Request = None,  # type: ignore[assignment]
    db: Session = Depends(get_db),
):
    """Explicit open registration (e.g. email pixel or QR redirect)."""
    if settings.rate_limit_enabled:
        check_rate_limit(get_client_ip(request), 20, 60, f"inv-pixel-{event_slug}")

    inv = (
        db.query(models.GuestInvitation)
        .filter(
            models.GuestInvitation.token_lookup == token,
            models.GuestInvitation.event_slug == event_slug,
            models.GuestInvitation.is_active == True,  # noqa: E712
        )
        .first()
    )
    if not inv:
        return  # Silently ignore — don't reveal existence

    cfg = _get_event_config_dict(event_slug, db)
    if cfg.get("track_invitation_opens", True):
        _record_open_event(db, inv, request, source=source or "pixel")
        db.commit()


# ── Admin endpoints ────────────────────────────────────────────────────────────


@router.get(
    "/events/{event_slug}/guests",
    summary="Listar invitados del evento (admin)",
)
async def list_guests(
    event_slug: str,
    status_filter: Optional[str] = Query(None, alias="status", description="Filtrar por status"),
    guest_type: Optional[str] = Query(None, description="Filtrar por tipo: general|family|vip|staff"),
    search: Optional[str] = Query(None, max_length=200, description="Buscar en display_name, contact_name, email"),
    tags: Optional[str] = Query(None, description="Filtrar por tag (comma-separated)"),
    active_only: bool = Query(True, description="Solo mostrar invitaciones activas"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)

    q = db.query(models.GuestInvitation).filter(
        models.GuestInvitation.event_slug == event_slug
    )
    if active_only:
        q = q.filter(models.GuestInvitation.is_active == True)  # noqa: E712
    if status_filter:
        q = q.filter(models.GuestInvitation.status == status_filter)
    if guest_type:
        q = q.filter(models.GuestInvitation.guest_type == guest_type)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (models.GuestInvitation.display_name.ilike(like))
            | (models.GuestInvitation.contact_name.ilike(like))
            | (models.GuestInvitation.email.ilike(like))
        )

    total = q.count()
    pages = max(1, math.ceil(total / limit))
    offset = (page - 1) * limit
    invitations = q.order_by(models.GuestInvitation.created_at.desc()).offset(offset).limit(limit).all()

    base_url = settings.public_base_url
    return {
        "items": [_invitation_to_response(inv, base_url) for inv in invitations],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post(
    "/events/{event_slug}/guests",
    response_model=schemas.GuestInvitationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear invitado personalizado (admin)",
)
async def create_guest(
    event_slug: str,
    data: schemas.GuestInvitationCreate,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)

    # Verify event exists
    event = db.query(models.Event).filter(models.Event.slug == event_slug).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Evento '{event_slug}' no encontrado")

    # Generate unique token (retry on collision, extremely unlikely)
    for _ in range(5):
        token = generate_invitation_token()
        if not db.query(models.GuestInvitation).filter(
            models.GuestInvitation.token_lookup == token
        ).first():
            break
    else:
        raise HTTPException(status_code=500, detail="No se pudo generar un token único. Intenta de nuevo.")

    tags = data.tags or []
    flags = data.conditional_flags or []

    inv = models.GuestInvitation(
        event_slug=event_slug,
        display_name=_sanitize(data.display_name, 300) or data.display_name,
        contact_name=_sanitize(data.contact_name, 300),
        email=data.email,
        phone=_sanitize(data.phone, 50),
        group_name=_sanitize(data.group_name, 200),
        guest_type=data.guest_type or "general",
        status="pending",
        allowed_passes=data.allowed_passes,
        confirmed_passes=0,
        declined_passes=0,
        token_lookup=token,
        notes=_sanitize(data.notes, 2000),
        tags_json=json.dumps(tags),
        conditional_flags_json=json.dumps(flags),
        metadata_json="{}",
        open_count=0,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(inv)
    db.flush()  # get inv.id before commit

    _record_audit(
        db,
        event_slug=event_slug,
        entity_type="invitation",
        entity_id=inv.id,
        action="create",
        after={
            "display_name": inv.display_name,
            "allowed_passes": inv.allowed_passes,
            "guest_type": inv.guest_type,
        },
    )

    db.commit()
    db.refresh(inv)

    return _invitation_to_response(inv, settings.public_base_url)


@router.get(
    "/events/{event_slug}/guests/stats",
    response_model=schemas.GuestStatsResponse,
    summary="Estadísticas de invitados (admin)",
)
async def guest_stats(
    event_slug: str,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)

    q = db.query(models.GuestInvitation).filter(
        models.GuestInvitation.event_slug == event_slug,
        models.GuestInvitation.is_active == True,  # noqa: E712
    )

    all_invitations = q.all()
    total_invitations = len(all_invitations)

    total_passes = sum(i.allowed_passes for i in all_invitations)
    confirmed_passes = sum(i.confirmed_passes for i in all_invitations)
    declined_passes = sum(i.declined_passes for i in all_invitations)
    pending_passes = total_passes - confirmed_passes - declined_passes

    opened = sum(1 for i in all_invitations if i.open_count > 0)
    not_opened = total_invitations - opened

    status_counts: dict[str, int] = {}
    for inv in all_invitations:
        status_counts[inv.status] = status_counts.get(inv.status, 0) + 1

    open_rate = opened / total_invitations if total_invitations else 0.0
    # confirmation_rate = confirmed out of those that have responded
    responded = sum(1 for i in all_invitations if i.status in ("confirmed", "declined", "partial"))
    confirmation_rate = (
        sum(1 for i in all_invitations if i.status in ("confirmed", "partial")) / responded
        if responded else 0.0
    )

    return schemas.GuestStatsResponse(
        total_invitations=total_invitations,
        total_passes=total_passes,
        confirmed_passes=confirmed_passes,
        declined_passes=declined_passes,
        pending_passes=max(0, pending_passes),
        opened=opened,
        not_opened=not_opened,
        status_counts=status_counts,
        open_rate=round(open_rate, 4),
        confirmation_rate=round(confirmation_rate, 4),
    )


@router.get(
    "/events/{event_slug}/guests/export.csv",
    summary="Exportar lista de invitados como CSV (admin)",
)
async def export_guests_csv(
    event_slug: str,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)

    invitations = (
        db.query(models.GuestInvitation)
        .filter(models.GuestInvitation.event_slug == event_slug)
        .order_by(models.GuestInvitation.created_at)
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "id", "display_name", "contact_name", "email", "phone",
        "group_name", "guest_type", "status", "allowed_passes",
        "confirmed_passes", "declined_passes", "open_count",
        "first_opened_at", "last_rsvp_at", "tags", "notes",
        "is_active", "created_at",
    ])

    for inv in invitations:
        tags = _parse_json_field(inv.tags_json, [])
        writer.writerow([
            inv.id,
            inv.display_name,
            inv.contact_name or "",
            inv.email or "",
            inv.phone or "",
            inv.group_name or "",
            inv.guest_type,
            inv.status,
            inv.allowed_passes,
            inv.confirmed_passes,
            inv.declined_passes,
            inv.open_count,
            inv.first_opened_at.isoformat() if inv.first_opened_at else "",
            inv.last_rsvp_at.isoformat() if inv.last_rsvp_at else "",
            ";".join(tags),
            inv.notes or "",
            "1" if inv.is_active else "0",
            inv.created_at.isoformat(),
        ])

    output.seek(0)
    filename = f"invitados_{event_slug}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/events/{event_slug}/guests/template.csv",
    summary="Descargar template CSV vacío para importar invitados (admin)",
)
async def download_csv_template(
    event_slug: str,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(_CSV_TEMPLATE_COLUMNS)
    # Sample row for guidance
    writer.writerow([
        "Familia García",  # display_name
        "Juan García",     # contact_name
        "juan@example.com",  # email
        "+595981234567",   # phone
        "Mesa 1",          # group_name
        "family",          # guest_type
        "3",               # allowed_passes
        "Alergia a nueces",  # notes
        "vip;early-rsvp",  # tags (semicolon-separated)
    ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="template_invitados_{event_slug}.csv"'},
    )


@router.post(
    "/events/{event_slug}/guests/import/preview",
    response_model=schemas.CSVImportPreview,
    summary="Previsualizar importación CSV sin guardar (admin)",
)
async def import_guests_preview(
    event_slug: str,
    file: UploadFile = File(...),
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    """
    Parse the uploaded CSV file and return a preview with validated rows and errors.
    Does NOT save anything to the database.
    """
    await _verify_guest_admin(event_slug, authorization, db)

    raw = await file.read()
    try:
        text_content = raw.decode("utf-8-sig")  # strip BOM if present
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="El archivo CSV debe estar en codificación UTF-8")

    return _parse_csv_import(text_content, max_rows=_CSV_IMPORT_MAX_ROWS)


@router.post(
    "/events/{event_slug}/guests/import/commit",
    status_code=status.HTTP_201_CREATED,
    summary="Confirmar importación CSV y guardar invitados válidos (admin)",
)
async def import_guests_commit(
    event_slug: str,
    payload: dict,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    """
    Receive pre-validated CSV rows as JSON and save them as GuestInvitation records.
    Frontend sends { rows: [...valid_rows from preview...] }.
    Returns count of imported rows.
    """
    await _verify_guest_admin(event_slug, authorization, db)

    event = db.query(models.Event).filter(models.Event.slug == event_slug).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Evento '{event_slug}' no encontrado")

    rows: list[dict] = payload.get("rows", [])
    if not rows:
        raise HTTPException(status_code=400, detail="No hay filas válidas para importar.")

    created = 0
    for row in rows:
        token = generate_invitation_token()
        tags_list: list[str] = []
        if row.get("tags"):
            tags_list = [t.strip() for t in str(row["tags"]).split(";") if t.strip()]

        inv = models.GuestInvitation(
            event_slug=event_slug,
            display_name=row["display_name"],
            contact_name=row.get("contact_name") or None,
            email=row.get("email") or None,
            phone=row.get("phone") or None,
            group_name=row.get("group_name") or None,
            guest_type=row.get("guest_type", "general"),
            status="pending",
            allowed_passes=int(row.get("allowed_passes", 1)),
            confirmed_passes=0,
            declined_passes=0,
            token_lookup=token,
            notes=row.get("notes") or None,
            tags_json=json.dumps(tags_list),
            conditional_flags_json="[]",
            metadata_json="{}",
            open_count=0,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(inv)
        created += 1

    db.commit()

    return {"imported": created, "errors": 0}


@router.get(
    "/events/{event_slug}/guests/{guest_id}",
    response_model=schemas.GuestInvitationResponse,
    summary="Detalle de invitado (admin)",
)
async def get_guest(
    event_slug: str,
    guest_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)
    inv = _get_invitation_or_404(event_slug, guest_id, db)
    return _invitation_to_response(inv, settings.public_base_url)


@router.put(
    "/events/{event_slug}/guests/{guest_id}",
    response_model=schemas.GuestInvitationResponse,
    summary="Actualizar invitado (admin)",
)
async def update_guest(
    event_slug: str,
    guest_id: int,
    data: schemas.GuestInvitationUpdate,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)
    inv = _get_invitation_or_404(event_slug, guest_id, db)

    before_snapshot = {
        "display_name": inv.display_name,
        "allowed_passes": inv.allowed_passes,
        "status": inv.status,
        "guest_type": inv.guest_type,
    }

    if data.display_name is not None:
        inv.display_name = _sanitize(data.display_name, 300) or inv.display_name
    if data.contact_name is not None:
        inv.contact_name = _sanitize(data.contact_name, 300)
    if data.email is not None:
        inv.email = data.email
    if data.phone is not None:
        inv.phone = _sanitize(data.phone, 50)
    if data.group_name is not None:
        inv.group_name = _sanitize(data.group_name, 200)
    if data.guest_type is not None:
        inv.guest_type = data.guest_type
    if data.allowed_passes is not None:
        inv.allowed_passes = data.allowed_passes
    if data.notes is not None:
        inv.notes = _sanitize(data.notes, 2000)
    if data.tags is not None:
        inv.tags_json = json.dumps(data.tags)
    if data.conditional_flags is not None:
        inv.conditional_flags_json = json.dumps(data.conditional_flags)

    inv.updated_at = datetime.utcnow()

    _record_audit(
        db,
        event_slug=event_slug,
        entity_type="invitation",
        entity_id=inv.id,
        action="update",
        before=before_snapshot,
        after={
            "display_name": inv.display_name,
            "allowed_passes": inv.allowed_passes,
            "status": inv.status,
            "guest_type": inv.guest_type,
        },
    )

    db.commit()
    db.refresh(inv)
    return _invitation_to_response(inv, settings.public_base_url)


@router.patch(
    "/events/{event_slug}/guests/{guest_id}/status",
    response_model=schemas.GuestInvitationResponse,
    summary="Cambiar estado de invitación (admin)",
)
async def patch_guest_status(
    event_slug: str,
    guest_id: int,
    payload: dict,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)
    inv = _get_invitation_or_404(event_slug, guest_id, db)

    new_status = payload.get("status", "")
    blocked_reason = payload.get("blocked_reason")

    valid_statuses = {s.value for s in schemas.InvitationStatus}
    if new_status not in valid_statuses:
        raise HTTPException(status_code=422, detail=f"Estado inválido. Valores permitidos: {sorted(valid_statuses)}")

    before_snapshot = {"status": inv.status, "blocked_reason": inv.blocked_reason}

    inv.status = new_status
    if new_status == "blocked" and blocked_reason:
        inv.blocked_reason = _sanitize(blocked_reason, 500)
    elif new_status != "blocked":
        inv.blocked_reason = None

    inv.updated_at = datetime.utcnow()

    _record_audit(
        db,
        event_slug=event_slug,
        entity_type="invitation",
        entity_id=inv.id,
        action="update",
        before=before_snapshot,
        after={"status": inv.status, "blocked_reason": inv.blocked_reason},
    )

    db.commit()
    db.refresh(inv)
    return _invitation_to_response(inv, settings.public_base_url)


@router.delete(
    "/events/{event_slug}/guests/{guest_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Soft-delete de invitado (admin)",
)
async def delete_guest(
    event_slug: str,
    guest_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    """Soft-delete: sets is_active=False. Does not remove from DB."""
    await _verify_guest_admin(event_slug, authorization, db)
    inv = _get_invitation_or_404(event_slug, guest_id, db)

    before_snapshot = {"is_active": inv.is_active, "status": inv.status}
    inv.is_active = False
    inv.updated_at = datetime.utcnow()

    _record_audit(
        db,
        event_slug=event_slug,
        entity_type="invitation",
        entity_id=inv.id,
        action="delete",
        before=before_snapshot,
        after={"is_active": False},
    )

    db.commit()


@router.post(
    "/events/{event_slug}/guests/{guest_id}/regenerate-token",
    response_model=schemas.GuestInvitationResponse,
    summary="Regenerar token de invitación (admin)",
)
async def regenerate_guest_token(
    event_slug: str,
    guest_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    """Generate a new token for the invitation, invalidating the old URL."""
    await _verify_guest_admin(event_slug, authorization, db)
    inv = _get_invitation_or_404(event_slug, guest_id, db)

    old_token_ref = inv.token_lookup[:8] + "..."

    for _ in range(5):
        new_token = generate_invitation_token()
        if not db.query(models.GuestInvitation).filter(
            models.GuestInvitation.token_lookup == new_token
        ).first():
            break
    else:
        raise HTTPException(status_code=500, detail="No se pudo generar un token único.")

    inv.token_lookup = new_token
    inv.updated_at = datetime.utcnow()

    _record_audit(
        db,
        event_slug=event_slug,
        entity_type="invitation",
        entity_id=inv.id,
        action="regenerate_token",
        before={"token_ref": old_token_ref},
        after={"token_ref": new_token[:8] + "..."},
    )

    db.commit()
    db.refresh(inv)
    return _invitation_to_response(inv, settings.public_base_url)


@router.get(
    "/events/{event_slug}/guests/{guest_id}/qr-data",
    summary="Obtener URL de invitación para QR (admin)",
)
async def get_guest_qr_data(
    event_slug: str,
    guest_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)
    inv = _get_invitation_or_404(event_slug, guest_id, db)

    qr_base = settings.public_base_url.rstrip("/")
    invitation_url = f"{qr_base}/e/{event_slug}/i/{inv.token_lookup}"
    return {
        "invitation_url": invitation_url,
        "token": inv.token_lookup,
        "display_name": inv.display_name,
        "event_slug": event_slug,
    }


@router.get(
    "/events/{event_slug}/guests/{guest_id}/audit",
    summary="Historial de auditoría de invitado (admin)",
)
async def get_guest_audit(
    event_slug: str,
    guest_id: int,
    limit: int = Query(50, ge=1, le=200),
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)
    _get_invitation_or_404(event_slug, guest_id, db)  # verify existence

    logs = (
        db.query(models.InvitationAuditLog)
        .filter(
            models.InvitationAuditLog.event_slug == event_slug,
            models.InvitationAuditLog.entity_type == "invitation",
            models.InvitationAuditLog.entity_id == guest_id,
        )
        .order_by(models.InvitationAuditLog.performed_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": log.id,
            "action": log.action,
            "before": _parse_json_field(log.before_json, None),
            "after": _parse_json_field(log.after_json, None),
            "performed_at": log.performed_at.isoformat(),
            "performed_by_type": log.performed_by_type,
            "performed_by_ref": log.performed_by_ref,
        }
        for log in logs
    ]


@router.get(
    "/events/{event_slug}/guests/{guest_id}/whatsapp",
    summary="Generar mensaje WhatsApp para invitado (admin)",
)
async def get_guest_whatsapp(
    event_slug: str,
    guest_id: int,
    base_url: Optional[str] = Query(None, max_length=300, description="Override public base URL for invitation link (use window.location.origin from frontend)"),
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    await _verify_guest_admin(event_slug, authorization, db)
    inv = _get_invitation_or_404(event_slug, guest_id, db)

    cfg = _get_event_config_dict(event_slug, db)
    event = db.query(models.Event).filter(models.Event.slug == event_slug).first()
    event_name = event.name if event else event_slug

    # Read configurable fields from event config
    event_date = cfg.get("event_date", cfg.get("date", ""))
    rsvp_deadline = cfg.get("rsvp_deadline", None)
    template_str = cfg.get("whatsapp_template", _DEFAULT_WHATSAPP_TEMPLATE)

    effective_base = (base_url.rstrip("/") if base_url else settings.public_base_url.rstrip("/"))
    invitation_url = f"{effective_base}/e/{event_slug}/i/{inv.token_lookup}"

    rendered = template_str.format(
        display_name=inv.display_name,
        event_name=event_name,
        event_date=event_date,
        allowed_passes=inv.allowed_passes,
        invitation_url=invitation_url,
        rsvp_deadline=rsvp_deadline or "",
    )

    wa_url = f"https://wa.me/?text={urllib.parse.quote(rendered)}"

    return {
        "message": rendered,
        "url": wa_url,
        "display_name": inv.display_name,
        "event_name": event_name,
        "allowed_passes": inv.allowed_passes,
        "invitation_url": invitation_url,
    }


# ── Internal helpers ───────────────────────────────────────────────────────────


def _get_invitation_or_404(
    event_slug: str,
    guest_id: int,
    db: Session,
) -> models.GuestInvitation:
    """Fetch an active GuestInvitation or raise HTTP 404."""
    inv = (
        db.query(models.GuestInvitation)
        .filter(
            models.GuestInvitation.id == guest_id,
            models.GuestInvitation.event_slug == event_slug,
        )
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Invitado no encontrado")
    return inv


def _parse_csv_import(text_content: str, max_rows: int) -> schemas.CSVImportPreview:
    """
    Parse CSV text and return a CSVImportPreview with valid and error rows.
    Required columns: display_name, allowed_passes.
    """
    valid_guest_types = {g.value for g in schemas.GuestType}
    valid_rows: list[dict[str, Any]] = []
    error_rows: list[dict[str, Any]] = []

    try:
        reader = csv.DictReader(io.StringIO(text_content))
        fieldnames = reader.fieldnames or []
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error al leer CSV: {exc}")

    if "display_name" not in fieldnames:
        raise HTTPException(
            status_code=400,
            detail="El CSV debe contener la columna 'display_name'.",
        )

    for row_num, row in enumerate(reader, start=2):
        if row_num > max_rows + 1:
            error_rows.append({
                "row": row_num,
                "errors": [f"Límite de {max_rows} filas por importación excedido."],
            })
            break

        row_errors: list[str] = []

        display_name = (row.get("display_name") or "").strip()
        if not display_name:
            row_errors.append("'display_name' es obligatorio y no puede estar vacío.")

        allowed_passes_raw = (row.get("allowed_passes") or "1").strip()
        try:
            allowed_passes = int(allowed_passes_raw)
            if allowed_passes < 1 or allowed_passes > 50:
                row_errors.append("'allowed_passes' debe estar entre 1 y 50.")
        except ValueError:
            allowed_passes = 1
            row_errors.append(f"'allowed_passes' debe ser un número entero (recibido: '{allowed_passes_raw}').")

        guest_type = (row.get("guest_type") or "general").strip().lower()
        if guest_type not in valid_guest_types:
            row_errors.append(f"'guest_type' inválido '{guest_type}'. Valores: {sorted(valid_guest_types)}.")
            guest_type = "general"

        if row_errors:
            error_rows.append({"row": row_num, "data": dict(row), "errors": row_errors})
        else:
            valid_rows.append({
                "display_name": _sanitize(display_name, 300),
                "contact_name": _sanitize((row.get("contact_name") or "").strip() or None, 300),
                "email": (row.get("email") or "").strip() or None,
                "phone": _sanitize((row.get("phone") or "").strip() or None, 50),
                "group_name": _sanitize((row.get("group_name") or "").strip() or None, 200),
                "guest_type": guest_type,
                "allowed_passes": allowed_passes,
                "notes": _sanitize((row.get("notes") or "").strip() or None, 2000),
                "tags": (row.get("tags") or "").strip(),
            })

    return schemas.CSVImportPreview(
        valid_rows=valid_rows,
        error_rows=error_rows,
        total=len(valid_rows) + len(error_rows),
        valid_count=len(valid_rows),
        error_count=len(error_rows),
    )
