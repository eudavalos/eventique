.PHONY: dev install build up down logs restart deploy status env db-shell

# ── Development ───────────────────────────────────────────────
install:
	cd frontend && npm install
	pip install -r api/requirements.txt

dev:
	@echo "Starting Eventique (dev mode)..."
	@make -j2 dev-api dev-web

dev-web:
	cd frontend && npm run dev

dev-api:
	uvicorn api.main:app --host 0.0.0.0 --port 8700 --reload

# ── Production (Docker) ───────────────────────────────────────
build:
	docker compose build --no-cache

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

logs-frontend:
	docker compose logs -f frontend

# ── Raspberry Pi 5 deploy ─────────────────────────────────────
deploy:
	@echo "Deploying Eventique to Raspberry Pi 5..."
	docker compose build
	docker compose up -d --force-recreate
	@echo "Done — https://eventique.tecnopowerpy.top"

# ── Database ──────────────────────────────────────────────────
db-shell:
	docker compose exec api python3 -c "from api.database import engine; from sqlalchemy import text; \
	  conn = engine.connect(); result = conn.execute(text('SELECT * FROM rsvps')); \
	  [print(r) for r in result]"

# ── Utils ─────────────────────────────────────────────────────
status:
	docker compose ps

env:
	@test -f .env || (cp .env.example .env && echo "✓ .env created — edit it now!")
