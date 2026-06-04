#!/usr/bin/env sh
# Remove IDE-injected Cursor co-author trailers from commit messages.
set -eu

commit_msg_file=${1:-}
if [ -z "$commit_msg_file" ] || [ ! -f "$commit_msg_file" ]; then
  exit 0
fi

tmp=$(mktemp)
grep -viE '^[[:space:]]*co-authored-by:[[:space:]]*cursor([[:space:]]|<|$)' \
  "$commit_msg_file" >"$tmp" || true
mv "$tmp" "$commit_msg_file"
