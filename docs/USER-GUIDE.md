# 📚 APX Toolkit - Complete User Guide

**Everything you need to know to use APX Toolkit effectively**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Input Configuration](#input-configuration)
4. [Output Structure](#output-structure)
5. [Use Cases](#use-cases)
6. [Advanced Features](#advanced-features)
7. [Enhanced Developer Features](#enhanced-developer-features-new)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Introduction

### What is APX Toolkit?

APX Toolkit is an automated developer tool that:
- **Discovers** APIs automatically from websites
- **Generates** complete integration packages
- **Documents** APIs in multiple formats
- **Creates** production-ready code, tests, and SDKs

**Unique Features:**
- ✅ Only tool with automatic API discovery
- ✅ Supports REST, GraphQL, and WebSocket
- ✅ OAuth 2.0 automation
- ✅ Security auditing
- ✅ Change detection
- ✅ GitHub Actions integration
- ✅ VS Code extension

---

## Getting Started

### Prerequisites

- Apify account (free at https://apify.com)
- Apify CLI (optional, for command-line usage)

### Quick Start

1. Visit: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
2. Click "Start"
3. Enter input (see examples below)
4. Wait for results (usually 10-30 seconds)

See [Getting Started Guide](GETTING-STARTED.md) for detailed steps.

---

## Input Configuration

### Required Fields

```json
{
  "startUrls": [
    {"url": "https://example.com"}
  ]
}
```

### Basic Configuration

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "maxPages": 100,
  "maxConcurrency": 5,
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl"]
}
```

### Complete Configuration

```json
{
  "startUrls": [
    {"url": "https://api.example.com"}
  ],
  "apiPatterns": ["/api/", "/v1/"],
  "minResponseSize": 1000,
  "discoveryTimeout": 10000,
  "maxPages": 100,
  "maxConcurrency": 5,
  "dataPath": "data.items",
  "paginationType": "auto",
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl", "insomnia"],
  "enableInteractionSimulation": true,
  "interactionWaitTime": 2000,
  "bearerToken": "your-token-here",
  "apiKey": "your-api-key",
  "loginUrl": "https://api.example.com/login",
  "oauthFlow": true,
  "generateGitHubActions": true,
  "generateSecurityReport": true,
  "generateEnhancedDocs": true,
  "enableGitIntegration": false
}
```

### Field Descriptions

#### Core Discovery

- **`startUrls`** (required): Array of URLs to start discovery from
- **`apiPatterns`**: Filter specific API endpoints (e.g., `["/api/", "/v1/"]`)
- **`minResponseSize`**: Minimum response size in bytes (filters small configs)
- **`discoveryTimeout`**: How long to wait for API discovery (ms)
- **`maxPages`**: Maximum pages to process from discovered APIs
- **`maxConcurrency`**: Number of concurrent requests

#### Data Extraction

- **`dataPath`**: JSONPath to extract data (e.g., `"data.items"`)
- **`paginationType`**: `"auto"`, `"offset"`, `"page"`, or `"cursor"`

#### Documentation

- **`generateDocumentation`**: Generate API docs (default: true)
- **`exportFormats`**: `["openapi", "postman", "curl", "insomnia"]`

#### Interaction

- **`enableInteractionSimulation`**: Auto-click/scroll for SPAs (default: true)
- **`interactionWaitTime`**: Wait time after interactions (ms, default: 2000)

#### Authentication

- **`bearerToken`**: Bearer token (added as `Authorization: Bearer TOKEN`)
- **`apiKey`**: API key (added as `X-API-Key` header)
- **`authHeaders`**: Custom headers object
- **`loginUrl`**: URL for OAuth 2.0 login flow
- **`oauthFlow`**: Enable automatic OAuth token capture

#### Enhanced Features (NEW!)

- **`generateGitHubActions`**: Generate GitHub Actions workflow (default: true)
- **`generateSecurityReport`**: Generate security audit (default: true)
- **`generateEnhancedDocs`**: Generate enhanced markdown docs (default: true)
- **`enableGitIntegration`**: Auto-commit to git (default: false)

---

## Output Structure

### Dataset Views (9 Views)

APX organizes results into 9 dataset views:

1. **Discovered APIs** 📡
   - API endpoint summaries
   - Methods, URLs, headers
   - Pagination info
   - Rate limit info

2. **Extracted Data** 📊
   - All data items from APIs
   - Structured JSON data
   - Source URLs

3. **Code Snippets** 💻
   - Code in 12 languages:
     - TypeScript, JavaScript, Python, Go, Rust
     - Java, PHP, Ruby, C#, Kotlin
     - cURL, PowerShell

4. **TypeScript Types** 📘
   - Complete `.d.ts` files
   - Full type definitions
   - Ready for IDE integration

5. **API Documentation** 📚
   - OpenAPI 3.0 spec
   - Postman collection
   - cURL commands
   - Insomnia collection

6. **Test Suites** 🧪
   - Jest (JavaScript)
   - pytest (Python)
   - Mocha (JavaScript)
   - Vitest (TypeScript)
   - Playwright (E2E)

7. **SDK Packages** 📦
   - TypeScript SDK
   - Python SDK
   - Go SDK
   - All with CI/CD templates

8. **API Examples** 📝
   - Request examples
   - Response examples
   - Real API data

9. **Execution Summary** 📈
   - Statistics
   - Metrics
   - Performance data

### Enhanced Outputs (NEW!)

#### GitHub Actions Workflow

Location: `.github/workflows/apx-discovery.yml`

**Features:**
- Scheduled API discovery
- Auto-update on changes
- PR generation
- Artifact uploads

#### Security Audit Report

Location: `SECURITY-AUDIT.md` and `security-audit.json`

**Includes:**
- Security score (0-100)
- Vulnerability detection
- Best practices check
- Recommendations

#### Enhanced Documentation

Location: `API.md`, `README.md`, `jsdoc-comments.json`

**Features:**
- Markdown API reference
- JSDoc/TSDoc comments
- Interactive documentation

---

## Use Cases

### 1. API Discovery from Website

**Goal:** Find all APIs used by a website

```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 10,
  "enableInteractionSimulation": true
}
```

**Result:** All API endpoints discovered and documented.

---

### 2. API Documentation Generation

**Goal:** Generate complete documentation for an API

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "apiPatterns": ["/api/"],
  "maxPages": 50,
  "exportFormats": ["openapi", "postman", "curl", "insomnia"]
}
```

**Result:** Documentation in all 4 formats.

---

### 3. Code Generation for Integration

**Goal:** Get ready-to-use code in your language

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "maxPages": 20
}
```

**Result:** Code snippets in 12 languages, TypeScript types, test suites.

---

### 4. SDK Package Creation

**Goal:** Create publishable SDK packages

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "maxPages": 50
}
```

**Result:** Complete SDK packages for TypeScript, Python, and Go.

---

### 5. Security Auditing

**Goal:** Audit API security

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "generateSecurityReport": true
}
```

**Result:** Security audit report with score and recommendations.

---

### 6. CI/CD Automation

**Goal:** Automate API discovery in CI/CD

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "generateGitHubActions": true
}
```

**Result:** GitHub Actions workflow ready for automation.

---

## Advanced Features

### OAuth 2.0 Flow

APX can automatically capture OAuth tokens:

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "loginUrl": "https://api.example.com/login",
  "oauthFlow": true
}
```

**How it works:**
1. APX navigates to login URL
2. Monitors network traffic
3. Captures authentication tokens
4. Uses tokens for API requests

---

### GraphQL Support

APX automatically detects GraphQL APIs:

- Detects GraphQL queries
- Extracts operation names
- Generates GraphQL-specific code
- Creates GraphQL documentation

**No special configuration needed!**

---

### WebSocket Support

APX detects WebSocket connections:

- Monitors WebSocket connections
- Generates WebSocket client code
- Documents WebSocket protocols

**Automatic detection!**

---

### Pagination Handling

APX automatically detects and handles pagination:

- **Offset-based:** `?offset=0&limit=10`
- **Page-based:** `?page=1&size=10`
- **Cursor-based:** `?cursor=abc123`

Set `paginationType: "auto"` for automatic detection.

---

## Enhanced Developer Features (NEW!)

### 1. Progress Streaming

Real-time progress updates with:
- Current phase (discovery, processing, generation)
- Progress percentage
- Estimated time remaining
- Current item being processed

**Visible in:** Apify Console logs and VS Code extension

---

### 2. GitHub Actions Integration

Auto-generates `.github/workflows/apx-discovery.yml`:

```yaml
name: APX API Discovery
on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:
jobs:
  discover-api:
    steps:
      - name: Discover API
        run: apx --url ${{ secrets.API_URL }}
```

**Features:**
- Scheduled discovery
- Auto-update on changes
- PR generation
- Artifact uploads

---

### 3. Security Audit Reports

Comprehensive security analysis:

- **Security Score:** 0-100 rating
- **Vulnerability Detection:** Critical, high, medium, low issues
- **Best Practices:** Recommendations
- **Report Format:** Markdown + JSON

**Example Issues Detected:**
- HTTP instead of HTTPS
- Exposed API keys in URLs
- Missing authentication
- No rate limiting info
- Sensitive data in URLs

---

### 4. Change Detection

Track API changes over time:

- **Added APIs:** New endpoints discovered
- **Removed APIs:** Endpoints no longer available
- **Modified APIs:** Changed parameters, headers
- **Breaking Changes:** Critical changes detected

**Use Case:** Monitor APIs for breaking changes.

---

### 5. Enhanced Documentation

Professional documentation generation:

- **Markdown API Reference:** Complete API docs
- **JSDoc/TSDoc Comments:** IDE integration
- **README Generation:** Package documentation
- **Interactive Docs:** Web-based explorer

---

### 6. Git Integration

Automate version control:

- **Auto-commit:** Generated files committed automatically
- **Changelog:** Auto-generated changelog entries
- **Version Tagging:** Automatic version tags
- **Branch Management:** Create branches for updates

**Enable:** Set `enableGitIntegration: true`

---

### 7. VS Code Extension

Discover APIs directly from VS Code:

- Right-click → "Discover API with APX"
- Progress tracking in IDE
- Integrated workflow
- No context switching

**Installation:** See `vscode-extension/README.md`

---

### 8. Interactive API Explorer

Web UI for testing APIs:

- Browse discovered APIs
- Test endpoints interactively
- View request/response
- Generate code on-the-fly

**Location:** `web-ui/index.html`

---

## Troubleshooting

### No APIs Discovered

**Possible Causes:**
- Site doesn't use API calls
- APIs require user interaction
- APIs are loaded dynamically

**Solutions:**
- Enable `enableInteractionSimulation: true`
- Increase `discoveryTimeout`
- Check if site uses APIs

---

### Authentication Errors

**Possible Causes:**
- Invalid token
- Token expired
- Wrong authentication method

**Solutions:**
- Verify token is valid
- Use OAuth flow for automatic capture
- Check authentication headers

---

### Timeout Issues

**Possible Causes:**
- Slow API responses
- Network issues
- Too many pages

**Solutions:**
- Increase `discoveryTimeout`
- Reduce `maxPages`
- Check network connectivity

---

## Best Practices

### 1. Start Simple

Begin with minimal configuration:

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "maxPages": 1
}
```

Then expand based on results.

---

### 2. Use API Patterns

Filter specific endpoints:

```json
{
  "apiPatterns": ["/api/v1/", "/rest/"]
}
```

Reduces noise and speeds up discovery.

---

### 3. Enable Interactions for SPAs

For single-page applications:

```json
{
  "enableInteractionSimulation": true,
  "interactionWaitTime": 2000
}
```

Helps discover APIs triggered by user actions.

---

### 4. Use Security Reports

Always review security audit:

```json
{
  "generateSecurityReport": true
}
```

Identifies vulnerabilities and best practices.

---

### 5. Automate with GitHub Actions

Set up automated discovery:

```json
{
  "generateGitHubActions": true
}
```

Keeps API documentation up-to-date automatically.

---

## Examples

See `test-scenarios/` folder for ready-to-use examples:

- `simple-api.json` - Quick test
- `multiple-apis.json` - Multiple APIs
- `full-features.json` - All features enabled

---

## Resources

- **Actor URL:** https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
- **GitHub:** https://github.com/irun2themoney/apx-toolkit
- **npm:** https://www.npmjs.com/package/apx-toolkit
- **Documentation:** See `docs/` folder

---

**Happy API discovering!** 🚀
