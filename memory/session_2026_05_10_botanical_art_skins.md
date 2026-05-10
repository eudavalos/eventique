# Session 2026-05-10 - Botanical Art Across Invitation Skins

## Pedido

Agregar imagenes botanicas similares a referencias de invitaciones externas: ramas laterales tipo acuarela/eucalipto, mas presencia visual en los skins, con parametrizacion completa y sin hardcodear un caso especifico.

## Decisiones

- Se implemento como una capa comun de arte floral/botanico, no como imagen fija por evento.
- Nuevo helper `frontend/src/lib/floralConfig.ts` centraliza la resolucion de configuracion global y overrides por skin.
- `frontend/src/components/RealisticFloralDecor.tsx` ahora soporta:
  - `watercolor-eucalyptus`
  - `green-pinocchio-white-roses`
- Se agregaron claves globales:
  - `botanical_art_enabled`
  - `botanical_art_style`
  - `botanical_art_density`
  - `botanical_art_opacity`
  - `botanical_art_card_decor_enabled`
- Los skins Envelope y Paper Access siguen soportando sus claves especificas, con fallback a las globales.

## Implementacion

- Admin -> Secciones -> Skin de Invitacion agrega control global "Imagenes botanicas globales".
- Se agrego el estilo acuarela/eucalipto a los selectores existentes de Envelope y Paper Access.
- Se aplico decoracion parametrizada en:
  - Classic: Hero, Countdown, Venues y cards de recinto.
  - Envelope: EnvelopeHero, CollageHero, VenuesEnvelope y cards.
  - Paper Access: hero, contenido y cards.
  - Amorea: hero, contenido y cards.
- Se agregaron atributos `data-floral-layer` y `data-floral-style` para validacion DOM sin afectar UX.

## Produccion Pi

- Evento `boda-conce-eume` actualizado via API:
  - `botanical_art_style = watercolor-eucalyptus`
  - `botanical_art_density = lush`
  - `envelope_floral_decor_style = watercolor-eucalyptus`
  - `paper_floral_decor_style = watercolor-eucalyptus`
- Deploy realizado en `eudavalos@raspberrypi` con rebuild/recreate de frontend.

## Validaciones

- Build local `npm run build`: OK.
- Build Docker frontend en Pi: OK.
- Health Pi: API y frontend healthy.
- Suite funcional Pi: `57/57`.
- Validacion visual headless/CDP:
  - enlace personalizado activo renderiza 3 capas `watercolor-eucalyptus`.
  - screenshot confirma ramas acuarela/eucalipto visibles sin bloquear texto ni CTA.

## Riesgos / notas

- Las ramas son SVG nativo parametrizable, no assets externos copiados de los sitios de referencia.
- Los links de referencia solo guiaron el estilo visual; no se reutilizaron imagenes de terceros.
