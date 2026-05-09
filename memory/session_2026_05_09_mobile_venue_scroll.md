# Session 2026-05-09 - Mobile Venue Scroll

## Pedido

El usuario pidio mejorar el scroll en moviles para que debajo de cada hoja/seccion aparezca correctamente el contenido de lugar y los botones de ubicacion en las secciones inferiores.

## Hallazgos

- La vista corresponde al skin `envelope`.
- La seccion `VenuesEnvelope` renderizaba ceremonia y recepcion como una columna continua.
- En viewport movil, el segundo CTA `Ver Ubicacion` podia quedar demasiado pegado al borde inferior durante el recorrido visual.

## Cambios

- `frontend/src/sections/VenuesEnvelope.tsx`
  - Cada recinto ahora usa la clase `envelope-venue-panel`.
  - Se agrego un indicador visual movil entre recinto 1 y recinto 2.
  - El separador vertical tiene clase propia para poder ajustarlo en mobile.
- `frontend/src/index.css`
  - Se agrego responsive mobile para `envelope-venues-section`, `envelope-venues-list`, `envelope-venue-panel`, `envelope-venue-scroll-cue` y `envelope-venue-separator`.
  - En mobile cada recinto tiene altura util de pantalla, `scroll-margin-top` para navbar fija, margen inferior seguro y snap de proximidad.

## Validaciones

- Build local frontend: OK.
- Deploy Pi frontend: OK, container healthy.
- Playwright mobile 390x844 sobre produccion:
  - Primer `Ver Ubicacion` visible al entrar a `#recintos`.
  - Segundo `Ver Ubicacion` visible dentro del viewport al desplazarse al segundo recinto.

## Resultado

En moviles, la seccion de lugares se comporta como paneles/hojas verticales con scroll mas claro y sin botones de ubicacion cortados al borde inferior.
