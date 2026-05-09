# Session 2026-05-09 - Paper Access Floral Decor

## Pedido

Agregar mas decoracion a las invitaciones con flores de pinoquio verde y rosas blancas, manteniendo configuracion completa y sin hardcodear datos del evento.

## Requerimiento Identificado

- La decoracion debe aplicar al skin activo `paper-access`.
- Debe poder configurarse desde Admin.
- Debe permitir activar/desactivar, seleccionar estilo, ajustar densidad y opacidad.
- La decoracion no debe depender de invitado, musica ni RSVP.

## Implementacion

- Nuevos campos parametrizados:
  - `paper_floral_decor_enabled`
  - `paper_floral_decor_style`
  - `paper_floral_decor_density`
  - `paper_floral_decor_opacity`

- Estilo inicial:
  - `green-pinocchio-white-roses`

- Densidades soportadas:
  - `subtle`
  - `balanced`
  - `lush`

- Archivos modificados:
  - `frontend/src/types/index.ts`
  - `frontend/src/config/wedding.ts`
  - `frontend/src/lib/mergeConfig.ts`
  - `frontend/src/sections/PaperAccessSkin.tsx`
  - `frontend/src/pages/AdminPage.tsx`
  - `docs/test_suite.py`
  - `scripts/event_scenario_catalog.py`

## UX/UI

- Se agrego una decoracion SVG responsive con rosas blancas, ramas verdes y puntos florales tipo pinoquio.
- Se renderiza como ornamento no interactivo (`aria-hidden`, `pointer-events-none`).
- Se agrega en hero y contenido, respetando capas y sin bloquear interaccion.
- Admin -> Secciones -> Paper Access incluye:
  - Mostrar decoracion
  - Estilo floral
  - Densidad
  - Opacidad

## Produccion Pi

- Evento: `boda-conce-eume`
- Config aplicada:
  - `paper_floral_decor_enabled = true`
  - `paper_floral_decor_style = green-pinocchio-white-roses`
  - `paper_floral_decor_density = lush`
  - `paper_floral_decor_opacity = 0.72`
- Se mantuvo:
  - `paper_music_card_enabled = false`

## Validaciones

- Build local `npm run build`: OK.
- Deploy Pi `docker compose build frontend && docker compose up -d frontend`: OK.
- `eventique-api`: healthy.
- `eventique-frontend`: healthy.
- Ruta publica personalizada responde `200 OK`.
- API de token activo `ca7a550f...` confirma configuracion floral aplicada.
- Suite Pi `docs/test_suite.py`: `56/56` OK.

## Nota Operativa

- Los tokens `772d591...` y `aaaa6f...` estan desactivados en produccion y devuelven `403`.
- Token activo validado: `ca7a550f...`.
