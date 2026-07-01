#!/usr/bin/env bash
# ============================================================
# Kurve — Pruebas de carga básicas
# ============================================================
# Uso:
#   export BASE_URL="http://localhost:3000"
#   export AUTH_TOKEN="<token JWT de un member>"
#   export CLIENT_ID="<uuid de un cliente asignado al member>"
#   export TASK_TYPE_ID="<uuid de un tipo de tarea>"
#   bash scripts/load-test.sh
# ============================================================

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
AUTH_TOKEN="${AUTH_TOKEN:-}"
CLIENT_ID="${CLIENT_ID:-}"
TASK_TYPE_ID="${TASK_TYPE_ID:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }
info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

# ------------------------------------------------------------------
# 1. Health check
# ------------------------------------------------------------------
echo ""
echo "=== 1. Health check ==="
HTTP=$(curl -s -o /tmp/health_body.json -w "%{http_code}" "$BASE_URL/api/health")
BODY=$(cat /tmp/health_body.json)
LATENCY=$(echo "$BODY" | grep -o '"latency_ms":[0-9]*' | grep -o '[0-9]*' || echo "?")
if [ "$HTTP" = "200" ]; then
  pass "DB reachable — latencia ${LATENCY}ms"
else
  fail "Health check falló (HTTP $HTTP): $BODY"
fi

if [ -z "$AUTH_TOKEN" ] || [ -z "$CLIENT_ID" ] || [ -z "$TASK_TYPE_ID" ]; then
  info "AUTH_TOKEN, CLIENT_ID o TASK_TYPE_ID no configurados — saltando pruebas de actividad"
  exit 0
fi

ACTIVITY_PAYLOAD=$(cat <<EOF
{
  "client_id": "$CLIENT_ID",
  "task_type_id": "$TASK_TYPE_ID",
  "log_date": "$(date +%Y-%m-%d)",
  "hours": 0.5,
  "pieces_count": 0,
  "status": "delivered"
}
EOF
)

post_activity() {
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/api/activity-logs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "$ACTIVITY_PAYLOAD"
}

# ------------------------------------------------------------------
# 2. Rate limiting: 35 requests consecutivos — espera 429 en req 31+
# ------------------------------------------------------------------
echo ""
echo "=== 2. Rate limiting (35 requests) ==="
PASS_COUNT=0
LIMIT_COUNT=0
for i in $(seq 1 35); do
  CODE=$(post_activity)
  if [ "$CODE" = "429" ]; then
    LIMIT_COUNT=$((LIMIT_COUNT + 1))
  else
    PASS_COUNT=$((PASS_COUNT + 1))
  fi
done
info "Requests permitidos: $PASS_COUNT | Bloqueados (429): $LIMIT_COUNT"
if [ "$LIMIT_COUNT" -gt 0 ]; then
  pass "Rate limiting activado correctamente"
else
  fail "Rate limiting NO bloqueó ninguna request (esperado ≥1 bloqueo en 35 requests)"
fi

# ------------------------------------------------------------------
# 3. Concurrencia: 10 requests simultáneos al trigger de consumo
# ------------------------------------------------------------------
echo ""
echo "=== 3. Concurrencia — 10 requests simultáneos ==="
PIDS=()
TMPDIR_RESULTS=$(mktemp -d)
for i in $(seq 1 10); do
  (
    CODE=$(post_activity)
    echo "$CODE" > "$TMPDIR_RESULTS/req_$i"
  ) &
  PIDS+=($!)
done
for PID in "${PIDS[@]}"; do wait "$PID" 2>/dev/null || true; done

ERRORS=0
for i in $(seq 1 10); do
  CODE=$(cat "$TMPDIR_RESULTS/req_$i" 2>/dev/null || echo "000")
  if [ "$CODE" != "200" ] && [ "$CODE" != "201" ] && [ "$CODE" != "409" ] && [ "$CODE" != "429" ]; then
    ERRORS=$((ERRORS + 1))
    info "  req $i → HTTP $CODE (inesperado)"
  fi
done
rm -rf "$TMPDIR_RESULTS"

if [ "$ERRORS" -eq 0 ]; then
  pass "Sin errores 500 bajo 10 requests simultáneos"
else
  fail "$ERRORS requests retornaron errores inesperados bajo carga concurrente"
fi

echo ""
echo "=== Pruebas finalizadas ==="
