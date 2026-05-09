#!/usr/bin/env python3
"""
Deterministic Eventique QA scenario catalog.

The catalog is data-driven: every event is derived from supported product
dimensions instead of one-off fixtures. It can be used by DB seeders, API
seeders, documentation, and validation scripts.
"""

from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from typing import Any


CATALOG_VERSION = "2026.05.08"
DEFAULT_COUNT = 50
DEFAULT_PREFIX = "qa50"
DEFAULT_PUBLIC_BASE_URL = "https://eventique.tecnopowerpy.top"

EVENT_TYPES = [
    "boda",
    "cumpleanos",
    "bautismo",
    "quinceanera",
    "graduacion",
    "corporativo",
    "primera-comunion",
    "aniversario",
    "baby-shower",
]

SKINS = ["classic", "envelope", "paper-access"]
INVITATION_MODES = ["generic", "personalized", "hybrid"]
MUSIC_PROFILES = ["youtube-single", "youtube-playlist", "disabled"]
GIFT_PROFILES = ["registry", "bank", "both", "none"]
VENUE_PROFILES = ["single", "ceremony-reception"]
RSVP_PROFILES = ["open", "deadline", "limited", "song-request"]
GUEST_PROFILES = ["general", "family", "vip", "staff"]

PALETTES_BY_EVENT_TYPE: dict[str, list[str]] = {
    "boda": ["rose-gold", "burgundy", "gold-premium", "sage", "paper-olive"],
    "cumpleanos": ["coral", "peach", "teal", "lavender"],
    "bautismo": ["mint", "sage", "cream", "ocean"],
    "quinceanera": ["lavender", "peach", "rose-gold", "burgundy"],
    "graduacion": ["sapphire", "denim", "navy-gold", "platinum"],
    "corporativo": ["platinum", "denim", "sapphire", "teal"],
    "primera-comunion": ["mint", "cream", "sage", "rose-gold"],
    "aniversario": ["gold-premium", "burgundy", "rose-gold", "midnight"],
    "baby-shower": ["mint", "peach", "lavender", "cream"],
}


@dataclass(frozen=True)
class EventTypeSpec:
    label: str
    display_name: str
    person1: tuple[str, str]
    person2: tuple[str, str]
    parents1: str
    parents2: str
    ceremony_label: str
    reception_label: str
    city: str
    country: str
    dress_code: str
    hero_subtitle: str
    rsvp_title: str


EVENT_TYPE_SPECS: dict[str, EventTypeSpec] = {
    "boda": EventTypeSpec(
        label="Boda",
        display_name="Isabel & Mateo",
        person1=("Isabel", "Rojas"),
        person2=("Mateo", "Vargas"),
        parents1="Familia Rojas Duarte",
        parents2="Familia Vargas Benitez",
        ceremony_label="Ceremonia",
        reception_label="Recepcion",
        city="Asuncion",
        country="Paraguay",
        dress_code="Formal",
        hero_subtitle="Celebramos nuestro matrimonio",
        rsvp_title="Confirma tu asistencia",
    ),
    "cumpleanos": EventTypeSpec(
        label="Cumpleanos",
        display_name="Cumpleanos de Ana",
        person1=("Ana", "Molina"),
        person2=("", ""),
        parents1="Familia Molina",
        parents2="",
        ceremony_label="Celebracion",
        reception_label="After",
        city="San Lorenzo",
        country="Paraguay",
        dress_code="Casual elegante",
        hero_subtitle="Una noche para celebrar",
        rsvp_title="Confirmar asistencia",
    ),
    "bautismo": EventTypeSpec(
        label="Bautismo",
        display_name="Bautismo de Sofia",
        person1=("Sofia", "Acosta"),
        person2=("Familia", "Acosta"),
        parents1="Padrinos de bautismo",
        parents2="Abuelos maternos y paternos",
        ceremony_label="Iglesia",
        reception_label="Almuerzo",
        city="Luque",
        country="Paraguay",
        dress_code="Semi formal",
        hero_subtitle="Acompananos en este sacramento",
        rsvp_title="Confirmar presencia",
    ),
    "quinceanera": EventTypeSpec(
        label="Quinceanera",
        display_name="15 anos de Valeria",
        person1=("Valeria", "Caceres"),
        person2=("", ""),
        parents1="Familia Caceres",
        parents2="",
        ceremony_label="Recepcion",
        reception_label="Fiesta",
        city="Fernando de la Mora",
        country="Paraguay",
        dress_code="Gala",
        hero_subtitle="Mis quince anos",
        rsvp_title="Confirma si vienes",
    ),
    "graduacion": EventTypeSpec(
        label="Graduacion",
        display_name="Graduacion de Diego",
        person1=("Diego", "Torres"),
        person2=("", ""),
        parents1="Familia Torres",
        parents2="",
        ceremony_label="Acto academico",
        reception_label="Brindis",
        city="Asuncion",
        country="Paraguay",
        dress_code="Formal academico",
        hero_subtitle="Celebramos este logro",
        rsvp_title="Confirmar asistencia",
    ),
    "corporativo": EventTypeSpec(
        label="Corporativo",
        display_name="Summit Tecnopower",
        person1=("Tecnopower", "PY"),
        person2=("Equipo", "Organizador"),
        parents1="Sponsors principales",
        parents2="",
        ceremony_label="Acreditacion",
        reception_label="Networking",
        city="Asuncion",
        country="Paraguay",
        dress_code="Business casual",
        hero_subtitle="Experiencia corporativa para invitados",
        rsvp_title="Registrar asistencia",
    ),
    "primera-comunion": EventTypeSpec(
        label="Primera Comunion",
        display_name="Primera Comunion de Lucia",
        person1=("Lucia", "Paredes"),
        person2=("Familia", "Paredes"),
        parents1="Padrinos de bautismo",
        parents2="Padrinos de primera comunion",
        ceremony_label="Misa",
        reception_label="Encuentro familiar",
        city="Capiata",
        country="Paraguay",
        dress_code="Semi formal claro",
        hero_subtitle="Acompananos en este dia de fe",
        rsvp_title="Confirmar presencia",
    ),
    "aniversario": EventTypeSpec(
        label="Aniversario",
        display_name="Aniversario de Clara & Raul",
        person1=("Clara", "Medina"),
        person2=("Raul", "Silva"),
        parents1="Familia Medina",
        parents2="Familia Silva",
        ceremony_label="Cena",
        reception_label="Brindis",
        city="Encarnacion",
        country="Paraguay",
        dress_code="Elegante",
        hero_subtitle="Celebramos un nuevo aniversario",
        rsvp_title="Confirmar asistencia",
    ),
    "baby-shower": EventTypeSpec(
        label="Baby Shower",
        display_name="Baby Shower de Emma",
        person1=("Emma", "Gonzalez"),
        person2=("Camila", "Gonzalez"),
        parents1="Familia Gonzalez",
        parents2="",
        ceremony_label="Bienvenida",
        reception_label="Celebracion",
        city="Mariano Roque Alonso",
        country="Paraguay",
        dress_code="Tonos suaves",
        hero_subtitle="Esperamos a Emma",
        rsvp_title="Confirmar asistencia",
    ),
}


def build_scenarios(
    *,
    count: int = DEFAULT_COUNT,
    prefix: str = DEFAULT_PREFIX,
    public_base_url: str = DEFAULT_PUBLIC_BASE_URL,
    start_date: date | None = None,
) -> list[dict[str, Any]]:
    """Build a deterministic list of scenario events."""
    if count < 1:
        raise ValueError("count must be >= 1")
    start = start_date or date.today()
    scenarios: list[dict[str, Any]] = []
    for index in range(count):
        event_type = EVENT_TYPES[index % len(EVENT_TYPES)]
        skin = SKINS[(index // len(EVENT_TYPES)) % len(SKINS)]
        mode = INVITATION_MODES[index % len(INVITATION_MODES)]
        music_profile = MUSIC_PROFILES[(index // 2) % len(MUSIC_PROFILES)]
        gift_profile = GIFT_PROFILES[(index // 3) % len(GIFT_PROFILES)]
        venue_profile = VENUE_PROFILES[(index // 5) % len(VENUE_PROFILES)]
        rsvp_profile = RSVP_PROFILES[(index // 7) % len(RSVP_PROFILES)]
        guest_profile = GUEST_PROFILES[index % len(GUEST_PROFILES)]

        scenario_number = index + 1
        event_day = start + timedelta(days=45 + index * 3)
        slug = (
            f"{prefix}-{scenario_number:02d}-{event_type}-"
            f"{_skin_slug(skin)}-{_mode_slug(mode)}"
        )
        name = f"QA {scenario_number:02d} - {EVENT_TYPE_SPECS[event_type].label} - {_skin_label(skin)}"
        config = _build_config(
            scenario_number=scenario_number,
            event_type=event_type,
            skin=skin,
            mode=mode,
            music_profile=music_profile,
            gift_profile=gift_profile,
            venue_profile=venue_profile,
            rsvp_profile=rsvp_profile,
            guest_profile=guest_profile,
            event_day=event_day,
            public_base_url=public_base_url,
        )
        scenarios.append(
            {
                "id": f"SCN-{scenario_number:03d}",
                "slug": slug,
                "name": name,
                "event_type": event_type,
                "dimensions": {
                    "skin": skin,
                    "invitation_mode": mode,
                    "music_profile": music_profile,
                    "gift_profile": gift_profile,
                    "venue_profile": venue_profile,
                    "rsvp_profile": rsvp_profile,
                    "guest_profile": guest_profile,
                },
                "config": config,
                "sample_guest": _build_sample_guest(scenario_number, guest_profile),
                "sample_rsvp": _build_sample_rsvp(scenario_number, rsvp_profile),
            }
        )
    return scenarios


def summarize_coverage(scenarios: list[dict[str, Any]]) -> dict[str, Any]:
    """Return dimension coverage for reporting and validation."""
    coverage: dict[str, Any] = {
        "total": len(scenarios),
        "event_types": {},
        "skins": {},
        "invitation_modes": {},
        "music_profiles": {},
        "gift_profiles": {},
        "venue_profiles": {},
        "rsvp_profiles": {},
        "guest_profiles": {},
    }
    dimension_keys = {
        "skins": "skin",
        "invitation_modes": "invitation_mode",
        "music_profiles": "music_profile",
        "gift_profiles": "gift_profile",
        "venue_profiles": "venue_profile",
        "rsvp_profiles": "rsvp_profile",
        "guest_profiles": "guest_profile",
    }
    for scenario in scenarios:
        event_type = scenario["event_type"]
        coverage["event_types"][event_type] = coverage["event_types"].get(event_type, 0) + 1
        dimensions = scenario["dimensions"]
        for output_key, dimension_key in dimension_keys.items():
            value = dimensions[dimension_key]
            coverage[output_key][value] = coverage[output_key].get(value, 0) + 1
    return coverage


def _build_config(
    *,
    scenario_number: int,
    event_type: str,
    skin: str,
    mode: str,
    music_profile: str,
    gift_profile: str,
    venue_profile: str,
    rsvp_profile: str,
    guest_profile: str,
    event_day: date,
    public_base_url: str,
) -> dict[str, Any]:
    spec = EVENT_TYPE_SPECS[event_type]
    palette = "paper-olive" if skin == "paper-access" else _palette_for(event_type, scenario_number)
    same_venue = venue_profile == "single"
    ceremony_dt = datetime.combine(event_day, time(17, 0)).isoformat()
    reception_dt = datetime.combine(event_day, time(20, 0)).isoformat()
    display_date = event_day.strftime("%d/%m/%Y")
    max_guests = 2 if rsvp_profile == "limited" else 6
    allow_song_request = rsvp_profile in {"song-request", "open"}

    config: dict[str, Any] = {
        "event_type": event_type,
        "couple": {
            "person1": {
                "firstName": spec.person1[0],
                "lastName": spec.person1[1],
                "parents": spec.parents1 or None,
            },
            "person2": {
                "firstName": spec.person2[0],
                "lastName": spec.person2[1],
                "parents": spec.parents2 or None,
            },
            "displayNames": f"{spec.display_name} - Caso QA {scenario_number:02d}",
            "hashtag": f"#EventiqueQA{scenario_number:02d}",
        },
        "dates": {
            "ceremony": ceremony_dt,
            "reception": reception_dt,
            "timezone": "America/Asuncion",
            "displayDate": display_date,
        },
        "venues": {
            "ceremony": _venue(spec, spec.ceremony_label, scenario_number, "17:00"),
            "reception": _venue(spec, spec.reception_label, scenario_number, "20:00"),
            "sameVenue": same_venue,
        },
        "theme": {
            "palette": palette,
            "language": "es",
            "fonts": {
                "heading": "Cormorant Garamond",
                "subheading": "Playfair Display",
                "body": "Jost",
            },
        },
        "sections": _sections(spec, scenario_number, rsvp_profile, max_guests, allow_song_request),
        "music": _music(music_profile),
        "social": {"hashtag": f"#EventiqueQA{scenario_number:02d}"},
        "gift_registry_enabled": gift_profile in {"registry", "both"},
        "gift_registry_url": f"{public_base_url.rstrip('/')}/e/qa-regalos-{scenario_number:02d}",
        "gift_registry_label": "Ver opciones de regalo",
        "gift_registry_title": "Regalos",
        "gift_registry_description": "La configuracion de regalos se valida desde este escenario QA.",
        "gift_bank_enabled": gift_profile in {"bank", "both"},
        "gift_bank_title": "Datos para obsequio",
        "gift_bank_body": "Canal de prueba para validar obsequios por transferencia.",
        "gift_bank_accounts": [
            {"label": "Alias QA", "value": f"eventique.qa.{scenario_number:02d}"},
            {"label": "Referencia", "value": f"QA-{scenario_number:02d}-{event_type}"},
        ],
        "invitation_mode": mode,
        "allow_public_rsvp": mode in {"generic", "hybrid"},
        "require_invitation_token_for_rsvp": mode == "personalized",
        "track_invitation_opens": mode in {"personalized", "hybrid"},
        "allow_guest_self_edit": mode in {"personalized", "hybrid"},
        "allow_guest_member_names": guest_profile in {"family", "vip"},
        "allow_guest_count_change": rsvp_profile != "limited",
        "rsvp_enforce_pass_limit": rsvp_profile == "limited" or mode == "personalized",
        "show_reserved_passes_message": mode in {"personalized", "hybrid"},
        "whatsapp_template": (
            "Hola {display_name}, te invitamos a {event_name}. "
            "Fecha: {event_date}. Link: {invitation_url}"
        ),
        "personalized_full_view": mode in {"personalized", "hybrid"},
        "personalized_hero_badge_enabled": True,
        "personalized_hero_badge_label": "Invitacion especial para",
        "personalized_greeting_enabled": True,
        "personalized_greeting_position": "after_hero",
        "personalized_greeting_title": "Tu acceso personalizado",
        "personalized_greeting_body": "Este escenario valida personalizacion, cupos reservados y flags por invitado.",
        "personalized_show_passes": True,
        "personalized_passes_label": "Hemos reservado {passes} lugar(es) para ti.",
        "personalized_show_type_badge": True,
        "personalized_show_countdown": True,
        "personalized_countdown_label": "Faltan {days} dias",
        "conditional_flag_meta": {
            "after_party": {
                "title": "After Party",
                "body": "Acceso habilitado para este grupo de invitados.",
            },
            "transporte": {
                "title": "Transporte incluido",
                "body": "El traslado esta contemplado en el escenario.",
            },
            "mesa_principal": {
                "title": "Mesa principal",
                "body": "Ubicacion preferencial parametrizada para invitados VIP.",
            },
        },
        "personalized_rsvp_step1_title": "Podras acompanarnos?",
        "personalized_rsvp_step2_attending_title": "Datos de asistencia",
        "personalized_rsvp_step2_declined_title": "Gracias por avisarnos",
        "personalized_rsvp_step2_declined_body": "Registramos que no podras asistir.",
        "personalized_rsvp_step3_title": "Detalles finales",
        "personalized_rsvp_confirmed_title": "Confirmacion registrada",
        "personalized_rsvp_confirmed_body_attending": "Tu asistencia quedo registrada.",
        "personalized_rsvp_confirmed_body_declined": "Tu respuesta quedo registrada.",
        "invitation_skin": skin,
        "envelope_opening_text": "Empieza una nueva etapa",
        "envelope_tap_label": "Toca aqui",
        "collage_countdown_label": "Faltan",
        "collage_subtitle": spec.label,
        "collage_monogram_separator": "|",
        "venues_ceremony_label": spec.ceremony_label,
        "venues_reception_label": spec.reception_label,
        "venues_ceremony_icon": "church",
        "venues_reception_icon": "champagne",
        "dress_code_enabled": True,
        "dress_code_title": "Codigo de vestimenta",
        "dress_code_value": spec.dress_code,
        "gallery_polaroid_enabled": skin == "envelope",
        "gallery_polaroid_footer_text": "Te esperamos",
        "gallery_polaroid_bw": scenario_number % 2 == 0,
        "paper_access_intro_label": "Invitacion digital",
        "paper_access_intro_text": "Abre tu acceso al evento",
        "paper_access_tap_label": "Toca aqui",
        "paper_access_guest_label": "Invitacion especial para",
        "paper_access_passes_label": "Hemos reservado {passes} cupo(s) para ti.",
        "paper_floral_decor_enabled": True,
        "paper_floral_decor_style": "green-pinocchio-white-roses",
        "paper_floral_decor_density": "balanced",
        "paper_floral_decor_opacity": 0.62,
        "paper_music_card_enabled": True,
        "paper_music_prompt": "Dale play para escuchar la musica del evento",
        "paper_music_button_label": "Reproducir musica",
        "paper_parents_intro": "En compania de nuestras familias",
        "paper_calendar_title": "Agendalo",
        "paper_calendar_button_label": "Agregar al calendario",
        "paper_venues_title": "Detalles del evento",
        "paper_location_button_label": "Ubicacion",
        "paper_gift_intro": "Tu presencia es lo mas importante.",
        "paper_countdown_title": "Faltan",
        "paper_countdown_subtitle": "Para este gran dia",
        "paper_countdown_days_label": "Dias",
        "paper_countdown_hours_label": "Horas",
        "paper_countdown_minutes_label": "Minutos",
        "paper_rsvp_title": spec.rsvp_title,
        "qa_scenario": {
            "catalog_version": CATALOG_VERSION,
            "scenario_number": scenario_number,
            "event_type": event_type,
            "skin": skin,
            "invitation_mode": mode,
            "music_profile": music_profile,
            "gift_profile": gift_profile,
            "venue_profile": venue_profile,
            "rsvp_profile": rsvp_profile,
            "guest_profile": guest_profile,
        },
    }
    if same_venue:
        config["venues"]["reception"] = deepcopy(config["venues"]["ceremony"])
        config["venues"]["reception"]["time"] = "20:00"
    return config


def _sections(
    spec: EventTypeSpec,
    scenario_number: int,
    rsvp_profile: str,
    max_guests: int,
    allow_song_request: bool,
) -> dict[str, Any]:
    deadline = (date.today() + timedelta(days=30 + scenario_number)).isoformat()
    return {
        "hero": {
            "enabled": True,
            "subtitle": spec.hero_subtitle,
            "ctaLabel": spec.rsvp_title,
            "overlayOpacity": 0.42,
            "showScrollIndicator": True,
        },
        "countdown": {"enabled": True, "label": "Faltan"},
        "ourStory": {
            "enabled": True,
            "title": "Historia del evento",
            "subtitle": "Momentos clave del escenario",
            "events": [
                {
                    "date": "Inicio",
                    "title": "Creacion del evento",
                    "description": f"Escenario QA {scenario_number:02d} configurado para pruebas integrales.",
                },
                {
                    "date": "Confirmacion",
                    "title": "Gestion de invitados",
                    "description": "Valida RSVP, invitados personalizados y aislamiento multi-evento.",
                },
            ],
        },
        "schedule": {
            "enabled": True,
            "title": "Agenda",
            "items": [
                {"time": "17:00", "title": spec.ceremony_label, "location": "ceremony"},
                {"time": "20:00", "title": spec.reception_label, "location": "reception"},
            ],
        },
        "weddingParty": {
            "enabled": scenario_number % 2 == 0,
            "title": "Equipo del evento",
            "members": [
                {"name": "Coordinacion QA", "role": "Operacion", "side": "both"},
                {"name": "Anfitrion QA", "role": "Anfitrion", "side": "both"},
            ],
        },
        "gallery": {
            "enabled": True,
            "title": "Galeria",
            "subtitle": "Assets parametrizados del escenario",
            "photos": [],
        },
        "accommodation": {
            "enabled": scenario_number % 3 == 0,
            "title": "Alojamiento sugerido",
            "hotels": [
                {
                    "name": "Hotel QA Central",
                    "address": "Centro, Paraguay",
                    "priceRange": "Referencia QA",
                    "stars": 4,
                }
            ],
        },
        "faq": {
            "enabled": True,
            "title": "Preguntas frecuentes",
            "items": [
                {
                    "question": "Como confirmo asistencia?",
                    "answer": "Desde el formulario RSVP de la invitacion.",
                },
                {
                    "question": "Puedo sugerir musica?",
                    "answer": "Depende de la configuracion RSVP de este escenario.",
                },
            ],
        },
        "rsvp": {
            "enabled": True,
            "title": spec.rsvp_title,
            "subtitle": "Respuesta gestionada por Eventique",
            "deadline": deadline if rsvp_profile == "deadline" else None,
            "maxGuestsPerResponse": max_guests,
            "allowPlusOne": max_guests > 1,
            "allowDietaryRestrictions": True,
            "allowSongRequest": allow_song_request,
            "allowMessage": True,
            "confirmationMessage": "Gracias. Tu respuesta fue registrada.",
        },
        "footer": {
            "enabled": True,
            "message": "Gracias por acompanarnos.",
            "credits": f"Eventique QA {scenario_number:02d}",
        },
    }


def _venue(spec: EventTypeSpec, label: str, scenario_number: int, hour: str) -> dict[str, Any]:
    query = f"{spec.city} {spec.country}".replace(" ", "+")
    return {
        "name": f"{label} QA {scenario_number:02d}",
        "address": f"Direccion parametrizada {scenario_number:02d}",
        "city": spec.city,
        "country": spec.country,
        "mapsUrl": f"https://maps.google.com/?q={query}",
        "time": hour,
        "dresscode": spec.dress_code,
        "notes": "Recinto generado por el catalogo QA parametrizado.",
    }


def _music(profile: str) -> dict[str, Any]:
    if profile == "disabled":
        return {"enabled": False, "autoplay": False, "tracks": []}
    tracks = [
        {
            "title": "Pista QA principal",
            "artist": "Eventique",
            "url": "https://www.youtube.com/watch?v=zqlkbbJ003w",
        }
    ]
    if profile == "youtube-playlist":
        tracks.append(
            {
                "title": "Pista QA secundaria",
                "artist": "Eventique",
                "url": "https://youtu.be/zqlkbbJ003w",
            }
        )
    return {"enabled": True, "autoplay": False, "tracks": tracks}


def _build_sample_guest(scenario_number: int, guest_profile: str) -> dict[str, Any]:
    passes = {"general": 1, "family": 4, "vip": 2, "staff": 1}[guest_profile]
    flags = {
        "general": [],
        "family": ["transporte"],
        "vip": ["after_party", "mesa_principal"],
        "staff": ["transporte"],
    }[guest_profile]
    return {
        "display_name": f"Invitado QA {scenario_number:02d}",
        "contact_name": f"Contacto QA {scenario_number:02d}",
        "email": f"qa{scenario_number:02d}@eventique.tecnopowerpy.top",
        "phone": f"+595981{scenario_number:06d}",
        "group_name": f"Grupo QA {scenario_number:02d}",
        "guest_type": guest_profile,
        "allowed_passes": passes,
        "notes": "Invitado creado por seed de escenarios QA.",
        "tags": ["qa", f"scenario-{scenario_number:02d}", guest_profile],
        "conditional_flags": flags,
    }


def _build_sample_rsvp(scenario_number: int, rsvp_profile: str) -> dict[str, Any]:
    attending = rsvp_profile != "deadline"
    return {
        "name": f"RSVP QA {scenario_number:02d}",
        "email": f"rsvp.qa{scenario_number:02d}@eventique.tecnopowerpy.top",
        "attending": attending,
        "guest_count": 1 if not attending else 2,
        "plus_one_name": "Acompanante QA" if attending else None,
        "dietary_restrictions": "Sin restricciones",
        "song_request": "Pista QA principal" if rsvp_profile == "song-request" else None,
        "message": "RSVP generado por validacion de escenarios.",
    }


def _palette_for(event_type: str, scenario_number: int) -> str:
    palettes = PALETTES_BY_EVENT_TYPE[event_type]
    return palettes[(scenario_number - 1) % len(palettes)]


def _skin_slug(skin: str) -> str:
    return {"classic": "classic", "envelope": "env", "paper-access": "paper"}[skin]


def _mode_slug(mode: str) -> str:
    return {"generic": "gen", "personalized": "per", "hybrid": "hyb"}[mode]


def _skin_label(skin: str) -> str:
    return {"classic": "Classic", "envelope": "Envelope", "paper-access": "Paper Access"}[skin]


if __name__ == "__main__":
    import json

    scenarios = build_scenarios()
    print(json.dumps({"coverage": summarize_coverage(scenarios), "scenarios": scenarios}, indent=2))
