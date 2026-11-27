#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${1:-workflo-web-staging}"
CONFIG_PATH="${2:-wrangler.jsonc}"

if [[ ! -f "$CONFIG_PATH" ]]; then
  echo "Missing ${CONFIG_PATH}. Run scripts/cloudflare/provision-staging.sh or generate from cloudflare/wrangler.pages.jsonc.template first." >&2
  exit 1
fi

npx --yes wrangler@4 d1 migrations apply "$DB_NAME" --local --config "$CONFIG_PATH"
