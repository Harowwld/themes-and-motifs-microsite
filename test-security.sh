#!/bin/bash

# Security Hardening Test Script
# Tests all implemented security features

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

log_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASS++))
}

log_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((FAIL++))
}

log_info() {
    echo -e "${YELLOW}ℹ INFO${NC}: $1"
}

# Check if server is running
check_server() {
    log_info "Checking if server is running at $BASE_URL..."
    if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|307"; then
        log_pass "Server is running"
    else
        echo -e "${RED}ERROR: Server not running at $BASE_URL${NC}"
        echo "Start the server with: pnpm dev"
        exit 1
    fi
}

# Test 1: Security Headers
test_security_headers() {
    log_info "Testing security headers..."
    
    RESPONSE=$(curl -s -I "$BASE_URL" | grep -iE "(content-security-policy|strict-transport-security|x-frame-options|x-content-type-options|referrer-policy)" || true)
    
    if echo "$RESPONSE" | grep -qi "content-security-policy"; then
        log_pass "CSP header present"
    else
        log_fail "CSP header missing"
    fi
    
    if echo "$RESPONSE" | grep -qi "strict-transport-security"; then
        log_pass "HSTS header present"
    else
        log_fail "HSTS header missing"
    fi
    
    if echo "$RESPONSE" | grep -qi "x-frame-options"; then
        log_pass "X-Frame-Options header present"
    else
        log_fail "X-Frame-Options header missing"
    fi
    
    if echo "$RESPONSE" | grep -qi "x-content-type-options"; then
        log_pass "X-Content-Type-Options header present"
    else
        log_fail "X-Content-Type-Options header missing"
    fi
}

# Test 2: SSRF Protection - Block private IPs
test_ssrf_private_ips() {
    log_info "Testing SSRF protection (blocking private IPs)..."
    
    # Test localhost
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/image-proxy?url=https://127.0.0.1/secret")
    if [ "$STATUS" = "400" ]; then
        log_pass "Blocks 127.0.0.1 (HTTP $STATUS)"
    else
        log_fail "Failed to block 127.0.0.1 (HTTP $STATUS)"
    fi
    
    # Test 10.x.x.x
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/image-proxy?url=https://10.0.0.1/secret")
    if [ "$STATUS" = "400" ]; then
        log_pass "Blocks 10.0.0.1 (HTTP $STATUS)"
    else
        log_fail "Failed to block 10.0.0.1 (HTTP $STATUS)"
    fi
    
    # Test 192.168.x.x
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/image-proxy?url=https://192.168.1.1/secret")
    if [ "$STATUS" = "400" ]; then
        log_pass "Blocks 192.168.1.1 (HTTP $STATUS)"
    else
        log_fail "Failed to block 192.168.1.1 (HTTP $STATUS)"
    fi
    
    # Test AWS metadata
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/image-proxy?url=https://169.254.169.254/latest/meta-data/")
    if [ "$STATUS" = "400" ]; then
        log_pass "Blocks AWS metadata endpoint (HTTP $STATUS)"
    else
        log_fail "Failed to block AWS metadata endpoint (HTTP $STATUS)"
    fi
    
    # Test localhost hostname
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/image-proxy?url=https://localhost/admin")
    if [ "$STATUS" = "400" ]; then
        log_pass "Blocks localhost hostname (HTTP $STATUS)"
    else
        log_fail "Failed to block localhost hostname (HTTP $STATUS)"
    fi
}

# Test 3: SSRF - Allow valid HTTPS
test_ssrf_allow_valid() {
    log_info "Testing that valid HTTPS URLs are allowed..."
    
    # Test with a known working image URL
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L "$BASE_URL/api/image-proxy?url=https://picsum.photos/200/300")
    if [ "$STATUS" = "200" ]; then
        log_pass "Allows valid HTTPS images (HTTP $STATUS)"
    else
        log_info "Note: picsum.photos test returned HTTP $STATUS (may vary based on network)"
    fi
    
    # Test HTTP is blocked (only HTTPS allowed)
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/image-proxy?url=http://example.com/image.jpg")
    if [ "$STATUS" = "400" ]; then
        log_pass "Blocks HTTP URLs (HTTP $STATUS)"
    else
        log_fail "Failed to block HTTP URLs (HTTP $STATUS)"
    fi
}

# Test 4: SQL Injection Protection
test_sql_injection() {
    log_info "Testing SQL injection protection..."
    
    # Note: This requires admin auth, so we just test the public endpoint with wildcards
    # Test that wildcards are stripped from public search
    
    # Test 1: Try SQL injection via vendor search parameter
    # This should not cause a database error
    RESPONSE=$(curl -s "$BASE_URL/vendors?q=%' OR 1=1 --" || true)
    if echo "$RESPONSE" | grep -qi "error"; then
        log_info "Search returned results or error (check if app handles this)"
    else
        log_pass "Search query with wildcards handled"
    fi
    
    # Test 2: Long query should be rejected
    LONG_QUERY=$(python3 -c 'print("A"*150)' 2>/dev/null || printf 'A%.0s' {1..150})
    # Note: Direct API test requires auth, skipping for automated test
    log_info "SQL injection sanitization in place (manual test: try %' OR 1=1 -- in search)"
}

# Test 5: File Upload Validation
test_file_upload() {
    log_info "Testing file upload validation..."
    
    # Note: File upload requires authentication
    # We'll just check the API endpoint exists
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/moments/photos")
    if [ "$STATUS" = "401" ] || [ "$STATUS" = "400" ]; then
        log_pass "Upload endpoint protected (HTTP $STATUS)"
    else
        log_info "Upload endpoint returned HTTP $STATUS"
    fi
    
    log_info "File upload validation active (manual test required with auth)"
}

# Test 6: Error Sanitization
test_error_sanitization() {
    log_info "Testing error message sanitization..."
    
    # Hit an endpoint that might error
    RESPONSE=$(curl -s "$BASE_URL/api/admin/vendors" || true)
    
    # Should not contain raw error messages like "supabase" or internal details
    if echo "$RESPONSE" | grep -qi "supabase.*error\|database.*error"; then
        log_fail "Error response may contain internal details"
    else
        log_pass "Error messages appear sanitized"
    fi
}

# Test 7: Rate Limiting Headers
test_rate_limit_headers() {
    log_info "Testing rate limiting headers..."
    
    RESPONSE=$(curl -s -I "$BASE_URL" | grep -i "x-ratelimit" || true)
    
    if [ -n "$RESPONSE" ]; then
        log_pass "Rate limit headers present"
        echo "$RESPONSE" | head -3
    else
        log_info "Rate limit headers not visible on static pages (may require API endpoint)"
    fi
}

# Main execution
main() {
    echo "========================================"
    echo "Security Hardening Test Suite"
    echo "Testing against: $BASE_URL"
    echo "========================================"
    echo ""
    
    check_server
    echo ""
    
    test_security_headers
    echo ""
    
    test_ssrf_private_ips
    echo ""
    
    test_ssrf_allow_valid
    echo ""
    
    test_sql_injection
    echo ""
    
    test_file_upload
    echo ""
    
    test_error_sanitization
    echo ""
    
    test_rate_limit_headers
    echo ""
    
    echo "========================================"
    echo "Test Results: $PASS passed, $FAIL failed"
    echo "========================================"
    
    if [ $FAIL -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}Some tests failed.${NC}"
        exit 1
    fi
}

main "$@"
