#!/usr/bin/env sh
# Load demo applicants into PostgreSQL (requires Docker Postgres + Flyway schema).
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

docker compose up -d

echo "Waiting for PostgreSQL..."
ready=0
for _ in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U recruita -d recruita >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done

if [ "$ready" -ne 1 ]; then
  echo "PostgreSQL did not become ready in time." >&2
  exit 1
fi

set -a
if [ -f backend/.env ]; then
  # shellcheck disable=SC1091
  . backend/.env
fi
set +a

export SPRING_PROFILES_ACTIVE=persistence,seed
exec sh scripts/run-mvn.sh -q -Dspring-boot.run.profiles="${SPRING_PROFILES_ACTIVE}" spring-boot:run
