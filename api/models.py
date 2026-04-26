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
