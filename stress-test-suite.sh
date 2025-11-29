#!/bin/bash

# APX Toolkit - Comprehensive Stress Test Suite
# Tests edge cases, error handling, and performance

set -e

echo "🧪 APX Toolkit - Comprehensive Stress Test Suite"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ACTOR_ID="2eXbQISXqhTnIxWNJ"
PASSED=0
FAILED=0
TOTAL=0

# Test counter
increment_test() {
    TOTAL=$((TOTAL + 1))
}

pass_test() {
    PASSED=$((PASSED + 1))
    echo -e "${GREEN}✅ PASS${NC}"
}

fail_test() {
    FAILED=$((FAILED + 1))
    echo -e "${RED}❌ FAIL${NC}"
}

# Test 1: Simple API Test
test_simple_api() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: Simple API Discovery${NC}"
    echo "  Testing: Basic API discovery with valid URL"
    
    INPUT='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com/posts"}],"maxPages":1}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=300 > /dev/null 2>&1; then
        pass_test
    else
        fail_test
    fi
    echo ""
}

# Test 2: Invalid URL
test_invalid_url() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: Invalid URL Handling${NC}"
    echo "  Testing: Error handling for invalid URL"
    
    INPUT='{"startUrls":[{"url":"not-a-valid-url"}],"maxPages":1}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=300 2>&1 | grep -q "error\|Error\|failed\|Failed"; then
        pass_test  # Should fail gracefully
    else
        fail_test
    fi
    echo ""
}

# Test 3: Empty Input
test_empty_input() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: Empty Input Handling${NC}"
    echo "  Testing: Error handling for missing startUrls"
    
    INPUT='{"maxPages":1}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=300 2>&1 | grep -q "error\|Error\|required\|startUrls"; then
        pass_test  # Should fail with clear error
    else
        fail_test
    fi
    echo ""
}

# Test 4: Large Response
test_large_response() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: Large Response Handling${NC}"
    echo "  Testing: Handling large API responses"
    
    INPUT='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com/posts"}],"maxPages":10,"maxConcurrency":3}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=600 > /dev/null 2>&1; then
        pass_test
    else
        fail_test
    fi
    echo ""
}

# Test 5: High Concurrency
test_high_concurrency() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: High Concurrency${NC}"
    echo "  Testing: High concurrent requests"
    
    INPUT='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com/posts"}],"maxPages":5,"maxConcurrency":10}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=600 > /dev/null 2>&1; then
        pass_test
    else
        fail_test
    fi
    echo ""
}

# Test 6: Timeout Scenario
test_timeout() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: Timeout Handling${NC}"
    echo "  Testing: Very short timeout"
    
    INPUT='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com/posts"}],"discoveryTimeout":100,"maxPages":1}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=300 > /dev/null 2>&1; then
        pass_test  # Should handle timeout gracefully
    else
        fail_test
    fi
    echo ""
}

# Test 7: Multiple URLs
test_multiple_urls() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: Multiple Start URLs${NC}"
    echo "  Testing: Multiple URLs in parallel"
    
    INPUT='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com/posts"},{"url":"https://jsonplaceholder.typicode.com/users"}],"maxPages":2}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=600 > /dev/null 2>&1; then
        pass_test
    else
        fail_test
    fi
    echo ""
}

# Test 8: All Features Enabled
test_all_features() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: All Features Enabled${NC}"
    echo "  Testing: All features simultaneously"
    
    INPUT='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com/posts"}],"maxPages":2,"generateDocumentation":true,"exportFormats":["openapi","postman","curl","insomnia"],"generateGitHubActions":true,"generateSecurityReport":true,"generateEnhancedDocs":true}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=600 > /dev/null 2>&1; then
        pass_test
    else
        fail_test
    fi
    echo ""
}

# Test 9: Invalid Configuration
test_invalid_config() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: Invalid Configuration${NC}"
    echo "  Testing: Invalid maxPages value"
    
    INPUT='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com/posts"}],"maxPages":-1}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=300 2>&1 | grep -q "error\|Error\|invalid\|Invalid"; then
        pass_test  # Should validate and reject
    else
        fail_test
    fi
    echo ""
}

# Test 10: Non-existent Domain
test_nonexistent_domain() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: Non-existent Domain${NC}"
    echo "  Testing: Error handling for unreachable domain"
    
    INPUT='{"startUrls":[{"url":"https://this-domain-does-not-exist-12345.com"}],"maxPages":1,"discoveryTimeout":5000}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=300 > /dev/null 2>&1; then
        pass_test  # Should handle gracefully
    else
        fail_test
    fi
    echo ""
}

# Test 11: API Pattern Filtering
test_api_patterns() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: API Pattern Filtering${NC}"
    echo "  Testing: Filtering APIs by pattern"
    
    INPUT='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com"}],"apiPatterns":["/posts"],"maxPages":5}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=600 > /dev/null 2>&1; then
        pass_test
    else
        fail_test
    fi
    echo ""
}

# Test 12: Minimal Response Size
test_min_response_size() {
    increment_test
    echo -e "${BLUE}Test $TOTAL: Minimum Response Size Filter${NC}"
    echo "  Testing: Filtering by response size"
    
    INPUT='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com/posts"}],"minResponseSize":10000,"maxPages":1}'
    
    if apify call "$ACTOR_ID" --input="$INPUT" --wait-for-finish=300 > /dev/null 2>&1; then
        pass_test
    else
        fail_test
    fi
    echo ""
}

# Run all tests
echo "Starting comprehensive stress tests..."
echo ""

test_simple_api
test_invalid_url
test_empty_input
test_large_response
test_high_concurrency
test_timeout
test_multiple_urls
test_all_features
test_invalid_config
test_nonexistent_domain
test_api_patterns
test_min_response_size

# Summary
echo "================================================"
echo "📊 Test Summary"
echo "================================================"
echo ""
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Review results above.${NC}"
    exit 1
fi

