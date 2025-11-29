# 🚀 Deployment Instructions

**Complete guide for updating npm and Apify profiles**

---

## 📦 Update npm Package

### 1. Update Version

Version has been updated to `1.0.2` in `package.json`

### 2. Build and Test

```bash
# Build the project
npm run build

# Verify build
node verify-apify-build.js
```

### 3. Publish to npm

```bash
# Check you're logged in
npm whoami

# If not logged in
npm login

# Dry run to see what will be published
npm publish --dry-run

# Publish
npm publish
```

### 4. Verify on npm

Visit: https://www.npmjs.com/package/apx-toolkit

The package description and README will automatically update from `package.json` and `README.md`.

---

## 🎭 Update Apify Actor Profile

### 1. Go to Actor Settings

Visit: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ/settings

### 2. Update Description

Use this description:

```
APX - The API Toolkit

From API discovery to production code in seconds.

APX automatically discovers APIs (REST, GraphQL, WebSocket) and generates complete integration packages:
• Code snippets in 12 languages (TypeScript, JavaScript, Python, Go, Rust, Java, PHP, Ruby, C#, Kotlin, cURL, PowerShell)
• TypeScript type definitions (.d.ts files)
• Test suites with schema validation (Jest, pytest, Mocha, Vitest, Playwright)
• SDK packages ready to publish (TypeScript, Python, Go)
• API documentation in multiple formats (OpenAPI, Postman, cURL, Insomnia)
• Request/response examples with real API data

Features:
✅ Automatic API discovery by monitoring network traffic
✅ REST, GraphQL & WebSocket support
✅ OAuth 2.0 automatic token capture
✅ Pagination auto-detection
✅ Rate limit detection
✅ Multi-format documentation
✅ Complete test suites
✅ Ready-to-publish SDK packages

Saves weeks of developer work in seconds.
```

### 3. Update Tags

Add these tags:
```
api-discovery
api-documentation
api-toolkit
code-generation
openapi
postman
typescript
sdk-generator
test-generator
api-integration
developer-tools
automation
playwright
rest-api
graphql
websocket
```

### 4. Set Category

Category: **"API Tools"** or **"Developer Tools"**

### 5. Update README

The README is automatically pulled from `README.md` in the repository.

### 6. Set Visibility

- **Public** - For competition/public use
- **Private** - For personal use only

### 7. Add Example Input

Add this example input in the Actor settings:

```json
{
  "startUrls": [
    {
      "url": "https://jsonplaceholder.typicode.com/posts"
    }
  ],
  "maxPages": 1,
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl"]
}
```

### 8. Add Screenshots/Video (Optional)

If you have screenshots or demo videos, add them to showcase the Actor.

---

## ✅ Verification Checklist

### npm Package
- [ ] Version updated in package.json
- [ ] README.md is clean and professional
- [ ] Description is clear and compelling
- [ ] Keywords are relevant
- [ ] Package builds successfully
- [ ] Published to npm
- [ ] Verified on npm website

### Apify Actor
- [ ] Description updated
- [ ] Tags added
- [ ] Category set
- [ ] Example input added
- [ ] Visibility set (Public/Private)
- [ ] README displays correctly
- [ ] Actor builds successfully
- [ ] Test run completes successfully

---

## 🎯 Quick Commands

### npm
```bash
npm run build          # Build
npm publish --dry-run  # Test publish
npm publish            # Publish
```

### Apify
```bash
apify push             # Deploy Actor
apify call apx-toolkit --input-file=test-scenarios/simple-api.json  # Test
```

---

## 📝 Notes

- npm package description comes from `package.json`
- npm README comes from `README.md` in root
- Apify Actor description can be set in console or will use README.md
- Both should be kept in sync for consistency

---

**Ready to deploy!** 🚀

