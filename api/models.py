import secrets
import hashlib
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, UniqueConstraint
from .database import Base


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    admin_token = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class EventConfig(Base):
    __tablename__ = "event_config"
    id = Column(Integer, primary_key=True, autoincrement=True)
    event_slug = Column(String(100), nullable=False, default="default", index=True)
    event_type = Column(String(50), default="boda")
    config_json = Column(Text, nullable=False, default="{}")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RSVP(Base):
    __tablename__ = "rsvps"
    id = Column(Integer, primary_key=True, index=True)
    event_slug = Column(String(100), nullable=False, default="default", index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False, index=True)
    attending = Column(Boolean, nullable=False)
    guest_count = Column(Integer, default=1)
    plus_one_name = Column(String(200), nullable=True)
    dietary_restrictions = Column(String(500), nullable=True)
    song_request = Column(String(300), nullable=True)
    message = Column(Text, nullable=True)
    # Personalized invitation linkage (nullable for backward compat)
    invitation_id = Column(Integer, nullable=True)
    rsvp_source = Column(String(50), nullable=True, default="generic")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("email", "event_slug", name="uq_rsvp_email_event"),
    )


class Media(Base):
    __tablename__ = "media"
    id = Column(Integer, primary_key=True, index=True)
    event_slug = Column(String(100), nullable=False, index=True)
    filename = Column(String(300), nullable=False)
    original_filename = Column(String(300), nullable=False)
    file_type = Column(String(50), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)
    url = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


# ── Guest Invitation Module ──────────────────────────────────────────────────


class GuestInvitation(Base):
    """Personalized invitation record for a specific guest or group."""
    __tablename__ = "guest_invitations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_slug = Column(String(100), nullable=False, index=True)
    # Visible name on the invitation page (e.g. "Familia García")
    display_name = Column(String(300), nullable=False)
    # Contact person name (internal, e.g. "Juan García")
    contact_name = Column(String(300), nullable=True)
    email = Column(String(200), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    group_name = Column(String(200), nullable=True)
    # guest_type: general | family | vip | staff
    guest_type = Column(String(50), nullable=False, default="general")
    # status: draft | pending | sent | opened | confirmed | declined | partial | blocked | expired
    status = Column(String(50), nullable=False, default="pending")
    # Cupos reservados para este invitado/grupo
    allowed_passes = Column(Integer, nullable=False, default=1)
    confirmed_passes = Column(Integer, nullable=False, default=0)
    declined_passes = Column(Integer, nullable=False, default=0)
    # URL token (high-entropy, used directly as lookup — 64 hex chars from secrets.token_hex(32))
    token_lookup = Column(String(64), nullable=False, unique=True, index=True)
    # Internal notes for admin
    notes = Column(Text, nullable=True)
    # JSON arrays stored as text
    tags_json = Column(Text, nullable=False, default="[]")
    conditional_flags_json = Column(Text, nullable=False, default="[]")
    metadata_json = Column(Text, nullable=False, default="{}")
    # Open tracking
    first_opened_at = Column(DateTime, nullable=True)
    last_opened_at = Column(DateTime, nullable=True)
    open_count = Column(Integer, nullable=False, default=0)
    # RSVP tracking
    last_rsvp_at = Column(DateTime, nullable=True)
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Soft delete / block
    is_active = Column(Boolean, nullable=False, default=True)
    blocked_reason = Column(String(500), nullable=True)


class GuestMember(Base):
    """Individual member belonging to a GuestInvitation (one per pass)."""
    __tablename__ = "guest_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_slug = Column(String(100), nullable=False, index=True)
    invitation_id = Column(Integer, nullable=False, index=True)  # logical FK to GuestInvitation.id
    full_name = Column(String(300), nullable=False)
    # member_type: adult | child | infant
    member_type = Column(String(50), nullable=False, default="adult")
    age_group = Column(String(50), nullable=True)
    menu_preference = Column(String(200), nullable=True)
    dietary_restrictions = Column(String(500), nullable=True)
    # None = pending, True = attending, False = not attending
    attending = Column(Boolean, nullable=True)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class InvitationOpenEvent(Base):
    """Tracking record for each time an invitation was opened."""
    __tablename__ = "invitation_open_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_slug = Column(String(100), nullable=False, index=True)
    invitation_id = Column(Integer, nullable=False, index=True)
    opened_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    # SHA-256 of IP address — never raw IP
    ip_hash = Column(String(64), nullable=True)
    # SHA-256 of user-agent string
    user_agent_hash = Column(String(64), nullable=True)
    # open source channel: direct | whatsapp | email | qr | etc.
    source = Column(String(100), nullable=True)
    metadata_json = Column(Text, nullable=False, default="{}")


class InvitationAuditLog(Base):
    """Immutable audit trail for all invitation-related actions."""
    __tablename__ = "invitation_audit_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_slug = Column(String(100), nullable=False, index=True)
    # entity_type: invitation | member | rsvp
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    # action: create | update | delete | block | regenerate_token | rsvp_submit | etc.
    action = Column(String(100), nullable=False)
    before_json = Column(Text, nullable=True)
    after_json = Column(Text, nullable=True)
    performed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    # performed_by_type: admin | guest | system
    performed_by_type = Column(String(50), nullable=False, default="admin")
    # token ref, slug, or other identifier for the performer
    performed_by_ref = Column(String(200), nullable=True)
