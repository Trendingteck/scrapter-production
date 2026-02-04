#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000/api"
EMAIL="admin@scrapter.com"
PASSWORD="admin@password123"

echo "🔍 Testing Scrapter API at $BASE_URL..."

# 1. Health Check
echo -e "\n[1/4] Checking Health..."
curl -s "$BASE_URL/health" | grep -q "ok" && echo "✅ Health OK" || echo "❌ Health Check Failed"

# 2. Debug DB Connection
echo -e "\n[2/4] Testing DB Connection..."
curl -s "$BASE_URL/debug/db-force" | grep -q "connected" && echo "✅ DB Connected" || echo "❌ DB Connection Failed (Check your .env and Prisma)"

# 3. Test Signup (Optional, might fail if user exists)
echo -e "\n[3/4] Testing Signup (attempt)..."
curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"name\": \"Admin\"}"

# 4. Test Login
echo -e "\n[4/4] Testing Login..."
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

if echo "$LOGIN_RES" | grep -q "sessionToken"; then
  echo "✅ Login Successful!"
  TOKEN=$(echo "$LOGIN_RES" | sed -n 's/.*"sessionToken":"\([^"]*\)".*/\1/p')
  echo "🔑 Received Token: ${TOKEN:0:10}..."
else
  echo "❌ Login Failed: $LOGIN_RES"
fi

echo -e "\n🚀 API Verification Finish!"
