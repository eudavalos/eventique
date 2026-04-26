# Despliegue de Eventique

## Local Development

### Setup

```bash
# Install dependencies
make install

# Create local .env (copy from .env.example)
cp .env.example .env

# Start dev servers
make docker-up
```

Visit:
- Frontend: http://localhost:5176
- API Docs: http://localhost:5176/api/docs

### Run Tests

```bash
make test
```

### Build Frontend

```bash
make build
```

---

## Raspberry Pi Deployment

### Prerequisites

- SSH access: `eudavalos@raspberrypi`
- Docker installed on Pi
- `.env` configured with production values

### Pre-Deploy Checklist

```bash
# Verify branch is clean
git status

# Backup database
make backup-db

# Verify all builds pass
make build
make docker
make test
```

### Deploy

```bash
make deploy-pi
```

This will:
1. Backup existing database on Pi
2. Copy source code
3. Build Docker images
4. Start containers with `--force-recreate`
5. Display status

### Verify

```bash
# Check container status
ssh eudavalos@raspberrypi "docker compose ps"

# View logs
ssh eudavalos@raspberrypi "docker compose logs --tail=50"

# Test health
curl https://eventique.tecnopowerpy.top/api/health
```

### Rollback

If deployment fails:

```bash
# Restore from backup
ssh eudavalos@raspberrypi "cp ~/Boda/data/backup/eventique_TIMESTAMP.db ~/Boda/data/eventique.db"

# Restart
ssh eudavalos@raspberrypi "docker compose restart api"
```

---

## Environment Variables

All variables in `.env.example`:

- `ENVIRONMENT` — development, staging, production
- `ADMIN_TOKEN` — Must change in production
- `DATABASE_URL` — SQLite path
- `ALLOWED_ORIGINS` — CORS origins
- `SMTP_*` — Email configuration (optional)
- `MAX_*_MB` — Upload limits

---

## Troubleshooting

### API fails to start

```bash
# Check logs
docker compose logs api

# Verify migrations ran
docker compose exec api python api/migrate.py
```

### Frontend shows errors

```bash
# Verify environment
grep VITE_ .env

# Rebuild
cd frontend && npm run build
docker compose up --build frontend
```

### Rate limiting blocks requests

Check `RATE_LIMIT_*` settings in `.env`. Increase limits if needed:

```
RATE_LIMIT_RSVP_CHECK_PER_MINUTE=20
RATE_LIMIT_MEDIA_UPLOAD_PER_MINUTE=10
```

---

## Database Backups

Automatic backups on every deployment.  
Manual backup:

```bash
make backup-db
```

Backups stored in `data/backup/`.

---

## Monitoring

### Health Check

```bash
curl http://localhost:5176/api/health
```

### Logs

```bash
make logs         # Frontend + API
make docker-logs  # Docker only
```

### View Events

```bash
docker compose exec api python -c "
from api.database import SessionLocal
from api import models
db = SessionLocal()
events = db.query(models.Event).all()
for e in events:
    print(f'{e.slug}: {e.name}')
"
```
