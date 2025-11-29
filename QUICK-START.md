# 🚀 APX Toolkit - Quick Start Guide

**The easiest way to discover APIs and generate complete integration packages!**

---

## ⚡ 5-Minute Quick Start

### Option 1: Use Apify Console (Easiest)

1. **Go to your Actor:**
   ```
   https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
   ```

2. **Click "Start"**

3. **Paste this input:**
   ```json
   {
     "startUrls": [{"url": "https://jsonplaceholder.typicode.com/posts"}],
     "maxPages": 1
   }
   ```

4. **Click "Start" and watch the magic!**

### Option 2: Use Apify CLI

```bash
# Install Apify CLI (if not installed)
npm install -g apify-cli

# Login
apify login

# Run with simple input
apify call apx-toolkit --input-file=test-scenarios/simple-api.json
```

---

## 📋 Common Use Cases

### 1. Discover APIs from a Website

```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 10,
  "enableInteractionSimulation": true
}
```

### 2. Document an Existing API

```json
{
  "startUrls": [{"url": "https://api.example.com/v1"}],
  "apiPatterns": ["/api/", "/v1/"],
  "maxPages": 50
}
```

### 3. Generate Code for Multiple APIs

```json
{
  "startUrls": [
    {"url": "https://api.example.com/users"},
    {"url": "https://api.example.com/products"}
  ],
  "maxPages": 20,
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl"]
}
```

### 4. With Authentication

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "bearerToken": "your-token-here",
  "maxPages": 10
}
```

---

## 🎯 What You Get

Every run generates:

✅ **API Documentation** - OpenAPI, Postman, cURL, Insomnia  
✅ **Code Snippets** - 12 programming languages  
✅ **TypeScript Types** - Complete type definitions  
✅ **Test Suites** - 5 testing frameworks  
✅ **SDK Packages** - TypeScript, Python, Go  
✅ **Examples** - Request/response samples  

---

## 📊 View Results

After a run completes:

1. **Go to the Run page** (link shown after completion)
2. **Click "Dataset" tab**
3. **Browse or download** all generated artifacts

---

## 🔧 Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `startUrls` | URLs to start discovery from | Required |
| `maxPages` | Maximum pages to process | 100 |
| `maxConcurrency` | Concurrent requests | 5 |
| `generateDocumentation` | Generate API docs | true |
| `exportFormats` | Formats: openapi, postman, curl, insomnia | ["openapi", "postman", "curl"] |
| `enableInteractionSimulation` | Auto-click/scroll to trigger APIs | true |
| `bearerToken` | Authentication token | - |
| `apiKey` | API key for auth | - |

---

## 💡 Pro Tips

1. **Start Simple:** Use `maxPages: 1` for quick tests
2. **Enable Interactions:** Set `enableInteractionSimulation: true` for SPAs
3. **Use Patterns:** Add `apiPatterns` to filter specific endpoints
4. **Check Logs:** Monitor real-time logs for discovery progress

---

## 🆘 Need Help?

- **Actor URL:** https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
- **Documentation:** See `USER-GUIDE.md`
- **Examples:** Check `test-scenarios/` folder

---

**Ready to go! Start your first run and see the magic happen!** ✨

