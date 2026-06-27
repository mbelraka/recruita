#!/usr/bin/env sh
# Husky pre-commit: lint-staged, then scoped QC.
# Staged frontend/ → precommit:frontend; staged backend/ → precommit:backend; both → both.
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
. "$ROOT/scripts/clean-npm-env.sh"

"$ROOT/scripts/bin/npm" exec lint-staged

if sh scripts/has-staged-lockfile-changes.sh; then
  echo "pre-commit: Lockfile — running lockfile:check"
  "$ROOT/scripts/bin/npm" run lockfile:check
fi

if sh scripts/has-staged-frontend-changes.sh; then
  sh scripts/pre-commit-frontend.sh
fi

if sh scripts/has-staged-backend-changes.sh; then
  sh scripts/pre-commit-backend.sh
fi
