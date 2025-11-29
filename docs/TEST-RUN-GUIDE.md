# 🧪 Test Run Guide - APX Toolkit

**How to test APX Toolkit and verify it works correctly**

---

## Quick Test (30 seconds)

### Option 1: Apify Console

1. Go to: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
2. Click **"Start"**
3. Paste this input:
   ```json
   {
     "startUrls": [{"url": "https://jsonplaceholder.typicode.com/posts"}],
     "maxPages": 1
   }
   ```
4. Click **"Start"** and wait ~10-30 seconds
5. Check **"Dataset"** tab for results

### Option 2: Apify CLI

```bash
apify call apx-toolkit --input-file=test-scenarios/simple-api.json
```

---

## Test Scenarios

### Simple API Test

**File:** `test-scenarios/simple-api.json`

```json
{
  "startUrls": [{"url": "https://jsonplaceholder.typicode.com/posts"}],
  "maxPages": 1,
  "maxConcurrency": 2,
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl"]
}
```

**Expected:** 1 API discovered, code snippets generated

---

### Multiple APIs Test

**File:** `test-scenarios/multiple-apis.json`

```json
{
  "startUrls": [
    {"url": "https://jsonplaceholder.typicode.com/posts"},
    {"url": "https://jsonplaceholder.typicode.com/users"}
  ],
  "maxPages": 2
}
```

**Expected:** 2+ APIs discovered

---

### Full Features Test

**File:** `test-scenarios/full-features.json`

```json
{
  "startUrls": [{"url": "https://jsonplaceholder.typicode.com/posts"}],
  "maxPages": 5,
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl", "insomnia"],
  "generateGitHubActions": true,
  "generateSecurityReport": true,
  "generateEnhancedDocs": true
}
```

**Expected:** All features enabled, enhanced outputs generated

---

## What to Verify

### ✅ Basic Functionality

- [ ] APIs discovered successfully
- [ ] Code snippets generated
- [ ] Documentation created
- [ ] TypeScript types generated
- [ ] Test suites created
- [ ] SDK packages built

### ✅ Enhanced Features (NEW!)

- [ ] GitHub Actions workflow generated
- [ ] Security audit report created
- [ ] Enhanced documentation generated
- [ ] Progress tracking working
- [ ] All outputs in correct format

### ✅ Dataset Views

Check all 9 dataset views:
1. Discovered APIs
2. Extracted Data
3. Code Snippets
4. TypeScript Types
5. API Documentation
6. Test Suites
7. SDK Packages
8. API Examples
9. Execution Summary

---

## Troubleshooting Tests

### No APIs Discovered

**Check:**
- URL is accessible
- Site uses API calls
- Try enabling `enableInteractionSimulation: true`

### Timeout Issues

**Solution:**
- Increase `discoveryTimeout`
- Reduce `maxPages`
- Check network connectivity

### Authentication Errors

**Solution:**
- Verify token is valid
- Check authentication method
- Try OAuth flow if available

---

## Test Scripts

### Using Test Script

```bash
./run-test.sh
```

Interactive script to choose test scenario.

### Direct Test

```bash
apify call apx-toolkit --input-file=test-scenarios/simple-api.json
```

---

## Expected Results

### Successful Run

- ✅ Run status: SUCCEEDED
- ✅ APIs discovered: 1+
- ✅ Items extracted: 1+
- ✅ All dataset views populated
- ✅ Enhanced outputs generated (if enabled)

### Output Files

- Code snippets in multiple languages
- TypeScript type definitions
- API documentation (OpenAPI, Postman, etc.)
- Test suites
- SDK packages
- Security audit report (if enabled)
- GitHub Actions workflow (if enabled)

---

## Performance Benchmarks

### Typical Run Times

- **Simple API:** 10-15 seconds
- **Multiple APIs:** 20-30 seconds
- **Full Features:** 30-60 seconds

### Resource Usage

- **Memory:** ~200-500 MB
- **CPU:** Moderate during discovery
- **Network:** Depends on API responses

---

## See Also

- **[Getting Started](GETTING-STARTED.md)** - First steps
- **[User Guide](USER-GUIDE.md)** - Complete documentation
- **[Developer Guide](DEVELOPER-GUIDE.md)** - Development info

---

**Happy testing!** 🧪
