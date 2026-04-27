"""
Safe database migration script for Eventique.
Idempotent: safe to run multiple times.
Creates backup before altering tables.
"""

import shutil
from datetime import datetime
from pathlib import Path
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

DATABASE_URL = "sqlite:////app/data/eventique.db"
BACKUP_DIR = Path("/app/data/backup")


def get_engine():
    """Create SQLite engine."""
    return create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


def create_backup():
    """Create timestamped backup of database before migration."""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    db_path = Path("/app/data/eventique.db")
    if db_path.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = BACKUP_DIR / f"eventique_{timestamp}.db"
        shutil.copy2(db_path, backup_path)
        print(f"✓ Backup created: {backup_path}")

        # Clean old backups (keep last 7)
        backups = sorted(BACKUP_DIR.glob("eventique_*.db"), reverse=True)
        for old_backup in backups[7:]:
            old_backup.unlink()
            print(f"✓ Removed old backup: {old_backup.name}")


def run_migrations():
    """Execute database migrations."""
    engine = get_engine()

    with engine.connect() as conn:
        inspector = inspect(conn)

        # Create events table if missing
        if "events" not in inspector.get_table_names():
            conn.execute(text("""
                CREATE TABLE events (
                    id INTEGER NOT NULL PRIMARY KEY,
                    slug VARCHAR(100) NOT NULL UNIQUE,
                    name VARCHAR(200) NOT NULL,
                    admin_token VARCHAR(255),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✓ Created table: events")

        # Create event_config table if missing
        if "event_config" not in inspector.get_table_names():
            conn.execute(text("""
                CREATE TABLE event_config (
                    id INTEGER NOT NULL PRIMARY KEY,
                    event_slug VARCHAR(100) NOT NULL UNIQUE,
                    config_json TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✓ Created table: event_config")

        # Add event_slug to event_config if missing
        ec_cols = [col.name for col in inspector.get_columns("event_config")]
        if "event_slug" not in ec_cols:
            conn.execute(text("""
                ALTER TABLE event_config ADD COLUMN event_slug VARCHAR(100) NOT NULL DEFAULT 'default'
            """))
            conn.commit()
            print("✓ Added event_slug column to event_config")

        # Create rsvps table if missing
        if "rsvps" not in inspector.get_table_names():
            conn.execute(text("""
                CREATE TABLE rsvps (
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
            conn.commit()
            print("✓ Created table: rsvps")

        # Create media table if missing
        if "media" not in inspector.get_table_names():
            conn.execute(text("""
                CREATE TABLE media (
                    id INTEGER NOT NULL PRIMARY KEY,
                    event_slug VARCHAR(100) NOT NULL,
                    file_type VARCHAR(10) NOT NULL,
                    original_filename VARCHAR(255),
                    stored_filename VARCHAR(255) NOT NULL UNIQUE,
                    size_bytes INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✓ Created table: media")

        # Create indices if missing
        indices_to_create = [
            ("ix_events_slug", "events", "slug"),
            ("ix_event_config_event_slug", "event_config", "event_slug"),
            ("ix_rsvps_event_slug", "rsvps", "event_slug"),
            ("ix_rsvps_email_event_slug", "rsvps", ["email", "event_slug"]),
            ("ix_media_event_slug", "media", "event_slug"),
        ]

        existing_indices = {
            idx.name for idx in inspector.get_indexes("events") +
            inspector.get_indexes("event_config") +
            inspector.get_indexes("rsvps") +
            inspector.get_indexes("media")
            if "rsvps" in [t for t in inspector.get_table_names()]
        }

        for idx_name, table, columns in indices_to_create:
            if table in inspector.get_table_names() and idx_name not in existing_indices:
                cols_str = ", ".join(columns) if isinstance(columns, list) else columns
                conn.execute(text(f"CREATE INDEX {idx_name} ON {table} ({cols_str})"))
                print(f"✓ Created index: {idx_name}")

        conn.commit()

        # ── Personalized Invitations (enterprise guest module) ─────────────

        # Migrate: add invitation_id and rsvp_source to rsvps
        rsvp_cols = [col.name for col in inspector.get_columns("rsvps")]
        if "invitation_id" not in rsvp_cols:
            conn.execute(text("ALTER TABLE rsvps ADD COLUMN invitation_id INTEGER NULL"))
            conn.commit()
            print("✓ Added invitation_id to rsvps")
        if "rsvp_source" not in rsvp_cols:
            conn.execute(text("ALTER TABLE rsvps ADD COLUMN rsvp_source VARCHAR(50) NULL DEFAULT 'generic'"))
            conn.commit()
            print("✓ Added rsvp_source to rsvps")

        # Create guest_invitations table
        if "guest_invitations" not in inspector.get_table_names():
            conn.execute(text("""
                CREATE TABLE guest_invitations (
                    id INTEGER NOT NULL PRIMARY KEY,
                    event_slug VARCHAR(100) NOT NULL,
                    display_name VARCHAR(300) NOT NULL,
                    contact_name VARCHAR(300),
                    email VARCHAR(200),
                    phone VARCHAR(50),
                    group_name VARCHAR(200),
                    guest_type VARCHAR(50) NOT NULL DEFAULT 'general',
                    status VARCHAR(50) NOT NULL DEFAULT 'pending',
                    allowed_passes INTEGER NOT NULL DEFAULT 1,
                    confirmed_passes INTEGER NOT NULL DEFAULT 0,
                    declined_passes INTEGER NOT NULL DEFAULT 0,
                    token_lookup VARCHAR(64) NOT NULL UNIQUE,
                    notes TEXT,
                    tags_json TEXT NOT NULL DEFAULT '[]',
                    conditional_flags_json TEXT NOT NULL DEFAULT '[]',
                    metadata_json TEXT NOT NULL DEFAULT '{}',
                    first_opened_at DATETIME,
                    last_opened_at DATETIME,
                    open_count INTEGER NOT NULL DEFAULT 0,
                    last_rsvp_at DATETIME,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN NOT NULL DEFAULT 1,
                    blocked_reason VARCHAR(500)
                )
            """))
            conn.commit()
            conn.execute(text("CREATE INDEX ix_guest_invitations_event_slug ON guest_invitations (event_slug)"))
            conn.execute(text("CREATE INDEX ix_guest_invitations_token_lookup ON guest_invitations (token_lookup)"))
            conn.execute(text("CREATE INDEX ix_guest_invitations_email ON guest_invitations (email)"))
            conn.commit()
            print("✓ Created table: guest_invitations")

        # Create guest_members table
        if "guest_members" not in inspector.get_table_names():
            conn.execute(text("""
                CREATE TABLE guest_members (
                    id INTEGER NOT NULL PRIMARY KEY,
                    event_slug VARCHAR(100) NOT NULL,
                    invitation_id INTEGER NOT NULL,
                    full_name VARCHAR(300) NOT NULL,
                    member_type VARCHAR(50) NOT NULL DEFAULT 'adult',
                    age_group VARCHAR(50),
                    menu_preference VARCHAR(200),
                    dietary_restrictions VARCHAR(500),
                    attending BOOLEAN,
                    notes VARCHAR(500),
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            conn.execute(text("CREATE INDEX ix_guest_members_invitation_id ON guest_members (invitation_id)"))
            conn.execute(text("CREATE INDEX ix_guest_members_event_slug ON guest_members (event_slug)"))
            conn.commit()
            print("✓ Created table: guest_members")

        # Create invitation_open_events table
        if "invitation_open_events" not in inspector.get_table_names():
            conn.execute(text("""
                CREATE TABLE invitation_open_events (
                    id INTEGER NOT NULL PRIMARY KEY,
                    event_slug VARCHAR(100) NOT NULL,
                    invitation_id INTEGER NOT NULL,
                    opened_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    ip_hash VARCHAR(64),
                    user_agent_hash VARCHAR(64),
                    source VARCHAR(100),
                    metadata_json TEXT NOT NULL DEFAULT '{}'
                )
            """))
            conn.commit()
            conn.execute(text("CREATE INDEX ix_open_events_invitation_id ON invitation_open_events (invitation_id)"))
            conn.commit()
            print("✓ Created table: invitation_open_events")

        # Create invitation_audit_log table
        if "invitation_audit_log" not in inspector.get_table_names():
            conn.execute(text("""
                CREATE TABLE invitation_audit_log (
                    id INTEGER NOT NULL PRIMARY KEY,
                    event_slug VARCHAR(100) NOT NULL,
                    entity_type VARCHAR(50) NOT NULL,
                    entity_id INTEGER NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    before_json TEXT,
                    after_json TEXT,
                    performed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    performed_by_type VARCHAR(50) NOT NULL DEFAULT 'admin',
                    performed_by_ref VARCHAR(200)
                )
            """))
            conn.commit()
            conn.execute(text("CREATE INDEX ix_audit_log_event_slug ON invitation_audit_log (event_slug)"))
            conn.execute(text("CREATE INDEX ix_audit_log_entity ON invitation_audit_log (entity_type, entity_id)"))
            conn.commit()
            print("✓ Created table: invitation_audit_log")

    print("✓ Migration complete")


if __name__ == "__main__":
    create_backup()
    run_migrations()
    print("✓ Database ready")
