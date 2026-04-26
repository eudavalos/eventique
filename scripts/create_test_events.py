#!/usr/bin/env python3
"""
Crear eventos de prueba para testear multi-tenancy
Uso: python scripts/create_test_events.py
"""

import sys
import json
from datetime import datetime, timedelta
from pathlib import Path

# Add api to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from api.database import SessionLocal, engine
from api.models import Base, Event, EventConfig

# Event templates
TEST_EVENTS = [
    {
        "slug": "boda-concepcion-eumelio",
        "name": "Boda Concepción & Eumelio",
        "event_type": "boda",
        "config": {
            "eventName": "Concepción & Eumelio",
            "eventDate": (datetime.now() + timedelta(days=250)).isoformat(),
            "eventType": "boda",
            "venue": {
                "name": "Salón de Eventos",
                "location": "CDMX",
            },
            "palette": "nature",
            "sections": {
                "hero": {"enabled": True, "subtitle": "Nos alegra invitarte"},
                "countdown": {"enabled": True, "label": "Nos casamos en"},
                "ourStory": {"enabled": True, "title": "Nuestra Historia"},
                "schedule": {"enabled": True, "title": "Agenda del Día"},
                "accommodation": {"enabled": True, "title": "Dónde Hospedarse"},
                "gallery": {"enabled": True, "title": "Momentos"},
                "rsvp": {"enabled": True, "title": "Confirma tu asistencia"},
                "footer": {"enabled": True},
            }
        }
    },
    {
        "slug": "cumple-ana-30",
        "name": "Cumpleaños Ana - 30 años",
        "event_type": "cumpleaños",
        "config": {
            "eventName": "Ana cumple 30",
            "eventDate": (datetime.now() + timedelta(days=45)).isoformat(),
            "eventType": "cumpleaños",
            "venue": {"name": "Rooftop Bar", "location": "CDMX"},
            "palette": "modern",
            "sections": {
                "hero": {"enabled": True, "subtitle": "¡Celebra conmigo!"},
                "countdown": {"enabled": True, "label": "Falta"},
                "gallery": {"enabled": True, "title": "Momentos"},
                "rsvp": {"enabled": True, "title": "¿Vienes?"},
                "footer": {"enabled": True},
            }
        }
    },
    {
        "slug": "bautismo-sofialucas",
        "name": "Bautismo Sofía & Lucas",
        "event_type": "bautismo",
        "config": {
            "eventName": "Bautismo de Sofía y Lucas",
            "eventDate": (datetime.now() + timedelta(days=60)).isoformat(),
            "eventType": "bautismo",
            "venue": {"name": "Iglesia San José", "location": "Querétaro"},
            "palette": "soft",
            "sections": {
                "hero": {"enabled": True, "subtitle": "Los bendecimos"},
                "countdown": {"enabled": True},
                "ourStory": {"enabled": True, "title": "Nuestras Historias"},
                "schedule": {"enabled": True},
                "accommodation": {"enabled": True},
                "gallery": {"enabled": True},
                "rsvp": {"enabled": True},
                "footer": {"enabled": True},
            }
        }
    },
    {
        "slug": "quinceañera-isabel",
        "name": "Quinceañera Isabel",
        "event_type": "quinceañera",
        "config": {
            "eventName": "Isabel Cumple 15",
            "eventDate": (datetime.now() + timedelta(days=90)).isoformat(),
            "eventType": "quinceañera",
            "venue": {"name": "Salón Versalles", "location": "Guanajuato"},
            "palette": "romantic",
            "sections": {
                "hero": {"enabled": True, "subtitle": "De niña a mujer"},
                "countdown": {"enabled": True, "label": "Ya falta poco"},
                "ourStory": {"enabled": True, "title": "Mi Vida en 15 Años"},
                "schedule": {"enabled": True, "title": "Itinerario"},
                "gallery": {"enabled": True, "title": "Galería"},
                "rsvp": {"enabled": True, "title": "Confirma tu asistencia"},
                "footer": {"enabled": True},
            }
        }
    },
    {
        "slug": "corporativo-techconf2026",
        "name": "Conferencia Tech 2026",
        "event_type": "corporativo",
        "config": {
            "eventName": "TechConf 2026",
            "eventDate": (datetime.now() + timedelta(days=120)).isoformat(),
            "eventType": "corporativo",
            "venue": {"name": "Centro de Convenciones", "location": "CDMX"},
            "palette": "corporate",
            "sections": {
                "hero": {"enabled": True, "subtitle": "Únete a nosotros"},
                "countdown": {"enabled": True, "label": "Próximamente"},
                "schedule": {"enabled": True, "title": "Agenda de Conferencias"},
                "accommodation": {"enabled": True, "title": "Hoteles Recomendados"},
                "gallery": {"enabled": True, "title": "Ediciones Anteriores"},
                "rsvp": {"enabled": True, "title": "Registrate"},
                "footer": {"enabled": True},
            }
        }
    }
]

def create_test_events():
    """Create test events in database"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    created_events = []

    try:
        for event_data in TEST_EVENTS:
            slug = event_data["slug"]
            name = event_data["name"]
            event_type = event_data["event_type"]
            config = event_data["config"]

            # Check if event exists
            existing = db.query(Event).filter(Event.slug == slug).first()
            if existing:
                print(f"⏭️  {slug} - ya existe, omitiendo")
                created_events.append((slug, name, event_type))
                continue

            # Create event
            event = Event(slug=slug, name=name, admin_token=f"token-{slug}")
            db.add(event)
            db.flush()

            # Create event config
            event_config = EventConfig(
                event_slug=slug,
                event_type=event_type,
                config_json=json.dumps(config, ensure_ascii=False, indent=2)
            )
            db.add(event_config)

            print(f"✅ {slug} - Creado ({event_type})")
            created_events.append((slug, name, event_type))

        db.commit()
        print(f"\n{'='*60}")
        print(f"Total eventos creados: {len(created_events)}")
        print(f"{'='*60}\n")

        # Print links
        print("📍 LINKS PARA ACCEDER A CADA EVENTO:\n")

        for slug, name, event_type in created_events:
            local_url = f"http://localhost:5176/e/{slug}"
            prod_url = f"https://eventique.tecnopowerpy.top/e/{slug}"
            print(f"{name}")
            print(f"  Tipo: {event_type}")
            print(f"  Local:  {local_url}")
            print(f"  Prod:   {prod_url}")
            print()

        print(f"{'='*60}")
        print("Para testear eventos locales:")
        print("  1. Inicia frontend: cd frontend && npm run dev")
        print("  2. Inicia API: uvicorn api.main:app --reload --port 8700")
        print("  3. Abre en browser: http://localhost:5176/e/{slug}")
        print(f"{'='*60}\n")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()

    return True

if __name__ == "__main__":
    success = create_test_events()
    sys.exit(0 if success else 1)
