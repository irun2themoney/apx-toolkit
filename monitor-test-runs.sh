#!/bin/bash

# Monitor test runs and collect results

echo "📊 Monitoring Test Runs..."
echo ""

# Array of run IDs to monitor
RUN_IDS=("$@")

if [ ${#RUN_IDS[@]} -eq 0 ]; then
    echo "Usage: ./monitor-test-runs.sh RUN_ID1 RUN_ID2 ..."
    echo "Or provide run IDs as arguments"
    exit 1
fi

for RUN_ID in "${RUN_IDS[@]}"; do
    echo "Monitoring Run: $RUN_ID"
    echo "URL: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ/runs/$RUN_ID"
    
    STATUS="RUNNING"
    ATTEMPTS=0
    MAX_ATTEMPTS=24  # 2 minutes max
    
    while [ "$STATUS" = "RUNNING" ] || [ "$STATUS" = "READY" ] || [ "$STATUS" = "READY_TO_RUN" ]; do
        sleep 5
        ATTEMPTS=$((ATTEMPTS + 1))
        
        if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
            echo "  ⏱️  Timeout waiting for completion"
            break
        fi
        
        STATUS_OUTPUT=$(apify run "$RUN_ID" --status-only 2>&1 || echo "UNKNOWN")
        STATUS=$(echo "$STATUS_OUTPUT" | tail -1 | tr -d '[:space:]' || echo "UNKNOWN")
        
        if [ "$STATUS" != "RUNNING" ] && [ "$STATUS" != "READY" ] && [ "$STATUS" != "READY_TO_RUN" ]; then
            break
        fi
        
        echo "  Status: $STATUS (attempt $ATTEMPTS/$MAX_ATTEMPTS)"
    done
    
    echo "  Final Status: $STATUS"
    
    if [ "$STATUS" = "SUCCEEDED" ]; then
        echo -e "  \033[0;32m✅ SUCCESS\033[0m"
    elif [ "$STATUS" = "FAILED" ]; then
        echo -e "  \033[0;31m❌ FAILED\033[0m"
        echo "  Check logs for details"
    else
        echo -e "  \033[0;33m⚠️  Status: $STATUS\033[0m"
    fi
    echo ""
done

echo "✅ Monitoring complete!"

