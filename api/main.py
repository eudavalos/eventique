import os
import json
import secrets
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "change-me-in-production")
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5174,https://eventique.tecnopowerpy.top",
).split(",")

app = FastAPI(
    title="Eventique — Event Invitations API",
    version="2.0.0",
    description="API para gestión de invitaciones y confirmaciones de asistencia a eventos",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bearer = HTTPBearer(auto_error=False)


def verify_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not credentials or not secrets.compare_digest(credentials.credentials, ADMIN_TOKEN):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return True


# ── Public endpoints ──────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "app": "Eventique API", "version": "2.0.0"}


@app.get("/event-config")
async def get_event_config(db: Session = Depends(get_db)):
    row = db.query(models.EventConfig).first()
    if not row:
        return {}
    return json.loads(row.config_json)


@app.put("/event-config")
async def update_event_config(
    request: Request,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin),
):
    payload = await request.json()
    row = db.query(models.EventConfig).first()
    if row:
        row.config_json = json.dumps(payload, ensure_ascii=False)
    else:
        row = models.EventConfig(id=1, config_json=json.dumps(payload, ensure_ascii=False))
        db.add(row)
    db.commit()
    return json.loads(row.config_json)


@app.post("/rsvp", response_model=schemas.RSVPResponse, status_code=status.HTTP_201_CREATED)
async def create_rsvp(data: schemas.RSVPCreate, db: Session = Depends(get_db)):
    existing = db.query(models.RSVP).filter(models.RSVP.email == data.email).first()
    if existing:
        for key, value in data.model_dump().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing

    rsvp = models.RSVP(**data.model_dump())
    db.add(rsvp)
    db.commit()
    db.refresh(rsvp)
    return rsvp


@app.get("/rsvp/check", response_model=schemas.CheckResponse)
async def check_email(email: str = Query(...), db: Session = Depends(get_db)):
    existing = db.query(models.RSVP).filter(models.RSVP.email == email).first()
    if existing:
        return {"exists": True, "attending": existing.attending}
    return {"exists": False}


# ── Admin endpoints (require Bearer token) ────────────────────

@app.get("/rsvp", response_model=list[schemas.RSVPResponse])
async def list_rsvps(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin),
):
    return db.query(models.RSVP).offset(skip).limit(limit).all()


@app.get("/rsvp/stats", response_model=schemas.RSVPStats)
async def rsvp_stats(db: Session = Depends(get_db), _: bool = Depends(verify_admin)):
    total = db.query(models.RSVP).count()
    attending = db.query(models.RSVP).filter(models.RSVP.attending == True).count()  # noqa
    not_attending = db.query(models.RSVP).filter(models.RSVP.attending == False).count()  # noqa
    total_guests = (
        db.query(func.sum(models.RSVP.guest_count))
        .filter(models.RSVP.attending == True)  # noqa
        .scalar()
        or 0
    )
    return {
        "total_responses": total,
        "attending": attending,
        "not_attending": not_attending,
        "total_guests": total_guests,
    }


@app.delete("/rsvp/{rsvp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rsvp(
    rsvp_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin),
):
    rsvp = db.query(models.RSVP).filter(models.RSVP.id == rsvp_id).first()
    if not rsvp:
        raise HTTPException(status_code=404, detail="RSVP not found")
    db.delete(rsvp)
    db.commit()
