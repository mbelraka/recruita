#!/usr/bin/env sh
# Validate the committed API-first OpenAPI contract (backend/openapi/openapi.yaml).
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
SPEC="${ROOT}/backend/openapi/openapi.yaml"

if [ ! -f "$SPEC" ]; then
  echo "Missing OpenAPI contract: ${SPEC}" >&2
  exit 1
fi

node - "$SPEC" <<'NODE'
const fs = require('node:fs');
const YAML = require('yaml');

const specPath = process.argv[2];
const spec = YAML.parse(fs.readFileSync(specPath, 'utf8'));

if (!String(spec.openapi ?? '').startsWith('3.')) {
  console.error('Spec missing OpenAPI 3.x version field');
  process.exit(1);
}

const paths = spec.paths ?? {};
const requiredPaths = [
  '/api/health',
  '/api/match',
  '/api/match-job',
  '/api/action/parse',
  '/api/applicants',
  '/api/applicants/full',
  '/api/profiles',
];
const missingPaths = requiredPaths.filter((path) => !(path in paths));
if (missingPaths.length > 0) {
  console.error('Contract missing paths:', missingPaths.join(', '));
  process.exit(1);
}

const schemas = spec.components?.schemas ?? {};
const requiredSchemas = [
  'ApplicantDto',
  'ApplicantSummaryDto',
  'SaveApplicantRequestDto',
  'ProfileDto',
  'SaveProfileRequestDto',
  'MatchRequestDto',
  'MatchWireResponse',
  'ParseActionResponse',
];
const missingSchemas = requiredSchemas.filter((name) => !(name in schemas));
if (missingSchemas.length > 0) {
  console.error('Contract missing schemas:', missingSchemas.join(', '));
  process.exit(1);
}

console.log('OpenAPI contract OK');
NODE
