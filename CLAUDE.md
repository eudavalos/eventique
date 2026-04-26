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

## Estado del proyecto (2026-04-25)

| Fase | Estado | Descripción |
|------|--------|-------------|
| Fase 1 — MVP | ✅ COMPLETO | React SPA + FastAPI RSVP + Docker deploy en Pi |
| Fase 2 — Diseño enterprise | ✅ COMPLETO | 6 paletas, Framer Motion, 10 secciones configurables |
| Fase 3 — Config dinámica + Admin | ✅ COMPLETO | ConfigContext, PUT /event-config, Admin 3 tabs, event types |
| Fase 4 — GitHub + CI | ✅ COMPLETO | Repo eudavalos/eventique, README enterprise, git flow |
| Fase 5 — Multi-tenancy | 🔲 PENDIENTE | Múltiples eventos desde un único deploy |
| Fase 6 — Media management | 🔲 PENDIENTE | Upload de fotos/música desde admin |

**Cliente actual**: Concepción & Eumelio · boda · 2026-12-05 · paleta `nature`  
**Recintos**: placeholders — el cliente debe completar desde /admin  
**Música**: YouTube track `zqlkbbJ003w` (track 1) + 2 MP3 placeholder

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

---

## Protocolo de Sesión

En cada sesión significativa, actualizar estos tres artefactos:

1. `memory/session_YYYY_MM_DD_<tema>.md` — decisiones, validaciones, cambios
2. `CLAUDE.md` → sección "Estado del proyecto" con fecha actualizada
3. `.claude/settings.local.json` → `session_protocol.last_session_date` + cambios técnicos

**Iteración automática**: Ejecutar todas las subtareas de un bloque sin pedir confirmación entre ellas. Pausar solo ante: (a) acción destructiva irreversible, (b) ambigüedad que cambia el alcance, (c) fin de bloque o sesión.

---

## API Endpoints

| Method | Path | Auth | Descripción |
|---|---|---|---|
| GET | /health | — | Health check |
| GET | /event-config | — | Config actual del evento (JSON) |
| PUT | /event-config | Admin | Guardar nueva config (JSON arbitrario) |
| POST | /rsvp | — | Enviar confirmación de asistencia |
| GET | /rsvp/check?email= | — | Verificar si email ya confirmó |
| GET | /rsvp | Admin | Listar todas las confirmaciones |
| GET | /rsvp/stats | Admin | Estadísticas de asistencia |
| DELETE | /rsvp/{id} | Admin | Eliminar confirmación |
