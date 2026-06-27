#!/usr/bin/env sh
# Export springdoc runtime spec and fail when it drifts from backend/openapi/openapi.yaml.
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export GROQ_API_KEY="${GROQ_API_KEY:-ci-openapi-validation-key}"
export PORT=3001
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-dev,persistence}"
RUNTIME_SPEC="$(mktemp "${TMPDIR:-/tmp}/recruita-openapi-runtime.XXXXXX.json")"

cleanup() {
  rm -f "$RUNTIME_SPEC"
  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting persistence stack for OpenAPI drift check ..."
sh scripts/infra-up.sh

sh scripts/start-backend.sh &
BACKEND_PID=$!

echo "Waiting for API health at http://localhost:${PORT}/api/health ..."
READY=0
for _ in $(seq 1 120); do
  if curl -sf "http://localhost:${PORT}/api/health" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "API did not become healthy within 120s" >&2
  exit 1
fi

echo "Exporting runtime OpenAPI spec ..."
curl -sf "http://localhost:${PORT}/v3/api-docs" -o "$RUNTIME_SPEC"
node -e "JSON.parse(require('node:fs').readFileSync(process.argv[1],'utf8'))" "$RUNTIME_SPEC"

node scripts/validate-openapi-drift.cjs "$RUNTIME_SPEC"
