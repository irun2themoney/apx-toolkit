# APX Toolkit 🚀

**Discover APIs. Generate code. Save weeks of work.**

[![npm version](https://img.shields.io/npm/v/apx-toolkit.svg)](https://www.npmjs.com/package/apx-toolkit)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![GitHub stars](https://img.shields.io/github/stars/irun2themoney/apx-toolkit?style=social)](https://github.com/irun2themoney/apx-toolkit)

---

## ⚡ What It Does

APX automatically discovers APIs from any website and generates everything you need:

- ✅ **Code** in 12 languages (TypeScript, Python, Go, Java, etc.)
- ✅ **Documentation** (OpenAPI, Postman, cURL, Insomnia)
- ✅ **TypeScript types** (.d.ts files)
- ✅ **Test suites** (Jest, pytest, Mocha, etc.)
- ✅ **SDK packages** (TypeScript, Python, Go)
- ✅ **Mock servers** (Express.js)
- ✅ **Performance reports** (k6 load tests)
- ✅ **Contract tests** (Pact, Schemathesis)
- ✅ **Dependency graphs** (interactive visualizations)
- ✅ **MCP & x402 integrations** (AI assistant support)

**Result:** 2-4 weeks of work → **10 seconds** ⚡

---

## 🚀 Quick Start (30 seconds)

### Option 1: Apify Platform (Easiest)

1. **Go to:** [https://console.apify.com/actors/2eXbQISXqhTnIxWNJ](https://console.apify.com/actors/2eXbQISXqhTnIxWNJ)
2. **Click "Start"**
3. **Paste this:**
   ```json
   {
     "startUrls": [{"url": "https://example.com"}]
   }
   ```
4. **Wait 10-30 seconds** → Done! Check the Dataset tab.

### Option 2: CLI (Local)

```bash
npm install -g apx-toolkit
apx --url https://example.com
```

---

## 📖 How It Works

1. **You provide:** A website URL
2. **APX discovers:** All APIs the site uses (REST, GraphQL, WebSocket)
3. **APX generates:** Complete integration package
4. **You get:** Production-ready code, docs, tests, SDKs

**That's it!** No API specs needed. No manual setup. Just works.

---

## 💡 Common Use Cases

### Discover APIs from a Website
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 10
}
```

### With Authentication
```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "bearerToken": "your-token-here"
}
```

### Full Feature Set
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "generateMockServer": true,
  "generatePerformanceBenchmark": true,
  "generateContractTests": true,
  "generateDependencyGraph": true
}
```

---

## 📦 What You Get

Results are organized in 9 dataset views:

1. **Discovered APIs** 📡 - API endpoints found
2. **Extracted Data** 📊 - All data items
3. **Code Snippets** 💻 - Code in 12 languages
4. **TypeScript Types** 📘 - Type definitions
5. **API Documentation** 📚 - OpenAPI, Postman, etc.
6. **Test Suites** 🧪 - Ready-to-run tests
7. **SDK Packages** 📦 - Publishable SDKs
8. **API Examples** 📝 - Request/response examples
9. **Execution Summary** 📈 - Statistics

---

## 🎯 Key Features

- **Automatic Discovery** - Finds APIs by watching network traffic
- **12 Languages** - TypeScript, Python, Go, Java, PHP, Ruby, C#, Kotlin, Rust, JavaScript, cURL, PowerShell
- **Multiple Formats** - OpenAPI, Postman, cURL, Insomnia
- **OAuth Support** - Automatic token capture
- **GraphQL & WebSocket** - Full support
- **Production Ready** - CI/CD templates, security audits, change detection

---

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK-START.md)** - Get started in 60 seconds
- **[User Guide](docs/USER-GUIDE.md)** - Complete documentation
- **[Common Use Cases](docs/COMMON-USE-CASES.md)** - Real-world examples
- **[FAQ](docs/FAQ.md)** - Frequently asked questions

---

## 🤝 Contributing

Found a bug? Have an idea? [Open an issue](https://github.com/irun2themoney/apx-toolkit/issues) or submit a PR!

---

## 📄 License

ISC License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Actor:** [https://console.apify.com/actors/2eXbQISXqhTnIxWNJ](https://console.apify.com/actors/2eXbQISXqhTnIxWNJ)
- **GitHub:** [https://github.com/irun2themoney/apx-toolkit](https://github.com/irun2themoney/apx-toolkit)
- **npm:** [https://www.npmjs.com/package/apx-toolkit](https://www.npmjs.com/package/apx-toolkit)

---

**APX Toolkit** - Your complete API integration solution. Save weeks of work in seconds. 🚀
