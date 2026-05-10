# Eventique — Claude Code Context

**Proyecto**: Eventique — Plataforma de invitaciones digitales para eventos  
**Propietario**: Eumelio Dávalos (eudavalos91@gmail.com)  
**Empresa**: Tecnopowerpy / Eumelio Dávalos (producto vendible, cliente actual: Concepción & Eumelio)  
**Stack**: React 18 + TypeScript + Vite + FastAPI + SQLite + Docker + Cloudflare Tunnel  
**Licencia**: MIT  
**URL producción**: https://eventique.tecnopowerpy.top  
**Repositorio**: https://github.com/eudavalos/eventique

---

## Propósito

Eventique es una plataforma de invitaciones digitales diseñada como **producto vendible**. El propietario la despliega para clientes (bodas, cumpleaños, bautismos, quinceañeras, graduaciones, corporativos) y el cliente configura TODO desde el panel `/admin` sin tocar código ni hacer rebuild. La arquitectura de config dinámica permite que un cambio en el admin se refleje en la invitación en el próximo page load, sin SSH ni Docker.

---

## Arquitectura en capas

```
eventique.tecnopowerpy.top (HTTPS via Cloudflare)
    │
    ↓ Cloudflare Tunnel (tecnopowerpy — systemd en Pi host, NUNCA en Docker)
    │
    ↓ Pi host:5176
    │
┌───────────────────────────────────────────┐
│  nginx:alpine (eventique-frontend)         │
│  • Sirve /usr/share/nginx/html (React SPA) │
│  • try_files → /index.html  (SPA routing)  │
│  • /api/* → proxy http://api:8700/         │
└───────────────────────────────────────────┘
    │ Docker bridge: eventique
    ↓
┌───────────────────────────────────────────┐
│  python:slim (eventique-api)               │
│  • FastAPI + SQLAlchemy                    │
│  • SQLite en /app/data/eventique.db        │
│  • RSVP table + EventConfig table          │
└───────────────────────────────────────────┘
```

**Flujo de config dinámica**:
```
wedding.ts (defaults) → mergeConfig() en App.tsx ← GET /api/event-config (SQLite)
                                  ↓
                    ConfigContext.Provider
                                  ↓
              useConfig() en todos los componentes
```

**Reglas de capas inviolables**:
1. Ningún componente importa `config` de `wedding.ts` directamente — siempre `useConfig()`
2. La API no lee `wedding.ts` — lee solo la BD
3. El admin guarda con `PUT /api/event-config` (Bearer token)
4. Cloudflared es servicio del host Pi — nunca en `docker-compose.yml`

---

## Comandos clave

```bash
# ── Desarrollo local ──────────────────────────────────────────
cd frontend && npm install && npm run dev         # Frontend dev (port 5174)
uvicorn api.main:app --reload --port 8700          # API dev

# ── Deploy a Raspberry Pi (SSH: eudavalos@raspberrypi) ───────
# Solo frontend cambió:
scp -r /d/Proyectos/Eventos/Boda/frontend/src eudavalos@raspberrypi:~/Boda/frontend/
ssh eudavalos@raspberrypi "cd ~/Boda && docker compose build frontend && docker compose up -d frontend"

# Solo API cambió:
scp /d/Proyectos/Eventos/Boda/api/*.py eudavalos@raspberrypi:~/Boda/api/
ssh eudavalos@raspberrypi "cd ~/Boda && docker compose build api && docker compose up -d api"

# Ambos cambiaron:
scp -r /d/Proyectos/Eventos/Boda/frontend/src eudavalos@raspberrypi:~/Boda/frontend/
scp /d/Proyectos/Eventos/Boda/api/*.py eudavalos@raspberrypi:~/Boda/api/
ssh eudavalos@raspberrypi "cd ~/Boda && docker compose build && docker compose up -d --force-recreate && docker compose ps"

# ── Diagnóstico en Pi ─────────────────────────────────────────
ssh eudavalos@raspberrypi "cd ~/Boda && docker compose logs --tail=50"
ssh eudavalos@raspberrypi "cd ~/Boda && docker compose ps"
ssh eudavalos@raspberrypi "curl -s http://localhost:5176/ | head -5"
ssh eudavalos@raspberrypi "curl -s http://localhost:8700/health"
```

---

## Estado del proyecto (2026-05-09)

| Fase | Estado | Descripción |
|------|--------|-------------|
| Fase 1 — MVP | ✅ COMPLETO | React SPA + FastAPI RSVP + Docker deploy en Pi |
| Fase 2 — Diseño enterprise | ✅ COMPLETO | 6 paletas, Framer Motion, 10 secciones configurables |
| Fase 3 — Config dinámica + Admin | ✅ COMPLETO | ConfigContext, PUT /event-config, Admin 5 tabs, event types |
| Fase 4 — GitHub + CI | ✅ COMPLETO | Repo eudavalos/eventique, README enterprise, git flow |
| Fase 5 — Multi-tenancy | ✅ COMPLETO | Event model, /e/:slug routes, EventSlugContext, admin Eventos tab |
| Fase 6 — Media management | ✅ COMPLETO | Upload fotos/audio desde admin, galería drag-drop, serve via API |
| Fase 7 — Product polish | ✅ COMPLETO | Email SMTP notifications, QR codes admin, RSVP edit modal, /landing page |
| Fase 8 — Content management | ✅ COMPLETO | Secciones tab (OurStory/Schedule/FAQ/Footer CRUD), gallery/music ↔ media integration, saveConfig fix, event-type adaptive titles |
| Fase 9 — Full section editors | ✅ COMPLETO | Hero/Countdown/WeddingParty/Accommodation/Gallery/RSVP/Social editors en Secciones tab |
| Fase 10 — Music enhancements | ✅ COMPLETO | YouTube track management desde admin, music.enabled/autoplay toggles |
| Fase 11 — Event duplication | ✅ COMPLETO | POST /events/{slug}/duplicate, modal "Clonar" en tab Eventos |
| Fase 12 — Invitaciones Personalizadas | ✅ COMPLETO | GuestInvitation model, 18 endpoints, Admin Invitados tab, /e/:slug/i/:token, CSV import/export, QR, WhatsApp, tracking privado |
| Fase 13 — UX Invitación Personalizada | ✅ COMPLETO | PersonalizedGreeting enterprise redesign, YouTube fix, parametrización total, sección Obsequio bancaria |
| Fase 14 — Skin Envelope | ✅ COMPLETO | EnvelopeHero, CollageHero, VenuesEnvelope, DressCode, GalleryPolaroid, paleta olive |
| Fase 15 — Test Suite Enterprise | ✅ COMPLETO | 57 tests en 9 categorías, 100% en Pi, docs/test_suite.py |
| Fase 16 — Documentación + Ayuda Admin | ✅ COMPLETO | GUIA_USUARIO_EVENTIQUE.md ~800 líneas + Tab "Ayuda" integrada en AdminPage |
| Fase 17 — WhatsApp Preview + Short Links | ✅ COMPLETO | `/s/{short_code}` con Open Graph para WhatsApp, redirección a invitación real, link corto en WhatsApp/QR/copiar link |
| Fase 18 — Paper Access Skin | ✅ COMPLETO | Nueva skin `paper-access`, paleta `paper-olive`, config full desde Admin, RSVP/música/invitados/venues/regalos integrados |
| Fase 19 — QA 50 Event Scenarios | ✅ COMPLETO | Catalogo parametrizado de 50 eventos QA, runner API para Pi, guests/RSVP opcionales, validacion de rutas publicas |

**Cliente actual**: Concepción & Eumelio · boda · 2026-06-07 · paleta `nature`  
**Recintos**: Iglesia de San Pedro Claver + Club de Pesca, Carapeguá, Paraguay  
**Música**: YouTube track `zqlkbbJ003w` (track 1) + 2 MP3 placeholder  
**Rama activa**: `main` — todas las features mergeadas y deployed a Pi  
**Último cambio operativo**: fix personalized RSVP decline handling, deploy Pi OK, suite 57/57

### Decisiones persistentes nuevas (2026-05-08)
- WhatsApp debe compartir links cortos internos `https://eventique.tecnopowerpy.top/s/{short_code}` para invitaciones personalizadas.
- `short_code` usa los primeros 16 caracteres del token de invitación; el token completo de 64 caracteres no se muestra en el mensaje.
- `GET /s/{short_code}` devuelve HTML Open Graph para crawlers sociales (WhatsApp/Facebook/etc.) y `302` al link real para usuarios normales.
- `PUBLIC_BASE_URL` tiene prioridad para construir URLs públicas HTTPS en previews, evitando `http://localhost` o `http://eventique...` cuando se prueba desde el proxy local del Pi.
- `{invitation_url}` en la plantilla WhatsApp resuelve al link corto. Variables disponibles: `{short_url}` y `{full_invitation_url}`.
- `frontend/public/og-eventique.jpg` es el asset JPG 1200x630 usado como imagen de preview.

### Referencias visuales analizadas (2026-05-08)

- `docs/example2` contiene una referencia externa de invitacion digital vertical tipo Canva/Amorea: MP4 576x1024, 15 frames JPG 1280x2276, transcript no util para requerimientos.
- La referencia define una direccion visual mobile-first: fondo papel/off-white, acentos olive/dark green, calas blancas, tarjetas de papel apiladas, sobres, sombras suaves, serif elegante y script decorativa.
- Secciones detectadas: access hero personalizado con cupos, sobre interactivo, musica, tarjeta formal/padres, calendario, ceremonia, recepcion, dress code, regalos, countdown y confirmacion RSVP.
- Decision: tratar `docs/example2` como material de inspiracion/referencia, no como asset productivo, salvo confirmacion de derechos.
- Recomendacion tecnica: implementar como nueva skin/variante (`paper-access` o `canva-floral`) reutilizando `useConfig()`, invitaciones personalizadas, venues, music, gift registry, countdown y RSVP existentes.

### Decisiones persistentes Paper Access (2026-05-08)

- `paper-access` es una skin oficial configurable desde Admin -> Secciones -> Skin de Invitacion.
- La paleta recomendada para este formato es `paper-olive`.
- Todo texto visible del formato Paper Access vive en config dinamica con prefijo `paper_*`; no debe depender de valores sueltos fuera de `WeddingConfig`/SQLite.
- El formato reutiliza `GuestContext`, `MusicPlayer`, `GiftRegistry`, `RSVP`, venues, countdown y footer existentes para no duplicar contratos de negocio.
- Validacion en Pi: deploy frontend OK y `docs/test_suite.py` completo paso 56/56 contra `http://localhost:5176/api`.

### Decisiones persistentes QA 50 Event Scenarios (2026-05-08)

- Los 50 eventos QA se generan desde `scripts/event_scenario_catalog.py`; no usar fixtures SQL manuales para el flujo enterprise.
- El runner productivo es `scripts/seed_event_scenarios.py` y opera por API contra `http://localhost:5176/api` en Pi.
- Prefijo oficial: `qa50`; esto permite validar, listar y limpiar escenarios sin tocar eventos reales.
- Cobertura obligatoria: 9 tipos de evento, 3 skins, 3 modos de invitacion, perfiles de musica, regalos, recintos, RSVP e invitados.
- Los escenarios QA no crean tokens admin especificos por defecto; se administran con `ADMIN_TOKEN` global para evitar credenciales por evento.
- Documentacion operativa: `docs/QA_50_EVENT_SCENARIOS.md` y `docs/TEST_EVENTS_GUIDE.md`.

### Decisiones persistentes Invitaciones Personalizadas (2026-05-08)

- La configuracion visual de una invitacion personalizada es por evento (`event_config.event_slug`), no por invitado.
- `PersonalizedInvitationRoute` debe aplicar tambien el `event_config` que viene dentro de `GET /events/{slug}/invitations/{token}`; esto evita que un link personalizado renderice con defaults si falla el request separado a `/event-config`.
- En `boda-conce-eume` existen dos registros operativos similares para Ilde Dávalos (`id=1` y `id=4`) con tokens y estados distintos; no archivar ninguno sin validar cual link se esta compartiendo.

### Decisiones persistentes RSVP Personalizado (2026-05-09)

- En RSVP personalizado, `guest_count=0` es valido solo para rechazo (`attending=false`).
- Confirmar asistencia (`attending=true`) requiere `guest_count >= 1`; el backend lo valida en `PersonalizedRSVPCreate`.
- El frontend nunca debe pasar objetos/arrays de error API directo a componentes React o `toast.error`.
- Usar `frontend/src/lib/apiError.ts` (`getApiErrorMessage`) para normalizar errores FastAPI/Pydantic antes de renderizar.
- Caso de regresion obligatorio: `TC-035B` en `docs/test_suite.py` valida rechazo personalizado con `guest_count=0`.
- Validacion Pi: deploy API+frontend OK, prueba directa sobre `boda-conce-eume` con invitados temporales OK, suite `57/57`.

### Decisiones persistentes UX Mobile Envelope (2026-05-09)

- En `VenuesEnvelope`, cada recinto debe comportarse como panel/hoja movil con altura util y `scroll-margin-top` para no quedar debajo de la navegacion fija.
- Los CTAs `Ver Ubicacion` deben quedar visibles con margen inferior seguro en mobile.
- El scroll entre ceremonia y recepcion usa snap de proximidad y un indicador visual sin texto adicional.
- Validacion: Playwright mobile 390x844 sobre produccion confirmo ambos botones de ubicacion visibles al navegar cada panel.

### Decisiones persistentes Maps Links (2026-05-10)

- No renderizar links dinamicos de Google Maps/Firebase (`maps.app.goo.gl`, `goo.gl`, `app.goo.gl`, `page.link`) directamente en ninguna plantilla.
- Todas las plantillas deben usar `frontend/src/lib/maps.ts` y `getVenueMapsUrl(venue)` para los CTAs de ubicacion.
- Si el link guardado es dinamico, generar fallback estable `https://www.google.com/maps/search/?api=1&query=...` con datos del recinto.
- Produccion `boda-conce-eume` usa URLs finales `google.com/maps/place/...` para ceremonia y recepcion.
- Validacion Pi: frontend healthy, suite `57/57`, Playwright mobile confirma anchors sin `maps.app.goo.gl` ni `goo.gl/app/maps`.

---

## Thresholds — Política de parametrización

**Ninguna constante numérica en código fuente**. Todo valor configurable vive en `settings.local.json`.

Los valores actuales están en `settings.local.json` (raíz del repo, versionado en git). Acceder con:
- Frontend: constantes importadas de `config/` o leídas de `useConfig()`
- Backend: variables de entorno en `.env` (ADMIN_TOKEN, DATABASE_URL, ALLOWED_ORIGINS)
- Infraestructura: valores en `docker-compose.yml`

Valores en `settings.local.json`:
- `api.port` = 8700
- `frontend.port_host` = 5176  
- `rsvp.max_guests_default` = 4
- `rsvp.max_guests_absolute` = 8
- `docker.healthcheck_interval_s` = 30
- `docker.healthcheck_retries_api` = 5

---

## Convenciones de código

### Obligatorias
- Nuevos componentes/secciones → `const config = useConfig()` como primera línea
- Nuevos campos admin-configurables → `types/index.ts` (EventConfig) + `wedding.ts` (default) + `api/main.py` (persist) + formulario en AdminPage
- Nuevas paletas → `PaletteKey` en types + objeto en `theme.ts` + card en `PALETTE_OPTIONS` en AdminPage
- TypeScript strict: sin `any` explícito, sin `@ts-ignore`

### Anti-patrones conocidos (NUNCA hacer)

| Anti-patrón | Por qué | Corrección |
|---|---|---|
| `import { config } from '../config/wedding'` en secciones | No es reactivo al config dinámico | `import { useConfig }` + `const config = useConfig()` |
| `btoa(token)` antes de enviar al API admin | API compara raw string — btoa siempre da 401 | Enviar token sin codificar |
| `CMD` en healthcheck de nginx | El shell redirect `> /dev/null` no funciona sin shell | Usar `CMD-SHELL` |
| Cloudflared en `docker-compose.yml` | Tunnel es compartido del host Pi, conflicto | Mantener en `/etc/cloudflared/config.yml` del host |
| `import.meta.env` sin `vite-env.d.ts` | TypeScript error en build | Requiere `frontend/src/vite-env.d.ts` |
| `COPY ../nginx/` en Dockerfile con build context = `frontend/` | Docker no puede salir del build context | Build context = raíz del proyecto |
| `postMessage(msg, '*')` para YouTube | Browsers estrictos/móvil ignoran wildcard origin | Usar `YT_ORIGIN = 'https://www.youtube.com'` como target |
| YouTube embed sin `&origin=` | YouTube API requiere origin con enablejsapi=1 | `buildYouTubeSrc()` agrega `&origin=${encodeURIComponent(window.location.origin)}` |
| Enviar comando YT antes de `onReady` | Comandos enviados antes de que YouTube inicialice son silenciosamente ignorados | Usar `pendingPlayRef` queue, ejecutar en handler `onReady` |
| Hardcodear texto en componentes de invitación personalizada | No configurable desde admin; viola principio de parametrización total | Todo texto via `useConfig()` con fallback a defaults en `wedding.ts` |
| Campos nuevos en WeddingConfig sin agregar a `mergeConfig` | La propagación DB→config NO es automática — `mergeConfig` usa spread solo para campos conocidos | Agregar línea explícita en `mergeConfig()` en `App.tsx` para cada campo nuevo |
| Arrays CRUD (tracks, accounts) como campos de `useForm`/`register` | Arrays dinámicos con CRUD no encajan en react-hook-form sin `useFieldArray` | Usar local `useState` array (patrón `musicTracks`, `giftBankAccounts`) |
| Asumir que evento de prueba tiene config completa | Evento recién creado tiene `{}` como config — assertions sobre campos estructurales fallan | Hacer PUT con config seed antes de duplicar/verificar campos en tests |
| Buscar `"created"` o `"count"` en respuesta de import commit | API retorna `{"imported": N, "errors": M}` no `{"created": N}` | Buscar `data.get("imported")` primero en el lookup chain |
| Asumir `"pending"` es el único estado inicial de guest | API puede retornar `"opened"` si el GET /invitations/{token} fue llamado antes (auto-tracking) | `GUEST_VALID_STATUS` debe incluir `"opened"` junto a los demás estados |

---

## Protocolo de Sesión

En cada sesión significativa, actualizar estos cuatro artefactos:

1. `memory/session_YYYY_MM_DD_<tema>.md` — decisiones, validaciones, cambios
2. `CLAUDE.md` → sección "Estado del proyecto" con fecha actualizada
3. `settings.local.json` → `session_protocol.last_session_date` + cambios técnicos relevantes
4. `memory/MEMORY.md` → añadir entrada al índice

**Auto-memoria por iteración**: En cada orden/respuesta relevante guardar contexto inmediatamente en el sistema de memoria en `C:\Users\EuDavalos\.claude\projects\D--Proyectos-Eventos-Boda\memory\`. No esperar al final de la sesión.

**Tipos de memoria**: `user` (perfil/preferencias), `feedback` (reglas/anti-patrones), `project` (estado/decisiones), `reference` (recursos externos).

**Iteración automática**: Ejecutar todas las subtareas de un bloque sin pedir confirmación entre ellas. Pausar solo ante: (a) acción destructiva irreversible, (b) ambigüedad que cambia el alcance, (c) fin de bloque o sesión.

---

## API Endpoints

### Backward-compat (default event)
| Method | Path | Auth | Descripción |
|---|---|---|---|
| GET | /health | — | Health check |
| GET | /event-config | — | Config del evento default |
| PUT | /event-config | Admin | Guardar config del evento default |
| POST | /rsvp | — | RSVP al evento default |
| GET | /rsvp/check?email= | — | Verificar email en evento default |
| GET | /rsvp | Admin | Listar RSVPs del evento default |
| GET | /rsvp/stats | Admin | Stats del evento default |
| DELETE | /rsvp/{id} | Admin | Eliminar RSVP del evento default |

### Multi-tenant (Fase 5)
| Method | Path | Auth | Descripción |
|---|---|---|---|
| GET | /events | Superadmin | Listar todos los eventos |
| POST | /events | Superadmin | Crear nuevo evento |
| DELETE | /events/{slug} | Superadmin | Eliminar evento y todos sus datos |
| GET | /events/{slug}/event-config | — | Config del evento |
| PUT | /events/{slug}/event-config | EventAdmin | Guardar config del evento |
| POST | /events/{slug}/rsvp | — | RSVP al evento |
| GET | /events/{slug}/rsvp/check | — | Verificar email en evento |
| GET | /events/{slug}/rsvp | EventAdmin | Listar RSVPs del evento |
| GET | /events/{slug}/rsvp/stats | EventAdmin | Stats del evento |
| DELETE | /events/{slug}/rsvp/{id} | EventAdmin | Eliminar RSVP del evento |

### Media (Fase 6)
| Method | Path | Auth | Descripción |
|---|---|---|---|
| GET | /events/{slug}/media | EventAdmin | Listar archivos del evento |
| POST | /events/{slug}/media | EventAdmin | Subir imagen (10MB) o audio (50MB) |
| DELETE | /events/{slug}/media/{id} | EventAdmin | Eliminar archivo |
| GET | /uploads/{slug}/{filename} | — | Servir archivo subido |

### Event operations (Fase 11)
| Method | Path | Auth | Descripción |
|---|---|---|---|
| POST | /events/{slug}/duplicate | Superadmin | Duplicar evento (copia EventConfig JSON al nuevo slug) |

### Guest Invitations (Fase 12)
| Method | Path | Auth | Descripción |
|---|---|---|---|
| GET | /events/{slug}/invitations/{token} | — | Obtener datos de invitación personalizada |
| POST | /events/{slug}/invitations/{token}/rsvp | — | Confirmar asistencia con token (quota enforced) |
| POST | /events/{slug}/invitations/{token}/open | — | Registrar apertura (204, fire-and-forget) |
| GET | /events/{slug}/guests | EventAdmin | Listar invitados paginados (items, total, page, pages) |
| POST | /events/{slug}/guests | EventAdmin | Crear invitado manual |
| GET | /events/{slug}/guests/stats | EventAdmin | Estadísticas de invitados |
| GET | /events/{slug}/guests/export.csv | EventAdmin | Exportar todos los invitados en CSV |
| GET | /events/{slug}/guests/template.csv | EventAdmin | Descargar plantilla CSV de importación |
| POST | /events/{slug}/guests/import/preview | EventAdmin | Preview de CSV sin guardar (multipart) |
| POST | /events/{slug}/guests/import/commit | EventAdmin | Importar filas validadas como JSON |
| GET | /events/{slug}/guests/{id} | EventAdmin | Detalle de invitado |
| PUT | /events/{slug}/guests/{id} | EventAdmin | Actualizar invitado |
| PATCH | /events/{slug}/guests/{id}/status | EventAdmin | Cambiar estado (JSON body {status, blocked_reason}) |
| DELETE | /events/{slug}/guests/{id} | EventAdmin | Soft-delete de invitado |
| POST | /events/{slug}/guests/{id}/regenerate-token | EventAdmin | Regenerar token único |
| GET | /events/{slug}/guests/{id}/qr-data | EventAdmin | Datos para generar QR |
| GET | /events/{slug}/guests/{id}/audit | EventAdmin | Historial de auditoría |
| GET | /events/{slug}/guests/{id}/whatsapp | EventAdmin | Generar mensaje + URL wa.me |
| GET | /s/{short_code} | — | Link corto público: Open Graph para crawlers sociales y redirect 302 a invitación personalizada |

---

## Admin Panel — Cobertura de secciones (post Fase 12)

**8 tabs**: `dashboard` · `rsvps` · `invitados` · `config` · `tema` · `media` · `eventos` · `secciones` · `ayuda`

### Tab Invitados — funcionalidades
- Stats dashboard: total invitaciones, cupos totales, confirmados, pendientes + barra de estados
- Tabla de invitados: búsqueda, filtro por estado, paginación (50/página)
- Acciones por fila: ver detalle, QR, WhatsApp, editar, cambiar estado, eliminar (soft-delete)
- Crear invitado manual (GuestForm con todos los campos)
- Importar CSV: descarga template → upload → preview 2-fases → commit
- Exportar CSV completo
- Modal QR con `qrcode.react`
- Modal WhatsApp: mensaje pre-generado con link corto `/s/{short_code}`, preview Open Graph y botón abrir wa.me
- Modal auditoría por invitado

### Tab Config — Invitation Mode
- Selector 3 modos: Genérico / Personalizado / Híbrido
- 7 toggles configurables: public_rsvp, require_token, track_opens, self_edit, member_names, count_change, enforce_limit
- Campo WhatsApp template con variables: {display_name}, {event_name}, {event_date}, {allowed_passes}, {invitation_url}, {short_url}, {full_invitation_url}, {rsvp_deadline}
- Toggle Gift Registry (ocultar sección si no aplica)
- Card "Datos Bancarios (Obsequio)": toggle + título + cuerpo + CRUD de cuentas bancarias (label/valor)

### Tab Secciones — editores disponibles

| Sección | Campos editables |
|---|---|
| Hero | enabled toggle, subtitle, backgroundImage (visual picker + URL), overlayOpacity, showScrollIndicator |
| Countdown | enabled toggle, label text |
| OurStory | enabled toggle, title, CRUD de eventos (date, title, description) |
| Schedule | enabled toggle, title, CRUD de items (time, title, description) |
| WeddingParty | enabled toggle, title, CRUD de miembros (name, role, side: bride/groom/both, description) |
| Accommodation | enabled toggle, title, CRUD de hoteles (name, address, phone, website, stars 0-5, priceRange, notes) |
| Gallery | enabled toggle, title, subtitle (fotos se asignan desde Media tab) |
| RSVP | title, subtitle, confirmationMessage |
| Footer | enabled toggle, message, credits |
| Social | hashtag, Instagram username |
| Music (top-level) | enabled toggle, autoplay toggle, YouTube track add (URL + título + artista), remove tracks |

### Tab Media — integración
- Imágenes: botón toggle "Galería" → `addPhotoToGallery` / `removePhotoFromGallery` (persiste inmediatamente)
- Audio: botón toggle Music → `addTrackToPlayer` / `removeTrackFromPlayer` (persiste inmediatamente)

---

## Music Playback — Paper Access (2026-05-08)

### Decisión Persistente
- `music` sigue siendo configuración de evento (`enabled`, `autoplay`, `tracks`) y no debe hardcodearse en skins.
- El formato `paper-access` debe iniciar música mediante gesto explícito del usuario desde su tarjeta visible de música.
- Para desacoplar skins y reproductor global, usar eventos internos:
  - `eventique:music-player:play`
  - `eventique:music-player:toggle`
- Los links YouTube con playlist deben preservar el parámetro `list` en el iframe embed.

### Hallazgo Producción
- Evento `boda-conce-eume` tenía guardado correctamente:
  - `https://youtu.be/Zp9V76_1dTY?list=PL5tjfSPzC_uq1RTTFgLOpz3CD2TnLveUb`
- La invitación personalizada recibía la configuración correcta.
- El fallo estaba en UX/lógica: la tarjeta de música de `paper-access` era visual y no disparaba `MusicPlayer`; además `autoplay` puede ser bloqueado por el navegador.

### Validación
- Build local frontend OK.
- Deploy Pi frontend OK.
- `eventique-frontend` healthy.
- Ruta de invitación personalizada devuelve `200 OK`.
- Suite Pi `docs/test_suite.py`: `56/56` OK.

### Ajuste Visual Posterior
- `paper_music_prompt` puede quedar como string vacío para ocultar el texto superior de la tarjeta de música en `paper-access`.
- `MusicPaperCard` solo renderiza ese prompt si tiene contenido no vacío.
- Admin debe persistir `paper_music_prompt = ""` cuando el usuario quiere ocultarlo; no convertirlo a `undefined` porque eso reactiva el fallback por defecto.
- `paper_music_card_enabled` controla si la tarjeta completa de música se muestra en `paper-access`.
- Este flag es independiente de `music.enabled`: ocultar la tarjeta no elimina la música ni las pistas configuradas.
- Admin -> Secciones -> Paper Access incluye el checkbox `Mostrar tarjeta de música`.

### Decoración Floral Paper Access (2026-05-09)
- La decoración floral del skin `paper-access` es parametrizada con:
  - `paper_floral_decor_enabled`
  - `paper_floral_decor_style`
  - `paper_floral_decor_density`
  - `paper_floral_decor_opacity`
- Estilo inicial soportado: `green-pinocchio-white-roses`.
- Densidades soportadas: `subtle`, `balanced`, `lush`.
- Admin -> Secciones -> Paper Access permite activar, elegir estilo, densidad y opacidad.
- Producción `boda-conce-eume`: decoración activa con densidad `lush` y opacidad `0.72`.
- Tokens antiguos `772d591...` y `aaaa6f...` están desactivados; token activo validado `ca7a550f...`.

### Decoración Floral Realista Envelope + Paper Access (2026-05-09)
- La decoración floral realista se centraliza en `frontend/src/components/RealisticFloralDecor.tsx`.
- Componentes disponibles:
  - `RealisticFloralSpray`
  - `FloralDecorLayer`
  - `FloralCardAccent`
- Estilo soportado: `green-pinocchio-white-roses`.
- Envelope tiene configuración propia:
  - `envelope_floral_decor_enabled`
  - `envelope_floral_decor_style`
  - `envelope_floral_decor_density`
  - `envelope_floral_decor_opacity`
  - `envelope_floral_card_decor_enabled`
- Paper Access agrega `paper_floral_card_decor_enabled`.
- En producción `boda-conce-eume`, Envelope y Paper Access quedan en densidad `lush`, opacidad `0.78`, y decoración por-card activa.
