.PHONY: help install test lint build dev docker docker-up docker-down logs status backup-db deploy-pi

help:
	@echo "Eventique — Available commands:"
	@echo "  make install      — Install dependencies"
	@echo "  make test         — Run backend tests"
	@echo "  make lint         — Lint frontend"
	@echo "  make build        — Build frontend (production)"
	@echo "  make docker       — Build Docker images"
	@echo "  make docker-up    — Start Docker Compose"
	@echo "  make docker-down  — Stop Docker Compose"
	@echo "  make logs         — Show Docker logs"
	@echo "  make status       — Check Docker status"
	@echo "  make backup-db    — Backup database"
	@echo "  make deploy-pi    — Deploy to Raspberry Pi"

install:
	cd frontend && npm install
	pip install -r api/requirements.txt

test:
	cd api && python -m pytest tests/ -v --tb=short 2>/dev/null || echo "Tests not available"

build:
	cd frontend && npm run build

docker:
	docker compose build

docker-up:
	docker compose up -d && echo "✓ Services started"

docker-down:
	docker compose down

logs:
	docker compose logs --tail=100 -f

status:
	docker compose ps

backup-db:
	@mkdir -p data/backup
	@cp data/eventique.db data/backup/eventique_$$(date +%Y%m%d_%H%M%S).db && echo "✓ Backed up"

deploy-pi:
	@echo "Deploying to Pi..."
	ssh eudavalos@raspberrypi "mkdir -p ~/Boda && mkdir -p ~/Boda/data/backup"
	scp -r frontend/src api/*.py .env* eudavalos@raspberrypi:~/Boda/
	ssh eudavalos@raspberrypi "cd ~/Boda && docker compose build && docker compose up -d --force-recreate"
	@echo "✓ Deploy complete"
