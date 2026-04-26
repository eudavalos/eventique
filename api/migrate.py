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

    print("✓ Migration complete")


if __name__ == "__main__":
    create_backup()
    run_migrations()
    print("✓ Database ready")
