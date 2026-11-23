#!/usr/bin/env bash
set -euo pipefail

BUCKET_NAME="${1:?Usage: deploy-frontend.sh <bucket-name> <distribution-id> [dist-directory]}"
DISTRIBUTION_ID="${2:?Usage: deploy-frontend.sh <bucket-name> <distribution-id> [dist-directory]}"
DIST_DIR="${3:-../dist}"

if [[ ! -f "$DIST_DIR/index.html" ]]; then
  echo "Missing $DIST_DIR/index.html. Run the frontend production build first." >&2
  exit 1
fi

# Content-hashed JavaScript/CSS and versioned media can be cached immutably.
aws s3 sync "$DIST_DIR/" "s3://$BUCKET_NAME/" \
  --delete \
  --exclude "*.html" \
  --exclude "robots.txt" \
  --exclude "favicon.svg" \
  --cache-control "public,max-age=31536000,immutable"

# HTML must revalidate so new deployments become visible immediately.
aws s3 sync "$DIST_DIR/" "s3://$BUCKET_NAME/" \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public,max-age=0,must-revalidate"

for file in robots.txt favicon.svg; do
  if [[ -f "$DIST_DIR/$file" ]]; then
    aws s3 cp "$DIST_DIR/$file" "s3://$BUCKET_NAME/$file" \
      --cache-control "public,max-age=3600,must-revalidate"
  fi
done

aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
echo "Uploaded $DIST_DIR to s3://$BUCKET_NAME and requested CloudFront invalidation."
