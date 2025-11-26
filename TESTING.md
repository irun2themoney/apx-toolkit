# Testing Guide

This guide will help you test Smart API Finder & Documenter Actor locally before deploying to Apify.

## Prerequisites

1. **Node.js 20+** installed
2. **Dependencies installed**: Run `npm install`
3. **Playwright browsers**: Will be installed automatically on first run

## Quick Test

```bash
# Build and run the test
npm test
```

This will:
1. Build the TypeScript code
2. Run the test script with `test-input.json`
3. Show you the results

## Test Configuration

Edit `test-input.json` to test different scenarios:

### Test Case 1: Basic API Discovery

```json
{
  "startUrls": [
    {"url": "https://quotes.toscrape.com/js/"}
  ],
  "maxPages": 3,
  "discoveryTimeout": 15000
}
```

### Test Case 2: E-commerce Site (if available)

```json
{
  "startUrls": [
    {"url": "https://example-ecommerce.com/products"}
  ],
  "apiPatterns": ["/api/"],
  "maxPages": 5
}
```

### Test Case 3: News Site

```json
{
  "startUrls": [
    {"url": "https://example-news.com/articles"}
  ],
  "maxPages": 10
}
```

## What to Check

### ✅ Discovery Phase

1. **Browser launches**: You should see Playwright starting
2. **Page loads**: The start URL should load in headless browser
3. **API detection**: Look for log messages like:
   - `Potential API endpoint found: [URL]`
   - `Discovered API: [baseUrl]`
4. **Request enqueuing**: Should see `Enqueued API request: [URL]`

### ✅ API Processing Phase

1. **HTTP requests**: Should see fast HTTP requests (not browser)
2. **Data extraction**: Look for:
   - `Extracted X items from API response`
   - `Processing API request: [URL]`
3. **Pagination**: Should see:
   - `Enqueued next page: [page number]`
   - Multiple pages being processed

### ✅ Output

1. **Dataset items**: Check that items are saved
2. **Metadata**: Each item should have `_metadata` with:
   - `sourceUrl`
   - `apiUrl`
   - `extractedAt`
3. **Statistics**: Final stats should show:
   - Total requests handled
   - Items extracted

## Expected Output

```
🧪 Starting Smart API Finder & Documenter - TEST MODE
==========================================

[MOCK] Actor.init() called
[MOCK] Actor.getInput() - loaded from test-input.json
📋 Test Configuration:
   Start URLs: 1
   Max Pages: 5
   Max Concurrency: 2
   Discovery Timeout: 15000ms

🚀 Starting discovery phase...

[INFO] Starting API discovery for https://...
[INFO] Potential API endpoint found: https://...
[INFO] Discovered API: https://...
[INFO] Enqueued API request: https://...

✅ Discovery phase complete. Starting API processing phase...

[INFO] Processing API request: https://...
[INFO] Extracted 10 items from API response
[INFO] Enqueued next page: 2
...

✅ API processing phase complete.

📊 Crawling Statistics:
   Total Requests: 6
   Handled Requests: 6

📦 Dataset Statistics:
   Items Extracted: 50

📄 Sample Data (first 3 items):
...
```

## Troubleshooting Tests

### Issue: No APIs Discovered

**Possible causes:**
- Site doesn't use API calls (server-side rendering)
- API calls require user interaction
- Discovery timeout too short
- API responses too small (adjust `minResponseSize`)

**Solutions:**
- Increase `discoveryTimeout` to 20000 or 30000
- Try a different test site
- Check browser DevTools manually to see if APIs exist
- Reduce `minResponseSize` if APIs return small responses

### Issue: API Discovered But No Data

**Possible causes:**
- Data path not detected correctly
- API requires authentication
- API response structure different than expected

**Solutions:**
- Manually specify `dataPath` in test-input.json
- Check the API response in browser DevTools
- Verify API returns data (not just metadata)

### Issue: Pagination Not Working

**Possible causes:**
- Pagination type not detected
- API doesn't provide pagination metadata
- Max pages limit reached

**Solutions:**
- Manually set `paginationType` in test-input.json
- Check API response for pagination info
- Increase `maxPages` if needed

### Issue: Playwright Not Installing

**Solution:**
```bash
npx playwright install chromium
```

## Testing Checklist

Before deploying, verify:

- [ ] Code compiles without errors (`npm run build`)
- [ ] Test runs successfully (`npm test`)
- [ ] Discovery phase finds at least one API endpoint
- [ ] API processing extracts data items
- [ ] Pagination works (if applicable)
- [ ] Output dataset contains expected data
- [ ] Metadata fields are present in output
- [ ] No critical errors in logs
- [ ] Handles edge cases gracefully (no API found, empty responses, etc.)

## Testing with Real Apify Platform

Once local tests pass:

1. **Push to Apify**: Use Apify CLI or GitHub integration
2. **Test run**: Create a test run in Apify console
3. **Check logs**: Review Actor logs in Apify dashboard
4. **Verify output**: Check dataset in Apify storage
5. **Monitor performance**: Check execution time and resource usage

## Next Steps After Testing

1. ✅ Fix any issues found during testing
2. ✅ Update README if needed based on test results
3. ✅ Ensure Actor Quality Score meets requirements (65+)
4. ✅ Register for the Apify Challenge
5. ✅ Publish the Actor

## Need Help?

- Check the main README.md troubleshooting section
- Review Apify documentation: https://docs.apify.com
- Check Crawlee documentation: https://crawlee.dev

