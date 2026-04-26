#!/bin/bash
# Fase 12 — Deploy a Raspberry Pi con backup
# Ejecutar: bash scripts/phase12-deploy-pi.sh

set -e  # Exit on error

echo "==================================================="
echo "FASE 12 — DEPLOY A RASPBERRY PI"
echo "==================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PI_USER="eudavalos"
PI_HOST="raspberrypi"
PI_HOME="~/Boda"

echo -e "${BLUE}Pre-Deploy Checklist${NC}"
echo ""

# 1. Git status
echo -n "Git status clean... "
if [ -z "$(git status --porcelain)" ]; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  echo "Working directory not clean. Please commit or stash changes."
  exit 1
fi

# 2. Verify .env exists
echo -n "Checking .env... "
if [ -f .env ]; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  echo "Missing .env file. Copy from .env.example and configure."
  exit 1
fi

# 3. Backup local database
echo -n "Backing up local database... "
mkdir -p data/backup
cp data/eventique.db "data/backup/eventique_pre_deploy_$(date +%Y%m%d_%H%M%S).db" 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${YELLOW}(skipped)${NC}"

# 4. Build frontend
echo -n "Building frontend... "
if cd frontend && npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
  cd ..
else
  echo -e "${RED}✗${NC}"
  echo "Frontend build failed."
  cd ..
  exit 1
fi

# 5. Verify Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null && docker ps > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${YELLOW}(warning: Docker may not be running)${NC}"
fi

# 6. Test SSH connection
echo -n "Testing SSH connection to Pi... "
if ssh -o ConnectTimeout=5 "$PI_USER@$PI_HOST" "echo OK" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  echo "Cannot connect to $PI_USER@$PI_HOST"
  echo "Ensure SSH is configured and Pi is reachable."
  exit 1
fi

echo ""
echo -e "${BLUE}Backup on Pi${NC}"
echo ""

# Backup existing database on Pi
echo -n "Creating backup on Pi... "
ssh "$PI_USER@$PI_HOST" \
  "mkdir -p $PI_HOME/data/backup && \
   [ -f $PI_HOME/data/eventique.db ] && \
   cp $PI_HOME/data/eventique.db $PI_HOME/data/backup/eventique_pre_deploy_\$(date +%Y%m%d_%H%M%S).db || \
   echo 'No existing DB to backup'" > /dev/null 2>&1 && \
  echo -e "${GREEN}✓${NC}" || \
  echo -e "${YELLOW}(skipped)${NC}"

echo ""
echo -e "${BLUE}Deployment${NC}"
echo ""

# Create directories on Pi
echo "Creating directories on Pi..."
ssh "$PI_USER@$PI_HOST" "mkdir -p $PI_HOME/data/backup $PI_HOME/data/uploads" || true

# Copy frontend code
echo "Copying frontend source..."
scp -r frontend/src "$PI_USER@$PI_HOST:$PI_HOME/frontend/" > /dev/null 2>&1 && \
  echo -e "${GREEN}✓ Frontend${NC}" || \
  { echo -e "${RED}✗ Frontend${NC}"; exit 1; }

# Copy backend code
echo "Copying backend source..."
scp api/*.py "$PI_USER@$PI_HOST:$PI_HOME/api/" > /dev/null 2>&1 && \
  echo -e "${GREEN}✓ Backend${NC}" || \
  { echo -e "${RED}✗ Backend${NC}"; exit 1; }

# Copy nginx config
echo "Copying nginx config..."
scp nginx/default.conf "$PI_USER@$PI_HOST:$PI_HOME/nginx/default.conf" > /dev/null 2>&1 && \
  echo -e "${GREEN}✓ Nginx${NC}" || \
  { echo -e "${YELLOW}(warning: nginx config may not have synced)${NC}"; }

# Copy environment
echo "Copying .env..."
scp .env "$PI_USER@$PI_HOST:$PI_HOME/.env" > /dev/null 2>&1 && \
  echo -e "${GREEN}✓ .env${NC}" || \
  { echo -e "${RED}✗ .env${NC}"; exit 1; }

# Copy docker-compose
echo "Copying docker-compose.yml..."
scp docker-compose.yml "$PI_USER@$PI_HOST:$PI_HOME/docker-compose.yml" > /dev/null 2>&1 && \
  echo -e "${GREEN}✓ docker-compose.yml${NC}" || \
  { echo -e "${RED}✗ docker-compose.yml${NC}"; exit 1; }

echo ""
echo -e "${BLUE}Building and Starting Services${NC}"
echo ""

echo "Building Docker images on Pi (this may take 2-3 minutes)..."
ssh "$PI_USER@$PI_HOST" \
  "cd $PI_HOME && \
   docker compose build --no-cache" && \
  echo -e "${GREEN}✓ Build successful${NC}" || \
  { echo -e "${RED}✗ Build failed${NC}"; exit 1; }

echo ""
echo "Starting services..."
ssh "$PI_USER@$PI_HOST" \
  "cd $PI_HOME && \
   docker compose up -d --force-recreate" && \
  echo -e "${GREEN}✓ Services started${NC}" || \
  { echo -e "${RED}✗ Services failed to start${NC}"; exit 1; }

echo ""
echo -e "${BLUE}Verification${NC}"
echo ""

# Wait for services to be ready
echo "Waiting for services to be healthy (15s)..."
sleep 15

# Check container status
echo "Container status:"
ssh "$PI_USER@$PI_HOST" "cd $PI_HOME && docker compose ps"

echo ""
echo -n "Health check... "
if ssh "$PI_USER@$PI_HOST" "curl -s http://localhost:5176/api/health | grep -q 'ok'" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Healthy${NC}"
else
  echo -e "${YELLOW}(waiting for readiness)${NC}"
  sleep 5
  if ssh "$PI_USER@$PI_HOST" "curl -s http://localhost:5176/api/health | grep -q 'ok'"; then
    echo -e "${GREEN}✓ Healthy${NC}"
  else
    echo -e "${YELLOW}(cannot verify, check manually)${NC}"
  fi
fi

echo ""
echo -n "Database status... "
ssh "$PI_USER@$PI_HOST" "ls -lh $PI_HOME/data/eventique.db" && echo "" || echo -e "${YELLOW}(check manually)${NC}"

echo ""
echo "==================================================="
echo "DEPLOYMENT SUMMARY"
echo "==================================================="
echo -e "${GREEN}✓ Deployment successful!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify at: https://eventique.tecnopowerpy.top/"
echo "2. Admin panel: https://eventique.tecnopowerpy.top/admin"
echo "3. Check logs: ssh $PI_USER@$PI_HOST 'cd $PI_HOME && docker compose logs -f api'"
echo ""
echo "Rollback (if needed):"
echo "  ssh $PI_USER@$PI_HOST \"cd $PI_HOME && cp data/backup/eventique_pre_deploy_*.db data/eventique.db && docker compose restart api\""
echo ""
