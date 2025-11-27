# 📦 Update npm and Apify Instructions

**Date**: November 26, 2025

---

## 🎯 Update npm Package (npmjs.com)

### Step 1: Update Package Version (if needed)

```bash
# Check current version
npm version

# If you want to bump version
npm version patch  # 1.0.1 -> 1.0.2
# OR
npm version minor  # 1.0.1 -> 1.1.0
```

### Step 2: Update Package on npm

The package is already published. To update:

1. **Make sure you're logged in**:
   ```bash
   npm whoami
   # Should show: irun2themoney
   ```

2. **Publish the update**:
   ```bash
   npm publish
   ```

3. **Update Package Description on npmjs.com**:
   - Go to: https://www.npmjs.com/package/apx-toolkit
   - Click "Edit Package" (if you're the owner)
   - Update the description if needed
   - The description from `package.json` is already comprehensive:
     ```
     APX - The API Toolkit. Automatically discovers APIs (REST, GraphQL, WebSocket) 
     and generates complete integration packages: code in 12 languages, TypeScript 
     types, test suites, SDK packages, and API documentation. Saves weeks of work 
     in seconds.
     ```

### Step 3: Verify npm Package

- Visit: https://www.npmjs.com/package/apx-toolkit
- Verify all information is correct
- Test installation: `npm install -g apx-toolkit`

---

## 🚀 Update Apify Actor

### Step 1: Update Actor Description

1. **Go to Apify Console**:
   - URL: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
   - Click "Settings" or "Edit"

2. **Update Description**:
   Use this comprehensive description:

   ```
   APX (API Toolkit) is an automated developer tool that discovers APIs from 
   websites and generates a complete integration package in seconds. It 
   automatically produces code in 12 languages (REST, GraphQL, WebSocket), 
   TypeScript types, test suites with schema validation, SDK packages with 
   CI/CD, and API documentation with inferred descriptions - everything a 
   developer needs to integrate with an API.

   **Key Features:**
   - Complete Developer Package: Generates code, types, tests, SDKs, docs
   - Multi-Language: 12 languages (TypeScript, Python, Go, Rust, Java, C#, 
     Kotlin, PHP, Ruby, cURL, PowerShell)
   - Multi-API Types: REST, GraphQL, WebSocket support
   - OAuth 2.0 Automation: Automatic token capture
   - Deep Interaction Fuzzing: Handles complex SPAs
   - Production-Grade: OpenAPI 3.1, JSON Schema, CI/CD templates
   - Multi-Platform: Apify Actor + CLI tool + npm package

   **Result**: Saves 2-4 weeks of developer work → 10 seconds.
   ```

3. **Update Tags** (if available):
   - `api-discovery`
   - `api-documentation`
   - `code-generation`
   - `openapi`
   - `graphql`
   - `websocket`
   - `typescript`
   - `sdk-generator`
   - `developer-tools`

### Step 2: Update Actor README

The Actor uses `./README.md` as its README. It's already updated with comprehensive information.

### Step 3: Verify Actor Configuration

1. **Check `.actor/actor.json`**:
   - ✅ Title: "APX - The API Toolkit"
   - ✅ Description: Updated
   - ✅ Input schema: Complete
   - ✅ Version: 1.0

2. **Verify Build**:
   ```bash
   npm run build
   ```

3. **Deploy to Apify** (if needed):
   ```bash
   apify push
   ```

### Step 4: Test Actor

1. Go to: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
2. Click "Start"
3. Use test input:
   ```json
   {
     "startUrls": [{"url": "https://jsonplaceholder.typicode.com"}],
     "maxPages": 2
   }
   ```
4. Verify output in Dataset

---

## ✅ Verification Checklist

### npm Package:
- [ ] Package version is correct (1.0.1)
- [ ] Description is comprehensive
- [ ] Keywords are relevant
- [ ] README displays correctly
- [ ] Installation works: `npm install -g apx-toolkit`
- [ ] CLI works: `apx --help`

### Apify Actor:
- [ ] Actor description is updated
- [ ] README displays correctly
- [ ] Input schema is complete
- [ ] Actor builds successfully
- [ ] Actor runs successfully
- [ ] Output is correct

---

## 📝 Quick Commands

### npm:
```bash
# Check current version
npm version

# Publish update
npm publish

# Verify installation
npm install -g apx-toolkit
apx --version
```

### Apify:
```bash
# Check Apify CLI
apify info

# Push updates
apify push

# Test locally
npm run build
npm start
```

---

## 🎯 Current Status

- **npm Package**: Published (v1.0.1)
- **Apify Actor**: Deployed (v1.0)
- **GitHub**: Updated
- **Documentation**: Complete

**All systems ready for updates!**

