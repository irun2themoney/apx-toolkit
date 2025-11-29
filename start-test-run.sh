#!/bin/bash
# Script to start Apify Actor run via API

ACTOR_ID="2eXbQISXqhTnIxWNJ"
INPUT_FILE="test-input.json"

echo "🚀 Starting APX Toolkit test run..."
echo "Actor ID: $ACTOR_ID"
echo "Input file: $INPUT_FILE"
echo ""
echo "To start the run, you need:"
echo "1. Apify API token (from https://console.apify.com/account/integrations)"
echo "2. Run this command:"
echo ""
echo "curl -X POST \\"
echo "  'https://api.apify.com/v2/acts/$ACTOR_ID/runs' \\"
echo "  -H 'Authorization: Bearer YOUR_API_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d @$INPUT_FILE"
echo ""
echo "Or use the browser:"
echo "1. Go to: https://console.apify.com/actors/$ACTOR_ID/source"
echo "2. Click 'Input' tab"
echo "3. Find 'Start URLs' field"
echo "4. Enter: [{\"url\": \"https://jsonplaceholder.typicode.com/posts\"}]"
echo "5. Click 'Start' button"

