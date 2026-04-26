import os
import json
import secrets
import shutil
import smtplib
import threading
import uuid
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, status, Query, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, text
import bcrypt
import bleach

from . import models, schemas
from .database import engine, get_db, SessionLocal
from .settings import get_settings
from .ratelimit import check_rate_limit, get_client_ip

# ── Config (from api/settings.py — all env vars centralized) ────────────────

settings = get_settings()

# ── Security helpers ──────────────────────────────────────────────────────────

def hash_token(token: str) -> str:
    """Hash a token using bcrypt."""
    return bcrypt.hashpw(token.encode(), bcrypt.gensalt()).decode()

def verify_token_hash(token: str, token_hash: str) -> bool:
    """Verify a token against its bcrypt hash."""
    try:
        return bcrypt.checkpw(token.encode(), token_hash.encode())
    except (ValueError, TypeError):
        return False

def sanitize_html(text: str, max_length: int = 5000) -> str:
    """Sanitize HTML/script content from user input."""
    if not text or len(text) > max_length:
        return text[:max_length] if text else ""
    tags = bleach.ALLOWED_TAGS
    attrs = bleach.ALLOWED_ATTRIBUTES
    return bleach.clean(text, tags=tags, attributes=attrs, strip=True)

# Legacy variables (for compatibility with existing code)
ADMIN_TOKEN = settings.admin_token
ALLOWED_ORIGINS = settings.allowed_origins if isinstance(settings.allowed_origins, list) else settings.allowed_origins.split(",")
UPLOAD_DIR = Path(settings.upload_dir)
MAX_IMAGE_SIZE = settings.max_image_size_mb * 1024 * 1024
MAX_AUDIO_SIZE = settings.max_audio_size_mb * 1024 * 1024
ALLOWED_IMAGE_TYPES = set(settings.allowed_image_types if isinstance(settings.allowed_image_types, list) else settings.allowed_image_types.split(","))
ALLOWED_AUDIO_TYPES = set(settings.allowed_audio_types if isinstance(settings.allowed_audio_types, list) else settings.allowed_audio_types.split(","))

# Email config
EMAIL_ENABLED = settings.email_enabled
SMTP_HOST = settings.smtp_host
SMTP_PORT = settings.smtp_port
SMTP_USER = settings.smtp_user
SMTP_PASS = settings.smtp_pass
SMTP_FROM = settings.smtp_from

# ── Startup migration ─────────────────────────────────────────────────────────

def run_migrations():
    with engine.connect() as conn:
        # Add event_slug to event_config if missing
        ec_cols = [r[1] for r in conn.execute(text("PRAGMA table_info(event_config)")).fetchall()]
        if ec_cols and "event_slug" not in ec_cols:
            conn.execute(text(
                "ALTER TABLE event_config ADD COLUMN event_slug VARCHAR(100) NOT NULL DEFAULT 'default'"
            ))
            conn.commit()

        # Rebuild rsvps to add event_slug + composite unique (removes global email unique)
        rsvp_cols = [r[1] for r in conn.execute(text("PRAGMA table_info(rsvps)")).fetchall()]
        if rsvp_cols and "event_slug" not in rsvp_cols:
            conn.execute(text("""
                CREATE TABLE rsvps_v2 (
                    id INTEGER NOT NULL PRIMARY KEY,
                    event_slug VARCHAR(100) NOT NULL DEFAULT 'default',
                    name VARCHAR(200) NOT NULL,
                    email VARCHAR(200) NOT NULL,
                    attending BOOLEAN NOT NULL,
                    guest_count INTEGER DEFAULT 1,
                    plus_one_name VARCHAR(200),
                    dietary_restrictions VARCHAR(500),
                    song_request VARCHAR(300),
                    message TEXT,
                    created_at DATETIME,
                    updated_at DATETIME,
                    UNIQUE (email, event_slug)
                )
            """))
            conn.execute(text("""
                INSERT INTO rsvps_v2
                    (id, event_slug, name, email, attending, guest_count,
                     plus_one_name, dietary_restrictions, song_request,
                     message, created_at, updated_at)
                SELECT id, 'default', name, email, attending, guest_count,
                    plus_one_name, dietary_restrictions, song_request,
                    message, created_at, updated_at
                FROM rsvps
            """))
            conn.execute(text("DROP TABLE rsvps"))
            conn.execute(text("ALTER TABLE rsvps_v2 RENAME TO rsvps"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_rsvps_id ON rsvps (id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_rsvps_email ON rsvps (email)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_rsvps_event_slug ON rsvps (event_slug)"))
            conn.commit()

    # Create default event — INSERT OR IGNORE avoids race condition on multi-worker restart
    with engine.connect() as conn:
        conn.execute(text(
            "INSERT OR IGNORE INTO events (slug, name, created_at) "
            "VALUES ('default', 'Evento Principal', datetime('now'))"
        ))
        conn.commit()


# ── Email helpers ─────────────────────────────────────────────────────────────


def _send_email_bg(to: str, subject: str, html: str):
    """Synchronous email sender — call in a daemon thread to avoid blocking."""
    if not EMAIL_ENABLED or not SMTP_USER or not SMTP_PASS:
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM or SMTP_USER
        msg["To"] = to
        msg.attach(MIMEText(html, "html", "utf-8"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as srv:
            srv.starttls()
            srv.login(SMTP_USER, SMTP_PASS)
            srv.sendmail(msg["From"], to, msg.as_string())
    except Exception:
        pass  # Non-blocking: RSVP is already saved


def _rsvp_confirmation_html(name: str, event_name: str, attending: bool) -> str:
    icon = "💚" if attending else "💌"
    msg = ("¡Estamos emocionados de compartir este momento contigo!" if attending
           else "Lamentamos que no puedas estar, pero te tendremos en mente.")
    return f"""<!DOCTYPE html>
<html lang="es">
<body style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#333;">
  <div style="text-align:center;padding:32px;background:#F8FCF6;border-radius:16px;">
    <p style="font-size:2.5rem;margin:0;">{icon}</p>
    <h1 style="font-size:1.4rem;font-weight:normal;color:#3E7B57;margin:12px 0;">¡Gracias, {name}!</h1>
    <p style="margin:8px 0;">Recibimos tu respuesta para <strong>{event_name}</strong>.</p>
    <p style="color:#555;margin:8px 0;">{msg}</p>
  </div>
  <p style="text-align:center;font-size:0.78rem;color:#9ca3af;margin-top:24px;">
    Este correo fue enviado automáticamente · No responder
  </p>
</body>
</html>"""


def _admin_notification_html(rsvp: models.RSVP, event_name: str) -> str:
    status = "✅ Asistirá" if rsvp.attending else "❌ No asistirá"
    guests = f" · {rsvp.guest_count} invitado{'s' if rsvp.guest_count != 1 else ''}" if rsvp.attending else ""
    extras = ""
    if rsvp.dietary_restrictions:
        extras += f"<p><strong>Dieta:</strong> {rsvp.dietary_restrictions}</p>"
    if rsvp.song_request:
        extras += f"<p><strong>Canción:</strong> {rsvp.song_request}</p>"
    if rsvp.message:
        extras += f"<p><strong>Mensaje:</strong> {rsvp.message}</p>"
    return f"""<!DOCTYPE html>
<html lang="es">
<body style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#333;">
  <h2 style="color:#3E7B57;border-bottom:2px solid #3E7B57;padding-bottom:8px;">Nuevo RSVP — {event_name}</h2>
  <p><strong>Nombre:</strong> {rsvp.name}</p>
  <p><strong>Email:</strong> {rsvp.email}</p>
  <p><strong>Respuesta:</strong> {status}{guests}</p>
  {extras}
</body>
</html>"""


def _trigger_rsvp_emails(rsvp: models.RSVP, event: models.Event, db: Session):
    if not EMAIL_ENABLED or not SMTP_USER:
        return
    cfg_row = db.query(models.EventConfig).filter(models.EventConfig.event_slug == event.slug).first()
    cfg = json.loads(cfg_row.config_json) if cfg_row else {}
    threading.Thread(
        target=_send_email_bg,
        args=(rsvp.email, f"Confirmación — {event.name}",
              _rsvp_confirmation_html(rsvp.name, event.name, bool(rsvp.attending))),
        daemon=True,
    ).start()
    if notif_email := cfg.get("notification_email"):
        threading.Thread(
            target=_send_email_bg,
            args=(notif_email, f"Nuevo RSVP: {rsvp.name} — {event.name}",
                  _admin_notification_html(rsvp, event.name)),
            daemon=True,
        ).start()


# ── Startup validation ────────────────────────────────────────────────────────

def _validate_smtp() -> bool:
    """Validate SMTP configuration if email is enabled."""
    if not EMAIL_ENABLED or not SMTP_USER:
        return True  # Email disabled, validation passes
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5) as srv:
            srv.starttls()
            srv.login(SMTP_USER, SMTP_PASS)
        return True
    except Exception as e:
        print(f"⚠️  SMTP validation failed: {type(e).__name__}")
        return False

# ── Lifespan ──────────────────────────────────────────────────────────────────

models.Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Validate SMTP if email is enabled
    if EMAIL_ENABLED and SMTP_USER:
        if _validate_smtp():
            print("✅ Email: SMTP configured and validated")
        else:
            print("⚠️  Email: SMTP validation failed (RSVP will work, emails may not send)")
    else:
        print("ℹ️  Email: SMTP disabled or not configured")

    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Eventique — Event Invitations API",
    version="3.0.0",
    description="API multi-tenant para gestión de invitaciones digitales",
    docs_url="/docs",
    openapi_url="/openapi.json",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# ── Security middleware (custom) ───────────────────────────────────────────────

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

bearer = HTTPBearer(auto_error=False)

# ── Auth ──────────────────────────────────────────────────────────────────────


def verify_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not credentials or not secrets.compare_digest(credentials.credentials, ADMIN_TOKEN):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return True


async def get_event_or_404(event_slug: str, db: Session = Depends(get_db)) -> models.Event:
    event = db.query(models.Event).filter(models.Event.slug == event_slug).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Evento '{event_slug}' no encontrado")
    return event


async def verify_event_admin(
    event: models.Event = Depends(get_event_or_404),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> models.Event:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    token = credentials.credentials
    if secrets.compare_digest(token, ADMIN_TOKEN):
        return event
    if event.admin_token:
        if event.admin_token.startswith("$2"):
            if verify_token_hash(token, event.admin_token):
                return event
        else:
            if secrets.compare_digest(token, event.admin_token):
                return event
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


# ── Helpers ───────────────────────────────────────────────────────────────────


def _upsert_event_config(event_slug: str, payload: dict, db: Session):
    row = db.query(models.EventConfig).filter(models.EventConfig.event_slug == event_slug).first()
    if row:
        row.config_json = json.dumps(payload, ensure_ascii=False)
        row.updated_at = datetime.utcnow()
    else:
        row = models.EventConfig(event_slug=event_slug, config_json=json.dumps(payload, ensure_ascii=False))
        db.add(row)
    db.commit()
    return json.loads(row.config_json)


def _upsert_rsvp(event_slug: str, data: schemas.RSVPCreate, db: Session) -> models.RSVP:
    data_dict = data.model_dump()
    data_dict["name"] = sanitize_html(data_dict.get("name", ""))
    data_dict["plus_one_name"] = sanitize_html(data_dict.get("plus_one_name", ""))
    data_dict["dietary_restrictions"] = sanitize_html(data_dict.get("dietary_restrictions", ""))
    data_dict["song_request"] = sanitize_html(data_dict.get("song_request", ""))
    data_dict["message"] = sanitize_html(data_dict.get("message", ""))

    existing = db.query(models.RSVP).filter(
        models.RSVP.email == data_dict["email"], models.RSVP.event_slug == event_slug
    ).first()
    if existing:
        for key, value in data_dict.items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing
    rsvp = models.RSVP(event_slug=event_slug, **data_dict)
    db.add(rsvp)
    db.commit()
    db.refresh(rsvp)
    return rsvp


def _get_stats(event_slug: str, db: Session) -> dict:
    q = db.query(models.RSVP).filter(models.RSVP.event_slug == event_slug)
    total = q.count()
    attending = q.filter(models.RSVP.attending == True).count()   # noqa: E712
    not_attending = q.filter(models.RSVP.attending == False).count()  # noqa: E712
    total_guests = (
        db.query(func.sum(models.RSVP.guest_count))
        .filter(models.RSVP.event_slug == event_slug, models.RSVP.attending == True)  # noqa: E712
        .scalar() or 0
    )
    return {
        "total_responses": total,
        "attending": attending,
        "not_attending": not_attending,
        "total_guests": total_guests,
    }


def _delete_rsvp_by_id(event_slug: str, rsvp_id: int, db: Session):
    rsvp = db.query(models.RSVP).filter(
        models.RSVP.id == rsvp_id, models.RSVP.event_slug == event_slug
    ).first()
    if not rsvp:
        raise HTTPException(status_code=404, detail="RSVP not found")
    db.delete(rsvp)
    db.commit()


# ── Health ────────────────────────────────────────────────────────────────────


@app.get("/health")
async def health(db: Session = Depends(get_db)):
    health_data = {
        "status": "ok",
        "app": "Eventique API",
        "version": "3.0.0",
        "database": "sqlite",
        "email": {
            "enabled": EMAIL_ENABLED,
            "configured": bool(SMTP_USER and SMTP_PASS),
        }
    }
    # Check database connectivity
    try:
        db.execute(text("SELECT 1"))
        health_data["database"] = "ok"
    except Exception:
        health_data["status"] = "degraded"
        health_data["database"] = "error"

    return health_data


# ── Backward-compat endpoints (alias → default event) ────────────────────────


@app.get("/event-config")
async def get_event_config(db: Session = Depends(get_db)):
    row = db.query(models.EventConfig).filter(models.EventConfig.event_slug == "default").first()
    if not row:
        return {}
    return json.loads(row.config_json)


@app.put("/event-config")
async def update_event_config(
    request: Request,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin),
):
    return _upsert_event_config("default", await request.json(), db)


@app.post("/rsvp", response_model=schemas.RSVPResponse, status_code=status.HTTP_201_CREATED)
async def create_rsvp(request: Request, data: schemas.RSVPCreate, db: Session = Depends(get_db)):
    if settings.rate_limit_enabled:
        check_rate_limit(get_client_ip(request), settings.rate_limit_rsvp_check_per_minute, 60, "rsvp-create")
    return _upsert_rsvp("default", data, db)


@app.get("/rsvp/check", response_model=schemas.CheckResponse)
async def check_email(request: Request, email: str = Query(...), db: Session = Depends(get_db)):
    if settings.rate_limit_enabled:
        check_rate_limit(get_client_ip(request), settings.rate_limit_rsvp_check_per_minute, 60, "rsvp-check")
    existing = db.query(models.RSVP).filter(
        models.RSVP.email == email, models.RSVP.event_slug == "default"
    ).first()
    return {"exists": bool(existing), "attending": existing.attending if existing else None}


@app.get("/rsvp/stats", response_model=schemas.RSVPStats)
async def rsvp_stats(db: Session = Depends(get_db), _: bool = Depends(verify_admin)):
    return _get_stats("default", db)


@app.get("/rsvp", response_model=list[schemas.RSVPResponse])
async def list_rsvps(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin),
):
    return db.query(models.RSVP).filter(models.RSVP.event_slug == "default").offset(skip).limit(limit).all()


@app.delete("/rsvp/{rsvp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rsvp(rsvp_id: int, db: Session = Depends(get_db), _: bool = Depends(verify_admin)):
    _delete_rsvp_by_id("default", rsvp_id, db)


# ── Events CRUD (superadmin: global ADMIN_TOKEN only) ─────────────────────────


@app.get("/events", response_model=list[schemas.EventResponse])
async def list_events(db: Session = Depends(get_db), _: bool = Depends(verify_admin)):
    return db.query(models.Event).order_by(models.Event.created_at).all()


@app.post("/events", response_model=schemas.EventResponse, status_code=201)
async def create_event(
    data: schemas.EventCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin),
):
    if db.query(models.Event).filter(models.Event.slug == data.slug).first():
        raise HTTPException(400, detail="El slug ya existe")
    event = models.Event(slug=data.slug, name=data.name, admin_token=data.admin_token or None)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@app.post("/events/{event_slug}/duplicate", response_model=schemas.EventResponse, status_code=201)
async def duplicate_event(
    request: Request,
    event_slug: str,
    data: schemas.EventCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin),
):
    if settings.rate_limit_enabled:
        check_rate_limit(get_client_ip(request), 2, 60, "event-duplicate")
    source = db.query(models.Event).filter(models.Event.slug == event_slug).first()
    if not source:
        raise HTTPException(404, detail="Evento origen no encontrado")
    if db.query(models.Event).filter(models.Event.slug == data.slug).first():
        raise HTTPException(400, detail="El slug ya existe")
    new_event = models.Event(slug=data.slug, name=data.name, admin_token=data.admin_token or None)
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    src_cfg = db.query(models.EventConfig).filter(models.EventConfig.event_slug == event_slug).first()
    if src_cfg:
        _upsert_event_config(data.slug, json.loads(src_cfg.config_json), db)
    return new_event


@app.delete("/events/{event_slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_slug: str,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin),
):
    if event_slug == "default":
        raise HTTPException(400, detail="No se puede eliminar el evento 'default'")
    event = db.query(models.Event).filter(models.Event.slug == event_slug).first()
    if not event:
        raise HTTPException(404)
    # Cascade: delete RSVPs, configs, and uploaded files
    db.query(models.RSVP).filter(models.RSVP.event_slug == event_slug).delete()
    db.query(models.EventConfig).filter(models.EventConfig.event_slug == event_slug).delete()
    db.query(models.Media).filter(models.Media.event_slug == event_slug).delete()
    event_dir = UPLOAD_DIR / event_slug
    if event_dir.exists():
        shutil.rmtree(event_dir, ignore_errors=True)
    db.delete(event)
    db.commit()


# ── Per-event endpoints ───────────────────────────────────────────────────────


@app.patch("/events/{event_slug}/admin-token")
async def set_event_admin_token(
    event: models.Event = Depends(verify_event_admin),
    db: Session = Depends(get_db),
):
    """Generate a new random admin token for the event."""
    new_token = secrets.token_urlsafe(24)
    event.admin_token = hash_token(new_token)
    db.commit()
    return {"slug": event.slug, "admin_token": new_token}


@app.get("/events/{event_slug}/event-config")
async def get_event_config_by_slug(
    event: models.Event = Depends(get_event_or_404),
    db: Session = Depends(get_db),
):
    row = db.query(models.EventConfig).filter(models.EventConfig.event_slug == event.slug).first()
    if not row:
        return {}
    return json.loads(row.config_json)


@app.put("/events/{event_slug}/event-config")
async def update_event_config_by_slug(
    request: Request,
    event: models.Event = Depends(verify_event_admin),
    db: Session = Depends(get_db),
):
    return _upsert_event_config(event.slug, await request.json(), db)


@app.post("/events/{event_slug}/rsvp", response_model=schemas.RSVPResponse, status_code=201)
async def create_event_rsvp(
    request: Request,
    data: schemas.RSVPCreate,
    event: models.Event = Depends(get_event_or_404),
    db: Session = Depends(get_db),
):
    if settings.rate_limit_enabled:
        check_rate_limit(get_client_ip(request), settings.rate_limit_rsvp_check_per_minute, 60, f"rsvp-{event.slug}")
    rsvp = _upsert_rsvp(event.slug, data, db)
    _trigger_rsvp_emails(rsvp, event, db)
    return rsvp


@app.get("/events/{event_slug}/rsvp/check", response_model=schemas.CheckResponse)
async def check_event_email(
    request: Request,
    event: models.Event = Depends(get_event_or_404),
    email: str = Query(...),
    db: Session = Depends(get_db),
):
    if settings.rate_limit_enabled:
        check_rate_limit(get_client_ip(request), settings.rate_limit_rsvp_check_per_minute, 60, f"rsvp-check-{event.slug}")
    existing = db.query(models.RSVP).filter(
        models.RSVP.email == email, models.RSVP.event_slug == event.slug
    ).first()
    return {"exists": bool(existing), "attending": existing.attending if existing else None}


@app.get("/events/{event_slug}/rsvp/stats", response_model=schemas.RSVPStats)
async def event_rsvp_stats(
    event: models.Event = Depends(verify_event_admin),
    db: Session = Depends(get_db),
):
    return _get_stats(event.slug, db)


@app.get("/events/{event_slug}/rsvp", response_model=list[schemas.RSVPResponse])
async def list_event_rsvps(
    event: models.Event = Depends(verify_event_admin),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 200,
):
    return (
        db.query(models.RSVP)
        .filter(models.RSVP.event_slug == event.slug)
        .offset(skip)
        .limit(limit)
        .all()
    )


@app.put("/events/{event_slug}/rsvp/{rsvp_id}", response_model=schemas.RSVPResponse)
async def update_event_rsvp(
    rsvp_id: int,
    data: schemas.RSVPCreate,
    event: models.Event = Depends(verify_event_admin),
    db: Session = Depends(get_db),
):
    rsvp = db.query(models.RSVP).filter(
        models.RSVP.id == rsvp_id, models.RSVP.event_slug == event.slug
    ).first()
    if not rsvp:
        raise HTTPException(404, detail="RSVP not found")
    for key, value in data.model_dump().items():
        setattr(rsvp, key, value)
    rsvp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(rsvp)
    return rsvp


@app.delete("/events/{event_slug}/rsvp/{rsvp_id}", status_code=204)
async def delete_event_rsvp(
    rsvp_id: int,
    event: models.Event = Depends(verify_event_admin),
    db: Session = Depends(get_db),
):
    _delete_rsvp_by_id(event.slug, rsvp_id, db)


# ── Media ─────────────────────────────────────────────────────────────────────


@app.get("/events/{event_slug}/media", response_model=list[schemas.MediaResponse])
async def list_media(
    event: models.Event = Depends(verify_event_admin),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Media)
        .filter(models.Media.event_slug == event.slug)
        .order_by(models.Media.uploaded_at.desc())
        .all()
    )


@app.post("/events/{event_slug}/media", response_model=schemas.MediaResponse, status_code=201)
async def upload_media(
    request: Request,
    event: models.Event = Depends(verify_event_admin),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if settings.rate_limit_enabled:
        check_rate_limit(get_client_ip(request), settings.rate_limit_media_upload_per_minute, 60, f"media-upload-{event.slug}")
    ct = file.content_type or ""
    if ct not in ALLOWED_IMAGE_TYPES | ALLOWED_AUDIO_TYPES:
        raise HTTPException(400, detail=f"Tipo de archivo no permitido: {ct}")

    file_type = "image" if ct in ALLOWED_IMAGE_TYPES else "audio"
    max_size = MAX_IMAGE_SIZE if file_type == "image" else MAX_AUDIO_SIZE

    content = await file.read()
    if len(content) > max_size:
        mb = max_size // (1024 * 1024)
        raise HTTPException(413, detail=f"Archivo demasiado grande. Máximo {mb} MB.")

    original_name = file.filename or "upload"
    ext = Path(original_name).suffix.lower()
    valid_exts = {".jpg", ".jpeg", ".png", ".webp", ".mp3", ".m4a", ".wav", ".ogg"}
    if ext not in valid_exts:
        ext = ".jpg" if file_type == "image" else ".mp3"

    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest_dir = UPLOAD_DIR / event.slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    (dest_dir / unique_name).write_bytes(content)

    url = f"/api/uploads/{event.slug}/{unique_name}"
    media_obj = models.Media(
        event_slug=event.slug,
        filename=unique_name,
        original_filename=original_name,
        file_type=file_type,
        mime_type=ct,
        size=len(content),
        url=url,
    )
    db.add(media_obj)
    db.commit()
    db.refresh(media_obj)
    return media_obj


@app.delete("/events/{event_slug}/media/{media_id}", status_code=204)
async def delete_media(
    media_id: int,
    event: models.Event = Depends(verify_event_admin),
    db: Session = Depends(get_db),
):
    media_obj = db.query(models.Media).filter(
        models.Media.id == media_id, models.Media.event_slug == event.slug
    ).first()
    if not media_obj:
        raise HTTPException(404, detail="Archivo no encontrado")
    (UPLOAD_DIR / event.slug / media_obj.filename).unlink(missing_ok=True)
    db.delete(media_obj)
    db.commit()


@app.get("/uploads/{event_slug}/{filename}")
async def serve_upload(event_slug: str, filename: str):
    safe_slug = event_slug.replace("..", "").replace("/", "").replace("\\", "")
    safe_file = filename.replace("..", "").replace("/", "").replace("\\", "")
    file_path = UPLOAD_DIR / safe_slug / safe_file
    if not file_path.is_file():
        raise HTTPException(404, detail="Archivo no encontrado")
    return FileResponse(file_path)
