# 🚀 Getting Started with APX Toolkit

**Your first steps to discovering APIs and generating complete integration packages**

---

## What is APX Toolkit?

APX Toolkit is the **only tool** that automatically:
- 🔍 **Discovers** APIs from websites (REST, GraphQL, WebSocket)
- 💻 **Generates** code in 12 programming languages
- 📚 **Creates** API documentation (OpenAPI, Postman, cURL, Insomnia)
- 🧪 **Builds** test suites in 5 frameworks
- 📦 **Publishes** SDK packages (TypeScript, Python, Go)
- 🔒 **Audits** security and detects vulnerabilities
- 🔄 **Tracks** API changes and breaking changes
- ⚙️ **Automates** CI/CD with GitHub Actions

**Saves 2-4 weeks of developer work → 10 seconds!**

---

## Quick Start (3 Steps)

### Step 1: Go to Your Actor

Visit: **https://console.apify.com/actors/2eXbQISXqhTnIxWNJ**

### Step 2: Click "Start"

Click the **"Start"** button on the Actor page.

### Step 3: Enter Input

Paste this simple input:

```json
{
  "startUrls": [{"url": "https://jsonplaceholder.typicode.com/posts"}],
  "maxPages": 1
}
```

Click **"Start"** and watch APX work its magic!

---

## What You'll Get

After the run completes (usually 10-30 seconds), you'll have:

### 📊 Dataset Views (9 organized views)

1. **Discovered APIs** 📡 - All API endpoints found
2. **Extracted Data** 📊 - Data from API responses
3. **Code Snippets** 💻 - Code in 12 languages
4. **TypeScript Types** 📘 - Complete type definitions
5. **API Documentation** 📚 - OpenAPI, Postman, cURL, Insomnia
6. **Test Suites** 🧪 - Tests in 5 frameworks
7. **SDK Packages** 📦 - Ready-to-publish SDKs
8. **API Examples** 📝 - Request/response examples
9. **Execution Summary** 📈 - Statistics and metrics

### 🚀 Enhanced Outputs (NEW!)

- **GitHub Actions Workflow** - `.github/workflows/apx-discovery.yml`
- **Security Audit Report** - `SECURITY-AUDIT.md`
- **Enhanced Documentation** - `API.md` with markdown
- **JSDoc Comments** - Ready for IDE integration

---

## Common Use Cases

### 1. Discover APIs from a Website

```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 10,
  "enableInteractionSimulation": true
}
```

**Use Case:** Find all APIs used by a website automatically.

---

### 2. Document an Existing API

```json
{
  "startUrls": [{"url": "https://api.example.com/v1"}],
  "apiPatterns": ["/api/", "/v1/"],
  "maxPages": 50
}
```

**Use Case:** Generate complete documentation for an API.

---

### 3. Generate Code for Integration

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman"]
}
```

**Use Case:** Get ready-to-use code snippets in your language.

---

### 4. With Authentication

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "bearerToken": "your-token-here"
}
```

**Use Case:** Discover authenticated APIs automatically.

---

### 5. OAuth Flow (Automatic Token Capture)

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "loginUrl": "https://api.example.com/login",
  "oauthFlow": true
}
```

**Use Case:** Automatically capture OAuth tokens from login flow.

---

## Configuration Options

### Basic Options

| Option | Description | Default |
|--------|-------------|---------|
| `startUrls` | URLs to start discovery from | **Required** |
| `maxPages` | Maximum pages to process | 100 |
| `maxConcurrency` | Concurrent requests | 5 |
| `generateDocumentation` | Generate API docs | true |
| `exportFormats` | Formats: openapi, postman, curl, insomnia | ["openapi", "postman", "curl"] |

### Advanced Options

| Option | Description | Default |
|--------|-------------|---------|
| `apiPatterns` | Filter specific API endpoints | [] |
| `bearerToken` | Bearer token for authentication | - |
| `apiKey` | API key (added as X-API-Key header) | - |
| `enableInteractionSimulation` | Auto-click/scroll for SPAs | true |
| `paginationType` | auto, offset, page, cursor | "auto" |
| `dataPath` | JSONPath to extract data | "" |

### Enhanced Features (NEW!)

| Option | Description | Default |
|--------|-------------|---------|
| `generateGitHubActions` | Generate GitHub Actions workflow | true |
| `generateSecurityReport` | Generate security audit report | true |
| `generateEnhancedDocs` | Generate enhanced markdown docs | true |
| `enableGitIntegration` | Auto-commit to git | false |

---

## Viewing Results

### In Apify Console

1. Go to your **Run page** (link shown after completion)
2. Click **"Dataset"** tab
3. Browse the **9 dataset views**:
   - Discovered APIs
   - Code Snippets
   - Documentation
   - Test Suites
   - SDK Packages
   - And more!

### Download Results

1. Click **"Dataset"** tab
2. Click **"Download"** button
3. Choose format (JSON, CSV, Excel, etc.)

---

## Next Steps

1. **Try a real API:**
   - Use `test-scenarios/simple-api.json`
   - Or discover your own API

2. **Read the User Guide:**
   - See `docs/USER-GUIDE.md` for complete documentation

3. **Explore Features:**
   - Check out GitHub Actions integration
   - Review security audit reports
   - Try the VS Code extension

---

## Need Help?

- **Actor URL:** https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
- **Documentation:** See `docs/USER-GUIDE.md`
- **Examples:** Check `test-scenarios/` folder
- **GitHub:** https://github.com/irun2themoney/apx-toolkit

---

**Ready to discover APIs? Start your first run now!** 🚀

