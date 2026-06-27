#!/usr/bin/env sh
# Generate Angular API client from the committed OpenAPI contract (API-first).
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
. "$ROOT/scripts/clean-npm-env.sh"

SPEC="${ROOT}/backend/openapi/openapi.yaml"
OUT_DIR="${ROOT}/frontend/src/app/generated/api-client"
TYPES_BARREL="${ROOT}/frontend/src/app/generated/api/types.ts"

if [ ! -f "$SPEC" ]; then
  echo "Missing OpenAPI contract: ${SPEC}" >&2
  exit 1
fi

echo "Generating Angular API client from ${SPEC} ..."
cd "${ROOT}/frontend"
npx ng-openapi-gen --config ng-openapi-gen.json

mkdir -p "$(dirname "$TYPES_BARREL")"

cat >"$TYPES_BARREL" <<'EOF'
/**
 * Stable aliases over ng-openapi-gen models.
 * Domain code should import wire DTOs from here or from feature *-api-*.model.ts shims.
 */
export type {
  ApplicantDto,
  ApplicantSummaryDto,
  ApplicationStatus,
  CandidateProfileDto,
  HealthResponse,
  MatchCandidateDto,
  MatchRequestDto,
  MatchResponseDto,
  MatchScoreDto,
  MatchWireResponse,
  ParseActionCommandRequest,
  ParseActionResponse,
  ProfileDto,
  SaveApplicantRequestDto,
  SaveProfileRequestDto,
  UiLanguage,
} from '../api-client/models';
EOF

echo "Generated ${OUT_DIR} and ${TYPES_BARREL}"
