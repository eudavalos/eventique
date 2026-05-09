# Session 2026-05-09 - Realistic Floral Decor for Envelope and Paper Access

## Pedido

Agregar a las invitaciones `Envelope (GO Party)` y `Paper Access` mas decoracion con flores de pinoquio verde y rosas blancas, con aspecto mas realista y decoraciones en cada card.

## Requerimiento Identificado

- La decoracion debe aplicar a ambos skins:
  - `envelope`
  - `paper-access`
- Debe ser parametrizada por skin.
- Debe tener control de:
  - enabled
  - estilo floral
  - densidad
  - opacidad
  - decoracion por-card
- Debe mantener compatibilidad con la configuracion existente de musica, RSVP e invitados.

## Implementacion

- Nuevo componente reutilizable:
  - `frontend/src/components/RealisticFloralDecor.tsx`

- Componentes exportados:
  - `RealisticFloralSpray`
  - `FloralDecorLayer`
  - `FloralCardAccent`

- Estilo soportado:
  - `green-pinocchio-white-roses`

- Densidades soportadas:
  - `subtle`
  - `balanced`
  - `lush`

## Campos Nuevos

### Envelope
- `envelope_floral_decor_enabled`
- `envelope_floral_decor_style`
- `envelope_floral_decor_density`
- `envelope_floral_decor_opacity`
- `envelope_floral_card_decor_enabled`

### Paper Access
- `paper_floral_card_decor_enabled`

Los campos previos de Paper Access se mantienen:
- `paper_floral_decor_enabled`
- `paper_floral_decor_style`
- `paper_floral_decor_density`
- `paper_floral_decor_opacity`

## UX/UI Admin

- Admin -> Secciones -> Envelope:
  - panel `Decoracion floral Envelope`
  - toggle mostrar decoracion
  - selector de estilo
  - selector de densidad
  - slider de opacidad
  - toggle `Decorar cards`

- Admin -> Secciones -> Paper Access:
  - el panel floral ahora incluye toggle `Decorar cards`

## Aplicacion Visual

- Envelope:
  - fondo hero del sobre
  - collage
  - cards de monograma, fecha y sobre floral
  - bloques de recintos

- Paper Access:
  - fondo hero
  - fondo contenido
  - todos los `DetailCard` del skin

## Produccion Pi

Evento `boda-conce-eume`:

- `envelope_floral_decor_enabled = true`
- `envelope_floral_decor_style = green-pinocchio-white-roses`
- `envelope_floral_decor_density = lush`
- `envelope_floral_decor_opacity = 0.78`
- `envelope_floral_card_decor_enabled = true`
- `paper_floral_decor_enabled = true`
- `paper_floral_decor_style = green-pinocchio-white-roses`
- `paper_floral_decor_density = lush`
- `paper_floral_decor_opacity = 0.78`
- `paper_floral_card_decor_enabled = true`

## Validaciones

- Build local frontend: OK.
- Deploy Pi frontend: OK.
- `eventique-api`: healthy.
- `eventique-frontend`: healthy.
- Ruta publica personalizada: `200 OK`.
- Token activo `ca7a550f...` confirma configuracion floral de ambos skins.
- Suite Pi `docs/test_suite.py`: `56/56` OK.

## Nota de Worktree

Se detectaron cambios locales no relacionados y no se incluyeron en el commit de esta tarea:
- `api/main.py`
- `api/settings.py`
- `docker-compose.yml`
- `docs/example/`
- `docs/example2/`
- `docs/videoplayback*.m4a`
