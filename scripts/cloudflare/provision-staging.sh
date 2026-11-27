#!/usr/bin/env bash
set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN as a GitHub Actions secret}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID as a GitHub Actions variable}"

API="https://api.cloudflare.com/client/v4"
DB_NAME="workflo-web-staging"
PAGES_PROJECT="workflo-site"
PRODUCTION_BRANCH="main"

api_get() {
  curl --fail-with-body --silent --show-error \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    "${API}$1"
}

api_post() {
  local path="$1"
  local body="$2"
  curl --fail-with-body --silent --show-error \
    -X POST \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "$body" \
    "${API}$path"
}

echo "Checking Cloudflare D1 database: ${DB_NAME}"
d1_list="$(api_get "/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database?name=${DB_NAME}")"
echo "$d1_list" | jq -e '.success == true' >/dev/null

db_id="$(echo "$d1_list" | jq -r --arg name "$DB_NAME" '.result[]? | select(.name == $name) | .uuid' | head -n 1)"
if [[ -z "$db_id" || "$db_id" == "null" ]]; then
  echo "Creating D1 database: ${DB_NAME}"
  d1_created="$(api_post "/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database" "$(jq -n --arg name "$DB_NAME" '{name:$name}')")"
  echo "$d1_created" | jq -e '.success == true' >/dev/null
  db_id="$(echo "$d1_created" | jq -r '.result.uuid')"
fi

if [[ -z "$db_id" || "$db_id" == "null" ]]; then
  echo "Could not resolve the D1 database UUID." >&2
  exit 1
fi

echo "Checking Cloudflare Pages project: ${PAGES_PROJECT}"
pages_list="$(api_get "/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects")"
echo "$pages_list" | jq -e '.success == true' >/dev/null

project_name="$(echo "$pages_list" | jq -r --arg name "$PAGES_PROJECT" '.result[]? | select(.name == $name) | .name' | head -n 1)"
if [[ -z "$project_name" || "$project_name" == "null" ]]; then
  echo "Creating Cloudflare Pages project: ${PAGES_PROJECT}"
  pages_created="$(api_post "/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects" \
    "$(jq -n --arg name "$PAGES_PROJECT" --arg branch "$PRODUCTION_BRANCH" \
      '{name:$name, production_branch:$branch, build_config:{build_command:"npm run build", destination_dir:"dist"}}')")"
  echo "$pages_created" | jq -e '.success == true' >/dev/null
fi

echo "Writing temporary Wrangler configuration for staging."
node --input-type=module - "$db_id" "$DB_NAME" "$PAGES_PROJECT" <<'NODE'
import { writeFile } from "node:fs/promises";

const [databaseId, databaseName, projectName] = process.argv.slice(2);
if (!databaseId || !databaseName || !projectName) {
  throw new Error("Missing generated Cloudflare resource metadata");
}

const config = {
  "$schema": "./node_modules/wrangler/config-schema.json",
  name: projectName,
  pages_build_output_dir: "./dist",
  compatibility_date: "2026-11-27",
  d1_databases: [{
    binding: "DB",
    database_name: databaseName,
    database_id: databaseId,
    migrations_dir: "./migrations",
  }],
  vars: {
    SUBMISSION_RETENTION_DAYS: "365",
  },
};

await writeFile("wrangler.jsonc", JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
NODE

echo "Cloudflare staging resources are ready."
