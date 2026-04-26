from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field


class RSVPCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    attending: bool
    guest_count: int = Field(default=1, ge=1, le=10)
    plus_one_name: Optional[str] = Field(None, max_length=200)
    dietary_restrictions: Optional[str] = Field(None, max_length=500)
    song_request: Optional[str] = Field(None, max_length=300)
    message: Optional[str] = None

    model_config = {"from_attributes": True}


class RSVPResponse(BaseModel):
    id: int
    name: str
    email: str
    attending: bool
    guest_count: int
    plus_one_name: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    song_request: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RSVPStats(BaseModel):
    total_responses: int
    attending: int
    not_attending: int
    total_guests: int


class CheckResponse(BaseModel):
    exists: bool
    attending: Optional[bool] = None


class EventConfigPayload(BaseModel):
    model_config = {"extra": "allow"}
    # Accepts any fields — the whole payload becomes the event config JSON
