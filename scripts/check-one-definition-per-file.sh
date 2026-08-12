#!/usr/bin/env sh
# Fail when a source file declares more than one type-level definition.
set -eu
ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec node "$ROOT/scripts/check-one-definition-per-file.cjs" "$@"
