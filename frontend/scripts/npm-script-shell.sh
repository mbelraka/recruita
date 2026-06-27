#!/usr/bin/env sh
# Workspace-local script-shell entry (npm resolves script-shell relative to frontend/).
set -eu
ROOT="$(CDPATH= cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=scripts/clean-npm-env.sh
. "$ROOT/scripts/clean-npm-env.sh"
export PATH="$ROOT/scripts/bin:$PATH"
exec /bin/sh "$@"
