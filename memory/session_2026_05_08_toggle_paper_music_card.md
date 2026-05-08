# Session 2026-05-08 - Toggle Paper Access Music Card

## Pedido

Desde captura de la invitacion `paper-access`, implementar configuracion para mostrar u ocultar la tarjeta completa de musica marcada en rojo.

## Requerimiento Identificado

- La tarjeta visual de musica dentro del contenido `paper-access` debe ser configurable.
- No debe confundirse con `music.enabled`:
  - `music.enabled` controla si existe reproductor/pistas.
  - `paper_music_card_enabled` controla si se muestra la tarjeta visual dentro del skin `paper-access`.
- El cambio debe ser parametrizado, persistente y editable desde Admin.

## Implementacion

- Nuevo campo de configuracion:
  - `paper_music_card_enabled?: boolean`
  - Default: `true`

- Archivos modificados:
  - `frontend/src/types/index.ts`
  - `frontend/src/config/wedding.ts`
  - `frontend/src/lib/mergeConfig.ts`
  - `frontend/src/sections/PaperAccessSkin.tsx`
  - `frontend/src/pages/AdminPage.tsx`
  - `docs/test_suite.py`
  - `scripts/event_scenario_catalog.py`

## Admin UX

- Se agrego checkbox `Mostrar tarjeta de musica` en:
  - Admin -> Secciones -> Skin de Invitacion -> Paper Access
- Texto del control:
  - Controla solo la tarjeta visual de Paper Access.
  - El reproductor se maneja en la seccion Musica.

## Produccion Pi

- Evento: `boda-conce-eume`
- Config aplicada:
  - `paper_music_card_enabled = false`
  - `paper_music_prompt = ""`
- La musica sigue habilitada:
  - `music.enabled = true`
  - pista `Instrumental`
  - URL `https://youtu.be/Zp9V76_1dTY?list=PL5tjfSPzC_uq1RTTFgLOpz3CD2TnLveUb`

## Validaciones

- Build local `npm run build`: OK.
- Deploy Pi:
  - `docker compose build frontend`
  - `docker compose up -d frontend`
- `eventique-api` healthy.
- `eventique-frontend` healthy.
- Ruta personalizada responde `200 OK`.
- API personalizada confirma `paper_music_card_enabled=false`.
- Suite Pi `docs/test_suite.py`: `56/56` OK.

## Estado

La tarjeta de musica de Paper Access queda ocultable/mostrable desde configuracion sin hardcodeos y sin afectar otros formatos ni la configuracion global del reproductor.
