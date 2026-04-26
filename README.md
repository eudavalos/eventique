# Eventique

**Enterprise-grade digital event invitations — fully configurable, zero rebuild.**

Eventique is a white-label platform for creating stunning, interactive digital invitations for any event type — weddings, birthdays, baptisms, quinceañeras, graduations, and corporate events. Deploy once on a Raspberry Pi 5; configure everything from the admin panel without touching code.

[![FastAPI](https://img.shields.io/badge/FastAPI-2.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)

---

## Features

- **Dynamic configuration** — All content (names, dates, venues, colors, music) is stored in SQLite and editable from `/admin`. Changes take effect on the next page load — no rebuild, no SSH.
- **6 color palettes** — Nature, Rose Gold, Garden, Navy Gold, Sage, Midnight. Live preview in admin.
- **YouTube & MP3 music player** — Floating player with play/pause control. Supports YouTube URLs or local MP3 files.
- **RSVP system** — Multi-step form with guest count, dietary restrictions, and song requests. Idempotent by email. CSV export.
- **Admin panel** — Three tabs: RSVPs (with stats + delete), Event Config, Theme. Protected by Bearer token.
- **10 animated sections** — Hero, Countdown, Our Story, Schedule, Wedding Party, Gallery, Accommodation, FAQ, RSVP, Footer. Each section togglable from admin.
- **6 event types** — `boda`, `cumpleanos`, `bautismo`, `quinceanera`, `graduacion`, `corporativo`. UI adapts terminology automatically.
- **Production-ready** — Docker Compose 2-service stack (Nginx + FastAPI), ARM64-compatible for Raspberry Pi 5, Cloudflare Tunnel for HTTPS.

---

## Architecture

```
eventique.tecnopowerpy.top (HTTPS via Cloudflare)
        │
        ↓  Cloudflare Tunnel — systemd service on Pi host (NEVER in Docker)
        │
        ↓  Pi host:5176
        │
┌───────────────────────────────────────────────────┐
│  nginx:alpine  (eventique-frontend)                │
│  ▸ Serves React SPA from /usr/share/nginx/html     │
│  ▸ try_files $uri $uri/ /index.html  (SPA routing) │
│  ▸ /api/* → proxy_pass http://api:8700/            │
└───────────────────────────────────────────────────┘
        │ Docker bridge network: eventique
        ↓
┌───────────────────────────────────────────────────┐
│  python:3.12-slim  (eventique-api)                 │
│  ▸ FastAPI + SQLAlchemy + Pydantic v2              │
│  ▸ SQLite at /app/data/eventique.db                │
│  ▸ Tables: rsvps, event_config                     │
└───────────────────────────────────────────────────┘
```

**Dynamic config flow:**
```
wedding.ts (static defaults)
         +
GET /api/event-config (SQLite)
         ↓
    mergeConfig()  in App.tsx
         ↓
  ConfigContext.Provider
         ↓
  useConfig()  in every component
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS, Framer Motion |
| Fonts | Cormorant Garamond, Playfair Display, Jost (Google Fonts) |
| Backend | FastAPI, SQLAlchemy, Pydantic v2, Uvicorn |
| Database | SQLite (default) — PostgreSQL-compatible via `DATABASE_URL` |
| Container | Docker Compose v2, Nginx Alpine, Python 3.12 Slim |
| Tunnel | Cloudflare Zero Trust (cloudflared, systemd) |
| Platform | Raspberry Pi 5 (ARM64) |

---

## Quick Start

### Prerequisites

- Docker + Docker Compose v2
- Node.js 20+ (for local development only)
- Python 3.12+ (for local development only)

### 1. Clone

```bash
git clone https://github.com/eudavalos/eventique.git
cd eventique
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Generate a secure token: python3 -c "import secrets; print(secrets.token_urlsafe(32))"
ADMIN_TOKEN=your-secure-token-here

DATABASE_URL=sqlite:////app/data/eventique.db
ALLOWED_ORIGINS=https://your-domain.com,http://localhost:5174
```

### 3. Add media (optional)

```bash
mkdir -p frontend/public/photos frontend/public/music
# Copy your photos and MP3 files here
```

### 4. Deploy

```bash
docker compose build
docker compose up -d
docker compose ps   # both services should be healthy
```

Frontend is available at `http://localhost:5176`. Admin panel at `http://localhost:5176/admin`.

---

## Local Development

```bash
# Install dependencies
cd frontend && npm install && cd ..
pip install -r api/requirements.txt

# Run both services in parallel
make dev

# Or separately:
cd frontend && npm run dev        # http://localhost:5174
uvicorn api.main:app --reload --port 8700
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | — | Health check |
| `GET` | `/event-config` | — | Current event configuration (JSON) |
| `PUT` | `/event-config` | Admin | Save event configuration |
| `POST` | `/rsvp` | — | Submit RSVP (idempotent by email) |
| `GET` | `/rsvp/check?email=` | — | Check if email has already RSVP'd |
| `GET` | `/rsvp` | Admin | List all RSVPs |
| `GET` | `/rsvp/stats` | Admin | Attendance statistics |
| `DELETE` | `/rsvp/{id}` | Admin | Delete an RSVP |

Interactive docs at `/api/docs` (Swagger UI) and `/api/redoc`.

**Admin auth**: `Authorization: Bearer <ADMIN_TOKEN>` — raw string, no encoding.

---

## Event Configuration

The full event config is a JSON object stored in `event_config` table (single row). It deep-merges with the static defaults in `frontend/src/config/wedding.ts`.

Key configurable fields:

```json
{
  "event_type": "boda",
  "couple": {
    "person1": { "name": "Name 1", "lastName": "Last 1" },
    "person2": { "name": "Name 2", "lastName": "Last 2" }
  },
  "dates": {
    "ceremony": "2026-12-05T16:00:00",
    "timezone": "America/Bogota"
  },
  "venues": {
    "ceremony": { "name": "...", "address": "...", "googleMapsUrl": "..." },
    "reception": { "name": "...", "address": "...", "googleMapsUrl": "..." }
  },
  "theme": {
    "palette": "nature"
  },
  "music": {
    "tracks": [{ "title": "...", "url": "https://youtube.com/watch?v=..." }]
  },
  "sections": {
    "hero": { "visible": true },
    "gallery": { "visible": true },
    "rsvp": { "visible": true }
  }
}
```

---

## Color Palettes

| Key | Primary | Accent | Character |
|-----|---------|--------|-----------|
| `nature` | `#3E7B57` | `#C9A93C` | Forest green + gold |
| `rose-gold` | `#B76E79` | `#C9A27C` | Romantic blush |
| `garden` | `#6B8F71` | `#D4A853` | Sage + honey |
| `navy-gold` | `#1B3A6B` | `#D4AF37` | Classic elegance |
| `sage` | `#8FAF8F` | `#B8975A` | Soft sage + bronze |
| `midnight` | `#2C3E50` | `#E8C97E` | Dramatic dark |

---

## Deployment on Raspberry Pi 5

See [DEPLOY.md](DEPLOY.md) for the full deployment guide, including Cloudflare Tunnel setup.

Quick deploy from your development machine:

```bash
# Copy changed files and rebuild
scp -r frontend/src api/*.py eudavalos@raspberrypi:~/Boda/
ssh eudavalos@raspberrypi "cd ~/Boda && docker compose build && docker compose up -d --force-recreate"
```

---

## Project Structure

```
eventique/
├── api/                    # FastAPI backend
│   ├── main.py             # Routes, CORS, auth
│   ├── models.py           # SQLAlchemy models (RSVP, EventConfig)
│   ├── schemas.py          # Pydantic v2 schemas
│   ├── database.py         # DB session factory
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── config/
│   │   │   └── wedding.ts  # Static default config
│   │   ├── context/
│   │   │   └── ConfigContext.tsx
│   │   ├── lib/
│   │   │   ├── api.ts      # API client
│   │   │   └── theme.ts    # Palette definitions
│   │   ├── pages/
│   │   │   ├── InvitationPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── sections/       # 10 invitation sections
│   │   ├── components/     # Shared components (MusicPlayer, etc.)
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx         # Root: ConfigContext.Provider + mergeConfig
│   ├── public/
│   │   ├── photos/         # Event photos (gitignored)
│   │   └── music/          # Local MP3 files (gitignored)
│   ├── index.html
│   └── Dockerfile
├── data/                   # SQLite volume mount (gitignored)
├── docker-compose.yml
├── .env.example
├── Makefile
├── DEPLOY.md
└── CLAUDE.md               # Claude Code context
```

---

## Roadmap

- [ ] **Multi-tenancy** — Multiple events from a single deploy (event slug routing)
- [ ] **Media upload** — Upload photos and music directly from admin panel
- [ ] **Email notifications** — Auto-email on new RSVP (SendGrid / SES)
- [ ] **QR invitation cards** — Printable PDF with QR code linking to invitation
- [ ] **Analytics** — Page view tracking, RSVP funnel metrics

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Built with care for Concepción & Eumelio · December 5, 2026*
