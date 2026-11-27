#!/usr/bin/env bash
set -euo pipefail

# Optional edge WAF rate-limiting template for once a custom domain Zone is onboarded.
# While operating solely on *.pages.dev, per-client rate limiting is enforced at the
# application edge inside Pages Functions (D1-backed sliding window in rate_limit_buckets).

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN with Zone > Firewall Services > Edit}"
: "${CLOUDFLARE_ZONE_ID:?Set CLOUDFLARE_ZONE_ID for your custom domain zone}"

curl --fail-with-body --silent --show-error \
  -X PUT \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/rulesets/phases/http_ratelimit/entrypoint" \
  --data '{
    "description": "Workflo public form submission rate limits",
    "rules": [
      {
        "action": "block",
        "expression": "(http.request.uri.path in {\"/api/v1/contact\" \"/api/v1/early-access\"} and http.request.method eq \"POST\")",
        "description": "Limit contact and early-access POST submissions to 10 requests per minute per IP",
        "ratelimit": {
          "characteristics": ["cf.colo.id", "ip.src"],
          "period": 60,
          "requests_per_period": 10,
          "mitigation_timeout": 60
        },
        "enabled": true
      }
    ]
  }'
