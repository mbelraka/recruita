#!/usr/bin/env sh
# Regenerate OpenAPI frontend types and fail when they drift from git.
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

sh scripts/codegen-openapi-frontend.sh

if ! git diff --quiet -- frontend/src/app/generated/; then
  echo "Generated API client is out of date. Run: npm run codegen:api" >&2
  git diff --stat -- frontend/src/app/generated/ >&2
  exit 1
fi

echo "OpenAPI frontend client is up to date"
