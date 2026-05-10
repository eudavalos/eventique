# Session 2026-05-10 - Stable Maps Links All Skins

## Pedido

Aplicar la correccion de links de ubicacion a todos los temas o plantillas para evitar el error movil `Dynamic Link Not Found` al abrir Google Maps.

## Hallazgos

- Produccion `boda-conce-eume` tenia enlaces cortos:
  - Ceremonia: `https://maps.app.goo.gl/r2Yf8PtKU3YNvJYT7`
  - Recepcion: `https://maps.app.goo.gl/FaQTGZQ2t87aw3DP7`
- En algunos Android/Chrome esos enlaces se reescriben a `https://goo.gl/app/maps/...` y muestran una pagina Firebase `Dynamic Link Not Found`.
- La causa es externa a Eventique: son Dynamic Links/Firebase wrappers usados por Google Maps, y Firebase Dynamic Links esta deprecado.

## Decision

- Ninguna plantilla debe renderizar directamente enlaces dinamicos de Maps (`maps.app.goo.gl`, `goo.gl`, `app.goo.gl`, `page.link`).
- Todas las plantillas deben pasar los links por un helper comun.
- Si el link guardado es dinamico, el frontend genera un link estable `https://www.google.com/maps/search/?api=1&query=...` usando nombre, direccion, ciudad y pais del recinto.
- En produccion, reemplazar los links cortos actuales por URLs finales de `google.com/maps/place/...`.

## Cambios

- Nuevo helper: `frontend/src/lib/maps.ts`
  - `getVenueMapsUrl(venue)`
  - Detecta hosts dinamicos y genera fallback estable por query.
- Templates actualizados:
  - `Venues.tsx` (classic)
  - `VenuesEnvelope.tsx` (envelope)
  - `PaperAccessSkin.tsx`
  - `AmoreaSkin.tsx`
  - `RSVP.tsx`
  - `PersonalizedInvitationPage.tsx`
- Produccion `boda-conce-eume`:
  - Ceremonia y recepcion actualizadas a URLs finales `google.com/maps/place/...`.

## Validaciones

- Build local frontend: OK.
- Deploy Pi frontend: OK, container healthy.
- Suite Pi: `57/57` OK.
- Playwright mobile 390x844 sobre produccion:
  - Los anchors de mapas renderizan `google.com/maps/place/...`.
  - No quedan `maps.app.goo.gl` ni `goo.gl/app/maps`.

## Resultado

La correccion aplica a todas las plantillas y skins actuales. Aunque el admin guarde un link corto dinamico de Google Maps, las invitaciones renderizan un link estable y evitan la pantalla Firebase Dynamic Link Not Found.
