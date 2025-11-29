# APX Toolkit 🚀

**The easiest way to discover and integrate with any API!**

[![npm version](https://img.shields.io/npm/v/apx-toolkit.svg)](https://www.npmjs.com/package/apx-toolkit)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![GitHub stars](https://img.shields.io/github/stars/irun2themoney/apx-toolkit?style=social)](https://github.com/irun2themoney/apx-toolkit)

**APX Toolkit** automatically discovers APIs and generates everything you need: **code in 12 languages, TypeScript types, test suites, SDK packages, API documentation, mock servers, performance reports, contract tests, and more** - all in one run.

**Saves 2-4 weeks of work → 10 seconds!** ⚡

---

## 🚀 Quick Start (60 seconds!)

### Step 1: Go to Apify
Visit: **[https://console.apify.com/actors/2eXbQISXqhTnIxWNJ](https://console.apify.com/actors/2eXbQISXqhTnIxWNJ)**

### Step 2: Click "Start"
Click the green **"Start"** button.

### Step 3: Paste This
```json
{
  "startUrls": [{"url": "https://example.com"}]
}
```

### Step 4: Wait 10-30 seconds
Done! Check the Dataset tab for all your outputs.

**That's it!** 🎉

---

## ✨ What APX Toolkit Generates

Every run automatically creates:

- ✅ **Code snippets** in 12 languages (TypeScript, JavaScript, Python, Go, Rust, Java, PHP, Ruby, C#, Kotlin, cURL, PowerShell)
- ✅ **TypeScript type definitions** (.d.ts files)
- ✅ **Test suites** with schema validation (Jest, pytest, Mocha, Vitest, Playwright)
- ✅ **SDK packages** ready to publish (TypeScript, Python, Go)
- ✅ **API documentation** in multiple formats (OpenAPI, Postman, cURL, Insomnia)
- ✅ **Request/response examples** with real API data
- ✅ **Mock servers** (Express.js) with real API data
- ✅ **Performance reports** with load test scripts (k6)
- ✅ **Contract tests** (Pact, Schemathesis) for CI/CD
- ✅ **Dependency graphs** (interactive HTML + Mermaid)
- ✅ **MCP integration** for AI assistants
- ✅ **x402 protocol** support for payment APIs

**Result:** Weeks of developer work → **10 seconds**. Complete API integration package ready to use.

---

## 📖 Documentation

### 🎯 Quick Start
- **[Quick Start Guide](docs/QUICK-START.md)** ⭐ - Get started in 60 seconds!
- **[Common Use Cases](docs/COMMON-USE-CASES.md)** - Real-world examples
- **[FAQ](docs/FAQ.md)** - Frequently asked questions

### 👤 User Guides
- **[User Guide](docs/USER-GUIDE.md)** - Complete user documentation
- **[CLI Documentation](docs/CLI.md)** - Command-line interface
- **[Test Scenarios](test-scenarios/)** - Ready-to-use configurations

### 👨‍💻 Developer Resources
- **[Developer Guide](docs/DEVELOPER-GUIDE.md)** - Architecture and development
- **[Project Structure](PROJECT-STRUCTURE.md)** - Code organization
- **[Contributing](CONTRIBUTING.md)** - How to contribute and give feedback

### 📚 Reference
- **[Documentation Index](docs/README.md)** - All documentation
- **[Feature Roadmap](FEATURE-ROADMAP.md)** - Planned features

---

## 🔧 Configuration

### Simple (Recommended for First Time)
```json
{
  "startUrls": [{"url": "https://example.com"}]
}
```
**That's it!** All defaults are optimized for you.

### Standard (Most Common)
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 50,
  "generateDocumentation": true,
  "generateMockServer": true
}
```

### Complete (Everything Enabled)
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 100,
  "generateDocumentation": true,
  "generateMockServer": true,
  "generatePerformanceBenchmark": true,
  "generateContractTests": true,
  "generateDependencyGraph": true
}
```

### 💡 Pro Tips

- **Use web pages, not API endpoints** - APX discovers APIs by watching pages make API calls
- **Start simple** - Use defaults first, then customize
- **Enable interaction simulation** - Discovers more APIs by clicking buttons
- **Check all dataset views** - Each view organizes different outputs

### 📚 More Examples
See [Common Use Cases](docs/COMMON-USE-CASES.md) for real-world examples.

---

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
  "bearerToken": "YOUR_TOKEN"
}
```

### Generate Mock Server
```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "generateMockServer": true
}
```

---

## 📦 Installation

### Apify Platform (Recommended)
Visit: [https://console.apify.com/actors/2eXbQISXqhTnIxWNJ](https://console.apify.com/actors/2eXbQISXqhTnIxWNJ)

### npm (CLI)
```bash
npm install -g apx-toolkit
```

---

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
- `comprehensive-test.json` - All features

---

## 🤝 Contributing & Feedback

**We love feedback!** Help us make APX Toolkit better:

- 💬 **[Give Feedback](CONTRIBUTING.md#-give-feedback)** - Share your thoughts
- 🐛 **[Report Bugs](CONTRIBUTING.md#-report-bugs)** - Help us fix issues
- 💡 **[Suggest Features](CONTRIBUTING.md#-suggest-features)** - Share your ideas
- 🚀 **[Share Success Stories](CONTRIBUTING.md#-share-your-success-stories)** - Tell us how APX helped you

See [CONTRIBUTING.md](CONTRIBUTING.md) for more ways to contribute!

---

## ⭐ Star Us!

If APX Toolkit helped you, please star us on GitHub! ⭐

[![GitHub stars](https://img.shields.io/github/stars/irun2themoney/apx-toolkit?style=social)](https://github.com/irun2themoney/apx-toolkit)

---

## 📚 Resources

- **Actor URL**: [https://console.apify.com/actors/2eXbQISXqhTnIxWNJ](https://console.apify.com/actors/2eXbQISXqhTnIxWNJ)
- **GitHub**: [https://github.com/irun2themoney/apx-toolkit](https://github.com/irun2themoney/apx-toolkit)
- **npm**: [https://www.npmjs.com/package/apx-toolkit](https://www.npmjs.com/package/apx-toolkit)

---

## 📄 License

ISC License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with [Apify](https://apify.com), [Crawlee](https://crawlee.dev), and [Playwright](https://playwright.dev).

**Made with ❤️ for developers who want to integrate APIs faster.**

---

**APX Toolkit** - Your complete API toolkit. Save weeks of work in seconds. 🚀
