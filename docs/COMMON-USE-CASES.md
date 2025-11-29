# 📋 Common Use Cases - APX Toolkit

**Real-world examples to get you started**

---

## 🎯 Use Case 1: "I want to integrate with an API"

**Problem:** You found a website with an API, but no documentation.

**Solution:**
```json
{
  "startUrls": [{"url": "https://the-website.com"}],
  "maxPages": 50,
  "generateDocumentation": true,
  "generateMockServer": true
}
```

**What you get:**
- ✅ Complete API documentation
- ✅ Code snippets in your language
- ✅ Mock server for testing
- ✅ TypeScript types

**Time saved:** 2-3 weeks → 2 minutes

---

## 🎯 Use Case 2: "I need to test API performance"

**Problem:** You want to know which APIs are slow.

**Solution:**
```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "generatePerformanceBenchmark": true,
  "generateDependencyGraph": true
}
```

**What you get:**
- ✅ Performance metrics for all endpoints
- ✅ Load test scripts (k6)
- ✅ Optimization recommendations
- ✅ Dependency graph showing bottlenecks

**Time saved:** Days of manual testing → 1 minute

---

## 🎯 Use Case 3: "I need a mock server for development"

**Problem:** You can't develop without hitting the real API.

**Solution:**
```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "generateMockServer": true
}
```

**What you get:**
- ✅ Production-ready Express.js mock server
- ✅ Real API response data (not fake!)
- ✅ Error scenarios included
- ✅ Ready to run: `npm install && npm start`

**Time saved:** 4-8 hours → 2 minutes

---

## 🎯 Use Case 4: "I want to prevent breaking changes"

**Problem:** APIs change and break your integration.

**Solution:**
```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "generateContractTests": true
}
```

**What you get:**
- ✅ Contract tests (Pact, Schemathesis)
- ✅ CI/CD integration
- ✅ Automatic breaking change detection
- ✅ Alerts when APIs change

**Time saved:** Hours of debugging → Automated

---

## 🎯 Use Case 5: "I want to understand API architecture"

**Problem:** You need to see how APIs relate to each other.

**Solution:**
```json
{
  "startUrls": [
    {"url": "https://api.example.com/users"},
    {"url": "https://api.example.com/posts"}
  ],
  "generateDependencyGraph": true
}
```

**What you get:**
- ✅ Interactive dependency graph (HTML)
- ✅ Mermaid diagrams
- ✅ Critical path analysis
- ✅ Visual API relationships

**Time saved:** Hours of analysis → Instant visualization

---

## 🎯 Use Case 6: "I want everything!"

**Problem:** You want the complete package.

**Solution:**
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 100,
  "generateDocumentation": true,
  "generateMockServer": true,
  "generatePerformanceBenchmark": true,
  "generateContractTests": true,
  "generateMCPIntegration": true,
  "generateX402Integration": true,
  "generateDependencyGraph": true
}
```

**What you get:**
- ✅ Everything! All features enabled
- ✅ Complete integration package
- ✅ Production-ready code
- ✅ Tests, docs, mocks, performance, contracts, graphs

**Time saved:** Months of work → 2 minutes

---

## 💡 Tips for Each Use Case

### For API Integration:
- Start with `maxPages: 10` to test quickly
- Enable interaction simulation for more APIs
- Use the generated code snippets as starting points

### For Performance Testing:
- Use multiple URLs to compare performance
- Check the performance report for slow endpoints
- Use the generated k6 scripts for load testing

### For Mock Servers:
- The mock server uses real API data
- Test locally before deploying
- Customize error scenarios as needed

### For Contract Testing:
- Run contract tests in CI/CD
- Set up alerts for breaking changes
- Review the contract JSON for details

### For Dependency Graphs:
- Use multiple related URLs
- Check critical paths for bottlenecks
- Export Mermaid diagrams for documentation

---

---

## 💬 Share Your Use Case!

**Did APX Toolkit help you?** We'd love to hear about it!

- [Share your story](../CONTRIBUTING.md#-share-your-success-stories)
- [Give feedback](../CONTRIBUTING.md#-give-feedback)
- [Star us on GitHub](https://github.com/irun2themoney/apx-toolkit) ⭐

---

**Choose your use case and get started!** 🚀

