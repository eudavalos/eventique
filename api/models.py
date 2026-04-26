from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from .database import Base


class EventConfig(Base):
    __tablename__ = "event_config"
    id = Column(Integer, primary_key=True, default=1)
    event_type = Column(String(50), default="boda")
    config_json = Column(Text, nullable=False, default="{}")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RSVP(Base):
    __tablename__ = "rsvps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False, index=True, unique=True)
    attending = Column(Boolean, nullable=False)
    guest_count = Column(Integer, default=1)
    plus_one_name = Column(String(200), nullable=True)
    dietary_restrictions = Column(String(500), nullable=True)
    song_request = Column(String(300), nullable=True)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
