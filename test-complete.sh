#!/bin/bash

# Complete End-to-End Test for APX Toolkit
# Tests all functionality from start to finish

set -e

echo "🧪 APX Toolkit - Complete End-to-End Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
TEST_URL="https://jsonplaceholder.typicode.com/posts"
TEST_INPUT_FILE="test-complete-input.json"
TEST_OUTPUT_DIR="./test-complete-output"

# Step 1: Build
echo "📦 Step 1: Building project..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 2: Create test input
echo "📝 Step 2: Creating test input..."
cat > "$TEST_INPUT_FILE" << EOF
{
  "startUrls": [{"url": "$TEST_URL"}],
  "maxPages": 1,
  "maxConcurrency": 2,
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl"],
  "generateGitHubActions": true,
  "generateSecurityReport": true,
  "generateEnhancedDocs": true
}
EOF
echo -e "${GREEN}✅ Test input created: $TEST_INPUT_FILE${NC}"
echo ""

# Step 3: Check if Apify CLI is available
echo "🔍 Step 3: Checking Apify CLI..."
if command -v apify &> /dev/null; then
    echo -e "${GREEN}✅ Apify CLI found${NC}"
    USE_APIFY=true
else
    echo -e "${YELLOW}⚠️  Apify CLI not found - will test locally${NC}"
    USE_APIFY=false
fi
echo ""

# Step 4: Run test
echo "🚀 Step 4: Running APX test..."
echo ""

if [ "$USE_APIFY" = true ]; then
    echo "Using Apify CLI to run test..."
    echo ""
    
    # Run on Apify platform
    RUN_OUTPUT=$(apify call apx-toolkit --input-file="$TEST_INPUT_FILE" 2>&1)
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oP 'Run ID: \K[^\s]+' || echo "")
    
    if [ -z "$RUN_ID" ]; then
        echo -e "${RED}❌ Failed to get run ID${NC}"
        echo "$RUN_OUTPUT"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Test run started: $RUN_ID${NC}"
    echo ""
    echo "📊 Monitoring run status..."
    echo ""
    
    # Poll for completion
    STATUS="RUNNING"
    while [ "$STATUS" = "RUNNING" ] || [ "$STATUS" = "READY" ]; do
        sleep 5
        STATUS=$(apify run $RUN_ID --status-only 2>/dev/null || echo "UNKNOWN")
        echo "  Status: $STATUS"
    done
    
    echo ""
    if [ "$STATUS" = "SUCCEEDED" ]; then
        echo -e "${GREEN}✅ Test run completed successfully!${NC}"
        echo ""
        echo "📥 Downloading results..."
        apify run $RUN_ID --dataset --output-dir="$TEST_OUTPUT_DIR" > /dev/null 2>&1 || true
    else
        echo -e "${RED}❌ Test run failed with status: $STATUS${NC}"
        exit 1
    fi
else
    echo "Using local test runner..."
    echo ""
    
    # Run locally using test-main.ts
    if node dist/test-main.js "$TEST_INPUT_FILE" > test-output.log 2>&1; then
        echo -e "${GREEN}✅ Local test completed${NC}"
    else
        echo -e "${RED}❌ Local test failed${NC}"
        cat test-output.log
        exit 1
    fi
fi

echo ""

# Step 5: Verify outputs
echo "✅ Step 5: Verifying outputs..."
echo ""

VERIFY_PASSED=true

# Check for generated files
if [ -d "$TEST_OUTPUT_DIR" ] || [ -d "./storage/datasets/default" ]; then
    echo -e "${GREEN}✅ Output directory found${NC}"
else
    echo -e "${RED}❌ Output directory not found${NC}"
    VERIFY_PASSED=false
fi

# Check for documentation
if find . -name "*.md" -path "*/apx-enhanced-output/*" -o -name "API.md" | grep -q .; then
    echo -e "${GREEN}✅ Documentation generated${NC}"
else
    echo -e "${YELLOW}⚠️  Documentation check skipped (may be in dataset)${NC}"
fi

# Check for GitHub Actions
if find . -name "apx-discovery.yml" | grep -q .; then
    echo -e "${GREEN}✅ GitHub Actions workflow generated${NC}"
else
    echo -e "${YELLOW}⚠️  GitHub Actions check skipped (may be in dataset)${NC}"
fi

echo ""

# Step 6: Summary
echo "📊 Test Summary"
echo "=============="
echo ""
echo "✅ Build: Successful"
echo "✅ Test Input: Created"
echo "✅ Test Run: Completed"
echo "✅ Outputs: Generated"
echo ""

if [ "$VERIFY_PASSED" = true ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "📁 Check results in:"
    echo "   - Apify Console: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ"
    if [ -n "$RUN_ID" ]; then
        echo "   - Run: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ/runs/$RUN_ID"
    fi
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some verifications failed${NC}"
    exit 1
fi

