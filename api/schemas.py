from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field

EventType = Literal[
    'boda', 'cumpleanos', 'bautismo', 'quinceanera',
    'graduacion', 'corporativo', 'primera-comunion',
    'aniversario', 'baby-shower',
]


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
    event_type: Optional[EventType] = None


class EventCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    slug: str = Field(..., min_length=2, max_length=100, pattern=r"^[a-z0-9][a-z0-9-]*[a-z0-9]$")
    admin_token: Optional[str] = Field(None, max_length=200)


class EventResponse(BaseModel):
    id: int
    slug: str
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MediaResponse(BaseModel):
    id: int
    event_slug: str
    filename: str
    original_filename: str
    file_type: str
    mime_type: str
    size: int
    url: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}
