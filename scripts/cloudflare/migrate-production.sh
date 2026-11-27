#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${1:-workflo-web-production}"
CONFIG_PATH="${2:-wrangler.jsonc}"

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID}"

if [[ ! -f "$CONFIG_PATH" ]]; then
  echo "Missing ${CONFIG_PATH}." >&2
  exit 1
fi

npx --yes wrangler@4 d1 migrations apply "$DB_NAME" --remote --config "$CONFIG_PATH"
