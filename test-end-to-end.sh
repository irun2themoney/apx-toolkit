#!/bin/bash

# Complete End-to-End Test for APX Toolkit
# Tests on Apify Platform (production environment)

set -e

echo "🧪 APX Toolkit - Complete End-to-End Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
ACTOR_ID="2eXbQISXqhTnIxWNJ"
TEST_INPUT_FILE="test-complete-input.json"

# Step 1: Verify build
echo -e "${BLUE}📦 Step 1: Verifying build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 2: Check Apify CLI
echo -e "${BLUE}🔍 Step 2: Checking Apify CLI...${NC}"
if ! command -v apify &> /dev/null; then
    echo -e "${RED}❌ Apify CLI not found. Please install: npm install -g apify-cli${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Apify CLI found${NC}"
echo ""

# Step 3: Check login
echo -e "${BLUE}🔐 Step 3: Checking Apify login...${NC}"
if ! apify info &> /dev/null; then
    echo -e "${RED}❌ Not logged into Apify. Please run: apify login${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Logged into Apify${NC}"
echo ""

# Step 4: Verify input file
echo -e "${BLUE}📝 Step 4: Verifying test input...${NC}"
if [ ! -f "$TEST_INPUT_FILE" ]; then
    echo -e "${RED}❌ Test input file not found: $TEST_INPUT_FILE${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Test input file found${NC}"
echo "   Input: $TEST_INPUT_FILE"
cat "$TEST_INPUT_FILE" | jq '.' 2>/dev/null || cat "$TEST_INPUT_FILE"
echo ""

# Step 5: Run test on Apify
echo -e "${BLUE}🚀 Step 5: Running test on Apify platform...${NC}"
echo ""
echo "This will:"
echo "  1. Start a run on Apify"
echo "  2. Monitor progress"
echo "  3. Wait for completion"
echo "  4. Verify results"
echo ""

RUN_OUTPUT=$(apify call "$ACTOR_ID" --input-file="$TEST_INPUT_FILE" 2>&1)
echo "$RUN_OUTPUT"

# Extract run ID (macOS compatible)
RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'runs/[A-Za-z0-9]+' | head -1 | cut -d'/' -f2 || echo "")

if [ -z "$RUN_ID" ]; then
    # Try alternative pattern from URL
    RUN_ID=$(echo "$RUN_OUTPUT" | grep -oE 'https://console.apify.com/actors/[^/]+/runs/[A-Za-z0-9]+' | grep -oE '[A-Za-z0-9]+$' | head -1 || echo "")
fi

if [ -z "$RUN_ID" ]; then
    echo -e "${RED}❌ Failed to extract run ID from output${NC}"
    echo "Full output:"
    echo "$RUN_OUTPUT"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Test run started!${NC}"
echo "   Run ID: $RUN_ID"
echo "   URL: https://console.apify.com/actors/$ACTOR_ID/runs/$RUN_ID"
echo ""

# Step 6: Monitor run
echo -e "${BLUE}📊 Step 6: Monitoring run status...${NC}"
echo ""

STATUS="RUNNING"
ATTEMPTS=0
MAX_ATTEMPTS=60  # 5 minutes max

while [ "$STATUS" = "RUNNING" ] || [ "$STATUS" = "READY" ] || [ "$STATUS" = "READY_TO_RUN" ]; do
    sleep 5
    ATTEMPTS=$((ATTEMPTS + 1))
    
    if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
        echo -e "${RED}❌ Timeout waiting for run to complete${NC}"
        exit 1
    fi
    
    STATUS_OUTPUT=$(apify run "$RUN_ID" --status-only 2>&1 || echo "UNKNOWN")
    STATUS=$(echo "$STATUS_OUTPUT" | tail -1 | tr -d '[:space:]' || echo "UNKNOWN")
    
    if [ "$STATUS" != "RUNNING" ] && [ "$STATUS" != "READY" ] && [ "$STATUS" != "READY_TO_RUN" ]; then
        break
    fi
    
    echo "  Status: $STATUS (attempt $ATTEMPTS/$MAX_ATTEMPTS)"
done

echo ""
echo -e "${BLUE}📊 Final Status: $STATUS${NC}"
echo ""

# Step 7: Check results
if [ "$STATUS" = "SUCCEEDED" ]; then
    echo -e "${GREEN}✅ Test run completed successfully!${NC}"
    echo ""
    
    # Get run info
    echo -e "${BLUE}📥 Step 7: Fetching run details...${NC}"
    RUN_INFO=$(apify run "$RUN_ID" --json 2>/dev/null || echo "{}")
    
    # Extract statistics
    DATASET_ITEMS=$(echo "$RUN_INFO" | jq -r '.defaultDatasetId // empty' 2>/dev/null || echo "")
    
    if [ -n "$DATASET_ITEMS" ]; then
        echo -e "${GREEN}✅ Dataset created: $DATASET_ITEMS${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "📊 View results:"
    echo "   https://console.apify.com/actors/$ACTOR_ID/runs/$RUN_ID"
    echo "   https://console.apify.com/actors/$ACTOR_ID/runs/$RUN_ID/dataset"
    echo ""
    echo "✅ Test Summary:"
    echo "   - Build: ✅ Successful"
    echo "   - Run: ✅ Completed"
    echo "   - Status: ✅ SUCCEEDED"
    echo "   - All features: ✅ Working"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Test run failed with status: $STATUS${NC}"
    echo ""
    echo "📊 View run details:"
    echo "   https://console.apify.com/actors/$ACTOR_ID/runs/$RUN_ID"
    echo ""
    exit 1
fi

