#!/usr/bin/env sh
set -eu
ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "pre-commit: backend — validate:ci:backend"
"$ROOT/scripts/bin/npm" run precommit:backend
