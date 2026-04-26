"""
Enterprise configuration for Eventique.

All configurable values are centralized here. Read from environment variables.
Defaults are set to safe/sensible values. Production must override via .env.
"""

from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional
import os


class Settings(BaseSettings):
    """Settings model using Pydantic v2 BaseSettings."""

    # ── Environment ────────────────────────────────────────────────────
    environment: str = Field(default="development", description="Environment: development, staging, production")
    debug: bool = Field(default=False, description="Debug mode (only in development)")

    # ── API ────────────────────────────────────────────────────────────
    api_title: str = Field(default="Eventique API", description="API title")
    api_version: str = Field(default="1.0.0", description="API version")
    admin_token: str = Field(default="change-me-in-production", description="Global admin token (required in production)")
    public_base_url: str = Field(default="http://localhost:5176", description="Public base URL for links")

    # ── Database ───────────────────────────────────────────────────────
    database_url: str = Field(default="sqlite:////app/data/eventique.db", description="Database URL")

    # ── CORS ───────────────────────────────────────────────────────────
    allowed_origins: str = Field(
        default="http://localhost:5174,http://localhost:5176,http://127.0.0.1:5174,http://127.0.0.1:5176",
        description="Comma-separated list of allowed CORS origins"
    )

    # ── Media Upload ────────────────────────────────────────────────────
    upload_dir: str = Field(default="/app/uploads", description="Directory for uploaded files")
    max_image_size_mb: int = Field(default=10, description="Max image upload size in MB")
    max_audio_size_mb: int = Field(default=50, description="Max audio upload size in MB")
    allowed_image_types: str = Field(default="image/jpeg,image/png,image/webp,image/gif", description="Comma-separated MIME types for images")
    allowed_audio_types: str = Field(default="audio/mpeg,audio/wav,audio/ogg,audio/webm", description="Comma-separated MIME types for audio")
    allowed_image_extensions: str = Field(default="jpg,jpeg,png,webp,gif", description="Comma-separated extensions for images")
    allowed_audio_extensions: str = Field(default="mp3,wav,ogg,webm,m4a", description="Comma-separated extensions for audio")

    # ── SMTP (Email) ───────────────────────────────────────────────────
    email_enabled: bool = Field(default=False, description="Enable email notifications")
    smtp_host: str = Field(default="smtp.gmail.com", description="SMTP server hostname")
    smtp_port: int = Field(default=587, description="SMTP server port")
    smtp_user: str = Field(default="", description="SMTP username (usually email)")
    smtp_pass: str = Field(default="", description="SMTP password or app password")
    smtp_from: str = Field(default="", description="From email address")

    # ── Rate Limiting ──────────────────────────────────────────────────
    rate_limit_enabled: bool = Field(default=True, description="Enable rate limiting")
    rate_limit_requests_per_minute: int = Field(default=60, description="Requests per minute (global average)")
    rate_limit_admin_requests_per_minute: int = Field(default=120, description="Admin requests per minute")
    rate_limit_rsvp_check_per_minute: int = Field(default=10, description="RSVP check requests per minute")
    rate_limit_media_upload_per_minute: int = Field(default=5, description="Media uploads per minute")

    # ── RSVP ────────────────────────────────────────────────────────────
    default_event_slug: str = Field(default="default", description="Default event slug")
    rsvp_max_guests_default: int = Field(default=4, description="Default max guests per RSVP")
    rsvp_max_guests_absolute: int = Field(default=8, description="Absolute max guests per RSVP (validation ceiling)")

    # ── Security ───────────────────────────────────────────────────────
    admin_session_timeout_hours: int = Field(default=24, description="Admin session timeout in hours (clientside)")
    token_hashing_enabled: bool = Field(default=False, description="Hash new tokens (not implemented yet)")
    require_https_in_production: bool = Field(default=True, description="Require HTTPS in production")

    # ── Feature Flags ──────────────────────────────────────────────────
    feature_email_enabled: bool = Field(default=False, description="Feature flag for email")
    feature_qr_codes_enabled: bool = Field(default=True, description="Feature flag for QR codes")
    feature_music_youtube_enabled: bool = Field(default=True, description="Feature flag for YouTube music")

    # ── Defaults & Timestamps ──────────────────────────────────────────
    healthcheck_interval_s: int = Field(default=30, description="Docker healthcheck interval")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v):
        """Convert comma-separated origins to list for internal use."""
        if isinstance(v, str):
            return [o.strip() for o in v.split(",")]
        return v

    @field_validator("allowed_image_types", mode="before")
    @classmethod
    def parse_image_types(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",")]
        return v

    @field_validator("allowed_audio_types", mode="before")
    @classmethod
    def parse_audio_types(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",")]
        return v

    @field_validator("allowed_image_extensions", mode="before")
    @classmethod
    def parse_image_extensions(cls, v):
        if isinstance(v, str):
            return [e.strip().lower() for e in v.split(",")]
        return v

    @field_validator("allowed_audio_extensions", mode="before")
    @classmethod
    def parse_audio_extensions(cls, v):
        if isinstance(v, str):
            return [e.strip().lower() for e in v.split(",")]
        return v


# Singleton instance — lazy loaded
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get or create the settings singleton."""
    global _settings
    if _settings is None:
        _settings = Settings()
        # Validate production settings
        if _settings.environment == "production":
            if _settings.admin_token == "change-me-in-production":
                raise ValueError("ADMIN_TOKEN must be set in production. Set ADMIN_TOKEN env var.")
            if _settings.email_enabled and not _settings.smtp_pass:
                raise ValueError("SMTP_PASS must be set if EMAIL_ENABLED=true")
    return _settings
