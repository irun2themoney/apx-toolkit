# 🚀 Quick Start Guide - APX Toolkit

**Get started in 60 seconds!**

---

## Step 1: Go to Your Actor

Visit: **https://console.apify.com/actors/2eXbQISXqhTnIxWNJ**

---

## Step 2: Click "Start"

Click the big green **"Start"** button.

---

## Step 3: Enter Your URL

In the input field, paste this simple configuration:

```json
{
  "startUrls": [{"url": "https://example.com"}]
}
```

**That's it!** Click **"Start"** and wait 10-30 seconds.

---

## Step 4: Get Your Results

After the run completes, you'll find:

### 📊 In the Dataset Tab:

1. **Discovered APIs** 📡 - All API endpoints found
2. **Code Snippets** 💻 - Ready-to-use code in 12 languages
3. **API Documentation** 📚 - OpenAPI, Postman, cURL formats
4. **TypeScript Types** 📘 - Complete type definitions
5. **Test Suites** 🧪 - Ready-to-run tests
6. **SDK Packages** 📦 - Publishable SDKs
7. **Mock Server** 🔄 - Production-ready mock server
8. **Performance Reports** 📊 - API performance metrics
9. **Dependency Graph** 🔗 - Visual API relationships

---

## 🎯 Common Use Cases

### Use Case 1: Quick API Discovery
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 10
}
```

### Use Case 2: Complete Integration Package
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "maxPages": 50,
  "generateDocumentation": true,
  "generateMockServer": true,
  "generatePerformanceBenchmark": true
}
```

### Use Case 3: Developer Tools Only
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "generateMockServer": true,
  "generateContractTests": true,
  "generateDependencyGraph": true
}
```

---

## 💡 Pro Tips

1. **Use web pages, not API endpoints** - APX discovers APIs by watching web pages make API calls
2. **Enable interaction simulation** - Helps discover more APIs by clicking buttons
3. **Start simple** - Use defaults first, then customize
4. **Check the dataset views** - Each view organizes different types of outputs

---

## ❓ Need Help?

- 📖 **Full Guide:** [User Guide](USER-GUIDE.md)
- ❓ **FAQ:** [Frequently Asked Questions](FAQ.md)
- 💬 **Feedback:** [Give us feedback](../CONTRIBUTING.md#-give-feedback)
- 🐛 **Issues:** [Report bugs](https://github.com/irun2themoney/apx-toolkit/issues)

---

## ⭐ Love APX Toolkit?

**Star us on GitHub!** ⭐

[![GitHub stars](https://img.shields.io/github/stars/irun2themoney/apx-toolkit?style=social)](https://github.com/irun2themoney/apx-toolkit)

**Share your success story!** We'd love to hear how APX helped you.

---

**That's it! You're ready to discover APIs!** 🎉

