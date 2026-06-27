#!/usr/bin/env sh
set -eu
ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "pre-commit: frontend — validate:ci:frontend"
"$ROOT/scripts/bin/npm" run precommit:frontend
