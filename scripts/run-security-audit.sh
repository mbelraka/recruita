#!/usr/bin/env sh
# OWASP Dependency-Check: load backend/.env (NVD_API_KEY) then run Maven audit profile.
#
# After upgrading dependency-check (< 12.2.2), delete stale NVD cache once if you see
# "Value too long for column URL CHARACTER VARYING(1000)":
#   rm -rf ~/.m2/repository/org/owasp/dependency-check-data
set -eu
ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

set -a
if [ -f backend/.env ]; then
  # shellcheck disable=SC1091
  . backend/.env
fi
set +a

exec sh scripts/run-mvn.sh -DskipTests -Psecurity-audit dependency-check:check -q "$@"
