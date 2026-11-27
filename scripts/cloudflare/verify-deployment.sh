#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:?Usage: verify-deployment.sh <https://your-site.pages.dev>}"
BASE_URL="${BASE_URL%/}"

echo "==> Checking homepage: ${BASE_URL}/"
curl --fail --silent --show-error --head "${BASE_URL}/" | head -n 5

echo "==> Checking health endpoint: ${BASE_URL}/api/v1/health"
health_body="$(curl --fail --silent --show-error "${BASE_URL}/api/v1/health")"
echo "$health_body" | jq -e '.status == "ok" and .service == "workflo-web-api"'

echo "==> Checking security headers and JSON 404 on unknown API route"
unknown_code="$(curl --silent --output /dev/null --write-out '%{http_code}' "${BASE_URL}/api/v1/does-not-exist")"
if [[ "$unknown_code" != "404" ]]; then
  echo "Expected HTTP 404 on /api/v1/does-not-exist, got ${unknown_code}" >&2
  exit 1
fi

echo "==> Checking invalid payload rejection (HTTP 400)"
invalid_code="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"x"}' \
  "${BASE_URL}/api/v1/contact")"
if [[ "$invalid_code" != "400" ]]; then
  echo "Expected HTTP 400 for invalid payload, got ${invalid_code}" >&2
  exit 1
fi

echo "OK: Deployment verification passed for ${BASE_URL}"
