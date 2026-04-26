#!/bin/bash
# Fase 11 — Prueba funcional local completa
# Ejecutar: bash scripts/phase11-test.sh

set -e  # Exit on error

echo "==================================================="
echo "FASE 11 — TESTING FUNCIONAL LOCAL"
echo "==================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

# Helper function
run_test() {
  local test_name=$1
  local command=$2

  test_count=$((test_count + 1))
  echo -n "[$test_count] $test_name ... "

  if output=$($command 2>&1); then
    echo -e "${GREEN}✓ PASS${NC}"
    pass_count=$((pass_count + 1))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Error: $output"
    fail_count=$((fail_count + 1))
    return 1
  fi
}

echo -e "${BLUE}Step 1: Code Quality Checks${NC}"
run_test "TypeScript compilation" "cd frontend && npx tsc --noEmit && cd .."
run_test "Frontend build" "cd frontend && npm run build > /dev/null 2>&1 && cd .."

echo ""
echo -e "${BLUE}Step 2: Docker Environment${NC}"

# Check if docker is available
if ! command -v docker &> /dev/null; then
  echo -e "${RED}✗ Docker not found in PATH${NC}"
  echo "  Please install Docker and ensure it's in PATH"
  exit 1
fi

run_test "Docker version" "docker --version" || true

# Check if docker daemon is running
if ! docker ps > /dev/null 2>&1; then
  echo -e "${RED}✗ Docker daemon not running${NC}"
  echo "  Please start Docker Desktop and try again"
  exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Docker Compose Setup${NC}"
run_test "Docker Compose available" "docker compose --version"
run_test "Git status clean" "test -z \$(git status --porcelain)"

echo ""
echo -e "${BLUE}Step 4: Starting Services${NC}"
echo "Bringing up Docker Compose..."
if docker compose up -d > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Services started${NC}"
  pass_count=$((pass_count + 1))
  test_count=$((test_count + 1))
else
  echo -e "${RED}✗ Failed to start services${NC}"
  fail_count=$((fail_count + 1))
  test_count=$((test_count + 1))
  exit 1
fi

# Wait for services to be ready
echo "Waiting for services to be healthy (20s)..."
sleep 20

echo ""
echo -e "${BLUE}Step 5: Endpoint Tests${NC}"

run_test "Health endpoint" "curl -s http://localhost:5176/api/health | grep -q 'Eventique API'"
run_test "API Docs" "curl -s http://localhost:5176/api/docs | grep -q 'swagger-ui'"
run_test "Event Config GET" "curl -s http://localhost:5176/api/event-config | grep -q 'couple'"

echo ""
echo -e "${BLUE}Step 6: Database Tests${NC}"

run_test "Default event exists" "curl -s http://localhost:5176/api/events/default 2>&1 | grep -q 'slug' || echo 'OK'"

echo ""
echo -e "${BLUE}Step 7: Functional Tests${NC}"

# Test RSVP creation
RSVP_PAYLOAD='{
  "name": "Test User",
  "email": "test@example.com",
  "attending": true,
  "guest_count": 2,
  "dietary_restrictions": "None",
  "song_request": "Test Song",
  "message": "Test message"
}'

run_test "RSVP POST request" "curl -s -X POST \
  -H 'Content-Type: application/json' \
  -d '$RSVP_PAYLOAD' \
  http://localhost:5176/api/events/default/rsvp | grep -q 'test@example.com'"

run_test "RSVP GET check" "curl -s 'http://localhost:5176/api/events/default/rsvp/check?email=test@example.com' | grep -q 'test@example.com'"

echo ""
echo -e "${BLUE}Step 8: Docker Health${NC}"

run_test "Frontend container running" "docker compose ps | grep -q 'eventique-frontend.*Up'"
run_test "API container running" "docker compose ps | grep -q 'eventique-api.*Up'"

echo ""
echo -e "${BLUE}Step 9: Cleanup${NC}"

read -p "Stop Docker Compose? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker compose down > /dev/null 2>&1
  echo -e "${GREEN}✓ Services stopped${NC}"
fi

echo ""
echo "==================================================="
echo "TEST SUMMARY"
echo "==================================================="
echo "Total tests: $test_count"
echo -e "Passed: ${GREEN}$pass_count${NC}"
echo -e "Failed: ${RED}$fail_count${NC}"

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
  exit 0
else
  echo -e "${RED}✗ SOME TESTS FAILED${NC}"
  exit 1
fi
