#!/usr/bin/env sh
# Fail on magic numbers, magic strings, and stringly-typed choices.
set -eu
ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec node "$ROOT/scripts/check-no-magic-values.cjs" "$@"
