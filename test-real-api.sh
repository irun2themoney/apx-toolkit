#!/bin/bash

# APX Toolkit - Real API Test Script
# Tests APX with a real API endpoint to verify full functionality

set -e

echo "🧪 APX Toolkit - Real API Test"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test configuration
ACTOR_ID="2eXbQISXqhTnIxWNJ"
TEST_URL="https://jsonplaceholder.typicode.com/posts"
TEST_INPUT_FILE="test-input-real-api.json"

# Create test input
echo "📝 Creating test input..."
cat > "$TEST_INPUT_FILE" <<EOF
{
  "startUrls": [
    {
      "url": "$TEST_URL"
    }
  ],
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl", "insomnia"],
  "maxPages": 10,
  "maxConcurrency": 3
}
EOF

echo "✅ Test input created: $TEST_INPUT_FILE"
echo ""

# Check if Apify CLI is installed
if ! command -v apify &> /dev/null; then
    echo -e "${YELLOW}⚠️  Apify CLI not found. Installing...${NC}"
    npm install -g apify-cli
fi

echo "🚀 Starting Actor run..."
echo "   Actor ID: $ACTOR_ID"
echo "   Test URL: $TEST_URL"
echo ""

# Run the actor
RUN_ID=$(apify call "$ACTOR_ID" --input-file "$TEST_INPUT_FILE" --wait-for-finish | grep -oP 'Run ID: \K[^\s]+' || echo "")

if [ -z "$RUN_ID" ]; then
    echo -e "${RED}❌ Failed to start Actor run${NC}"
    echo ""
    echo "Alternative: Run manually via Apify Console:"
    echo "1. Go to: https://console.apify.com/actors/$ACTOR_ID"
    echo "2. Click 'Input' tab"
    echo "3. Paste the content from $TEST_INPUT_FILE"
    echo "4. Click 'Start'"
    exit 1
fi

echo -e "${GREEN}✅ Actor run started: $RUN_ID${NC}"
echo ""
echo "📊 Monitor progress:"
echo "   https://console.apify.com/actors/$ACTOR_ID/runs/$RUN_ID"
echo ""

# Wait for completion (with timeout)
echo "⏳ Waiting for run to complete..."
TIMEOUT=300  # 5 minutes
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    STATUS=$(apify run "$RUN_ID" --status 2>/dev/null || echo "UNKNOWN")
    
    if [ "$STATUS" = "SUCCEEDED" ]; then
        echo -e "${GREEN}✅ Run completed successfully!${NC}"
        break
    elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "ABORTED" ]; then
        echo -e "${RED}❌ Run failed with status: $STATUS${NC}"
        exit 1
    fi
    
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    echo "   Status: $STATUS (${ELAPSED}s elapsed)"
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    echo -e "${YELLOW}⚠️  Timeout waiting for run to complete${NC}"
    echo "   Check status manually: https://console.apify.com/actors/$ACTOR_ID/runs/$RUN_ID"
    exit 1
fi

echo ""
echo "📦 Checking results..."
echo ""

# Get dataset ID
DATASET_ID=$(apify run "$RUN_ID" --dataset-id 2>/dev/null || echo "")

if [ -n "$DATASET_ID" ]; then
    echo "📊 Dataset ID: $DATASET_ID"
    echo "   View results: https://console.apify.com/storage/datasets/$DATASET_ID"
    echo ""
    
    # Download results
    echo "⬇️  Downloading results..."
    apify dataset "$DATASET_ID" --format json --output-dir "./test-output-real-api" 2>/dev/null || echo "   (Download may require manual action)"
    echo ""
fi

echo "✅ Test completed!"
echo ""
echo "📋 Expected Results:"
echo "   ✅ API endpoints discovered"
echo "   ✅ Code snippets generated (12 languages)"
echo "   ✅ TypeScript types created"
echo "   ✅ API documentation (OpenAPI, Postman, cURL, Insomnia)"
echo "   ✅ Test suites (5 frameworks)"
echo "   ✅ SDK packages (TypeScript, Python, Go)"
echo "   ✅ Data items extracted"
echo ""
echo "🔍 Verify in Apify Console:"
echo "   https://console.apify.com/actors/$ACTOR_ID/runs/$RUN_ID"
echo ""

