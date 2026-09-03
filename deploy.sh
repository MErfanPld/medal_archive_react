#!/usr/bin/env bash
set -euo pipefail

# Build production bundle for server deploy (مجموعه آثار ناصر صلب)
# API: http://api.nasersolb.com

export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://api.nasersolb.com}"
export API_PROXY_TARGET="${API_PROXY_TARGET:-http://api.nasersolb.com}"

echo "==> API: $NEXT_PUBLIC_API_URL"
echo "==> Installing deps..."
npm ci

echo "==> Building..."
npm run build

echo "==> Build done."
echo ""
echo "Standalone output: .next/standalone"
echo "Run on server:"
echo "  NODE_ENV=production node .next/standalone/server.js"
echo ""
echo "Or classic:"
echo "  npm run start"
echo ""
echo "Ensure public/ and .next/static are available next to the standalone server."
