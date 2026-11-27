#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-main}"
PROTECTED_PATHS=(
  "src/"
  "public/"
  "index.html"
  "vite.config.ts"
  "package.json"
  "package-lock.json"
  "bun.lock"
)

changed_files="$(git diff --name-only "${BASE_REF}"...HEAD -- "${PROTECTED_PATHS[@]}" || true)"
working_changes="$(git diff --name-only HEAD -- "${PROTECTED_PATHS[@]}" || true)"

if [[ -n "$changed_files" || -n "$working_changes" ]]; then
  echo "ERROR: Protected frontend files were modified:" >&2
  printf '%s\n' "$changed_files" "$working_changes" | sed '/^$/d' >&2
  exit 1
fi

echo "OK: Zero protected frontend files modified relative to ${BASE_REF}."
