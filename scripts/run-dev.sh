#!/usr/bin/env sh
set -e
ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
. "$ROOT/scripts/clean-npm-env.sh"

docker compose up -d

npm run start -w @recruita/frontend &
SPRING_PROFILES_ACTIVE=dev,persistence sh scripts/start-backend.sh &
wait
