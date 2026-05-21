#!/usr/bin/env sh
# Run Maven; prefer backend/.java-version via jenv/asdf/java_home when JAVA_HOME is unset.
set -eu
ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -z "${JAVA_HOME:-}" ] && [ -f "$ROOT/backend/.java-version" ]; then
  JAVA_VERSION="$(tr -d '[:space:]' < "$ROOT/backend/.java-version")"
  if command -v jenv >/dev/null 2>&1; then
    JAVA_HOME="$(jenv prefix "$JAVA_VERSION" 2>/dev/null || true)"
    [ -n "$JAVA_HOME" ] && export JAVA_HOME
  elif command -v asdf >/dev/null 2>&1; then
    JAVA_HOME="$(asdf where java "$JAVA_VERSION" 2>/dev/null || true)"
    [ -n "$JAVA_HOME" ] && export JAVA_HOME
  elif [ "$(uname -s)" = "Darwin" ] && [ -x /usr/libexec/java_home ]; then
    JAVA_HOME="$(/usr/libexec/java_home -v "$JAVA_VERSION" 2>/dev/null || true)"
    [ -n "$JAVA_HOME" ] && export JAVA_HOME
  fi
fi

exec "$ROOT/backend/mvnw" -f "$ROOT/backend" "$@"
