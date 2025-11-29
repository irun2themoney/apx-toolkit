# APX - The API Toolkit

**From API discovery to production code in seconds.**

[![npm version](https://img.shields.io/npm/v/apx-toolkit.svg)](https://www.npmjs.com/package/apx-toolkit)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![GitHub](https://img.shields.io/github/stars/irun2themoney/apx-toolkit?style=social)](https://github.com/irun2themoney/apx-toolkit)

APX is the ultimate developer tool that automatically discovers APIs and generates everything you need: **code in 12 languages, TypeScript types, test suites, SDK packages, and complete documentation** - all in one run.

## 🚀 Quick Start

### Option 1: Apify Platform (Recommended - No Installation)

**Live Actor**: [https://console.apify.com/actors/2eXbQISXqhTnIxWNJ](https://console.apify.com/actors/2eXbQISXqhTnIxWNJ)

1. Click **"Start"** on the Actor page
2. Paste this input:
   ```json
   {
     "startUrls": [{"url": "https://jsonplaceholder.typicode.com/posts"}],
     "maxPages": 1
   }
   ```
3. Click **"Start"** and get complete API integration package in 10-30 seconds!

### Option 2: CLI (Local Development)

```bash
# Install globally
npm install -g apx-toolkit

# Run APX
apx --url https://api.example.com

# Output saved to ./apx-output
```

See [Getting Started Guide](docs/GETTING-STARTED.md) for detailed instructions.

## ✨ What APX Generates

Every run automatically creates:

- ✅ **Code snippets** in 12 languages (TypeScript, JavaScript, Python, Go, Rust, Java, PHP, Ruby, C#, Kotlin, cURL, PowerShell)
- ✅ **TypeScript type definitions** (.d.ts files)
- ✅ **Test suites** with schema validation (Jest, pytest, Mocha, Vitest, Playwright)
- ✅ **SDK packages** ready to publish (TypeScript, Python, Go)
- ✅ **API documentation** in multiple formats (OpenAPI, Postman, cURL, Insomnia)
- ✅ **Request/response examples** with real API data
- ✅ **REST, GraphQL & WebSocket support** - Auto-detects all API types
- ✅ **OAuth 2.0 flow** - Automatic token capture from login flows

**Result:** Weeks of developer work → **10 seconds**. Complete API integration package ready to use.

## 📖 Documentation

### 🎯 Start Here
- **[Getting Started Guide](docs/GETTING-STARTED.md)** ⭐ - Your first steps (start here!)

### 👤 User Documentation
- **[Complete User Guide](docs/USER-GUIDE.md)** - Everything you need to know
- **[CLI Documentation](docs/CLI.md)** - Command-line interface
- **[Test Run Guide](docs/TEST-RUN-GUIDE.md)** - How to test the Actor
- **[Test Scenarios](test-scenarios/)** - Ready-to-use test configurations

### 👨‍💻 Developer Documentation
- **[Developer Guide](docs/DEVELOPER-GUIDE.md)** - Architecture and development
- **[Project Structure](PROJECT-STRUCTURE.md)** - Code organization
- **[Feature Roadmap](FEATURE-ROADMAP.md)** - Planned features
- **[Developer Experience Enhancements](DEVELOPER-EXPERIENCE-ENHANCEMENTS.md)** - All enhancements

### 📚 Reference
- **[Documentation Index](docs/README.md)** - All documentation
- **[Monetization Guide](docs/MONETIZATION-TIERED-PRICING.md)** - Pricing setup
- **[Competition Status](COMPETITION-READY.md)** - Competition readiness

## 🎯 Use Cases

### Discover APIs from a Website

```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 10,
  "enableInteractionSimulation": true
}
```

### Document an Existing API

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "apiPatterns": ["/api/"],
  "maxPages": 50
}
```

### With Authentication

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "bearerToken": "your-token-here"
}
```

## 📊 Output Structure

Results are organized in 9 dataset views:

1. **Discovered APIs** 📡 - API endpoint summaries
2. **Extracted Data** 📊 - All extracted data items
3. **Code Snippets** 💻 - Code in 12 languages
4. **TypeScript Types** 📘 - Type definitions
5. **API Documentation** 📚 - OpenAPI, Postman, cURL, Insomnia
6. **Test Suites** 🧪 - Tests in 5 frameworks
7. **SDK Packages** 📦 - Ready-to-publish SDKs
8. **API Examples** 📝 - Request/response examples
9. **Execution Summary** 📈 - Statistics and metrics

## 🛠️ Features

### Core Features
- **Automatic API Discovery** - Finds APIs by monitoring network traffic
- **Multi-Format Documentation** - OpenAPI, Postman, cURL, Insomnia
- **12 Language Support** - Generate code in your preferred language
- **Complete Test Suites** - Ready-to-run tests in 5 frameworks
- **SDK Generation** - Publishable packages with CI/CD templates
- **OAuth Support** - Automatic token capture
- **GraphQL & WebSocket** - Full support for modern APIs
- **Pagination Detection** - Auto-detects and handles pagination
- **Rate Limit Detection** - Identifies rate limits automatically

### 🚀 Enhanced Developer Experience (NEW!)
- **Progress Streaming** - Real-time progress updates with ETA
- **GitHub Actions Integration** - Auto-generate CI/CD workflows
- **Git Integration** - Auto-commit generated files with changelog
- **Security Audit Reports** - Vulnerability detection and best practices
- **Change Detection** - Track API changes and breaking changes
- **Enhanced Documentation** - Markdown docs with JSDoc comments
- **VS Code Extension** - Discover APIs directly from your IDE
- **Interactive API Explorer** - Web UI to test APIs interactively

## 📦 Installation

### npm

```bash
npm install -g apx-toolkit
```

### Apify Platform

Visit: [https://console.apify.com/actors/2eXbQISXqhTnIxWNJ](https://console.apify.com/actors/2eXbQISXqhTnIxWNJ)

## 🔧 Configuration

### Basic Input

```json
{
  "startUrls": [
    {"url": "https://api.example.com"}
  ],
  "maxPages": 100,
  "maxConcurrency": 5,
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl"]
}
```

### Advanced Options

- `apiPatterns` - Filter specific API endpoints
- `bearerToken` / `apiKey` - Authentication
- `enableInteractionSimulation` - Auto-click/scroll for SPAs
- `paginationType` - Manual pagination control
- `dataPath` - Custom data extraction path

### Enhanced Features (NEW!)

- `generateGitHubActions` - Generate GitHub Actions workflow (default: true)
- `generateSecurityReport` - Generate security audit report (default: true)
- `generateEnhancedDocs` - Generate enhanced markdown docs (default: true)
- `enableGitIntegration` - Auto-commit to git (default: false)

See [User Guide](docs/USER-GUIDE.md) for complete configuration options.

## 🧪 Testing

### Quick Test

```bash
# Using test script
./run-test.sh

# Or directly
apify call apx-toolkit --input-file=test-scenarios/simple-api.json
```

### Test Scenarios

Pre-configured test scenarios in `test-scenarios/`:
- `simple-api.json` - Quick test
- `multiple-apis.json` - Multiple APIs
- `full-features.json` - All features

## 📚 Resources

- **Actor URL**: [https://console.apify.com/actors/2eXbQISXqhTnIxWNJ](https://console.apify.com/actors/2eXbQISXqhTnIxWNJ)
- **GitHub**: [https://github.com/irun2themoney/apx-toolkit](https://github.com/irun2themoney/apx-toolkit)
- **npm**: [https://www.npmjs.com/package/apx-toolkit](https://www.npmjs.com/package/apx-toolkit)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [Apify](https://apify.com) - Web scraping and automation platform
- [Crawlee](https://crawlee.dev) - Web scraping framework
- [Playwright](https://playwright.dev) - Browser automation

---

**APX** - Your complete API toolkit. Save weeks of work in seconds.
