# Quick Test Guide

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Crawlee
- Playwright
- TypeScript
- All other dependencies

## Step 2: Build the Code

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

## Step 3: Verify Build

```bash
npm run verify
```

This checks that all required files are built and test configuration is valid.

## Step 4: Run Test

```bash
npm test
```

This will:
1. Build the code (if not already built)
2. Run the test script
3. Show you the results

## What You Should See

### Successful Test Output:

```
🧪 Starting Smart API Finder & Documenter - TEST MODE
==========================================

[MOCK] Actor.init() called
[MOCK] Actor.getInput() - loaded from test-input.json
📋 Test Configuration:
   Start URLs: 1
   Max Pages: 3
   Max Concurrency: 2
   Discovery Timeout: 20000ms

🚀 Starting discovery phase...

[INFO] Starting API discovery for https://...
[INFO] Potential API endpoint found: https://...
[INFO] Discovered API: https://...
[INFO] Enqueued API request: https://...

✅ Discovery phase complete. Starting API processing phase...

[INFO] Processing API request: https://...
[INFO] Extracted X items from API response
[INFO] Enqueued next page: 2

✅ API processing phase complete.

📊 Crawling Statistics:
   Total Requests: X
   Handled Requests: X

📦 Dataset Statistics:
   Items Extracted: X

✅ Test completed successfully!
```

## If Something Goes Wrong

### No APIs Discovered?

- The test site might not use APIs
- Try a different URL in `test-input.json`
- Increase `discoveryTimeout` to 30000
- Check the site manually in browser DevTools

### Build Errors?

- Make sure TypeScript is installed: `npm install`
- Check Node.js version: `node --version` (should be 20+)
- Try cleaning and rebuilding: `rm -rf dist && npm run build`

### Playwright Issues?

- Install browsers: `npx playwright install chromium`
- Check Playwright installation: `npx playwright --version`

## Next Steps

Once local tests pass:

1. ✅ Review the output data
2. ✅ Check that pagination works
3. ✅ Verify metadata is included
4. ✅ Test with different URLs
5. ✅ Deploy to Apify platform
6. ✅ Register for the challenge!

For more detailed testing, see [TESTING.md](TESTING.md).

