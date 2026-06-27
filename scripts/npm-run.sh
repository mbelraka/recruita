#!/usr/bin/env sh
# Top-level npm entry: unset devdir before npm starts (avoids npm 10.9+ config warnings).
set -eu
ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/scripts/bin/npm" "$@"
