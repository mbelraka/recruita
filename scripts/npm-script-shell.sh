#!/usr/bin/env sh
# npm script-shell: unset Cursor devdir noise and prefer the repo npm shim for nested npm calls.
set -eu
ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/clean-npm-env.sh
. "$ROOT/scripts/clean-npm-env.sh"
export PATH="$ROOT/scripts/bin:$PATH"
exec /bin/sh "$@"
