import os
import json
import secrets
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, status, Query, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from . import models, schemas
from .database import engine, get_db, SessionLocal

# ── Config ────────────────────────────────────────────────────────────────────

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "change-me-in-production")
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5174,https://eventique.tecnopowerpy.top",
).split(",")
UPLOAD_DIR = Path("/app/data/uploads")
MAX_IMAGE_SIZE = 10 * 1024 * 1024   # 10 MB
MAX_AUDIO_SIZE = 50 * 1024 * 1024   # 50 MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/x-m4a"}

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

    # Create default event if none exists
    db = SessionLocal()
    try:
        if not db.query(models.Event).filter(models.Event.slug == "default").first():
            db.add(models.Event(slug="default", name="Evento Principal"))
            db.commit()
    finally:
        db.close()


# ── Lifespan ──────────────────────────────────────────────────────────────────

models.Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Eventique — Event Invitations API",
    version="3.0.0",
    description="API multi-tenant para gestión de invitaciones digitales",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    if event.admin_token and secrets.compare_digest(token, event.admin_token):
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
    existing = db.query(models.RSVP).filter(
        models.RSVP.email == data.email, models.RSVP.event_slug == event_slug
    ).first()
    if existing:
        for key, value in data.model_dump().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing
    rsvp = models.RSVP(event_slug=event_slug, **data.model_dump())
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
async def health():
    return {"status": "ok", "app": "Eventique API", "version": "3.0.0"}


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
async def create_rsvp(data: schemas.RSVPCreate, db: Session = Depends(get_db)):
    return _upsert_rsvp("default", data, db)


@app.get("/rsvp/check", response_model=schemas.CheckResponse)
async def check_email(email: str = Query(...), db: Session = Depends(get_db)):
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
    data: schemas.RSVPCreate,
    event: models.Event = Depends(get_event_or_404),
    db: Session = Depends(get_db),
):
    return _upsert_rsvp(event.slug, data, db)


@app.get("/events/{event_slug}/rsvp/check", response_model=schemas.CheckResponse)
async def check_event_email(
    event: models.Event = Depends(get_event_or_404),
    email: str = Query(...),
    db: Session = Depends(get_db),
):
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
    event: models.Event = Depends(verify_event_admin),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
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
