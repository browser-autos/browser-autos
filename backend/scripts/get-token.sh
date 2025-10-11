#!/bin/bash

# Browser.autos - Get Access Token Script
# Usage: ./scripts/get-token.sh [username] [password]

set -e

# 默认值
DEFAULT_USERNAME="browserautos"
DEFAULT_PASSWORD="browser.autos"
API_URL="${API_URL:-http://localhost:3001}"

# 从参数或使用默认值
USERNAME="${1:-$DEFAULT_USERNAME}"
PASSWORD="${2:-$DEFAULT_PASSWORD}"

echo "================================================"
echo "  Browser.autos - Getting Access Token"
echo "================================================"
echo ""
echo "API URL:  $API_URL"
echo "Username: $USERNAME"
echo ""

# 获取 token
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

# 检查是否成功
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TOKEN=$(echo "$RESPONSE" | jq -r '.data.accessToken')

  echo "✓ Login successful!"
  echo ""
  echo "Access Token:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$TOKEN"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Export to environment:"
  echo "  export TOKEN=\"$TOKEN\""
  echo ""
  echo "Use in curl:"
  echo "  curl -H \"Authorization: Bearer \$TOKEN\" $API_URL/screenshot"
  echo ""

  # 保存到临时文件（可选）
  echo "$TOKEN" > /tmp/browser-autos-token.txt
  echo "✓ Token saved to: /tmp/browser-autos-token.txt"
  echo ""

  exit 0
else
  echo "✗ Login failed!"
  echo ""
  echo "Response:"
  echo "$RESPONSE" | jq '.'
  echo ""
  exit 1
fi
