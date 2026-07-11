#!/usr/bin/env sh
# Regenerate committed Spring API interfaces from backend/openapi/openapi.yaml.
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GENERATED_SRC="${ROOT}/backend/target/generated-sources/openapi/src/main/java/com/recruita/api/generated/api"
COMMITTED_SRC="${ROOT}/backend/src/main/java/com/recruita/api/generated/api"

echo "Generating Spring API interfaces from backend/openapi/openapi.yaml ..."
sh scripts/run-mvn.sh -q -f backend -Dopenapi.codegen.skip=false generate-sources

mkdir -p "$COMMITTED_SRC"
rm -f "${COMMITTED_SRC}/"*.java
cp "${GENERATED_SRC}/"*.java "$COMMITTED_SRC/"
rm -rf "${ROOT}/backend/target/generated-sources/openapi"

echo "Updated ${COMMITTED_SRC}"
