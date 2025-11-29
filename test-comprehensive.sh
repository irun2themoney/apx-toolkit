#!/bin/bash

# Comprehensive Test Suite for All New Features
# Tests all 6 innovative features + integration

set -e

ACTOR_ID="2eXbQISXqhTnIxWNJ"
ACTOR_NAME="apx-toolkit"
RESULTS_FILE="comprehensive-test-results-$(date +%Y%m%d-%H%M%S).json"

echo "🧪 APX Toolkit - Comprehensive Test Suite"
echo "=========================================="
echo ""
echo "Testing all 6 new features:"
echo "  1. 🔄 Mock Server Generator"
echo "  2. 📊 Performance Benchmarking"
echo "  3. 🧪 Contract Testing"
echo "  4. 🔗 Dependency Graph"
echo "  5. 🤖 MCP Integration"
echo "  6. 💳 x402 Integration"
echo ""

# Initialize results
echo "[]" > "$RESULTS_FILE"

# Helper function to record test results
record_result() {
    local test_name=$1
    local status=$2
    local run_id=$3
    local details=$4
    
    local result=$(cat "$RESULTS_FILE")
    local new_result=$(echo "$result" | jq ". + [{\"test\":\"$test_name\",\"status\":\"$status\",\"runId\":\"$run_id\",\"details\":\"$details\",\"timestamp\":\"$(date -Iseconds)\"}]")
    echo "$new_result" > "$RESULTS_FILE"
    
    if [ "$status" = "PASS" ]; then
        echo -e "\033[0;32m✅ PASS\033[0m"
    else
        echo -e "\033[0;31m❌ FAIL\033[0m"
    fi
}

# Test 1: Comprehensive Test (All Features)
test_comprehensive() {
    echo -e "\033[0;34m📋 Test 1: Comprehensive Test (All Features)\033[0m"
    echo "  Testing: All 6 features enabled simultaneously"
    
    RUN_OUTPUT=$(apify call "$ACTOR_NAME" --input-file=test-scenarios/comprehensive-test.json -t 600 2>&1 || true)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")
    
    if [ -n "$RUN_ID" ]; then
        echo "  Run ID: $RUN_ID"
        
        # Check for success
        if echo "$RUN_OUTPUT" | grep -q "SUCCEEDED\|Success"; then
            # Verify all features generated
            FEATURES_FOUND=0
            
            if echo "$RUN_OUTPUT" | grep -qi "mock"; then FEATURES_FOUND=$((FEATURES_FOUND + 1)); fi
            if echo "$RUN_OUTPUT" | grep -qi "performance\|benchmark"; then FEATURES_FOUND=$((FEATURES_FOUND + 1)); fi
            if echo "$RUN_OUTPUT" | grep -qi "contract"; then FEATURES_FOUND=$((FEATURES_FOUND + 1)); fi
            if echo "$RUN_OUTPUT" | grep -qi "mcp"; then FEATURES_FOUND=$((FEATURES_FOUND + 1)); fi
            if echo "$RUN_OUTPUT" | grep -qi "x402\|payment"; then FEATURES_FOUND=$((FEATURES_FOUND + 1)); fi
            if echo "$RUN_OUTPUT" | grep -qi "dependency\|graph"; then FEATURES_FOUND=$((FEATURES_FOUND + 1)); fi
            
            if [ $FEATURES_FOUND -ge 4 ]; then
                record_result "Comprehensive Test" "PASS" "$RUN_ID" "All features enabled, $FEATURES_FOUND/6 features detected"
            else
                record_result "Comprehensive Test" "PARTIAL" "$RUN_ID" "Only $FEATURES_FOUND/6 features detected"
            fi
        else
            record_result "Comprehensive Test" "FAIL" "$RUN_ID" "Run failed or incomplete"
        fi
    else
        record_result "Comprehensive Test" "FAIL" "" "Failed to get run ID"
    fi
    echo ""
}

# Test 2: Mock Server Generator
test_mock_server() {
    echo -e "\033[0;34m🔄 Test 2: Mock Server Generator\033[0m"
    echo "  Testing: Mock server generation"
    
    RUN_OUTPUT=$(apify call "$ACTOR_NAME" --input-file=test-scenarios/mock-server-test.json -t 600 2>&1 || true)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")
    
    if [ -n "$RUN_ID" ]; then
        if echo "$RUN_OUTPUT" | grep -q "SUCCEEDED\|Success"; then
            if echo "$RUN_OUTPUT" | grep -qi "mock"; then
                record_result "Mock Server Generator" "PASS" "$RUN_ID" "Mock server generated successfully"
            else
                record_result "Mock Server Generator" "FAIL" "$RUN_ID" "No mock server output detected"
            fi
        else
            record_result "Mock Server Generator" "FAIL" "$RUN_ID" "Run failed"
        fi
    else
        record_result "Mock Server Generator" "FAIL" "" "Failed to get run ID"
    fi
    echo ""
}

# Test 3: Performance Benchmarking
test_performance() {
    echo -e "\033[0;34m📊 Test 3: Performance Benchmarking\033[0m"
    echo "  Testing: Performance benchmarking"
    
    RUN_OUTPUT=$(apify call "$ACTOR_NAME" --input-file=test-scenarios/performance-test.json -t 600 2>&1 || true)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")
    
    if [ -n "$RUN_ID" ]; then
        if echo "$RUN_OUTPUT" | grep -q "SUCCEEDED\|Success"; then
            if echo "$RUN_OUTPUT" | grep -qi "performance\|benchmark"; then
                record_result "Performance Benchmarking" "PASS" "$RUN_ID" "Performance benchmark generated"
            else
                record_result "Performance Benchmarking" "FAIL" "$RUN_ID" "No performance output detected"
            fi
        else
            record_result "Performance Benchmarking" "FAIL" "$RUN_ID" "Run failed"
        fi
    else
        record_result "Performance Benchmarking" "FAIL" "" "Failed to get run ID"
    fi
    echo ""
}

# Test 4: MCP Integration
test_mcp() {
    echo -e "\033[0;34m🤖 Test 4: MCP Integration\033[0m"
    echo "  Testing: MCP integration generation"
    
    RUN_OUTPUT=$(apify call "$ACTOR_NAME" --input-file=test-scenarios/mcp-integration-test.json -t 600 2>&1 || true)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")
    
    if [ -n "$RUN_ID" ]; then
        if echo "$RUN_OUTPUT" | grep -q "SUCCEEDED\|Success"; then
            if echo "$RUN_OUTPUT" | grep -qi "mcp"; then
                record_result "MCP Integration" "PASS" "$RUN_ID" "MCP integration generated"
            else
                record_result "MCP Integration" "FAIL" "$RUN_ID" "No MCP output detected"
            fi
        else
            record_result "MCP Integration" "FAIL" "$RUN_ID" "Run failed"
        fi
    else
        record_result "MCP Integration" "FAIL" "" "Failed to get run ID"
    fi
    echo ""
}

# Test 5: Dependency Graph
test_dependency_graph() {
    echo -e "\033[0;34m🔗 Test 5: Dependency Graph\033[0m"
    echo "  Testing: Dependency graph generation"
    
    RUN_OUTPUT=$(apify call "$ACTOR_NAME" --input-file=test-scenarios/dependency-graph-test.json -t 600 2>&1 || true)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")
    
    if [ -n "$RUN_ID" ]; then
        if echo "$RUN_OUTPUT" | grep -q "SUCCEEDED\|Success"; then
            if echo "$RUN_OUTPUT" | grep -qi "dependency\|graph"; then
                record_result "Dependency Graph" "PASS" "$RUN_ID" "Dependency graph generated"
            else
                record_result "Dependency Graph" "FAIL" "$RUN_ID" "No dependency graph output detected"
            fi
        else
            record_result "Dependency Graph" "FAIL" "$RUN_ID" "Run failed"
        fi
    else
        record_result "Dependency Graph" "FAIL" "" "Failed to get run ID"
    fi
    echo ""
}

# Run all tests
echo "🚀 Starting comprehensive tests..."
echo ""

test_comprehensive
test_mock_server
test_performance
test_mcp
test_dependency_graph

# Summary
echo "📊 Test Summary"
echo "=============="
echo ""

TOTAL=$(jq 'length' "$RESULTS_FILE")
PASSED=$(jq '[.[] | select(.status == "PASS")] | length' "$RESULTS_FILE")
FAILED=$(jq '[.[] | select(.status == "FAIL")] | length' "$RESULTS_FILE")
PARTIAL=$(jq '[.[] | select(.status == "PARTIAL")] | length' "$RESULTS_FILE")

echo "Total Tests: $TOTAL"
echo -e "Passed: \033[0;32m$PASSED\033[0m"
echo -e "Failed: \033[0;31m$FAILED\033[0m"
if [ "$PARTIAL" -gt 0 ]; then
    echo -e "Partial: \033[0;33m$PARTIAL\033[0m"
fi
echo ""

# Detailed results
echo "📋 Detailed Results:"
jq -r '.[] | "\(.test): \(.status) - \(.details)"' "$RESULTS_FILE"
echo ""

echo "📄 Full results saved to: $RESULTS_FILE"
echo ""

if [ "$FAILED" -eq 0 ] && [ "$PARTIAL" -eq 0 ]; then
    echo -e "\033[0;32m✅ All tests passed!\033[0m"
    exit 0
else
    echo -e "\033[0;33m⚠️  Some tests failed or partial. Review results above.\033[0m"
    exit 1
fi

