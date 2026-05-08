---
name: session_2026_05_08_whatsapp_preview_shortlinks
description: Links cortos enmascarados para WhatsApp con preview Open Graph; endpoint /s/{short_code}; deploy Pi; protocolo de memoria reforzado.
type: project
originSessionId: 2026-05-08-whatsapp-preview-shortlinks
---

# Sesion 2026-05-08 - WhatsApp Preview + Links Cortos

## Resumen Ejecutivo

El usuario pidio que al compartir invitaciones personalizadas por WhatsApp se muestre vista previa y que los links se puedan acortar/enmascarar. Se implemento un flujo de short links internos, sin proveedor externo, para mantener control del dominio y proteger el token completo.

Resultado: produccion deployada en Raspberry Pi, GitHub actualizado, y links cortos funcionando con Open Graph.

## Decisiones Tomadas

- Se implemento endpoint publico `GET /s/{short_code}` en FastAPI.
- El short code usa los primeros 16 caracteres del token de invitacion, no 12, para conservar mas entropia sin exponer el token completo de 64 caracteres.
- Los usuarios normales reciben `302` hacia `/e/{slug}/i/{token_completo}`.
- Crawlers sociales, incluido WhatsApp, reciben HTML con Open Graph y Twitter card.
- `PUBLIC_BASE_URL` tiene prioridad para generar URLs publicas HTTPS, evitando previews con `http://localhost` o `http://eventique...` al pasar por nginx local.
- Se agrego `frontend/public/og-eventique.jpg` como imagen JPG 1200x630 para preview, porque WhatsApp necesita imagen publica absoluta y estable.
- El admin usa link corto por defecto en WhatsApp, copiar link, regenerar token y QR de invitados.

## Requerimientos Definidos o Cambiados

- Variable `{invitation_url}` en plantilla WhatsApp ahora resuelve al link corto.
- Se agregaron variables nuevas para plantillas:
  - `{short_url}`: link corto enmascarado.
  - `{full_invitation_url}`: link completo con token, disponible solo si se necesita.
- El link corto es el formato recomendado para compartir por WhatsApp.
- El link completo sigue existiendo internamente y como destino de redireccion.

## Problemas Detectados

- WhatsApp mostraba como preview solo el dominio y el URL porque las rutas SPA no entregaban metadatos OG especificos al crawler.
- El link largo exponia el slug y el token completo, lo que era poco elegante y mas sensible visualmente.
- En pruebas locales, `TestClient` carga `.env` y puede fallar si `DEBUG=release` o existen variables `VITE_*`; se valido con base SQLite temporal y entorno minimo.
- Al probar via `localhost:5176` en Pi, nginx enviaba esquema `http`; se corrigio priorizando `PUBLIC_BASE_URL=https://eventique.tecnopowerpy.top`.

## Validaciones Ejecutadas

- `py -3 -m py_compile api/*.py`: OK.
- `npm run build` en frontend: OK, solo warning existente de chunk grande.
- Prueba aislada `GET /s/{short_code}` con User-Agent `WhatsApp/2.0`: devuelve HTML con `og:title`, `og:description`, `og:image`.
- Prueba aislada `GET /s/{short_code}` sin crawler: devuelve `302` al link largo real.
- Prueba aislada endpoint WhatsApp: devuelve `short_url`, `full_invitation_url` y renderiza `{invitation_url}` como link corto.
- Deploy Pi:
  - `docker compose build api frontend`: OK.
  - `docker compose up -d --force-recreate api frontend`: OK.
  - API healthy y frontend healthy.
- Produccion:
  - `https://eventique.tecnopowerpy.top/og-eventique.jpg`: `200 image/jpeg`.
  - `https://eventique.tecnopowerpy.top/s/772d591daff904d7` con User-Agent WhatsApp devuelve tags OG HTTPS.
  - El mismo short link sin crawler redirige `302` a `/e/boda-conce-eume/i/{token}`.

## Cambios Realizados

- `api/main.py`: endpoint `/s/{short_code}`, generacion de HTML Open Graph, deteccion de crawlers sociales, redireccion a URL completa.
- `api/guests.py`: WhatsApp usa link corto en `{invitation_url}` y devuelve `short_url`/`full_invitation_url`.
- `frontend/src/pages/AdminPage.tsx`: copiar link, QR, regenerar token y WhatsApp usan short links.
- `frontend/src/lib/api.ts`: contrato del endpoint WhatsApp actualizado.
- `frontend/index.html`: OG default apunta a imagen JPG absoluta.
- `frontend/public/og-eventique.jpg`: asset de preview.
- `nginx/nginx.conf`: proxy `/s/` hacia FastAPI.

## Commit y Deploy

- Commit: `ec68c63 feat(share): add WhatsApp preview short links`.
- Rama: `main`.
- GitHub: push realizado a `origin/main`.
- Produccion: desplegado en Raspberry Pi.

## Protocolo de Memoria Reforzado

El usuario reitero que cada iteracion nueva del chat debe guardarse automaticamente en:
- memoria externa: `C:/Users/EuDavalos/.claude/projects/D--Proyectos-Eventos-Boda/memory/`
- archivos fisicos del proyecto: `memory/`, `CLAUDE.md`, `settings.local.json`
- indice de memoria cuando aplique: `MEMORY.md`

Regla operativa: no esperar al cierre de sesion para documentar decisiones, validaciones y cambios relevantes.
