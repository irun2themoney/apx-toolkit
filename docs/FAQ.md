# ❓ Frequently Asked Questions (FAQ)

**Common questions and answers**

---

## 🚀 Getting Started

### Q: How do I get started?
**A:** It's super easy! Just:
1. Go to https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
2. Click "Start"
3. Paste: `{"startUrls": [{"url": "https://example.com"}]}`
4. Wait 10-30 seconds
5. Done! Check the Dataset tab.

See [Quick Start Guide](QUICK-START.md) for details.

---

### Q: What URL should I use?
**A:** Use a **web page** (not a direct API endpoint). APX discovers APIs by watching the page make API calls.

**Good examples:**
- ✅ `https://example.com` (web page)
- ✅ `https://github.com` (web page)
- ✅ `https://news.ycombinator.com` (web page)

**Not ideal:**
- ❌ `https://api.example.com/posts` (direct API endpoint)
- ❌ `https://jsonplaceholder.typicode.com/posts` (direct API)

**Why?** APX needs to see the page make API calls to discover them.

---

### Q: How long does it take?
**A:** Usually 10-30 seconds for simple APIs, 1-2 minutes for complex ones.

---

## 🔧 Configuration

### Q: What's the minimum input needed?
**A:** Just a URL!
```json
{
  "startUrls": [{"url": "https://example.com"}]
}
```
Everything else has smart defaults.

---

### Q: What are the best settings for first-time users?
**A:** Use the defaults! They're optimized for most cases. Or try:
- **Simple:** Just change the URL
- **Standard:** Add `"maxPages": 50`
- **Complete:** Enable all features

---

### Q: What does "Interaction Simulation" do?
**A:** APX automatically clicks buttons and scrolls to trigger more API calls. This helps discover APIs that only load when you interact with the page.

**Recommendation:** Keep it enabled (default) for best results.

---

## 📊 Outputs

### Q: Where do I find my results?
**A:** In the **Dataset** tab after the run completes. You'll see 9 organized views:
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

### Q: What formats are available?
**A:** APX generates:
- **Documentation:** OpenAPI, Postman, cURL, Insomnia
- **Code:** 12 languages (TypeScript, Python, Go, etc.)
- **Tests:** 5 frameworks (Jest, pytest, etc.)
- **SDKs:** TypeScript, Python, Go packages

---

### Q: How do I download the results?
**A:** 
1. Go to the Dataset tab
2. Click "Download" button
3. Choose format (JSON, CSV, Excel, etc.)

---

## 🐛 Troubleshooting

### Q: No APIs discovered. What's wrong?
**A:** Try these:
1. ✅ Enable "Interaction Simulation" (default: enabled)
2. ✅ Use a web page, not a direct API endpoint
3. ✅ Increase "Max Pages" to discover more
4. ✅ Try multiple start URLs
5. ✅ Check if the site requires login (add auth headers)

---

### Q: Getting authentication errors (401/403)?
**A:** The API requires authentication. Add:
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "bearerToken": "YOUR_TOKEN"
}
```
Or use `apiKey` or `authHeaders` fields.

---

### Q: Run is taking too long?
**A:** 
1. Reduce `maxPages` (default: 100)
2. Reduce `maxConcurrency` (default: 5)
3. Use fewer start URLs

---

### Q: Getting timeout errors?
**A:**
1. Increase `discoveryTimeout` (default: 10000ms)
2. The site might be slow - try a different URL
3. Check your internet connection

---

## 💡 Tips & Tricks

### Q: How do I discover more APIs?
**A:**
1. Enable interaction simulation (default)
2. Use multiple start URLs
3. Increase max pages
4. Try different pages of the same site

---

### Q: Can I use this for my own API?
**A:** Yes! Point APX at your website and it will discover and document your APIs automatically.

---

### Q: What about private/authenticated APIs?
**A:** Yes! Add authentication:
- `bearerToken` for Bearer tokens
- `apiKey` for API keys
- `authHeaders` for custom headers
- `loginUrl` + `oauthFlow` for OAuth

---

### Q: Can I customize the generated code?
**A:** The generated code is ready to use, but you can customize it after generation. It's standard code in your language of choice.

---

## 🎯 Use Cases

### Q: I just want documentation
**A:** Perfect! Just enable `generateDocumentation: true` (default). You'll get OpenAPI, Postman, cURL, and Insomnia formats.

---

### Q: I need a mock server
**A:** Enable `generateMockServer: true` (default). You'll get a production-ready Express.js server with real API data.

---

### Q: I want to test API performance
**A:** Enable `generatePerformanceBenchmark: true` (default). You'll get performance metrics and load test scripts.

---

### Q: I want to prevent breaking changes
**A:** Enable `generateContractTests: true` (default). You'll get contract tests that catch breaking changes automatically.

---

## 🔒 Security

### Q: Is my data safe?
**A:** Yes! APX runs on Apify's secure platform. Your API keys and tokens are encrypted and never logged.

---

### Q: Can I use this for production APIs?
**A:** Yes! APX is production-ready. The generated code follows best practices and is ready to use.

---

## 📚 More Help

### Q: Where can I learn more?
**A:**
- 📖 [Quick Start Guide](QUICK-START.md) - Get started in 60 seconds
- 📋 [Common Use Cases](COMMON-USE-CASES.md) - Real-world examples
- 📘 [User Guide](USER-GUIDE.md) - Complete documentation
- 🧪 [Test Scenarios](test-scenarios/) - Ready-to-use examples

---

### Q: Still need help?
**A:** 
- Check the error messages - they include helpful tips
- Review the examples in `test-scenarios/`
- Try the "Simple Discovery" preset first

---

**Have a question not answered here?**
- Check the full [User Guide](USER-GUIDE.md)
- [Open an Issue](https://github.com/irun2themoney/apx-toolkit/issues)
- [Give Feedback](../CONTRIBUTING.md#-give-feedback)

---

## ⭐ Love APX Toolkit?

**Star us on GitHub!** ⭐

[![GitHub stars](https://img.shields.io/github/stars/irun2themoney/apx-toolkit?style=social)](https://github.com/irun2themoney/apx-toolkit)

**Your feedback helps make APX better for everyone!** 🙏

