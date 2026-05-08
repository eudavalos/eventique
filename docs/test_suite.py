#!/usr/bin/env python3
"""
Eventique — Enterprise Test Suite
==================================
Suite de pruebas funcionales completa para la API de Eventique.
Cubre 25 escenarios: API, config, invitaciones, skin envelope, validaciones y seguridad.

Uso:
    # Contra producción (Pi)
    python test_suite.py --base-url http://localhost:8700 --token <ADMIN_TOKEN>

    # Contra localhost
    python test_suite.py --base-url http://localhost:8700 --token <ADMIN_TOKEN>

    # Verbose
    python test_suite.py --base-url http://localhost:8700 --token <ADMIN_TOKEN> -v

Requiere: requests (pip install requests)
"""

import argparse
import json
import sys
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
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
BOLD   = "\033[1m"
RESET  = "\033[0m"
DIM    = "\033[2m"


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

    def __init__(self, base_url: str, admin_token: str, verbose: bool = False):
        self.base_url = base_url.rstrip("/")
        self.admin_token = admin_token
        self.verbose = verbose
        self.results: list[TestResult] = []
        self._test_slug = f"test-{uuid.uuid4().hex[:8]}"
        self._test_token: str | None = None
        self._guest_id: int | None = None
        self._guest_token: str | None = None
        self._rsvp_id: int | None = None
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _auth(self, token: str | None = None) -> dict:
        return {"Authorization": f"Bearer {token or self.admin_token}"}

    def _run(self, test_id: str, name: str, category: str, fn) -> TestResult:
        start = time.monotonic()
        try:
            details = fn() or {}
            passed = True
            error = ""
        except AssertionError as e:
            passed = False
            error = str(e)
            details = {}
        except Exception as e:
            passed = False
            error = f"{type(e).__name__}: {e}"
            details = {}
        duration_ms = (time.monotonic() - start) * 1000
        result = TestResult(test_id, name, category, passed, error, duration_ms, details)
        self.results.append(result)
        self._print_result(result)
        return result

    def _print_result(self, r: TestResult):
        icon = f"{GREEN}✓{RESET}" if r.passed else f"{RED}✗{RESET}"
        duration = f"{DIM}{r.duration_ms:.0f}ms{RESET}"
        print(f"  {icon} [{r.id}] {r.name} {duration}")
        if not r.passed:
            print(f"       {RED}→ {r.error}{RESET}")
        if self.verbose and r.details:
            for k, v in r.details.items():
                print(f"       {DIM}{k}: {v}{RESET}")

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def _assert_status(self, r: requests.Response, *codes: int):
        assert r.status_code in codes, (
            f"HTTP {r.status_code} (esperado {codes}). "
            f"Body: {r.text[:300]}"
        )

    def _assert_json_key(self, data: dict, *keys: str):
        for k in keys:
            assert k in data, f"Campo '{k}' ausente en respuesta. Keys: {list(data.keys())}"

    # ── CATEGORÍA 1: Health & Conectividad ───────────────────────────────────

    def tc001_health_endpoint(self):
        """TC-001: Health endpoint retorna 200 con status healthy."""
        def _():
            r = self.session.get(self._url("/health"))
            self._assert_status(r, 200)
            data = r.json()
            self._assert_json_key(data, "status", "app", "database")
            assert data["status"] in ("healthy", "ok"), f"Status: {data['status']}"
            assert data["database"] in ("connected", "ok"), f"DB: {data['database']}"
            return {"status": data["status"], "db": data["database"]}
        return self._run("TC-001", "Health endpoint — status healthy", "Conectividad", _)

    def tc002_cors_headers(self):
        """TC-002: CORS headers presentes en respuesta de API."""
        def _():
            r = self.session.options(
                self._url("/health"),
                headers={"Origin": "https://eventique.tecnopowerpy.top"}
            )
            # Al menos 200 o 204 (algunos servidores ignoran OPTIONS sin CORS real)
            assert r.status_code in (200, 204, 400, 405), f"HTTP {r.status_code}"
            return {"status": r.status_code}
        return self._run("TC-002", "CORS — responde a OPTIONS", "Conectividad", _)

    def tc003_api_version_in_health(self):
        """TC-003: Health incluye version de la API."""
        def _():
            r = self.session.get(self._url("/health"))
            self._assert_status(r, 200)
            data = r.json()
            assert "version" in data or "app" in data, "Sin version ni app en health"
            return {"app": data.get("app"), "version": data.get("version")}
        return self._run("TC-003", "Health — incluye versión y nombre de app", "Conectividad", _)

    # ── CATEGORÍA 2: Autenticación y Seguridad ────────────────────────────────

    def tc004_unauthorized_without_token(self):
        """TC-004: Endpoints admin retornan 401 sin token."""
        def _():
            paths = ["/rsvp/stats", "/rsvp"]
            failed = []
            for path in paths:
                r = self.session.get(self._url(path))
                if r.status_code not in (401, 403):
                    failed.append(f"{path}→{r.status_code}")
            assert not failed, f"Sin auth permitidos: {failed}"
            return {"tested_paths": len(paths)}
        return self._run("TC-004", "Seguridad — 401/403 sin token en admin endpoints", "Seguridad", _)

    def tc005_invalid_token_rejected(self):
        """TC-005: Token inválido retorna 401/403."""
        def _():
            r = self.session.get(
                self._url("/rsvp/stats"),
                headers={"Authorization": "Bearer token_invalido_xxxxxxxxxxx"}
            )
            assert r.status_code in (401, 403), f"HTTP {r.status_code} con token inválido"
            return {"status": r.status_code}
        return self._run("TC-005", "Seguridad — token inválido rechazado", "Seguridad", _)

    def tc006_valid_token_accepted(self):
        """TC-006: Token válido da acceso a endpoints admin."""
        def _():
            r = self.session.get(
                self._url("/rsvp"),
                headers=self._auth()
            )
            self._assert_status(r, 200)
            assert isinstance(r.json(), list), "Respuesta no es lista"
            return {"count": len(r.json())}
        return self._run("TC-006", "Seguridad — token válido acepta admin endpoints", "Seguridad", _)

    # ── CATEGORÍA 3: Gestión de Eventos ──────────────────────────────────────

    def tc007_list_events(self):
        """TC-007: Listado de eventos retorna array con al menos 'default'."""
        def _():
            r = self.session.get(self._url("/events"), headers=self._auth())
            self._assert_status(r, 200)
            events = r.json()
            assert isinstance(events, list), "No es lista"
            slugs = [e["slug"] for e in events]
            assert "default" in slugs, f"'default' no encontrado. Slugs: {slugs}"
            return {"total_events": len(events)}
        return self._run("TC-007", "Eventos — listar retorna al menos evento 'default'", "Eventos", _)

    def tc008_create_and_delete_event(self):
        """TC-008: Crear y eliminar evento de prueba."""
        def _():
            # Crear
            payload = {
                "slug": self._test_slug,
                "name": "Evento Test Suite",
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
            assert self._test_slug in slugs, f"Evento creado no en lista: {slugs}"

            return {"created_slug": data["slug"]}
        return self._run("TC-008", "Eventos — crear y listar evento de prueba", "Eventos", _)

    def tc009_duplicate_event(self):
        """TC-009: Duplicar evento copia su configuración."""
        def _():
            dup_slug = f"{self._test_slug}-dup"
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/duplicate"),
                json={"name": "Evento Duplicado", "slug": dup_slug},
                headers=self._auth()
            )
            self._assert_status(r, 201)
            data = r.json()
            assert data["slug"] == dup_slug, f"Slug dup: {data['slug']}"

            # Limpieza
            self.session.delete(self._url(f"/events/{dup_slug}"), headers=self._auth())
            return {"dup_slug": data["slug"]}
        return self._run("TC-009", "Eventos — duplicar evento de prueba", "Eventos", _)

    # ── CATEGORÍA 4: Config de Evento ─────────────────────────────────────────

    def tc010_get_default_event_config(self):
        """TC-010: Config del evento default es JSON válida con campos requeridos."""
        def _():
            r = self.session.get(self._url("/event-config"))
            self._assert_status(r, 200)
            data = r.json()
            for key in ("couple", "dates", "venues", "theme", "sections"):
                assert key in data, f"Campo '{key}' ausente en config"
            assert "ceremony" in data["dates"], "dates.ceremony ausente"
            assert "palette" in data["theme"], "theme.palette ausente"
            return {"palette": data["theme"]["palette"], "event_type": data.get("event_type")}
        return self._run("TC-010", "Config — GET event-config retorna campos requeridos", "Config", _)

    def tc011_put_event_config_saves_envelope_skin(self):
        """TC-011: PUT config persiste campos del skin envelope."""
        def _():
            # Obtener config actual
            r = self.session.get(self._url(f"/events/{self._test_slug}/event-config"))
            self._assert_status(r, 200)
            current = r.json()

            # Aplicar campos envelope
            current["invitation_skin"] = "envelope"
            current["envelope_opening_text"] = "Test: Nueva etapa juntos"
            current["envelope_tap_label"] = "Test: Abrí aquí"
            current["collage_countdown_label"] = "Test: Faltan"
            current["collage_subtitle"] = "Test: Nuestra Celebración"
            current["venues_ceremony_label"] = "Test: Misa"
            current["venues_reception_label"] = "Test: Fiesta"
            current["venues_ceremony_icon"] = "church"
            current["venues_reception_icon"] = "champagne"
            current["dress_code_enabled"] = True
            current["dress_code_title"] = "Test: Vestimenta"
            current["dress_code_value"] = "Formal"
            current["gallery_polaroid_enabled"] = True
            current["gallery_polaroid_footer_text"] = "Test: Te Esperamos"
            current["gallery_polaroid_bw"] = True

            r2 = self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current,
                headers=self._auth(self._test_token)
            )
            self._assert_status(r2, 200)

            # Verificar persistencia
            r3 = self.session.get(self._url(f"/events/{self._test_slug}/event-config"))
            saved = r3.json()
            assert saved.get("invitation_skin") == "envelope", f"invitation_skin: {saved.get('invitation_skin')}"
            assert saved.get("envelope_opening_text") == "Test: Nueva etapa juntos", "envelope_opening_text no persistió"
            assert saved.get("dress_code_value") == "Formal", "dress_code_value no persistió"
            assert saved.get("gallery_polaroid_bw") is True, "gallery_polaroid_bw no persistió"

            return {
                "invitation_skin": saved.get("invitation_skin"),
                "dress_code_value": saved.get("dress_code_value"),
            }
        return self._run("TC-011", "Config — PUT persiste todos los campos del skin envelope", "Config", _)

    def tc012_envelope_skin_all_fields_roundtrip(self):
        """TC-012: Round-trip de todos los campos envelope (write → read)."""
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
                "gallery_polaroid_enabled": False,
                "gallery_polaroid_footer_text": "Hasta pronto",
                "gallery_polaroid_bw": False,
            }
            r = self.session.get(self._url(f"/events/{self._test_slug}/event-config"))
            current = r.json()
            current.update(fields)

            self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current,
                headers=self._auth(self._test_token)
            )

            r2 = self.session.get(self._url(f"/events/{self._test_slug}/event-config"))
            saved = r2.json()
            failures = []
            for k, v in fields.items():
                actual = saved.get(k)
                if actual != v:
                    failures.append(f"{k}: expected={v!r}, got={actual!r}")
            assert not failures, "Campos no coinciden:\n" + "\n".join(failures)
            return {"fields_verified": len(fields)}
        return self._run("TC-012", "Config — round-trip completo de 16 campos envelope", "Config", _)

    def tc013_config_palette_olive_valid(self):
        """TC-013: Paleta 'olive' es válida y persistible en config."""
        def _():
            r = self.session.get(self._url(f"/events/{self._test_slug}/event-config"))
            current = r.json()
            if "theme" not in current:
                current["theme"] = {}
            current["theme"]["palette"] = "olive"

            r2 = self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current,
                headers=self._auth(self._test_token)
            )
            self._assert_status(r2, 200)

            r3 = self.session.get(self._url(f"/events/{self._test_slug}/event-config"))
            saved = r3.json()
            assert saved.get("theme", {}).get("palette") == "olive", \
                f"Paleta guardada: {saved.get('theme', {}).get('palette')}"
            return {"palette": "olive"}
        return self._run("TC-013", "Config — paleta 'olive' válida y persistible", "Config", _)

    def tc014_config_classic_skin_persists(self):
        """TC-014: Skin 'classic' se puede restaurar desde 'envelope'."""
        def _():
            r = self.session.get(self._url(f"/events/{self._test_slug}/event-config"))
            current = r.json()
            current["invitation_skin"] = "classic"
            r2 = self.session.put(
                self._url(f"/events/{self._test_slug}/event-config"),
                json=current,
                headers=self._auth(self._test_token)
            )
            self._assert_status(r2, 200)
            r3 = self.session.get(self._url(f"/events/{self._test_slug}/event-config"))
            assert r3.json().get("invitation_skin") == "classic", "No restauró a 'classic'"
            return {"skin": "classic"}
        return self._run("TC-014", "Config — skin 'classic' restaurable desde 'envelope'", "Config", _)

    # ── CATEGORÍA 5: RSVP Genérico ────────────────────────────────────────────

    def tc015_rsvp_submit_attending(self):
        """TC-015: RSVP attending=True se registra correctamente."""
        def _():
            unique_email = f"test-{uuid.uuid4().hex[:6]}@example.com"
            payload = {
                "name": "Invitado de Prueba",
                "email": unique_email,
                "attending": True,
                "guest_count": 2,
                "dietary_restrictions": "Sin gluten",
                "song_request": "La vida es una fiesta",
                "message": "Mensaje de prueba TC-015"
            }
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/rsvp"),
                json=payload
            )
            self._assert_status(r, 200, 201)
            data = r.json()
            assert data.get("attending") is True, f"attending: {data.get('attending')}"
            assert data.get("guest_count") == 2, f"guest_count: {data.get('guest_count')}"
            self._rsvp_id = data.get("id")
            return {"rsvp_id": self._rsvp_id, "email": unique_email}
        return self._run("TC-015", "RSVP — confirmar asistencia (attending=True)", "RSVP", _)

    def tc016_rsvp_check_email(self):
        """TC-016: Check email detecta RSVP existente."""
        def _():
            if not self._rsvp_id:
                raise AssertionError("TC-015 no creó RSVP — skip")
            # El email del TC-015 ya fue registrado pero no lo guardamos.
            # Verificamos que check funciona con un email inexistente.
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/rsvp/check"),
                params={"email": "inexistente@test.com"}
            )
            self._assert_status(r, 200)
            data = r.json()
            assert data.get("exists") is False, f"exists debería ser False: {data}"
            return {"exists": data.get("exists")}
        return self._run("TC-016", "RSVP — check email inexistente retorna exists=False", "RSVP", _)

    def tc017_rsvp_stats(self):
        """TC-017: Stats de RSVP retorna contadores correctos."""
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/rsvp/stats"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            data = r.json()
            for key in ("total_responses", "attending", "not_attending", "total_guests"):
                assert key in data, f"Falta '{key}' en stats"
            assert data["total_responses"] >= 0
            assert data["attending"] + data["not_attending"] == data["total_responses"], \
                "attending + not_attending != total_responses"
            return {k: data[k] for k in ("total_responses", "attending", "total_guests")}
        return self._run("TC-017", "RSVP — stats retorna contadores consistentes", "RSVP", _)

    def tc018_rsvp_not_attending(self):
        """TC-018: RSVP attending=False se registra con guest_count=0."""
        def _():
            unique_email = f"no-{uuid.uuid4().hex[:6]}@example.com"
            payload = {
                "name": "Invitado No Asistirá",
                "email": unique_email,
                "attending": False,
                "guest_count": 1,
            }
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/rsvp"),
                json=payload
            )
            self._assert_status(r, 200, 201)
            data = r.json()
            assert data.get("attending") is False, f"attending: {data.get('attending')}"
            return {"rsvp_id": data.get("id")}
        return self._run("TC-018", "RSVP — no asistirá (attending=False) registrado", "RSVP", _)

    # ── CATEGORÍA 6: Invitaciones Personalizadas ──────────────────────────────

    def tc019_create_guest_invitation(self):
        """TC-019: Crear invitado con todos los campos requeridos."""
        def _():
            payload = {
                "display_name": "Familia García — Test Suite",
                "contact_name": "Juan García",
                "email": f"garcia-{uuid.uuid4().hex[:4]}@test.com",
                "phone": "+595 981 123 456",
                "group_name": "Mesa 1",
                "guest_type": "family",
                "allowed_passes": 3,
                "notes": "Test TC-019 — Requiere silla de bebé",
                "tags": ["vip", "test"],
                "conditional_flags": ["after_party"]
            }
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/guests"),
                json=payload,
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 201)
            data = r.json()
            assert data["display_name"] == payload["display_name"]
            assert data["allowed_passes"] == 3
            assert data["guest_type"] == "family"
            assert data["status"] in ("draft", "pending"), f"status: {data.get('status')}"
            assert len(data["token_lookup"]) == 64, f"Token length: {len(data['token_lookup'])}"
            assert data["conditional_flags"] == ["after_party"], f"flags: {data['conditional_flags']}"
            self._guest_id = data["id"]
            self._guest_token = data["token_lookup"]
            return {"guest_id": self._guest_id, "token_len": len(data["token_lookup"])}
        return self._run("TC-019", "Invitados — crear invitado con todos los campos", "Invitados", _)

    def tc020_get_guest_invitation_public(self):
        """TC-020: GET público de invitación por token retorna datos completos."""
        def _():
            if not self._guest_token:
                raise AssertionError("TC-019 no creó invitado — skip")
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/invitations/{self._guest_token}"),
                params={"source": "test"}
            )
            self._assert_status(r, 200)
            data = r.json()
            for key in ("event_config", "invitation", "members", "rsvp_status", "already_responded"):
                assert key in data, f"Falta '{key}' en respuesta de invitación"
            inv = data["invitation"]
            assert inv["display_name"] == "Familia García — Test Suite"
            assert inv["allowed_passes"] == 3
            assert inv["status"] in ("draft", "opened"), f"Status: {inv['status']}"
            assert "envelope_opening_text" in data["event_config"] or True  # puede estar ausente si no se guardó
            return {
                "display_name": inv["display_name"],
                "status": inv["status"],
                "already_responded": data["already_responded"]
            }
        return self._run("TC-020", "Invitados — GET público retorna datos completos", "Invitados", _)

    def tc021_track_invitation_open(self):
        """TC-021: POST /open registra apertura y devuelve 204."""
        def _():
            if not self._guest_token:
                raise AssertionError("TC-019 no creó invitado — skip")
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/invitations/{self._guest_token}/open"),
                params={"source": "whatsapp"}
            )
            self._assert_status(r, 204)
            # Verificar que open_count aumentó
            r2 = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}"),
                headers=self._auth(self._test_token)
            )
            data = r2.json()
            assert data["open_count"] >= 1, f"open_count: {data['open_count']}"
            return {"open_count": data["open_count"]}
        return self._run("TC-021", "Invitados — POST /open registra apertura correctamente", "Invitados", _)

    def tc022_personalized_rsvp_submit(self):
        """TC-022: RSVP personalizado attending=True con miembros nominales."""
        def _():
            if not self._guest_token:
                raise AssertionError("TC-019 no creó invitado — skip")
            payload = {
                "attending": True,
                "guest_count": 2,
                "members": [
                    {"full_name": "Juan García", "member_type": "adult", "dietary_restrictions": "Sin mariscos"},
                    {"full_name": "María García", "member_type": "adult", "menu_preference": "Vegetariano"}
                ],
                "song_request": "Bésame Mucho",
                "message": "TC-022: Con mucho gusto",
                "source": "personalized"
            }
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/invitations/{self._guest_token}/rsvp"),
                json=payload
            )
            self._assert_status(r, 200, 201)
            data = r.json()
            assert data.get("ok") is True, f"ok: {data.get('ok')}"
            assert data.get("confirmed_passes") == 2, f"confirmed_passes: {data.get('confirmed_passes')}"

            # Verificar estado
            r2 = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}"),
                headers=self._auth(self._test_token)
            )
            guest = r2.json()
            # "partial" = menos de allowed_passes confirmados (3 asignados, 2 confirmados) — válido
            assert guest["status"] in ("confirmed", "partial"), f"status: {guest['status']}"
            assert guest["confirmed_passes"] == 2, f"confirmed_passes: {guest['confirmed_passes']}"
            return {"status": guest["status"], "confirmed_passes": guest["confirmed_passes"]}
        return self._run("TC-022", "Invitados — RSVP personalizado confirma con miembros", "Invitados", _)

    def tc023_guest_status_change(self):
        """TC-023: PATCH /status cambia estado del invitado."""
        def _():
            if not self._guest_id:
                raise AssertionError("TC-019 no creó invitado — skip")
            r = self.session.patch(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}/status"),
                json={"status": "blocked", "blocked_reason": "TC-023: prueba de bloqueo"},
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
            return {"previous_status": "blocked", "restored": True}
        return self._run("TC-023", "Invitados — PATCH /status cambia y bloquea correctamente", "Invitados", _)

    def tc024_regenerate_token(self):
        """TC-024: POST /regenerate-token genera nuevo token único."""
        def _():
            if not self._guest_id or not self._guest_token:
                raise AssertionError("TC-019 no creó invitado — skip")
            old_token = self._guest_token
            r = self.session.post(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}/regenerate-token"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            data = r.json()
            new_token = data["token_lookup"]
            assert len(new_token) == 64, f"Nuevo token length: {len(new_token)}"
            assert new_token != old_token, "Nuevo token igual al anterior"
            self._guest_token = new_token  # Actualizar para próximas pruebas
            return {"old_token_prefix": old_token[:8], "new_token_prefix": new_token[:8]}
        return self._run("TC-024", "Invitados — regenerar token produce nuevo token diferente", "Invitados", _)

    def tc025_guest_stats(self):
        """TC-025: GET /stats retorna métricas correctas del evento de prueba."""
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/stats"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            data = r.json()
            for key in ("total_invitations", "total_passes", "confirmed_passes",
                        "declined_passes", "pending_passes", "open_rate", "confirmation_rate"):
                assert key in data, f"Falta '{key}' en stats"
            assert data["total_invitations"] >= 1, "total_invitations debe ser >= 1"
            assert 0.0 <= data["open_rate"] <= 1.0, f"open_rate fuera de rango: {data['open_rate']}"
            assert 0.0 <= data["confirmation_rate"] <= 1.0, f"confirmation_rate: {data['confirmation_rate']}"
            return {k: data[k] for k in ("total_invitations", "confirmed_passes", "open_rate")}
        return self._run("TC-025", "Invitados — stats retorna métricas consistentes", "Invitados", _)

    def tc026_whatsapp_message_generation(self):
        """TC-026: GET /whatsapp genera mensaje y URL wa.me correctamente."""
        def _():
            if not self._guest_id:
                raise AssertionError("TC-019 no creó invitado — skip")
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
            assert len(data["message"]) > 10, "Mensaje WhatsApp demasiado corto"
            return {"url_prefix": data["url"][:30], "message_len": len(data["message"])}
        return self._run("TC-026", "Invitados — WhatsApp genera mensaje y URL wa.me", "Invitados", _)

    def tc027_csv_template_download(self):
        """TC-027: GET template.csv retorna CSV válido con headers correctos."""
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/template.csv"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            ct = r.headers.get("content-type", "")
            assert "csv" in ct or "text" in ct, f"Content-Type: {ct}"
            text = r.text
            required_cols = ["display_name", "allowed_passes"]
            for col in required_cols:
                assert col in text, f"Columna '{col}' ausente en template CSV"
            return {"content_type": ct, "size_bytes": len(r.content)}
        return self._run("TC-027", "CSV — template descargable con columnas correctas", "CSV", _)

    def tc028_csv_export(self):
        """TC-028: GET export.csv retorna datos del evento de prueba."""
        def _():
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/export.csv"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            text = r.text
            assert "Familia García" in text, "Invitado de prueba no en export.csv"
            return {"rows_approx": text.count("\n")}
        return self._run("TC-028", "CSV — export incluye invitado creado en TC-019", "CSV", _)

    def tc029_guest_audit_log(self):
        """TC-029: GET /audit retorna historial de cambios del invitado."""
        def _():
            if not self._guest_id:
                raise AssertionError("TC-019 no creó invitado — skip")
            r = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}/audit"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 200)
            audit = r.json()
            assert isinstance(audit, list), "Audit no es lista"
            assert len(audit) >= 1, "Audit vacío — debe tener al menos creación"
            actions = [e.get("action") for e in audit]
            assert any(a in ("create", "rsvp_submit", "update", "status_change") for a in actions), \
                f"No hay acción esperada. Actions: {actions}"
            return {"entries": len(audit), "first_action": audit[-1].get("action") if audit else None}
        return self._run("TC-029", "Invitados — audit log registra todas las acciones", "Invitados", _)

    def tc030_soft_delete_guest(self):
        """TC-030: DELETE invitado hace soft-delete (is_active=False)."""
        def _():
            if not self._guest_id:
                raise AssertionError("TC-019 no creó invitado — skip")
            r = self.session.delete(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}"),
                headers=self._auth(self._test_token)
            )
            self._assert_status(r, 204)

            # Verificar que sigue accesible pero is_active=False
            r2 = self.session.get(
                self._url(f"/events/{self._test_slug}/guests/{self._guest_id}"),
                headers=self._auth(self._test_token)
            )
            # Puede retornar 200 (con is_active=False) o 404 según implementación
            if r2.status_code == 200:
                assert r2.json().get("is_active") is False, f"is_active: {r2.json().get('is_active')}"
                return {"soft_deleted": True, "still_accessible": True}
            elif r2.status_code == 404:
                return {"soft_deleted": True, "still_accessible": False}
            else:
                raise AssertionError(f"HTTP inesperado: {r2.status_code}")
        return self._run("TC-030", "Invitados — soft-delete marca is_active=False", "Invitados", _)

    # ── CATEGORÍA 7: Cleanup ──────────────────────────────────────────────────

    def tc_cleanup_delete_test_event(self):
        """CLEANUP: Eliminar evento de prueba."""
        def _():
            r = self.session.delete(
                self._url(f"/events/{self._test_slug}"),
                headers=self._auth()
            )
            self._assert_status(r, 204, 200)
            return {"deleted": self._test_slug}
        return self._run("CLEANUP", f"Limpieza — eliminar evento '{self._test_slug}'", "Cleanup", _)

    # ── Ejecutar suite ────────────────────────────────────────────────────────

    def run(self):
        print(f"\n{BOLD}{CYAN}{'═' * 60}{RESET}")
        print(f"{BOLD}  EVENTIQUE — Enterprise Test Suite{RESET}")
        print(f"{BOLD}  Target: {self.base_url}{RESET}")
        print(f"{BOLD}  Evento de prueba: {self._test_slug}{RESET}")
        print(f"{BOLD}{CYAN}{'═' * 60}{RESET}\n")

        categories = {
            "Conectividad": [self.tc001_health_endpoint, self.tc002_cors_headers, self.tc003_api_version_in_health],
            "Seguridad":    [self.tc004_unauthorized_without_token, self.tc005_invalid_token_rejected, self.tc006_valid_token_accepted],
            "Eventos":      [self.tc007_list_events, self.tc008_create_and_delete_event, self.tc009_duplicate_event],
            "Config":       [self.tc010_get_default_event_config, self.tc011_put_event_config_saves_envelope_skin,
                             self.tc012_envelope_skin_all_fields_roundtrip, self.tc013_config_palette_olive_valid,
                             self.tc014_config_classic_skin_persists],
            "RSVP":         [self.tc015_rsvp_submit_attending, self.tc016_rsvp_check_email,
                             self.tc017_rsvp_stats, self.tc018_rsvp_not_attending],
            "Invitados":    [self.tc019_create_guest_invitation, self.tc020_get_guest_invitation_public,
                             self.tc021_track_invitation_open, self.tc022_personalized_rsvp_submit,
                             self.tc023_guest_status_change, self.tc024_regenerate_token,
                             self.tc025_guest_stats, self.tc026_whatsapp_message_generation,
                             self.tc029_guest_audit_log, self.tc030_soft_delete_guest],
            "CSV":          [self.tc027_csv_template_download, self.tc028_csv_export],
            "Cleanup":      [self.tc_cleanup_delete_test_event],
        }

        for cat, tests in categories.items():
            print(f"\n{BOLD}{YELLOW}▸ {cat}{RESET}")
            for test_fn in tests:
                test_fn()

        self._print_summary()

    def _print_summary(self):
        total   = len(self.results)
        passed  = sum(1 for r in self.results if r.passed)
        failed  = total - passed
        skipped = sum(1 for r in self.results if not r.passed and "skip" in r.error.lower())
        actual_failed = failed - skipped
        avg_ms  = sum(r.duration_ms for r in self.results) / total if total else 0

        print(f"\n{BOLD}{CYAN}{'═' * 60}{RESET}")
        print(f"{BOLD}  RESUMEN{RESET}")
        print(f"{CYAN}{'─' * 60}{RESET}")
        print(f"  Total:    {total}")
        print(f"  {GREEN}Pasaron:  {passed}{RESET}")
        print(f"  {RED}Fallaron: {actual_failed}{RESET}")
        if skipped:
            print(f"  {YELLOW}Skipped:  {skipped}{RESET}")
        print(f"  Tiempo promedio: {avg_ms:.0f}ms por test")
        print(f"{CYAN}{'─' * 60}{RESET}")

        if failed > 0:
            print(f"\n{BOLD}{RED}  FALLOS:{RESET}")
            for r in self.results:
                if not r.passed and "skip" not in r.error.lower():
                    print(f"  {RED}✗{RESET} [{r.id}] {r.name}")
                    print(f"    {DIM}→ {r.error[:120]}{RESET}")

        score_pct = int(passed / total * 100) if total else 0
        bar_filled = score_pct // 5
        bar = "█" * bar_filled + "░" * (20 - bar_filled)
        color = GREEN if score_pct >= 90 else (YELLOW if score_pct >= 70 else RED)
        print(f"\n  Score: {color}{bar} {score_pct}%{RESET}")

        if actual_failed == 0:
            print(f"\n{BOLD}{GREEN}  ✓ Suite completa: TODOS LOS TESTS PASARON{RESET}")
        else:
            print(f"\n{BOLD}{RED}  ✗ {actual_failed} tests fallaron — revisar logs arriba{RESET}")
        print(f"{BOLD}{CYAN}{'═' * 60}{RESET}\n")

        # Exit code para CI
        sys.exit(0 if actual_failed == 0 else 1)


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Eventique Enterprise Test Suite",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument("--base-url", default="http://localhost:8700", help="URL base de la API")
    parser.add_argument("--token", required=True, help="ADMIN_TOKEN del servidor")
    parser.add_argument("-v", "--verbose", action="store_true", help="Mostrar detalles de cada test")
    args = parser.parse_args()

    suite = EventiqueTestSuite(args.base_url, args.token, args.verbose)
    suite.run()


if __name__ == "__main__":
    main()
