#!/usr/bin/env sh
set -eu
ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
. "$ROOT/scripts/compose-env.sh"
exec docker compose down "$@"
