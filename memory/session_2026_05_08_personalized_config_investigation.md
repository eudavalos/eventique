# Session 2026-05-08 — Personalized Config Investigation

## Requerimiento

El usuario pidio examinar por que el link personalizado:

`/e/boda-conce-eume/i/772d591daff904d71ad225945a15f19caea2b7d483781fbcb10b547bc5e1787e`

parecia ser el unico invitado con la configuracion seleccionada.

## Hallazgos

- La configuracion visual esta guardada a nivel evento, no a nivel invitado.
- `boda-conce-eume` tiene `invitation_skin = paper-access`, `personalized_full_view = true` y `track_invitation_opens = true`.
- El token investigado pertenece al invitado `id=1`:
  - `display_name`: `Ilde Dávalos y familia`
  - `email`: `test@example.com`
  - `allowed_passes`: 3
  - `confirmed_passes`: 2
  - `declined_passes`: 1
  - `status`: `opened`
- Hay un duplicado operativo con nombre casi igual:
  - `id=4`
  - `display_name`: `Ilde Davalos y familia`
  - `phone`: `+595976368606`
  - token distinto: `aaaa6f456c6a051f...`
- Los 4 invitados activos de `boda-conce-eume` reciben por API la misma configuracion:
  - `invitation_skin = paper-access`
  - `personalized_full_view = true`
  - `theme.palette = nature`

## Problema Tecnico Detectado

En `PersonalizedInvitationRoute` el frontend cargaba `GET /event-config` por separado y usaba esa respuesta para renderizar el skin, aunque `GET /invitations/{token}` ya trae `event_config`.

Riesgo: si el request separado falla, corre fuera de orden o queda desincronizado, una invitacion personalizada puede renderizar con defaults estaticos aunque el payload del token tenga la configuracion correcta.

## Cambio Implementado

- `frontend/src/App.tsx`
  - Se agrego `applyInvitationPayloadConfig()`.
  - Al recibir `getPersonalizedInvitation`, se aplica inmediatamente `data.event_config`.
  - Esto evita que un link personalizado caiga a defaults si el request separado de config falla.

## Validaciones

- Build local frontend: `npm run build` OK.
- Deploy frontend en Pi: `docker compose build frontend && docker compose up -d frontend` OK.
- Docker Pi: `eventique-frontend` healthy, `eventique-api` healthy.
- API Pi: los 4 tokens activos de `boda-conce-eume` devuelven `paper-access`.
- Suite completa Pi: 56/56 tests, 100%.

## Nota Operativa

La percepcion de que solo un invitado tiene la configuracion seleccionada se explica por datos duplicados y por el riesgo de render frontend ya corregido. Si se desea limpiar la lista, revisar manualmente los duplicados `id=1` e `id=4` antes de archivar uno, porque tienen tokens y estados RSVP distintos.
