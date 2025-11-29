#!/bin/bash

# Comprehensive Test Suite for APX Toolkit
# Tests various scenarios and edge cases

set -e

echo "🧪 APX Toolkit - Comprehensive Test Suite"
echo "========================================"
echo ""

ACTOR_ID="2eXbQISXqhTnIxWNJ"
RESULTS_FILE="test-results-$(date +%Y%m%d-%H%M%S).json"
PASSED=0
FAILED=0
TOTAL=0

# Helper functions
increment_test() {
    TOTAL=$((TOTAL + 1))
}

record_result() {
    local test_name=$1
    local status=$2
    local run_id=$3
    local details=$4
    
    echo "{\"test\":\"$test_name\",\"status\":\"$status\",\"runId\":\"$run_id\",\"details\":\"$details\",\"timestamp\":\"$(date -Iseconds)\"}" >> "$RESULTS_FILE"
    
    if [ "$status" = "PASS" ]; then
        PASSED=$((PASSED + 1))
        echo -e "\033[0;32m✅ PASS\033[0m"
    else
        FAILED=$((FAILED + 1))
        echo -e "\033[0;31m❌ FAIL\033[0m"
    fi
}

# Test 1: Simple API (Baseline)
test_1_simple() {
    increment_test
    echo -e "\033[0;34mTest $TOTAL: Simple API (Baseline)\033[0m"
    echo "  Testing: Basic functionality with valid API"
    
    RUN_OUTPUT=$(apify call "$ACTOR_ID" --input-file=test-scenarios/simple-api.json 2>&1)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")
    
    if [ -n "$RUN_ID" ]; then
        echo "  Run ID: $RUN_ID"
        echo "  Monitoring..."
        
        # Wait and check status
        sleep 30
        STATUS=$(apify run "$RUN_ID" --status-only 2>&1 | tail -1 | tr -d '[:space:]' || echo "UNKNOWN")
        
        if [ "$STATUS" = "SUCCEEDED" ]; then
            record_result "Simple API" "PASS" "$RUN_ID" "Run completed successfully"
        else
            record_result "Simple API" "FAIL" "$RUN_ID" "Status: $STATUS"
        fi
    else
        record_result "Simple API" "FAIL" "" "Failed to get run ID"
    fi
    echo ""
}

# Test 2: Invalid URL
test_2_invalid_url() {
    increment_test
    echo -e "\033[0;34mTest $TOTAL: Invalid URL Handling\033[0m"
    echo "  Testing: Error handling for invalid URL"
    
    RUN_OUTPUT=$(apify call "$ACTOR_ID" --input='{"startUrls":[{"url":"not-a-valid-url"}],"maxPages":1}' 2>&1)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")
    
    if [ -n "$RUN_ID" ]; then
        echo "  Run ID: $RUN_ID"
        sleep 30
        STATUS=$(apify run "$RUN_ID" --status-only 2>&1 | tail -1 | tr -d '[:space:]' || echo "UNKNOWN")
        
        # Invalid URL should either fail gracefully or handle error
        if [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "SUCCEEDED" ]; then
            record_result "Invalid URL" "PASS" "$RUN_ID" "Handled gracefully: $STATUS"
        else
            record_result "Invalid URL" "FAIL" "$RUN_ID" "Unexpected status: $STATUS"
        fi
    else
        record_result "Invalid URL" "FAIL" "" "Failed to get run ID"
    fi
    echo ""
}

# Test 3: All Features
test_3_all_features() {
    increment_test
    echo -e "\033[0;34mTest $TOTAL: All Features Enabled\033[0m"
    echo "  Testing: All features simultaneously"
    
    RUN_OUTPUT=$(apify call "$ACTOR_ID" --input-file=test-scenarios/stress-test-all-features.json 2>&1)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")
    
    if [ -n "$RUN_ID" ]; then
        echo "  Run ID: $RUN_ID"
        echo "  Waiting for completion (this may take a minute)..."
        sleep 60
        
        STATUS=$(apify run "$RUN_ID" --status-only 2>&1 | tail -1 | tr -d '[:space:]' || echo "UNKNOWN")
        
        if [ "$STATUS" = "SUCCEEDED" ]; then
            record_result "All Features" "PASS" "$RUN_ID" "All features worked together"
        else
            record_result "All Features" "FAIL" "$RUN_ID" "Status: $STATUS"
        fi
    else
        record_result "All Features" "FAIL" "" "Failed to get run ID"
    fi
    echo ""
}

# Test 4: High Concurrency
test_4_high_concurrency() {
    increment_test
    echo -e "\033[0;34mTest $TOTAL: High Concurrency\033[0m"
    echo "  Testing: Stress test with high concurrent requests"
    
    RUN_OUTPUT=$(apify call "$ACTOR_ID" --input-file=test-scenarios/stress-test-high-concurrency.json 2>&1)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")
    
    if [ -n "$RUN_ID" ]; then
        echo "  Run ID: $RUN_ID"
        sleep 60
        STATUS=$(apify run "$RUN_ID" --status-only 2>&1 | tail -1 | tr -d '[:space:]' || echo "UNKNOWN")
        
        if [ "$STATUS" = "SUCCEEDED" ]; then
            record_result "High Concurrency" "PASS" "$RUN_ID" "Handled high load"
        else
            record_result "High Concurrency" "FAIL" "$RUN_ID" "Status: $STATUS"
        fi
    else
        record_result "High Concurrency" "FAIL" "" "Failed to get run ID"
    fi
    echo ""
}

# Test 5: Multiple URLs
test_5_multiple_urls() {
    increment_test
    echo -e "\033[0;34mTest $TOTAL: Multiple URLs\033[0m"
    echo "  Testing: Parallel processing of multiple URLs"
    
    INPUT='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com/posts"},{"url":"https://jsonplaceholder.typicode.com/users"}],"maxPages":3}'
    RUN_OUTPUT=$(apify call "$ACTOR_ID" --input="$INPUT" 2>&1)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")
    
    if [ -n "$RUN_ID" ]; then
        echo "  Run ID: $RUN_ID"
        sleep 60
        STATUS=$(apify run "$RUN_ID" --status-only 2>&1 | tail -1 | tr -d '[:space:]' || echo "UNKNOWN")
        
        if [ "$STATUS" = "SUCCEEDED" ]; then
            record_result "Multiple URLs" "PASS" "$RUN_ID" "Processed multiple URLs"
        else
            record_result "Multiple URLs" "FAIL" "$RUN_ID" "Status: $STATUS"
        fi
    else
        record_result "Multiple URLs" "FAIL" "" "Failed to get run ID"
    fi
    echo ""
}

# Initialize results file
echo "[]" > "$RESULTS_FILE"

# Run tests
echo "Starting comprehensive tests..."
echo ""

test_1_simple
test_2_invalid_url
test_3_all_features
test_4_high_concurrency
test_5_multiple_urls

# Summary
echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo ""
echo "Total Tests: $TOTAL"
echo -e "\033[0;32mPassed: $PASSED\033[0m"
echo -e "\033[0;31mFailed: $FAILED\033[0m"
echo ""
echo "Results saved to: $RESULTS_FILE"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "\033[0;32m🎉 All tests passed!\033[0m"
    exit 0
else
    echo -e "\033[0;31m⚠️  Some tests failed. Review results above.\033[0m"
    exit 1
fi

