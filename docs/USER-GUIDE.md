# 📚 APX Toolkit - Complete User Guide

**Your complete guide to using APX Toolkit for API discovery and code generation.**

---

## 🎯 What is APX Toolkit?

APX Toolkit automatically:
- 🔍 **Discovers** APIs from websites and applications
- 📝 **Documents** APIs in multiple formats
- 💻 **Generates** code in 12 programming languages
- 🧪 **Creates** test suites in 5 frameworks
- 📦 **Builds** ready-to-publish SDK packages
- 📘 **Provides** TypeScript type definitions

**Saves weeks of work in seconds!**

---

## 🚀 Getting Started

### Prerequisites

- Apify account (free at https://apify.com)
- Apify CLI (optional, for command-line usage)

### Quick Start

1. **Visit your Actor:** https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
2. **Click "Start"**
3. **Enter your input** (see examples below)
4. **Click "Start"** and wait for results!

---

## 📝 Input Configuration

### Required Fields

```json
{
  "startUrls": [
    {
      "url": "https://example.com"
    }
  ]
}
```

### Complete Input Schema

```json
{
  "startUrls": [
    {
      "url": "https://example.com"
    }
  ],
  "apiPatterns": ["/api/", "/v1/"],
  "minResponseSize": 1000,
  "discoveryTimeout": 10000,
  "maxPages": 100,
  "maxConcurrency": 5,
  "dataPath": "",
  "paginationType": "auto",
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl", "insomnia"],
  "enableInteractionSimulation": true,
  "interactionWaitTime": 2000,
  "authHeaders": {},
  "apiKey": "",
  "bearerToken": "",
  "loginUrl": "",
  "oauthFlow": false
}
```

### Field Descriptions

#### Basic Configuration

- **`startUrls`** (required): Array of URLs to start discovery
  ```json
  "startUrls": [{"url": "https://api.example.com"}]
  ```

- **`maxPages`**: Maximum number of pages to process (default: 100)
- **`maxConcurrency`**: Concurrent requests (default: 5)

#### API Discovery

- **`apiPatterns`**: URL patterns to match (e.g., `["/api/", "/v1/"]`)
- **`minResponseSize`**: Minimum response size in bytes (default: 1000)
- **`discoveryTimeout`**: How long to wait for discovery in ms (default: 10000)

#### Interaction

- **`enableInteractionSimulation`**: Auto-click/scroll to trigger APIs (default: true)
- **`interactionWaitTime`**: Wait time after interactions in ms (default: 2000)

#### Authentication

- **`bearerToken`**: Bearer token for authentication
- **`apiKey`**: API key (added as X-API-Key header)
- **`authHeaders`**: Custom headers object
- **`loginUrl`**: URL for OAuth flow
- **`oauthFlow`**: Enable OAuth token capture

#### Output

- **`generateDocumentation`**: Generate API docs (default: true)
- **`exportFormats`**: Formats to export: `["openapi", "postman", "curl", "insomnia"]`

---

## 🎨 Use Cases & Examples

### 1. Discover APIs from a Website

**Goal:** Find all APIs used by a website

```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 10,
  "enableInteractionSimulation": true,
  "interactionWaitTime": 3000
}
```

### 2. Document an Existing API

**Goal:** Generate documentation for known API endpoints

```json
{
  "startUrls": [
    {"url": "https://api.example.com/users"},
    {"url": "https://api.example.com/products"}
  ],
  "apiPatterns": ["/api/"],
  "maxPages": 50,
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman"]
}
```

### 3. Generate Code for Integration

**Goal:** Get ready-to-use code snippets

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "maxPages": 20,
  "generateDocumentation": true
}
```

**Output:** Code in JavaScript, Python, Go, Java, C#, PHP, Ruby, Swift, Kotlin, Rust, Dart, and Bash

### 4. Create Test Suites

**Goal:** Generate tests for discovered APIs

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "maxPages": 10
}
```

**Output:** Tests for Jest, pytest, Mocha, Vitest, and Playwright

### 5. Build SDK Packages

**Goal:** Create publishable SDK packages

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "maxPages": 15
}
```

**Output:** Complete SDK packages for TypeScript, Python, and Go

### 6. With Authentication

**Goal:** Discover APIs behind authentication

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "bearerToken": "your-token-here",
  "maxPages": 20
}
```

Or with API key:

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "apiKey": "your-api-key",
  "maxPages": 20
}
```

### 7. OAuth Flow

**Goal:** Automatically capture OAuth tokens

```json
{
  "startUrls": [{"url": "https://app.example.com"}],
  "loginUrl": "https://app.example.com/login",
  "oauthFlow": true,
  "maxPages": 20
}
```

---

## 📊 Understanding Output

### Dataset Structure

Your results are saved in the Apify Dataset with these views:

1. **Discovered APIs** 📡 - API endpoint summaries
2. **Extracted Data** 📊 - All extracted data items
3. **Code Snippets** 💻 - Code in 12 languages
4. **TypeScript Types** 📘 - Type definitions
5. **API Documentation** 📚 - OpenAPI, Postman, cURL, Insomnia
6. **Test Suites** 🧪 - Tests in 5 frameworks
7. **SDK Packages** 📦 - Ready-to-publish SDKs
8. **API Examples** 📝 - Request/response examples
9. **Execution Summary** 📈 - Statistics and metrics

### Accessing Results

1. **After run completes**, click the dataset link
2. **Browse views** to see different output types
3. **Download** individual items or entire dataset
4. **Export** as JSON, CSV, Excel, etc.

---

## 🔧 Advanced Configuration

### Pagination

APX automatically detects pagination types:
- **Offset-based:** `?offset=0&limit=10`
- **Page-based:** `?page=1&size=10`
- **Cursor-based:** `?cursor=abc123`

You can specify manually:

```json
{
  "paginationType": "offset",
  "dataPath": "data.items"
}
```

### Data Extraction

Specify custom data paths:

```json
{
  "dataPath": "results.data"
}
```

If empty, APX auto-detects the data structure.

### Filtering APIs

Use patterns to filter specific endpoints:

```json
{
  "apiPatterns": ["/api/v1/", "/rest/"],
  "minResponseSize": 500
}
```

---

## 🐛 Troubleshooting

### No APIs Discovered

**Problem:** Run completes but no APIs found

**Solutions:**
1. Enable interaction simulation:
   ```json
   {
     "enableInteractionSimulation": true,
     "interactionWaitTime": 3000
   }
   ```
2. Increase discovery timeout:
   ```json
   {
     "discoveryTimeout": 20000
   }
   ```
3. Try different URLs
4. Check if APIs require authentication

### Timeout Errors

**Problem:** Run times out

**Solutions:**
1. Reduce `maxPages`
2. Increase `discoveryTimeout`
3. Reduce `maxConcurrency`

### Authentication Issues

**Problem:** APIs return 401/403 errors

**Solutions:**
1. Add `bearerToken` or `apiKey`
2. Use `authHeaders` for custom auth
3. Enable `oauthFlow` for OAuth sites

### Missing Data

**Problem:** APIs discovered but no data extracted

**Solutions:**
1. Specify `dataPath` manually
2. Check API response structure
3. Verify pagination settings

---

## 💡 Best Practices

1. **Start Small:** Test with `maxPages: 1` first
2. **Use Patterns:** Filter APIs with `apiPatterns`
3. **Enable Interactions:** For SPAs and dynamic sites
4. **Monitor Logs:** Watch real-time progress
5. **Check Results:** Verify output in dataset views
6. **Iterate:** Adjust settings based on results

---

## 📞 Support & Resources

- **Actor URL:** https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
- **GitHub:** https://github.com/irun2themoney/apx-toolkit
- **Documentation:** See `README.md` for full details

---

## 🎉 You're Ready!

You now have everything you need to:
- ✅ Discover APIs automatically
- ✅ Generate complete integration packages
- ✅ Create documentation in multiple formats
- ✅ Build SDK packages
- ✅ Generate test suites

**Happy API discovering!** 🚀

