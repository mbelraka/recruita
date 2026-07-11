#!/usr/bin/env sh
# Regenerate backend Spring API interfaces and fail when they drift from git.
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GENERATED_SRC="${ROOT}/backend/target/generated-sources/openapi/src/main/java/com/recruita/api/generated/api"
COMMITTED_SRC="${ROOT}/backend/src/main/java/com/recruita/api/generated/api"

sh scripts/run-mvn.sh -q -f backend -Dopenapi.codegen.skip=false generate-sources

if ! diff -qr "$GENERATED_SRC" "$COMMITTED_SRC" >/dev/null 2>&1; then
  echo "Committed Spring API interfaces are out of date. Run: npm run codegen:api:backend" >&2
  diff -qr "$GENERATED_SRC" "$COMMITTED_SRC" >&2 || true
  rm -rf "${ROOT}/backend/target/generated-sources/openapi"
  exit 1
fi

rm -rf "${ROOT}/backend/target/generated-sources/openapi"
echo "Committed Spring API interfaces are up to date"
