#!/bin/bash
# APX Toolkit - Quick Test Runner
# Easy script to run test scenarios

echo "🚀 APX Toolkit - Test Runner"
echo "============================"
echo ""

# Check if Apify CLI is installed
if ! command -v apify &> /dev/null; then
    echo "❌ Apify CLI not found. Installing..."
    npm install -g apify-cli
fi

# Check if logged in
if ! apify info &> /dev/null; then
    echo "❌ Not logged into Apify. Please run: apify login"
    exit 1
fi

echo "Select test scenario:"
echo "1) Simple API Test (Quick - ~10 seconds)"
echo "2) Multiple APIs Test (Medium - ~30 seconds)"
echo "3) Full Features Test (Comprehensive - ~1 minute)"
echo "4) Custom input file"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Running Simple API Test..."
        apify call apx-toolkit --input-file=test-scenarios/simple-api.json
        ;;
    2)
        echo ""
        echo "Running Multiple APIs Test..."
        apify call apx-toolkit --input-file=test-scenarios/multiple-apis.json
        ;;
    3)
        echo ""
        echo "Running Full Features Test..."
        apify call apx-toolkit --input-file=test-scenarios/full-features.json
        ;;
    4)
        read -p "Enter path to input file: " filepath
        if [ -f "$filepath" ]; then
            echo ""
            echo "Running custom test..."
            apify call apx-toolkit --input-file="$filepath"
        else
            echo "❌ File not found: $filepath"
            exit 1
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Test complete! Check the Apify Console for results."

