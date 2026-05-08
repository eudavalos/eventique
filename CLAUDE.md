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

## Estado del proyecto (2026-05-07)

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

**Cliente actual**: Concepción & Eumelio · boda · 2026-06-07 · paleta `nature`  
**Recintos**: Iglesia de San Pedro Claver + Club de Pesca, Carapeguá, Paraguay  
**Música**: YouTube track `zqlkbbJ003w` (track 1) + 2 MP3 placeholder  
**Rama activa**: `main` — todas las features mergeadas y deployed a Pi

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

---

## Admin Panel — Cobertura de secciones (post Fase 12)

**7 tabs**: `rsvps` · `config` · `tema` · `media` · `eventos` · `secciones` · `invitados`

### Tab Invitados — funcionalidades
- Stats dashboard: total invitaciones, cupos totales, confirmados, pendientes + barra de estados
- Tabla de invitados: búsqueda, filtro por estado, paginación (50/página)
- Acciones por fila: ver detalle, QR, WhatsApp, editar, cambiar estado, eliminar (soft-delete)
- Crear invitado manual (GuestForm con todos los campos)
- Importar CSV: descarga template → upload → preview 2-fases → commit
- Exportar CSV completo
- Modal QR con `qrcode.react`
- Modal WhatsApp: mensaje pre-generado con URL personalizada, botón abrir wa.me
- Modal auditoría por invitado

### Tab Config — Invitation Mode
- Selector 3 modos: Genérico / Personalizado / Híbrido
- 7 toggles configurables: public_rsvp, require_token, track_opens, self_edit, member_names, count_change, enforce_limit
- Campo WhatsApp template con variables: {display_name}, {event_name}, {invitation_url}, {allowed_passes}
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
