# Session 2026-05-08 — QA 50 Event Scenarios

## Requerimiento

El usuario pidio generar 50 casos de eventos posibles en el servidor Pi, con parametrizacion completa, sin hardcodeo operativo, y validar toda la aplicacion hasta quedar funcional.

## Decisiones

- Se implementa un catalogo declarativo central en `scripts/event_scenario_catalog.py`.
- Los 50 escenarios se derivan de dimensiones soportadas por Eventique:
  - 9 tipos de evento.
  - 3 skins: `classic`, `envelope`, `paper-access`.
  - 3 modos de invitacion: `generic`, `personalized`, `hybrid`.
  - perfiles de musica, regalos, recintos, RSVP e invitados.
- El flujo productivo en Pi usa API, no SQL directo: `scripts/seed_event_scenarios.py`.
- Los eventos QA usan prefijo `qa50` para aislamiento y limpieza segura.
- No se crean tokens admin especificos por evento; se usa `ADMIN_TOKEN` global.

## Archivos Cambiados

- `scripts/event_scenario_catalog.py`
- `scripts/seed_event_scenarios.py`
- `scripts/create_test_events.py`
- `docs/QA_50_EVENT_SCENARIOS.md`
- `docs/TEST_EVENTS_GUIDE.md`
- `docs/PRODUCTION_TEST_EVENTS.md`
- `CLAUDE.md`
- `settings.local.json`
- `memory/MEMORY.md`

## Validaciones Locales

- `py -3 -m py_compile scripts/event_scenario_catalog.py scripts/seed_event_scenarios.py scripts/create_test_events.py`
- Generacion local del catalogo: 50 escenarios, slugs unicos, longitud compatible con API.
- Cobertura generada:
  - event_types: boda/cumpleanos/bautismo/quinceanera/graduacion/corporativo/primera-comunion/aniversario/baby-shower.
  - skins: classic/envelope/paper-access.
  - invitation_modes: generic/personalized/hybrid.
  - music_profiles: youtube-single/youtube-playlist/disabled.
  - gift_profiles: registry/bank/both/none.
  - venue_profiles: single/ceremony-reception.
  - rsvp_profiles: open/deadline/limited/song-request.
  - guest_profiles: general/family/vip/staff.

## Pendiente De Esta Iteracion

Completado:

- Scripts/docs copiados a `eudavalos@raspberrypi:~/Boda`.
- Primer seed real detecto problema de validacion: dominios `*.test` son rechazados por `email-validator`.
- Correccion aplicada: emails QA usan `@eventique.tecnopowerpy.top`.
- Seed/validate final en Pi:
  - `created: 0` (los 50 eventos ya existian del primer intento).
  - `updated: 50`.
  - `guests_created: 50`.
  - `rsvps_upserted: 33`.
  - `api_validated: 50`.
  - `frontend_validated: 50`.
  - `result: OK`.
- Suite funcional completa en Pi:
  - `docs/test_suite.py`
  - Total: 56.
  - Pasaron: 56.
  - Fallaron: 0.
  - Score: 100%.
- Validacion posterior de escenarios: 50/50 API y frontend OK.
