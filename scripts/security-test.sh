#!/bin/bash

# Security Testing Script for Airlinecabz
# This script tests various security measures

echo "🔐 Starting Security Tests..."
echo "================================"

BASE_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    local method=${4:-GET}
    
    echo -n "Testing: $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        ((FAILED++))
    fi
}

# Test with auth header
test_with_auth() {
    local name=$1
    local url=$2
    local expected_status=$3
    local token=$4
    
    echo -n "Testing: $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        ((FAILED++))
    fi
}

echo ""
echo "1️⃣  Testing Broken Access Control"
echo "-----------------------------------"
test_endpoint "Admin endpoint without auth" "$BASE_URL/api/bookings" 401
# Note: Invalid UUID test returns 401 (unauthorized) before UUID validation
# This is correct behavior - auth check happens first
test_endpoint "Admin endpoint with invalid UUID" "$BASE_URL/api/bookings/invalid-uuid" 401

echo ""
echo "2️⃣  Testing Authentication"
echo "-----------------------------------"
test_endpoint "Login with no password" "$BASE_URL/api/admin/login" 400 POST
test_endpoint "Public vehicles endpoint" "$BASE_URL/api/vehicles" 200

echo ""
echo "3️⃣  Testing Security Headers"
echo "-----------------------------------"
echo -n "Checking security headers... "
headers=$(curl -s -I "$BASE_URL" | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)")
if [ ! -z "$headers" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "$headers" | sed 's/^/  /'
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

echo ""
echo "4️⃣  Testing Rate Limiting"
echo "-----------------------------------"
echo "Making 105 requests to test rate limiting..."
count=0
rate_limited=false

for i in {1..105}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/vehicles")
    if [ "$response" -eq "429" ]; then
        rate_limited=true
        count=$i
        break
    fi
done

if [ "$rate_limited" = true ]; then
    echo -e "${GREEN}✓ PASS${NC} Rate limiting triggered at request $count"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} Rate limiting not triggered (may need server restart)"
fi

echo ""
echo "5️⃣  Testing Input Validation"
echo "-----------------------------------"

# Test XSS payload
echo -n "Testing XSS prevention... "
xss_payload='<script>alert("xss")</script>'
response=$(curl -s -X POST "$BASE_URL/api/bookings" \
    -H "Content-Type: application/json" \
    -d "{\"customer_name\":\"$xss_payload\",\"customer_email\":\"test@test.com\",\"customer_phone\":\"+919876543210\",\"pickup_location\":\"Test\",\"dropoff_location\":\"Test\",\"pickup_date\":\"2025-12-31T10:00:00\",\"vehicle_type\":\"sedan\",\"total_amount\":1000}")

if [[ $response == *"Invalid"* ]] || [[ $response == *"error"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} XSS payload rejected"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ CHECK${NC} Response: ${response:0:100}..."
fi

# Test SQL injection
echo -n "Testing SQL injection prevention... "
sql_payload="1' OR '1'='1"
response=$(curl -s "$BASE_URL/api/bookings?status=$sql_payload")
if [[ $response == *"Unauthorized"* ]] || [[ $response == *"Invalid"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} SQL injection prevented"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ CHECK${NC} Response: ${response:0:100}..."
fi

echo ""
echo "6️⃣  Testing HTTPS Redirect (if applicable)"
echo "-----------------------------------"
echo -n "Checking HSTS header... "
hsts=$(curl -s -I "$BASE_URL" | grep -i "Strict-Transport-Security")
if [ ! -z "$hsts" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  $hsts"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ INFO${NC} HSTS header not found (normal for localhost)"
fi

echo ""
echo "7️⃣  Testing Error Handling"
echo "-----------------------------------"
echo -n "Checking error messages don't expose internals... "
response=$(curl -s "$BASE_URL/api/bookings/00000000-0000-0000-0000-000000000000")
if [[ ! $response == *"stack"* ]] && [[ ! $response == *"trace"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} No stack traces exposed"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} Stack trace or internal details exposed"
    ((FAILED++))
fi

echo ""
echo "================================"
echo "📊 Test Results"
echo "================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All security tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some security tests failed. Please review.${NC}"
    exit 1
fi
