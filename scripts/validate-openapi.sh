#!/usr/bin/env sh
# Start the Spring API and verify the OpenAPI spec is served (dev profile).
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export GROQ_API_KEY="${GROQ_API_KEY:-ci-openapi-validation-key}"
export PORT=3001
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-dev}"

sh scripts/start-backend.sh &
BACKEND_PID=$!

cleanup() {
  if kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Waiting for API health at http://localhost:${PORT}/api/health ..."
READY=0
for _ in $(seq 1 90); do
  if curl -sf "http://localhost:${PORT}/api/health" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "API did not become healthy within 90s" >&2
  exit 1
fi

echo "Validating OpenAPI spec at http://localhost:${PORT}/v3/api-docs ..."
curl -sf "http://localhost:${PORT}/v3/api-docs" | grep -q '"openapi"'
echo "OpenAPI spec OK"
