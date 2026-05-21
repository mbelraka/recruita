#!/usr/bin/env sh
# Start Spring Boot API (dev profile).
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

set -a
if [ -f backend/.env ]; then
  # shellcheck disable=SC1091
  . backend/.env
fi
set +a

export PORT=3001
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-dev}"
exec sh scripts/run-mvn.sh -q -Dspring-boot.run.profiles="${SPRING_PROFILES_ACTIVE}" spring-boot:run
