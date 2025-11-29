#!/bin/bash

# Quick stress test runner - runs key tests

echo "🧪 Running Key Stress Tests..."
echo ""

ACTOR_ID="2eXbQISXqhTnIxWNJ"

# Test 1: Simple valid test
echo "✅ Test 1: Simple API (baseline)"
apify call "$ACTOR_ID" --input-file=test-scenarios/simple-api.json --wait-for-finish=300
echo ""

# Test 2: Invalid URL
echo "✅ Test 2: Invalid URL (should handle gracefully)"
apify call "$ACTOR_ID" --input-file=test-scenarios/stress-test-invalid-url.json --wait-for-finish=300 2>&1 | head -20
echo ""

# Test 3: All features
echo "✅ Test 3: All features enabled"
apify call "$ACTOR_ID" --input-file=test-scenarios/stress-test-all-features.json --wait-for-finish=600
echo ""

# Test 4: High concurrency
echo "✅ Test 4: High concurrency"
apify call "$ACTOR_ID" --input-file=test-scenarios/stress-test-high-concurrency.json --wait-for-finish=600
echo ""

echo "✅ Key stress tests complete!"

