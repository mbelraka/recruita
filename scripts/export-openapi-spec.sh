#!/usr/bin/env sh
# Export springdoc runtime spec for drift review (not the API-first source of truth).
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3001}"
SPEC_URL="${OPENAPI_SPEC_URL:-http://localhost:${PORT}/v3/api-docs}"
OUT="${ROOT}/backend/openapi/openapi.runtime.json"

mkdir -p "$(dirname "$OUT")"

echo "Fetching runtime OpenAPI spec from ${SPEC_URL} ..."
curl -sf "$SPEC_URL" -o "$OUT"
node -e "JSON.parse(require('node:fs').readFileSync(process.argv[1],'utf8'))" "$OUT"
echo "Wrote ${OUT} (compare against backend/openapi/openapi.yaml when reviewing drift)"
