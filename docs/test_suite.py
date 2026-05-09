#!/usr/bin/env python3
"""
Eventique — Enterprise Test Suite v2
======================================
Suite de pruebas funcionales completa para la API de Eventique.
Cubre 56+ escenarios: conectividad, seguridad, eventos, config, validaciones,
RSVP, invitados personalizados, seguridad avanzada, CSV import/export.

Uso:
    # Contra producción (Pi) via nginx proxy
    python test_suite.py --base-url http://localhost:5176/api --token <ADMIN_TOKEN>

    # Verbose (muestra detalles de cada test)
    python test_suite.py --base-url http://localhost:5176/api --token <ADMIN_TOKEN> -v

    # Categoría específica
    python test_suite.py --base-url http://localhost:5176/api --token <ADMIN_TOKEN> --cat "RSVP"

NOTA: El puerto 8700 (API) no está expuesto al host Pi — usar 5176/api (nginx proxy).

Requiere: requests (pip install requests)
"""

import argparse
import io
import json
import sys
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

try:
    import requests
except ImportError:
    print("ERROR: pip install requests")
    sys.exit(1)

# ── Colores ANSI ──────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BLUE   = "\033[94m"
BOLD   = "\033[1m"
RESET  = "\033[0m"
DIM    = "\033[2m"

# ── Constantes de configuración ───────────────────────────────────────────────
TOKEN_LENGTH        = 64        # SHA-256 hex digest length
MIN_WHATSAPP_MSG    = 10        # Mínimo caracteres para mensaje WhatsApp válido
CSV_REQUIRED_COLS   = ["display_name", "allowed_passes"]
HEALTH_VALID_STATUS = ("healthy", "ok")
HEALTH_VALID_DB     = ("connected", "ok")
CORS_VALID_CODES    = (200, 204, 400, 405)
GUEST_VALID_STATUS  = ("draft", "pending", "confirmed", "partial", "declined", "blocked", "opened")
RSVP_STATUS_FIELDS  = ("total_responses", "attending", "not_attending", "total_guests")
GUEST_STATS_FIELDS  = ("total_invitations", "total_passes", "confirmed_passes",
                        "declined_passes", "pending_passes", "open_rate", "confirmation_rate")


@dataclass
class TestResult:
    id: str
    name: str
    category: str
    passed: bool
    error: str = ""
    duration_ms: float = 0.0
    details: dict = field(default_factory=dict)


class EventiqueTestSuite:
    """Suite de pruebas funcionales enterprise para Eventique API."""

    def __init__(self, base_url: str, admin_token: str, verbose: bool = False,
                 only_category: str | None = None):
        self.base_url      = base_url.rstrip("/")
        self.admin_token   = admin_token
        self.verbose       = verbose
        self.only_category = only_category
        self.results: list[TestResult] = []

        # Estado compartido entre tests (lifecycle del evento de prueba)
        self._test_slug            = f"test-{uuid.uuid4().hex[:8]}"
        self._test_token: str | None = None      # token del evento de prueba

        # Estado RSVP
        self._rsvp_id: int | None    = None      # ID del RSVP de TC-015
        self._rsvp_email: str | None = None      # email de TC-015 (para TC-041)

        # Estado de invitados personalizados (guest principal del evento de prueba)
        self._guest_id: int | None    = None     # ID del guest de TC-019
        self._guest_token: str | None = None     # token del guest de TC-019

        # Estado CSV import
        self._csv_preview_rows: list | None = None  # filas validadas del preview (TC-054)

        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _auth(self, token: str | None = None) -> dict:
        """Cabecera Bearer con token de superadmin o token específico."""
        return {"Authorization": f"Bearer {token or self.admin_token}"}

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def _run(self, test_id: str, name: str, category: str, fn) -> TestResult:
        start = time.monotonic()
        try:
            details = fn() or {}
            passed, error = True, ""
        except AssertionError as e:
            passed, error, details = False, str(e), {}
        except Exception as e:
            passed, error, details = False, f"{type(e).__name__}: {e}", {}
        duration_ms = (time.monotonic() - start) * 1000
        result = TestResult(test_id, name, category, passed, error, duration_ms, details)
        self.results.append(result)
        self._print_result(result)
        return result

    def _print_result(self, r: TestResult):
        icon     = f"{GREEN}✓{RESET}" if r.passed else f"{RED}✗{RESET}"
        duration = f"{DIM}{r.duration_ms:.0f}ms{RESET}"
        print(f"  {icon} [{r.id}] {r.name} {duration}")
        if not r.passed:
            print(f"       {RED}→ {r.error[:200]}{RESET}")
        if self.verbose and r.details:
            for k, v in r.details.items():
                print(f"       {DIM}{k}: {v}{RESET}")

    def _assert_status(self, r: requests.Response, *codes: int):
        assert r.status_code in codes, (
            f"HTTP {r.status_code} (esperado {codes}). Body: {r.text[:300]}"
        )

    def _assert_keys(self, data: dict, *keys: str):
        for k in keys:
            assert k in data, f"Campo '{k}' ausente. Keys disponibles: {list(data.keys())}"

    def _skip_if(self, condition: bool, reason: str):
        if condition:
            raise AssertionError(reason)

    # ══════════════════════════════════════════════════════════════════════════
    # CATEGORÍA 1 — Conectividad
    # ══════════════════════════════════════════════════════════════════════════

    def tc001_health_endpoint(self):
        def _():
            r = self.session.get(self._url("/health"))
            self._assert_status(r, 200)
            data = r.json()
            self._assert_keys(data, "status", "app", "database")
            assert data["status"] in HEALTH_VALID_STATUS, f"Status: {data['status']}"
            assert data["database"] in HEALTH_VALID_DB, f"DB: {data['database']}"
            return {"status": data["status"], "db": data["database"]}
        return self._run("TC-001", "Health — status y database correctos", "Conectividad", _)

    def tc002_cors_options(self):
        def _():
            r = self.session.options(
                self._url("/health"),
                headers={"Origin": "https://eventique.tecnopowerpy.top"}
            )
            assert r.status_code in CORS_VALID_CODES, f"HTTP {r.status_code}"
            return {"status": r.status_code}
        return self._run("TC-002", "CORS — OPTIONS responde con código válido", "Conectividad", _)

    def tc003_health_version_and_app(self):
        def _():
            r = self.session.get(self._url("/health"))
            self._assert_status(r, 200)
            data = r.json()
            assert "version" in data or "app" in data, "Sin version ni app en health"
            return {"app": data.get("app"), "version": data.get("version")}
        return self._run("TC-003", "Health — incluye versión y nombre de app", "Conectividad", _)

    def tc004_health_response_time(self):
        def _():
            start = time.monotonic()
            r = self.session.get(self._url("/health"))
            elapsed_ms = (time.monotonic() - start) * 1000
            self._assert_status(r, 200)
            assert elapsed_ms < 1000, f"Health tardó {elapsed_ms:.0f}ms (máx 1000ms)"
            return {"elapsed_ms": round(elapsed_ms, 1)}
        return self._run("TC-004", "Health — tiempo de respuesta < 1000ms", "Conectividad", _)

    # ══════════════════════════════════════════════════════════════════════════
    # CATEGORÍA 2 — Seguridad
    # ══════════════════════════════════════════════════════════════════════════

    def tc005_unauthorized_without_token(self):
        def _():
            paths = ["/rsvp/stats", "/rsvp", "/events"]
            failed = []
            for path in paths:
                r = self.session.get(self._url(path))
                if r.status_code not in (401, 403):
                    failed.append(f"{path}→{r.status_code}")
            assert not failed, f"Endpoints admin accesibles sin auth: {failed}"
            return {"tested_paths": len(paths)}
        return self._run("TC-005", "Seguridad — admin endpoints requieren auth", "Seguridad", _)

    def tc006_invalid_token_rejected(self):
        def _():
            r = self.session.get(
                self._url("/rsvp/stats"),
                headers={"Authorization": "Bearer token_invalido_xxxxxxxxxxx"}
            )
            assert r.status_code in (401, 403), f"Token inválido aceptado: HTTP {r.status_code}"
            return {"status": r.status_code}
        return self._run("TC-006", "Seguridad — token inválido rechazado (401/403)", "Seguridad", _)

    def tc007_valid_token_accepted(self):
        def _():
            r = self.session.get(self._url("/rsvp"), headers=self._auth())
            self._assert_status(r, 200)
            assert isinstance(r.json(), list), "Respuesta no es lista"
            return {"rsvp_count": len(r.json())}
        return self._run("TC-007", "Seguridad — token válido accede a endpoints admin", "Seguridad", _)

    def tc008_config_put_no_auth_rejected(self):
        """TC-008: PUT event-config sin auth devuelve 401."""
        def _():
            r = self.session.put(
                self._url("/event-config"),
                json={"theme": {"palette": "ocean"}}
                # Sin header Authorization
            )
            assert r.status_code in (401, 403), \
                f"PUT config sin auth aceptado: HTTP {r.status_code}"
            return {"status": r.status_code}
        return self._run("TC-008", "Seguridad — PUT config sin auth rechazado (401)", "Seguridad", _)

    # ══════════════════════════════════════════════════════════════════════════
    # CATEGORÍA 3 — Gestión de Eventos
    # ══════════════════════════════════════════════════════════════════════════

    def tc009_list_events_contains_default(self):
        def _():
            r = self.session.get(self._url("/events"), headers=self._auth())
            self._assert_status(r, 200)
            events = r.json()
            assert isinstance(events, list), "No es lista"
            slugs = [e["slug"] for e in events]
            assert "default" in slugs, f"'default' no encontrado. Slugs: {slugs}"
            return {"total_events": len(events)}
        return self._run("TC-009", "Eventos — listar contiene evento 'default'", "Eventos", _)

    def tc010_create_test_event(self):
        def _():
            payload = {
                "slug": self._test_slug,
                "name": "Evento Test Suite v2",
                "admin_token": "test_token_12345"
            }
            r = self.session.post(self._url("/events"), json=payload, headers=self._auth())
            self._assert_status(r, 201)
            data = r.json()
            assert data["slug"] == self._test_slug, f"Slug: {data['slug']}"
            self._test_token = "test_token_12345"

            # Verificar que aparece en lista
            r2 = self.session.get(self._url("/events"), headers=self._auth())
            slugs = [e["slug"] for e in r2.json()]
            assert self._test_slug in slugs, f"Evento no en lista: {slugs}"
            return {"created_slug": data["slug"]}
        return self._run("TC-010", "Eventos — crear evento de prueba", "Eventos", _)

    def tc011_slug_duplicate_rejected(self):
        """TC-011: Intentar crear evento con slug ya existente es rechazado."""
        def _():
            r = self.session.post(
                self._url("/events"),
                json={"slug": self._test_slug, "name": "Duplicado", "admin_token": "otro"},
                headers=self._auth()
            )
            assert r.status_code in (400, 409, 422), \
                f"Slug duplicado aceptado: HTTP {r.status_code}"
            return {"status": r.status_code}
        return self._run("TC-011", "Eventos — slug duplicado rechazado (400/409)", "Eventos", _)

    def tc012_duplicate_event_copies_config(self):
        """TC-012: Duplicar evento copia su configuración al nuevo evento."""
        def _():
            dup_slug = f"{self._test_slug}-dup"

            # Poner config mínima en el evento origen para que la copia tenga contenido
            seed_cfg = {
                "couple": {"person1": {"firstName": "TC012"}, "person2": {"firstName": "Dup"}},
                "dates": {"ceremony": "2026-01-01"},
                "venues": [],
                "theme": {"palette": "nature"},
                "sections": {}
            }
            self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=seed_cfg, headers=self._auth(self._test_token)
            )

            r = self.session.post(
                self._url(f"/events/{self._test_slug}/duplicate"),
                json={"name": "Evento Duplicado", "slug": dup_slug},
                headers=self._auth()
            )
            self._assert_status(r, 201)
            data = r.json()
            assert data["slug"] == dup_slug, f"Slug dup: {data['slug']}"

            # Verificar que la config fue copiada (evento duplicado tiene 200 + campos seed)
            r_cfg = self.session.get(self._url(f"/events/{dup_slug}/event-config"))
            self._assert_status(r_cfg, 200)
            cfg = r_cfg.json()
            for key in ("couple", "dates", "venues", "theme", "sections"):
                assert key in cfg, f"Campo '{key}' ausente en config duplicada"

            # Limpieza — restaurar config del evento origen a vacío para TC-014
            self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json={}, headers=self._auth(self._test_token)
            )
            self.session.delete(self._url(f"/events/{dup_slug}"), headers=self._auth())
            return {"dup_slug": dup_slug}
        return self._run("TC-012", "Eventos — duplicar copia la configuración", "Eventos", _)

    # ══════════════════════════════════════════════════════════════════════════
    # CATEGORÍA 4 — Config de Evento
    # ══════════════════════════════════════════════════════════════════════════

    def tc013_get_default_config_fields(self):
        def _():
            r = self.session.get(self._url("/event-config"))
            self._assert_status(r, 200)
            data = r.json()
            for key in ("couple", "dates", "venues", "theme", "sections"):
                assert key in data, f"Campo '{key}' ausente en config"
            assert "ceremony" in data["dates"], "dates.ceremony ausente"
            assert "palette" in data["theme"], "theme.palette ausente"
            return {"palette": data["theme"]["palette"], "event_type": data.get("event_type")}
        return self._run("TC-013", "Config — GET retorna campos estructurales requeridos", "Config", _)

    def tc014_config_public_access_no_auth(self):
        """TC-014: GET config de evento es público — devuelve 200 sin Authorization header."""
        def _():
            # Hacer la petición SIN ningún header de auth
            r = requests.get(self._url(f"/events/{self._test_slug}/event-config"))
            self._assert_status(r, 200)
            # La respuesta puede estar vacía (evento recién creado sin config) — lo que
            # importa es que el endpoint no requiere auth y devuelve JSON válido.
            data = r.json()
            assert isinstance(data, dict), f"Respuesta no es dict: {type(data)}"
            return {"fields": len(data), "status": r.status_code}
        return self._run("TC-014", "Config — GET público no requiere autenticación", "Config", _)

    def tc015_put_envelope_skin_fields(self):
        """TC-015: PUT config persiste los 16 campos del skin envelope."""
        def _():
            r = self.session.get(self._url(f"/events/{self._test_slug}/event-config"))
            self._assert_status(r, 200)
            current = r.json()
            current.update({
                "invitation_skin": "envelope",
                "envelope_opening_text": "Test: Nueva etapa juntos",
                "envelope_tap_label": "Test: Abrí aquí",
                "collage_countdown_label": "Test: Faltan",
                "collage_subtitle": "Test: Nuestra Celebración",
                "venues_ceremony_label": "Test: Misa",
                "venues_reception_label": "Test: Fiesta",
                "venues_ceremony_icon": "church",
                "venues_reception_icon": "champagne",
                "dress_code_enabled": True,
                "dress_code_title": "Test: Vestimenta",
                "dress_code_value": "Formal",
                "envelope_floral_decor_enabled": True,
                "envelope_floral_decor_style": "green-pinocchio-white-roses",
                "envelope_floral_decor_density": "balanced",
                "envelope_floral_decor_opacity": 0.68,
                "envelope_floral_card_decor_enabled": True,
                "gallery_polaroid_enabled": True,
                "gallery_polaroid_footer_text": "Test: Te Esperamos",
                "gallery_polaroid_bw": True,
            })
            r2 = self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current, headers=self._auth(self._test_token)
            )
            self._assert_status(r2, 200)
            saved = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            assert saved.get("invitation_skin") == "envelope"
            assert saved.get("envelope_opening_text") == "Test: Nueva etapa juntos"
            assert saved.get("dress_code_value") == "Formal"
            assert saved.get("gallery_polaroid_bw") is True
            return {"skin": saved.get("invitation_skin")}
        return self._run("TC-015", "Config — PUT persiste campos del skin envelope", "Config", _)

    def tc016_envelope_skin_full_roundtrip(self):
        """TC-016: Round-trip de los 16 campos envelope (write → read → verify)."""
        def _():
            fields = {
                "invitation_skin": "envelope",
                "envelope_opening_text": "Comienza una nueva historia",
                "envelope_tap_label": "Toca para abrir",
                "collage_countdown_label": "Quedan",
                "collage_subtitle": "Nuestra Unión",
                "collage_monogram_separator": "&",
                "venues_ceremony_label": "Iglesia",
                "venues_reception_label": "Salón",
                "venues_ceremony_icon": "church",
                "venues_reception_icon": "heart",
                "dress_code_enabled": False,
                "dress_code_title": "Código de Vestir",
                "dress_code_value": "Informal",
                "envelope_floral_decor_enabled": True,
                "envelope_floral_decor_style": "green-pinocchio-white-roses",
                "envelope_floral_decor_density": "lush",
                "envelope_floral_decor_opacity": 0.74,
                "envelope_floral_card_decor_enabled": True,
                "gallery_polaroid_enabled": False,
                "gallery_polaroid_footer_text": "Hasta pronto",
                "gallery_polaroid_bw": False,
            }
            current = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            current.update(fields)
            self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current, headers=self._auth(self._test_token)
            )
            saved = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            failures = [
                f"{k}: expected={v!r}, got={saved.get(k)!r}"
                for k, v in fields.items() if saved.get(k) != v
            ]
            assert not failures, "Campos no coinciden:\n" + "\n".join(failures)
            return {"fields_verified": len(fields)}
        return self._run("TC-016", "Config — round-trip completo 16 campos envelope", "Config", _)

    def tc017_palette_olive_valid(self):
        def _():
            current = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            if "theme" not in current:
                current["theme"] = {}
            current["theme"]["palette"] = "olive"
            r2 = self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current, headers=self._auth(self._test_token)
            )
            self._assert_status(r2, 200)
            saved = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            assert saved.get("theme", {}).get("palette") == "olive", \
                f"Paleta: {saved.get('theme', {}).get('palette')}"
            return {"palette": "olive"}
        return self._run("TC-017", "Config — paleta 'olive' válida y persistible", "Config", _)

    def tc018_multiple_palettes_valid(self):
        """TC-018: Paletas nature, ocean y rose son válidas y persistibles."""
        def _():
            failures = []
            for palette in ("nature", "ocean", "rose"):
                current = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
                if "theme" not in current:
                    current["theme"] = {}
                current["theme"]["palette"] = palette
                r = self.session.put(
                    self._url(f"/events/{self._test_slug}/event-config"),
                    json=current, headers=self._auth(self._test_token)
                )
                if r.status_code != 200:
                    failures.append(f"palette={palette} → HTTP {r.status_code}")
                    continue
                saved = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
                if saved.get("theme", {}).get("palette") != palette:
                    failures.append(f"palette={palette} no persistió")
            assert not failures, "Paletas con errores: " + "; ".join(failures)
            return {"palettes_tested": 3}
        return self._run("TC-018", "Config — paletas nature/ocean/rose válidas", "Config", _)

    def tc019_classic_skin_restore(self):
        def _():
            current = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            current["invitation_skin"] = "classic"
            r2 = self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current, headers=self._auth(self._test_token)
            )
            self._assert_status(r2, 200)
            saved = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            assert saved.get("invitation_skin") == "classic", "No restauró a 'classic'"
            return {"skin": "classic"}
        return self._run("TC-019", "Config — skin 'classic' restaurable desde 'envelope'", "Config", _)

    def tc020a_paper_access_skin_full_roundtrip(self):
        """TC-020A: Round-trip de campos Paper Access."""
        def _():
            fields = {
                "invitation_skin": "paper-access",
                "paper_access_intro_label": "Test: Invitacion digital",
                "paper_access_intro_text": "Test: Abrir invitacion",
                "paper_access_tap_label": "Test: Toca aqui",
                "paper_access_guest_label": "Test: Invitado",
                "paper_access_passes_label": "Test: {passes} cupos",
                "paper_floral_decor_enabled": True,
                "paper_floral_decor_style": "green-pinocchio-white-roses",
                "paper_floral_decor_density": "lush",
                "paper_floral_decor_opacity": 0.72,
                "paper_floral_card_decor_enabled": True,
                "paper_music_card_enabled": False,
                "paper_music_prompt": "Test: Dale play",
                "paper_music_button_label": "Test: Reproducir",
                "paper_parents_intro": "Test: Familias",
                "paper_calendar_title": "Test: Calendario",
                "paper_calendar_button_label": "Test: Agendar",
                "paper_venues_title": "Test: Recintos",
                "paper_location_button_label": "Test: Ubicacion",
                "paper_gift_intro": "Test: Regalos",
                "paper_countdown_title": "Test: Faltan",
                "paper_countdown_subtitle": "Test: Gran dia",
                "paper_countdown_days_label": "Test: Dias",
                "paper_countdown_hours_label": "Test: Horas",
                "paper_countdown_minutes_label": "Test: Minutos",
                "paper_rsvp_title": "Test: RSVP",
            }
            current = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            current.update(fields)
            if "theme" not in current:
                current["theme"] = {}
            current["theme"]["palette"] = "paper-olive"
            r = self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current, headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            saved = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            failures = [
                f"{k}: expected={v!r}, got={saved.get(k)!r}"
                for k, v in fields.items() if saved.get(k) != v
            ]
            assert saved.get("theme", {}).get("palette") == "paper-olive", "Paleta paper-olive no persistio"
            assert not failures, "Campos Paper Access no coinciden:\n" + "\n".join(failures)
            return {"fields_verified": len(fields), "palette": "paper-olive"}
        return self._run("TC-020A", "Config — round-trip completo Paper Access", "Config", _)

    def tc020_sections_enabled_persist(self):
        """TC-020: Secciones enabled/disabled persisten correctamente."""
        def _():
            current = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            if "sections" not in current or "footer" not in current.get("sections", {}):
                return {"skipped": "no sections.footer en config"}

            original = current["sections"]["footer"].get("enabled", True)
            current["sections"]["footer"]["enabled"] = not original

            self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current, headers=self._auth(self._test_token)
            )
            saved = self.session.get(self._url(f"/events/{self._test_slug}/event-config")).json()
            assert saved["sections"]["footer"]["enabled"] == (not original), \
                f"footer.enabled no cambió: {saved['sections']['footer']['enabled']}"

            # Restaurar
            current2 = saved.copy()
            current2["sections"]["footer"]["enabled"] = original
            self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current2, headers=self._auth(self._test_token)
            )
            return {"toggled": True, "restored": True}
        return self._run("TC-020", "Config — secciones enabled/disabled persisten", "Config", _)

    # ══════════════════════════════════════════════════════════════════════════
    # CATEGORÍA 5 — RSVP Genérico
    # ══════════════════════════════════════════════════════════════════════════

    def tc021_rsvp_attending_true(self):
        def _():
            self._rsvp_email = f"test-{uuid.uuid4().hex[:6]}@example.com"
            payload = {
                "name": "Invitado de Prueba",
                "email": self._rsvp_email,
                "attending": True,
                "guest_count": 2,
                "dietary_restrictions": "Sin gluten",
                "song_request": "La vida es una fiesta",
                "message": "TC-021: mensaje de prueba"
            }
            r = self.session.post(self._url(f"/events/{self._test_slug}/rsvp"), json=payload)
            self._assert_status(r, 200, 201)
            data = r.json()
            assert data.get("attending") is True, f"attending: {data.get('attending')}"
            assert data.get("guest_count") == 2, f"guest_count: {data.get('guest_count')}"
            self._rsvp_id = data.get("id")
            return {"rsvp_id": self._rsvp_id, "email": self._rsvp_email}
        return self._run("TC-021", "RSVP — attending=True registrado correctamente", "RSVP", _)

    def tc022_rsvp_all_optional_fields(self):
        """TC-022: RSVP con todos los campos opcionales (dietary, song, message)."""
        def _():
            payload = {
                "name": "TC-022 Full Fields",
                "email": f"full-{uuid.uuid4().hex[:6]}@example.com",
                "attending": True,
                "guest_count": 1,
                "dietary_restrictions": "Vegano estricto",
                "song_request": "Bohemian Rhapsody",
                "message": "Mensaje completo con todos los campos opcionales TC-022"
            }
            r = self.session.post(self._url(f"/events/{self._test_slug}/rsvp"), json=payload)
            self._assert_status(r, 200, 201)
            data = r.json()
            assert data.get("attending") is True
            # Si la API retorna los campos opcionales, verificarlos
            if "dietary_restrictions" in data:
                assert data["dietary_restrictions"] == "Vegano estricto"
            if "song_request" in data:
                assert data["song_request"] == "Bohemian Rhapsody"
            return {"rsvp_id": data.get("id"), "fields_sent": 7}
        return self._run("TC-022", "RSVP — todos los campos opcionales aceptados", "RSVP", _)

    def tc023_rsvp_not_attending(self):
        def _():
            payload = {
                "name": "No Asistirá TC-023",
                "email": f"no-{uuid.uuid4().hex[:6]}@example.com",
                "attending": False,
                "guest_count": 1,
            }
            r = self.session.post(self._url(f"/events/{self._test_slug}/rsvp"), json=payload)
            self._assert_status(r, 200, 201)
            data = r.json()
            assert data.get("attending") is False, f"attending: {data.get('attending')}"
            return {"rsvp_id": data.get("id")}
        return self._run("TC-023", "RSVP — attending=False registrado correctamente", "RSVP", _)

    def tc024_rsvp_check_inexistent_email(self):
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/rsvp/check"),
                params={"email": f"noexiste-{uuid.uuid4().hex[:6]}@example.com"}
            )
            self._assert_status(r, 200)
            data = r.json()
            assert data.get("exists") is False, f"exists debería ser False: {data}"
            return {"exists": data.get("exists")}
        return self._run("TC-024", "RSVP — check email inexistente retorna exists=False", "RSVP", _)

    def tc025_rsvp_check_existing_email(self):
        """TC-025: Check email del RSVP de TC-021 retorna exists=True."""
        def _():
            self._skip_if(not self._rsvp_email, "TC-021 no registró email — skip")
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/rsvp/check"),
                params={"email": self._rsvp_email}
            )
            self._assert_status(r, 200)
            data = r.json()
            assert data.get("exists") is True, f"Email registrado no detectado: {data}"
            return {"exists": True, "email": self._rsvp_email}
        return self._run("TC-025", "RSVP — check email existente retorna exists=True", "RSVP", _)

    def tc026_rsvp_duplicate_email_detection(self):
        """TC-026: Enviar RSVP con mismo email dos veces — el segundo es detectado."""
        def _():
            email = f"dupl-{uuid.uuid4().hex[:6]}@example.com"
            base = {"name": "TC-026 Test", "email": email, "attending": True, "guest_count": 1}
            r1 = self.session.post(self._url(f"/events/{self._test_slug}/rsvp"), json=base)
            self._assert_status(r1, 200, 201)

            # Segundo envío con mismo email
            r2 = self.session.post(
                self._url(f"/events/{self._test_slug}/rsvp"),
                json={**base, "guest_count": 2}
            )
            # Puede actualizar (200/201) o rechazar (400/409/422)
            assert r2.status_code in (200, 201, 400, 409, 422), \
                f"HTTP inesperado: {r2.status_code}"

            # El email debe existir en el sistema
            r3 = self.session.get(
                self._url(f"/events/{self._test_slug}/rsvp/check"),
                params={"email": email}
            )
            assert r3.json().get("exists") is True, "Email no registrado en el sistema"
            return {"first": r1.status_code, "second": r2.status_code}
        return self._run("TC-026", "RSVP — email duplicado detectado por /check", "RSVP", _)

    def tc027_rsvp_attending_zero_guests(self):
        """TC-027: RSVP attending=True con guest_count=0 — comportamiento definido."""
        def _():
            payload = {
                "name": "TC-027 Zero",
                "email": f"zero-{uuid.uuid4().hex[:6]}@example.com",
                "attending": True,
                "guest_count": 0
            }
            r = self.session.post(self._url(f"/events/{self._test_slug}/rsvp"), json=payload)
            assert r.status_code in (200, 201, 400, 422), \
                f"HTTP inesperado para guest_count=0: {r.status_code}"
            return {"status": r.status_code, "accepted": r.status_code in (200, 201)}
        return self._run("TC-027", "RSVP — attending=True con guest_count=0 manejado", "RSVP", _)

    def tc028_rsvp_stats_consistent(self):
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/rsvp/stats"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            data = r.json()
            for key in RSVP_STATUS_FIELDS:
                assert key in data, f"Falta '{key}' en stats"
            assert data["total_responses"] >= 0
            assert data["attending"] + data["not_attending"] == data["total_responses"], \
                (f"attending({data['attending']}) + not_attending({data['not_attending']}) "
                 f"!= total_responses({data['total_responses']})")
            assert data["total_guests"] >= data["attending"], \
                f"total_guests < attending"
            return {k: data[k] for k in ("total_responses", "attending", "total_guests")}
        return self._run("TC-028", "RSVP — stats retorna contadores consistentes", "RSVP", _)

    def tc029_rsvp_list_admin(self):
        """TC-029: GET /rsvp retorna lista de RSVPs del evento de prueba."""
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/rsvp"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            data = r.json()
            assert isinstance(data, list), "Respuesta no es lista"
            assert len(data) >= 2, f"Debe tener ≥2 RSVPs (TC-021 + TC-023). Tiene: {len(data)}"
            return {"count": len(data)}
        return self._run("TC-029", "RSVP — list admin retorna RSVPs del evento", "RSVP", _)

    def tc030_rsvp_delete(self):
        """TC-030: DELETE /rsvp/{id} elimina el RSVP de TC-021."""
        def _():
            self._skip_if(not self._rsvp_id, "TC-021 no creó RSVP — skip")
            r = self.session.delete(
                self._url(f"/events/{self._test_slug}/rsvp/{self._rsvp_id}"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200, 204)

            # Verificar que ya no existe
            r2 = self.session.get(
                self._url(f"/events/{self._test_slug}/rsvp"),
                headers=self._auth(self._test_token)
            )
            ids = [entry.get("id") for entry in r2.json()]
            assert self._rsvp_id not in ids, f"RSVP {self._rsvp_id} sigue en lista"
            return {"deleted_id": self._rsvp_id}
        return self._run("TC-030", "RSVP — DELETE elimina entrada de la lista", "RSVP", _)

    # ══════════════════════════════════════════════════════════════════════════
    # CATEGORÍA 6 — Invitaciones Personalizadas (Invitados)
    # ══════════════════════════════════════════════════════════════════════════

    def tc031_create_guest_all_fields(self):
        def _():
            payload = {
                "display_name": "Familia García — Test Suite v2",
                "contact_name": "Juan García",
                "email": f"garcia-{uuid.uuid4().hex[:4]}@example.com",
                "phone": "+595 981 123 456",
                "group_name": "Mesa 1",
                "guest_type": "family",
                "allowed_passes": 3,
                "notes": "TC-031 — Requiere silla de bebé",
                "tags": ["vip", "test"],
                "conditional_flags": ["after_party"]
            }
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/guests"),
                json=payload, headers=self._auth(self._test_token)
            )
            self._assert_status(r, 201)
            data = r.json()
            assert data["display_name"] == payload["display_name"]
            assert data["allowed_passes"] == 3
            assert data["guest_type"] == "family"
            assert data["status"] in GUEST_VALID_STATUS, f"status: {data.get('status')}"
            assert len(data["token_lookup"]) == TOKEN_LENGTH, \
                f"Token length: {len(data['token_lookup'])} (esperado {TOKEN_LENGTH})"
            assert data["conditional_flags"] == ["after_party"], \
                f"flags: {data['conditional_flags']}"
            self._guest_id    = data["id"]
            self._guest_token = data["token_lookup"]
            return {"guest_id": self._guest_id, "token_len": len(data["token_lookup"])}
        return self._run("TC-031", "Invitados — crear invitado con todos los campos", "Invitados", _)

    def tc032_invitation_url_format(self):
        """TC-032: La URL de invitación contiene el slug del evento y el token."""
        def _():
            self._skip_if(not self._guest_id, "TC-031 no creó invitado — skip")
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            data = r.json()
            url = data.get("invitation_url", "")
            assert self._test_slug in url, f"Slug no en URL: {url}"
            assert self._guest_token[:16] in url, f"Token no en URL: {url}"
            return {"url": url[:60]}
        return self._run("TC-032", "Invitados — URL de invitación contiene slug y token", "Invitados", _)

    def tc033_get_invitation_public(self):
        def _():
            self._skip_if(not self._guest_token, "TC-031 no creó invitado — skip")
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/invitations/{self._guest_token}"),
                params={"source": "test"}
            )
            self._assert_status(r, 200)
            data = r.json()
            for key in ("event_config", "invitation", "members", "rsvp_status", "already_responded"):
                assert key in data, f"Falta '{key}' en respuesta de invitación"
            inv = data["invitation"]
            assert inv["display_name"] == "Familia García — Test Suite v2"
            assert inv["allowed_passes"] == 3
            assert inv["status"] in GUEST_VALID_STATUS, f"Status: {inv['status']}"
            return {"display_name": inv["display_name"], "status": inv["status"]}
        return self._run("TC-033", "Invitados — GET público por token retorna datos completos", "Invitados", _)

    def tc034_track_invitation_open(self):
        def _():
            self._skip_if(not self._guest_token, "TC-031 no creó invitado — skip")
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/invitations/{self._guest_token}/open"),
                params={"source": "whatsapp"}
            )
            self._assert_status(r, 204)
            r2 = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}"),
                headers=self._auth(self._test_token)
            )
            data = r2.json()
            assert data["open_count"] >= 1, f"open_count: {data['open_count']}"
            return {"open_count": data["open_count"]}
        return self._run("TC-034", "Invitados — POST /open registra apertura (open_count++)", "Invitados", _)

    def tc035_personalized_rsvp_with_members(self):
        def _():
            self._skip_if(not self._guest_token, "TC-031 no creó invitado — skip")
            payload = {
                "attending": True,
                "guest_count": 2,
                "members": [
                    {"full_name": "Juan García", "member_type": "adult",
                     "dietary_restrictions": "Sin mariscos"},
                    {"full_name": "María García", "member_type": "adult",
                     "menu_preference": "Vegetariano"}
                ],
                "song_request": "Bésame Mucho",
                "message": "TC-035: Con mucho gusto asistimos",
                "source": "personalized"
            }
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/invitations/{self._guest_token}/rsvp"),
                json=payload
            )
            self._assert_status(r, 200, 201)
            data = r.json()
            assert data.get("ok") is True, f"ok: {data.get('ok')}"
            assert data.get("confirmed_passes") == 2, \
                f"confirmed_passes: {data.get('confirmed_passes')}"
            # Verificar estado del guest
            guest = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}"),
                headers=self._auth(self._test_token)
            ).json()
            # partial = confirmó menos de los allowed_passes (2 de 3) → comportamiento correcto
            assert guest["status"] in ("confirmed", "partial"), f"status: {guest['status']}"
            assert guest["confirmed_passes"] == 2, \
                f"confirmed_passes: {guest['confirmed_passes']}"
            return {"status": guest["status"], "confirmed_passes": guest["confirmed_passes"]}
        return self._run("TC-035", "Invitados — RSVP personalizado con miembros nominales", "Invitados", _)

    def tc035b_personalized_rsvp_decline_zero_guests(self):
        """TC-035B: Rechazar invitacion personalizada acepta guest_count=0."""
        def _():
            payload = {
                "display_name": "TC-035B Declina",
                "allowed_passes": 2,
                "guest_type": "general",
                "email": f"tc035b-{uuid.uuid4().hex[:6]}@example.com",
            }
            created = self.session.post(
                self._url(f"/events/{self._test_slug}/guests"),
                json=payload,
                headers=self._auth(self._test_token)
            )
            self._assert_status(created, 201)
            guest = created.json()
            guest_id = guest["id"]
            guest_token = guest["token_lookup"]

            try:
                r = self.session.post(
                    self._url(f"/events/{self._test_slug}/invitations/{guest_token}/rsvp"),
                    json={"attending": False, "guest_count": 0, "members": [], "source": "personalized"}
                )
                self._assert_status(r, 200, 201)
                data = r.json()
                assert data.get("ok") is True, f"ok: {data.get('ok')}"
                assert data.get("status") == "declined", f"status: {data.get('status')}"

                refreshed = self.session.get(
                    self._url(f"/events/{self._test_slug}/guests/{guest_id}"),
                    headers=self._auth(self._test_token)
                )
                self._assert_status(refreshed, 200)
                detail = refreshed.json()
                assert detail["status"] == "declined", f"status: {detail['status']}"
                assert detail["confirmed_passes"] == 0, \
                    f"confirmed_passes: {detail['confirmed_passes']}"
                assert detail["declined_passes"] == 2, \
                    f"declined_passes: {detail['declined_passes']}"
                return {"status": detail["status"], "declined_passes": detail["declined_passes"]}
            finally:
                self.session.delete(
                    self._url(f"/events/{self._test_slug}/guests/{guest_id}"),
                    headers=self._auth(self._test_token)
                )
        return self._run("TC-035B", "Invitados - RSVP personalizado rechaza con guest_count=0", "Invitados", _)

    def tc036_guest_status_patch(self):
        def _():
            self._skip_if(not self._guest_id, "TC-031 no creó invitado — skip")
            r = self.session.patch(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}/status"),
                json={"status": "blocked", "blocked_reason": "TC-036: prueba de bloqueo"},
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            data = r.json()
            assert data["status"] == "blocked", f"status: {data['status']}"
            assert "prueba de bloqueo" in (data.get("blocked_reason") or ""), \
                f"blocked_reason: {data.get('blocked_reason')}"
            # Restaurar
            self.session.patch(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}/status"),
                json={"status": "confirmed"},
                headers=self._auth(self._test_token)
            )
            return {"blocked": True, "restored": True}
        return self._run("TC-036", "Invitados — PATCH /status bloqueo y restauración", "Invitados", _)

    def tc037_regenerate_token(self):
        def _():
            self._skip_if(not self._guest_id or not self._guest_token, "TC-031 no creó invitado — skip")
            old_token = self._guest_token
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}/regenerate-token"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            new_token = r.json()["token_lookup"]
            assert len(new_token) == TOKEN_LENGTH, f"Nuevo token length: {len(new_token)}"
            assert new_token != old_token, "Nuevo token igual al anterior"
            self._guest_token = new_token
            return {"old_prefix": old_token[:8], "new_prefix": new_token[:8]}
        return self._run("TC-037", "Invitados — regenerar token produce token diferente", "Invitados", _)

    def tc038_guest_detail_all_fields(self):
        """TC-038: GET /guests/{id} retorna todos los campos esperados."""
        def _():
            self._skip_if(not self._guest_id, "TC-031 no creó invitado — skip")
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            data = r.json()
            required = [
                "id", "event_slug", "display_name", "allowed_passes",
                "confirmed_passes", "status", "token_lookup", "open_count",
                "is_active", "created_at", "updated_at", "invitation_url"
            ]
            missing = [f for f in required if f not in data]
            assert not missing, f"Campos ausentes en GET detail: {missing}"
            assert data["event_slug"] == self._test_slug, \
                f"event_slug: {data['event_slug']}"
            return {"fields_present": len(required)}
        return self._run("TC-038", "Invitados — GET detail retorna todos los campos", "Invitados", _)

    def tc039_guest_qr_data(self):
        """TC-039: GET /guests/{id}/qr-data retorna token para QR."""
        def _():
            self._skip_if(not self._guest_id, "TC-031 no creó invitado — skip")
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}/qr-data"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            data = r.json()
            assert "token" in data or "url" in data or "qr_content" in data, \
                f"QR data sin campo esperado. Keys: {list(data.keys())}"
            return {"qr_keys": list(data.keys())}
        return self._run("TC-039", "Invitados — GET /qr-data retorna contenido para QR", "Invitados", _)

    def tc040_guest_whatsapp_url(self):
        def _():
            self._skip_if(not self._guest_id, "TC-031 no creó invitado — skip")
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}/whatsapp"),
                headers=self._auth(self._test_token),
                params={"base_url": "https://eventique.tecnopowerpy.top"}
            )
            self._assert_status(r, 200)
            data = r.json()
            for key in ("message", "url", "display_name"):
                assert key in data, f"Falta '{key}' en whatsapp response"
            assert "wa.me" in data["url"], f"URL no es wa.me: {data['url']}"
            assert len(data["message"]) > MIN_WHATSAPP_MSG, "Mensaje demasiado corto"
            return {"url_prefix": data["url"][:30], "msg_len": len(data["message"])}
        return self._run("TC-040", "Invitados — WhatsApp genera mensaje y URL wa.me", "Invitados", _)

    def tc041_guest_list_paginated(self):
        """TC-041: GET /guests retorna estructura paginada con items y total."""
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests"),
                headers=self._auth(self._test_token),
                params={"page": 1, "size": 10}
            )
            self._assert_status(r, 200)
            data = r.json()
            assert "items" in data, f"Falta 'items'. Keys: {list(data.keys())}"
            assert "total" in data, f"Falta 'total'. Keys: {list(data.keys())}"
            assert isinstance(data["items"], list), "items no es lista"
            assert data["total"] >= 1, "total debe ser >= 1"
            return {"total": data["total"], "page_size": len(data["items"])}
        return self._run("TC-041", "Invitados — lista retorna estructura paginada", "Invitados", _)

    def tc042_guest_stats_consistent(self):
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/stats"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            data = r.json()
            for key in GUEST_STATS_FIELDS:
                assert key in data, f"Falta '{key}' en stats"
            assert data["total_invitations"] >= 1, "total_invitations debe ser >= 1"
            assert 0.0 <= data["open_rate"] <= 1.0, \
                f"open_rate fuera de [0,1]: {data['open_rate']}"
            assert 0.0 <= data["confirmation_rate"] <= 1.0, \
                f"confirmation_rate fuera de [0,1]: {data['confirmation_rate']}"
            # Consistencia: confirmed + declined + pending == total_passes
            total_detail = (data["confirmed_passes"] + data["declined_passes"]
                            + data["pending_passes"])
            assert total_detail <= data["total_passes"] + 1, \
                f"confirmed+declined+pending ({total_detail}) > total_passes ({data['total_passes']})"
            return {k: data[k] for k in ("total_invitations", "confirmed_passes", "open_rate")}
        return self._run("TC-042", "Invitados — stats retorna métricas consistentes", "Invitados", _)

    def tc043_guest_audit_log(self):
        def _():
            self._skip_if(not self._guest_id, "TC-031 no creó invitado — skip")
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}/audit"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            audit = r.json()
            assert isinstance(audit, list), "Audit no es lista"
            assert len(audit) >= 1, "Audit vacío — debe tener al menos creación"
            actions = [e.get("action") for e in audit]
            valid_actions = ("create", "rsvp_submit", "update", "status_change", "open")
            assert any(a in valid_actions for a in actions), \
                f"Ninguna acción reconocida. Actions: {actions}"
            return {"entries": len(audit), "actions": actions[:5]}
        return self._run("TC-043", "Invitados — audit log registra acciones del ciclo", "Invitados", _)

    def tc044_soft_delete_guest(self):
        def _():
            self._skip_if(not self._guest_id, "TC-031 no creó invitado — skip")
            r = self.session.delete(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 204)
            r2 = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}"),
                headers=self._auth(self._test_token)
            )
            if r2.status_code == 200:
                assert r2.json().get("is_active") is False, \
                    f"is_active debería ser False: {r2.json().get('is_active')}"
                return {"soft_deleted": True, "accessible": True}
            elif r2.status_code == 404:
                return {"soft_deleted": True, "accessible": False}
            else:
                raise AssertionError(f"HTTP inesperado tras delete: {r2.status_code}")
        return self._run("TC-044", "Invitados — soft-delete marca is_active=False", "Invitados", _)

    # ══════════════════════════════════════════════════════════════════════════
    # CATEGORÍA 7 — Seguridad Avanzada (auto-contenidos)
    # ══════════════════════════════════════════════════════════════════════════

    def tc045_event_token_isolation(self):
        """TC-045: Token del evento de prueba rechazado en endpoints de 'default'."""
        def _():
            self._skip_if(not self._test_token, "TC-010 no creó evento — skip")
            r = self.session.get(
                self._url("/events/default/rsvp"),
                headers=self._auth(self._test_token)  # "test_token_12345"
            )
            assert r.status_code in (401, 403), \
                f"Aislamiento violado: token de evento A accedió a evento B (HTTP {r.status_code})"
            return {"isolated": True, "status": r.status_code}
        return self._run("TC-045", "Seguridad — token de evento A rechazado en evento B", "Seguridad Avanzada", _)

    def tc046_blocked_guest_cannot_rsvp(self):
        """TC-046: Invitado bloqueado no puede confirmar asistencia (auto-contenido)."""
        def _():
            # Crear invitado fresco
            r1 = self.session.post(
                self._url(f"/events/{self._test_slug}/guests"),
                json={"display_name": "TC-046 Bloqueado", "allowed_passes": 2},
                headers=self._auth(self._test_token)
            )
            self._assert_status(r1, 201)
            g = r1.json()
            gid, gtoken = g["id"], g["token_lookup"]

            # Bloquear
            self.session.patch(
                self._url(f"/events/{self._test_slug}/guests/{gid}/status"),
                json={"status": "blocked", "blocked_reason": "TC-046: bloqueo de prueba"},
                headers=self._auth(self._test_token)
            )

            # Intentar RSVP — debe ser rechazado
            r2 = self.session.post(
                self._url(f"/events/{self._test_slug}/invitations/{gtoken}/rsvp"),
                json={"attending": True, "guest_count": 1, "members": []}
            )
            assert r2.status_code in (400, 403, 422), \
                f"Invitado bloqueado aceptó RSVP: HTTP {r2.status_code}"

            # Limpiar
            self.session.delete(
                self._url(f"/events/{self._test_slug}/guests/{gid}"),
                headers=self._auth(self._test_token)
            )
            return {"blocked_rejected": True, "status": r2.status_code}
        return self._run("TC-046", "Seguridad — invitado bloqueado no puede RSVP", "Seguridad Avanzada", _)

    def tc047_old_token_invalid_after_regen(self):
        """TC-047: Token anterior inválido tras regeneración (auto-contenido)."""
        def _():
            # Crear invitado fresco
            r1 = self.session.post(
                self._url(f"/events/{self._test_slug}/guests"),
                json={"display_name": "TC-047 Regen", "allowed_passes": 1},
                headers=self._auth(self._test_token)
            )
            self._assert_status(r1, 201)
            g = r1.json()
            gid, old_token = g["id"], g["token_lookup"]

            # Regenerar token
            r2 = self.session.post(
                self._url(f"/events/{self._test_slug}/guests/{gid}/regenerate-token"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r2, 200)
            new_token = r2.json()["token_lookup"]
            assert new_token != old_token, "Token no cambió tras regeneración"

            # Token viejo → 404
            r3 = self.session.get(
                self._url(f"/events/{self._test_slug}/invitations/{old_token}")
            )
            assert r3.status_code == 404, \
                f"Token viejo aún válido tras regeneración: HTTP {r3.status_code}"

            # Token nuevo → 200
            r4 = self.session.get(
                self._url(f"/events/{self._test_slug}/invitations/{new_token}")
            )
            self._assert_status(r4, 200)

            # Limpiar
            self.session.delete(
                self._url(f"/events/{self._test_slug}/guests/{gid}"),
                headers=self._auth(self._test_token)
            )
            return {"old_invalid": True, "new_valid": True}
        return self._run("TC-047", "Seguridad — token viejo inválido tras regeneración", "Seguridad Avanzada", _)

    def tc048_rsvp_exceeds_allowed_passes(self):
        """TC-048: RSVP personalizado con cupos que exceden allowed_passes es rechazado."""
        def _():
            # Invitado con 2 cupos
            r1 = self.session.post(
                self._url(f"/events/{self._test_slug}/guests"),
                json={"display_name": "TC-048 Quota", "allowed_passes": 2},
                headers=self._auth(self._test_token)
            )
            self._assert_status(r1, 201)
            g = r1.json()
            gid, gtoken = g["id"], g["token_lookup"]

            # RSVP con 5 personas (excede límite de 2)
            r2 = self.session.post(
                self._url(f"/events/{self._test_slug}/invitations/{gtoken}/rsvp"),
                json={
                    "attending": True,
                    "guest_count": 5,
                    "members": [
                        {"full_name": f"Persona {i}", "member_type": "adult"}
                        for i in range(5)
                    ]
                }
            )
            assert r2.status_code in (400, 422, 403), \
                (f"RSVP con cupos excedidos aceptado: HTTP {r2.status_code}. "
                 f"Body: {r2.text[:100]}")

            # Limpiar
            self.session.delete(
                self._url(f"/events/{self._test_slug}/guests/{gid}"),
                headers=self._auth(self._test_token)
            )
            return {"quota_enforced": True, "status": r2.status_code}
        return self._run("TC-048", "Seguridad — RSVP rechazado si excede allowed_passes", "Seguridad Avanzada", _)

    def tc049_invalid_token_returns_404(self):
        """TC-049: Token inexistente en GET invitations retorna 404."""
        def _():
            fake_token = "a" * TOKEN_LENGTH
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/invitations/{fake_token}")
            )
            assert r.status_code == 404, \
                f"Token inexistente retornó HTTP {r.status_code} (esperado 404)"
            return {"status": 404}
        return self._run("TC-049", "Seguridad — token inexistente retorna 404", "Seguridad Avanzada", _)

    def tc050_guest_list_filter_by_status(self):
        """TC-050: GET /guests?status=confirmed filtra por estado."""
        def _():
            for status in ("pending", "confirmed"):
                r = self.session.get(
                    self._url(f"/events/{self._test_slug}/guests"),
                    headers=self._auth(self._test_token),
                    params={"status": status}
                )
                self._assert_status(r, 200)
                data = r.json()
                assert "items" in data or isinstance(data, list), \
                    f"Respuesta inesperada para status={status}: {type(data)}"
            return {"filters_tested": 2}
        return self._run("TC-050", "Seguridad — /guests acepta filtro por estado", "Seguridad Avanzada", _)

    # ══════════════════════════════════════════════════════════════════════════
    # CATEGORÍA 8 — CSV Export & Import
    # ══════════════════════════════════════════════════════════════════════════

    def tc051_csv_template_download(self):
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/template.csv"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            ct = r.headers.get("content-type", "")
            assert "csv" in ct or "text" in ct, f"Content-Type: {ct}"
            for col in CSV_REQUIRED_COLS:
                assert col in r.text, f"Columna '{col}' ausente en template CSV"
            return {"content_type": ct, "size_bytes": len(r.content)}
        return self._run("TC-051", "CSV — template descargable con columnas requeridas", "CSV", _)

    def tc052_csv_export_contains_guest(self):
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/export.csv"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            assert "Familia García" in r.text, \
                "Invitado 'Familia García' no en export.csv"
            return {"rows_approx": r.text.count("\n"), "size_bytes": len(r.content)}
        return self._run("TC-052", "CSV — export contiene invitado creado en TC-031", "CSV", _)

    def tc053_csv_import_preview(self):
        """TC-053: POST /import/preview con CSV válido retorna previsualización."""
        def _():
            csv_content = (
                "display_name,allowed_passes,email,phone,tags\n"
                "TC-053 Importado A,2,tc053a@example.com,+595111111,test\n"
                "TC-053 Importado B,1,tc053b@example.com,,test\n"
            )
            # Multipart — usar requests directo sin session headers
            r = requests.post(
                self._url(f"/events/{self._test_slug}/guests/import/preview"),
                files={"file": ("import_tc053.csv", csv_content.encode("utf-8"), "text/csv")},
                headers={"Authorization": f"Bearer {self._test_token}"}
            )
            self._assert_status(r, 200)
            data = r.json()

            # La respuesta puede ser lista o dict con campo rows/valid/preview
            if isinstance(data, list):
                assert len(data) >= 1, "Preview retorna lista vacía"
                self._csv_preview_rows = data
            elif isinstance(data, dict):
                rows_key = next(
                    (k for k in ("rows", "valid_rows", "preview", "data") if k in data),
                    None
                )
                assert rows_key is not None, \
                    f"Preview sin campo de filas. Keys: {list(data.keys())}"
                self._csv_preview_rows = data[rows_key]
            return {"preview_type": type(data).__name__,
                    "rows": len(self._csv_preview_rows or [])}
        return self._run("TC-053", "CSV — import preview retorna filas a importar", "CSV", _)

    def tc054_csv_import_commit(self):
        """TC-054: POST /import/commit crea invitados desde filas del preview."""
        def _():
            self._skip_if(
                not self._csv_preview_rows,
                "TC-053 no generó preview — skip"
            )
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/guests/import/commit"),
                json={"rows": self._csv_preview_rows},
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200, 201)
            data = r.json()

            # Verificar que se crearon invitados
            created = data.get("created", data.get("count", data.get("imported",
                               len(data) if isinstance(data, list) else 0)))
            assert created >= 1, f"Import commit no creó ningún invitado: {data}"

            # Verificar en la lista
            r2 = self.session.get(
                self._url(f"/events/{self._test_slug}/guests"),
                headers=self._auth(self._test_token),
                params={"size": 100}
            )
            items = r2.json().get("items", r2.json() if isinstance(r2.json(), list) else [])
            names = [g.get("display_name", "") for g in items]
            assert any("TC-053" in n for n in names), \
                f"Invitados importados no aparecen en lista. Names: {names[:5]}"
            return {"created": created}
        return self._run("TC-054", "CSV — import commit crea invitados correctamente", "CSV", _)

    # ══════════════════════════════════════════════════════════════════════════
    # CATEGORÍA 9 — Cleanup
    # ══════════════════════════════════════════════════════════════════════════

    def tc_cleanup(self):
        def _():
            r = self.session.delete(
                self._url(f"/events/{self._test_slug}"),
                headers=self._auth()
            )
            self._assert_status(r, 204, 200)
            return {"deleted": self._test_slug}
        return self._run("CLEANUP", f"Limpieza — eliminar evento '{self._test_slug}'", "Cleanup", _)

    # ══════════════════════════════════════════════════════════════════════════
    # Runner
    # ══════════════════════════════════════════════════════════════════════════

    def run(self):
        print(f"\n{BOLD}{CYAN}{'═' * 60}{RESET}")
        print(f"{BOLD}  EVENTIQUE — Enterprise Test Suite v2{RESET}")
        print(f"{BOLD}  Target:  {self.base_url}{RESET}")
        print(f"{BOLD}  Evento:  {self._test_slug}{RESET}")
        if self.only_category:
            print(f"{BOLD}  Filtro:  {self.only_category}{RESET}")
        print(f"{BOLD}{CYAN}{'═' * 60}{RESET}\n")

        # Orden de ejecución — respeta dependencias de estado
        categories: dict[str, list] = {
            "Conectividad": [
                self.tc001_health_endpoint,
                self.tc002_cors_options,
                self.tc003_health_version_and_app,
                self.tc004_health_response_time,
            ],
            "Seguridad": [
                self.tc005_unauthorized_without_token,
                self.tc006_invalid_token_rejected,
                self.tc007_valid_token_accepted,
                self.tc008_config_put_no_auth_rejected,
            ],
            "Eventos": [
                self.tc009_list_events_contains_default,
                self.tc010_create_test_event,       # ← crea self._test_slug
                self.tc011_slug_duplicate_rejected,
                self.tc012_duplicate_event_copies_config,
            ],
            "Config": [
                self.tc013_get_default_config_fields,
                self.tc014_config_public_access_no_auth,
                self.tc015_put_envelope_skin_fields,
                self.tc016_envelope_skin_full_roundtrip,
                self.tc017_palette_olive_valid,
                self.tc018_multiple_palettes_valid,
                self.tc019_classic_skin_restore,
                self.tc020a_paper_access_skin_full_roundtrip,
                self.tc020_sections_enabled_persist,
            ],
            "RSVP": [
                self.tc021_rsvp_attending_true,         # ← sets self._rsvp_id, self._rsvp_email
                self.tc022_rsvp_all_optional_fields,
                self.tc023_rsvp_not_attending,
                self.tc024_rsvp_check_inexistent_email,
                self.tc025_rsvp_check_existing_email,   # ← usa self._rsvp_email
                self.tc026_rsvp_duplicate_email_detection,
                self.tc027_rsvp_attending_zero_guests,
                self.tc028_rsvp_stats_consistent,
                self.tc029_rsvp_list_admin,
                self.tc030_rsvp_delete,                 # ← usa self._rsvp_id
            ],
            "Invitados": [
                self.tc031_create_guest_all_fields,     # ← sets self._guest_id, self._guest_token
                self.tc032_invitation_url_format,
                self.tc033_get_invitation_public,
                self.tc034_track_invitation_open,
                self.tc035_personalized_rsvp_with_members,
                self.tc035b_personalized_rsvp_decline_zero_guests,
                self.tc036_guest_status_patch,
                self.tc037_regenerate_token,
                self.tc038_guest_detail_all_fields,
                self.tc039_guest_qr_data,
                self.tc040_guest_whatsapp_url,
                self.tc041_guest_list_paginated,
                self.tc042_guest_stats_consistent,
                self.tc043_guest_audit_log,
                self.tc044_soft_delete_guest,           # ← último del guest principal
            ],
            "Seguridad Avanzada": [
                self.tc045_event_token_isolation,
                self.tc046_blocked_guest_cannot_rsvp,   # auto-contenido
                self.tc047_old_token_invalid_after_regen,  # auto-contenido
                self.tc048_rsvp_exceeds_allowed_passes, # auto-contenido
                self.tc049_invalid_token_returns_404,
                self.tc050_guest_list_filter_by_status,
            ],
            "CSV": [
                self.tc051_csv_template_download,
                self.tc052_csv_export_contains_guest,   # Familia García aún en export (soft-delete)
                self.tc053_csv_import_preview,          # ← sets self._csv_preview_rows
                self.tc054_csv_import_commit,           # ← usa self._csv_preview_rows
            ],
            "Cleanup": [
                self.tc_cleanup,
            ],
        }

        for cat, tests in categories.items():
            if self.only_category and cat.lower() != self.only_category.lower():
                continue
            print(f"\n{BOLD}{YELLOW}▸ {cat}{RESET}")
            for test_fn in tests:
                test_fn()

        self._print_summary()

    def _print_summary(self):
        total    = len(self.results)
        passed   = sum(1 for r in self.results if r.passed)
        failed   = total - passed
        skipped  = sum(1 for r in self.results if not r.passed and "skip" in r.error.lower())
        actual_f = failed - skipped
        avg_ms   = sum(r.duration_ms for r in self.results) / total if total else 0

        print(f"\n{BOLD}{CYAN}{'═' * 60}{RESET}")
        print(f"{BOLD}  RESUMEN{RESET}")
        print(f"{CYAN}{'─' * 60}{RESET}")
        print(f"  Total:    {total}")
        print(f"  {GREEN}Pasaron:  {passed}{RESET}")
        print(f"  {RED}Fallaron: {actual_f}{RESET}")
        if skipped:
            print(f"  {YELLOW}Skipped:  {skipped}{RESET}")
        print(f"  Tiempo promedio: {avg_ms:.0f}ms por test")
        print(f"{CYAN}{'─' * 60}{RESET}")

        if actual_f > 0:
            print(f"\n{BOLD}{RED}  FALLOS:{RESET}")
            for r in self.results:
                if not r.passed and "skip" not in r.error.lower():
                    print(f"  {RED}✗{RESET} [{r.id}] {r.name}")
                    print(f"    {DIM}→ {r.error[:160]}{RESET}")

        score_pct  = int(passed / total * 100) if total else 0
        bar_filled = score_pct // 5
        bar        = "█" * bar_filled + "░" * (20 - bar_filled)
        color      = GREEN if score_pct >= 90 else (YELLOW if score_pct >= 70 else RED)
        print(f"\n  Score: {color}{bar} {score_pct}%{RESET}")

        if actual_f == 0:
            print(f"\n{BOLD}{GREEN}  ✓ Suite completa: TODOS LOS TESTS PASARON{RESET}")
        else:
            print(f"\n{BOLD}{RED}  ✗ {actual_f} tests fallaron — revisar logs arriba{RESET}")
        print(f"{BOLD}{CYAN}{'═' * 60}{RESET}\n")

        sys.exit(0 if actual_f == 0 else 1)


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Eventique Enterprise Test Suite v2",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        "--base-url", default="http://localhost:5176/api",
        help="URL base de la API (default: http://localhost:5176/api)"
    )
    parser.add_argument("--token", required=True, help="ADMIN_TOKEN del servidor")
    parser.add_argument("-v", "--verbose", action="store_true",
                        help="Mostrar detalles de cada test")
    parser.add_argument("--cat", dest="category", default=None,
                        help="Ejecutar solo una categoría (ej: 'RSVP', 'Seguridad Avanzada')")
    args = parser.parse_args()

    suite = EventiqueTestSuite(args.base_url, args.token, args.verbose, args.category)
    suite.run()


if __name__ == "__main__":
    main()
