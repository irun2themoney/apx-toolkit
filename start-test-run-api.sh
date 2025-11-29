#!/bin/bash
# Script to start APX Toolkit test run via Apify API

ACTOR_ID="2eXbQISXqhTnIxWNJ"
API_TOKEN="${APIFY_API_TOKEN:-YOUR_API_TOKEN_HERE}"

# Test input with real API endpoint
INPUT_JSON='{
  "startUrls": [
    {
      "url": "https://jsonplaceholder.typicode.com/posts"
    }
  ],
  "maxPages": 10,
  "discoveryTimeout": 10000,
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl"],
  "enableInteractionSimulation": true
}'

echo "🚀 Starting APX Toolkit test run..."
echo "Actor ID: $ACTOR_ID"
echo ""

if [ "$API_TOKEN" = "YOUR_API_TOKEN_HERE" ]; then
    echo "❌ Error: Please set APIFY_API_TOKEN environment variable"
    echo ""
    echo "To get your API token:"
    echo "1. Go to: https://console.apify.com/account/integrations"
    echo "2. Copy your API token"
    echo "3. Run: export APIFY_API_TOKEN='your-token-here'"
    echo "4. Then run this script again"
    exit 1
fi

# Start the run
RESPONSE=$(curl -s -X POST \
  "https://api.apify.com/v2/acts/$ACTOR_ID/runs" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$INPUT_JSON")

# Extract run ID
RUN_ID=$(echo "$RESPONSE" | grep -o '"data":{"id":"[^"]*' | cut -d'"' -f6)

if [ -z "$RUN_ID" ]; then
    echo "❌ Failed to start run"
    echo "Response: $RESPONSE"
    exit 1
fi

echo "✅ Run started successfully!"
echo "Run ID: $RUN_ID"
echo ""
echo "📊 Monitor the run:"
echo "https://console.apify.com/actors/$ACTOR_ID/runs/$RUN_ID"
echo ""
echo "⏳ Waiting for run to complete..."
echo ""

# Poll for completion
while true; do
    STATUS=$(curl -s \
      "https://api.apify.com/v2/actor-runs/$RUN_ID" \
      -H "Authorization: Bearer $API_TOKEN" | \
      grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    echo "Status: $STATUS"
    
    if [ "$STATUS" = "SUCCEEDED" ] || [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "ABORTED" ]; then
        echo ""
        echo "✅ Run completed with status: $STATUS"
        echo ""
        echo "📊 View results:"
        echo "https://console.apify.com/actors/$ACTOR_ID/runs/$RUN_ID"
        echo ""
        echo "📋 Check dataset views:"
        echo "https://console.apify.com/actors/$ACTOR_ID/runs/$RUN_ID/dataset"
        break
    fi
    
    sleep 5
done

