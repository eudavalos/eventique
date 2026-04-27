from datetime import datetime
from enum import Enum
from typing import Any, Literal, Optional
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


# ── Guest Invitation Schemas ─────────────────────────────────────────────────


class GuestType(str, Enum):
    """Type classification of a guest/group."""
    general = "general"
    family = "family"
    vip = "vip"
    staff = "staff"


class InvitationStatus(str, Enum):
    """Lifecycle status of a personalized invitation."""
    draft = "draft"
    pending = "pending"
    sent = "sent"
    opened = "opened"
    confirmed = "confirmed"
    declined = "declined"
    partial = "partial"
    blocked = "blocked"
    expired = "expired"


class GuestInvitationCreate(BaseModel):
    """Payload for creating a new personalized invitation."""
    display_name: str = Field(..., min_length=1, max_length=300, description="Nombre visible en la invitación")
    contact_name: Optional[str] = Field(None, max_length=300, description="Nombre del contacto real (interno)")
    email: Optional[EmailStr] = Field(None, description="Email del invitado (opcional)")
    phone: Optional[str] = Field(None, max_length=50, description="Teléfono del invitado")
    group_name: Optional[str] = Field(None, max_length=200, description="Nombre del grupo familiar")
    guest_type: str = Field(default="general", description="Tipo: general | family | vip | staff")
    allowed_passes: int = Field(default=1, ge=1, le=50, description="Cupos reservados para este invitado/grupo")
    notes: Optional[str] = Field(None, description="Notas internas del admin")
    tags: Optional[list[str]] = Field(default=[], description="Etiquetas para filtrado")
    conditional_flags: Optional[list[str]] = Field(default=[], description="Flags condicionales para lógica de sección")

    model_config = {"from_attributes": True}


class GuestInvitationUpdate(BaseModel):
    """Payload for updating an existing personalized invitation (all fields optional)."""
    display_name: Optional[str] = Field(None, min_length=1, max_length=300)
    contact_name: Optional[str] = Field(None, max_length=300)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    group_name: Optional[str] = Field(None, max_length=200)
    guest_type: Optional[str] = None
    allowed_passes: Optional[int] = Field(None, ge=1, le=50)
    notes: Optional[str] = None
    tags: Optional[list[str]] = None
    conditional_flags: Optional[list[str]] = None

    model_config = {"from_attributes": True}


class GuestInvitationResponse(BaseModel):
    """Full invitation response (admin view)."""
    id: int
    event_slug: str
    display_name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    group_name: Optional[str] = None
    guest_type: str
    status: str
    allowed_passes: int
    confirmed_passes: int
    declined_passes: int
    token_lookup: str
    notes: Optional[str] = None
    tags: list[str] = []
    conditional_flags: list[str] = []
    first_opened_at: Optional[datetime] = None
    last_opened_at: Optional[datetime] = None
    open_count: int
    last_rsvp_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool
    blocked_reason: Optional[str] = None
    # Populated by endpoint, not persisted in DB
    invitation_url: Optional[str] = None

    model_config = {"from_attributes": True}


class GuestInvitationPublic(BaseModel):
    """Public (guest-facing) view of an invitation — no internal data."""
    display_name: str
    allowed_passes: int
    confirmed_passes: int
    status: str
    guest_type: str = "general"
    conditional_flags: list[str] = []
    event_slug: str

    model_config = {"from_attributes": True}


class GuestMemberCreate(BaseModel):
    """Payload for creating/updating a guest member within an invitation."""
    full_name: str = Field(..., min_length=1, max_length=300)
    member_type: str = Field(default="adult", description="adult | child | infant")
    menu_preference: Optional[str] = Field(None, max_length=200)
    dietary_restrictions: Optional[str] = Field(None, max_length=500)
    attending: Optional[bool] = None
    notes: Optional[str] = Field(None, max_length=500)

    model_config = {"from_attributes": True}


class GuestMemberResponse(BaseModel):
    """Full guest member record."""
    id: int
    event_slug: str
    invitation_id: int
    full_name: str
    member_type: str
    age_group: Optional[str] = None
    menu_preference: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    attending: Optional[bool] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PersonalizedRSVPCreate(BaseModel):
    """RSVP payload submitted via a personalized invitation token."""
    attending: bool
    guest_count: int = Field(default=1, ge=1, le=50)
    members: Optional[list[GuestMemberCreate]] = Field(default=[], description="Detalle de cada asistente")
    dietary_restrictions: Optional[str] = Field(None, max_length=500)
    song_request: Optional[str] = Field(None, max_length=300)
    message: Optional[str] = None
    source: str = Field(default="personalized", description="Canal de origen del RSVP")

    model_config = {"from_attributes": True}


class InvitationPublicResponse(BaseModel):
    """Full public response when opening a personalized invitation link."""
    event_config: dict[str, Any]
    invitation: GuestInvitationPublic
    members: list[GuestMemberResponse]
    rsvp_status: Optional[str] = None
    already_responded: bool


class GuestStatsResponse(BaseModel):
    """Aggregated statistics for the guest list of an event."""
    total_invitations: int
    total_passes: int
    confirmed_passes: int
    declined_passes: int
    pending_passes: int
    opened: int
    not_opened: int
    status_counts: dict[str, int]
    open_rate: float  # 0.0 – 1.0
    confirmation_rate: float  # 0.0 – 1.0


class CSVImportPreview(BaseModel):
    """Result of validating a CSV import before committing."""
    valid_rows: list[dict[str, Any]]
    error_rows: list[dict[str, Any]]  # each has 'row' and 'errors' keys
    total: int
    valid_count: int
    error_count: int


class WhatsAppTemplateVars(BaseModel):
    """Variables used to render a WhatsApp message template."""
    template: str
    display_name: str
    event_name: str
    event_date: str
    allowed_passes: int
    invitation_url: str
    rsvp_deadline: Optional[str] = None
