# 🚀 APX Toolkit - Deployment Guide

Complete guide for deploying APX Toolkit to Apify platform and publishing to npm.

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:

- [x] ✅ CLI tested and working
- [x] ✅ Build successful (`npm run build`)
- [x] ✅ All tests pass (`npm test`)
- [x] ✅ Dockerfile configured
- [x] ✅ `.actor/actor.json` configured
- [x] ✅ `.apifyignore` configured
- [x] ✅ Documentation complete

---

## 1️⃣ Deploy to Apify Platform

### Prerequisites

1. **Apify Account**: Sign up at https://apify.com
2. **Apify CLI**: Install globally
   ```bash
   npm install -g apify-cli
   ```
3. **Login to Apify**:
   ```bash
   apify login
   ```

### Step 1: Verify Configuration

Check that your Actor configuration is correct:

```bash
# Verify actor.json
cat .actor/actor.json

# Verify Dockerfile
cat Dockerfile

# Verify .apifyignore
cat .apifyignore
```

### Step 2: Test Build Locally

```bash
# Build the project
npm run build

# Test the Actor locally (if you have Apify SDK)
npm test
```

### Step 3: Push to Apify

```bash
# Push to Apify platform
apify push

# Or specify actor name
apify push --name your-actor-name
```

**What happens:**
- Apify CLI uploads your code
- Builds Docker image
- Creates/updates Actor on Apify platform

### Step 4: Test on Apify Platform

1. **Go to Apify Console**: https://console.apify.com
2. **Find your Actor**: Search for your actor name
3. **Create Test Run**:
   - Click "Start" button
   - Configure input (use test-input.json as reference)
   - Click "Run"
4. **Monitor Execution**:
   - Watch logs in real-time
   - Check for errors
   - Verify output dataset

### Step 5: Publish Actor

Once tested successfully:

1. **Go to Actor Settings**
2. **Set Visibility**: Public or Private
3. **Add Description**: Copy from README.md
4. **Add Tags**: `api-discovery`, `api-documentation`, `openapi`, `postman`
5. **Set Category**: "API Tools" or "Web Scraping"
6. **Click "Publish"**

### Step 6: Register for Competition (If Applicable)

If this is for the Apify Challenge:

1. **Go to Challenge Page**: https://apify.com/challenges
2. **Register Your Actor**
3. **Submit Actor URL**
4. **Complete Submission Form**

---

## 2️⃣ Publish to npm

### Prerequisites

1. **npm Account**: Sign up at https://www.npmjs.com
2. **Login to npm**:
   ```bash
   npm login
   ```
3. **Verify Package Name**: Check `package.json` - ensure `@apx/toolkit` is available

### Step 1: Prepare Package

```bash
# Ensure package.json is correct
cat package.json

# Verify bin entry exists
grep -A 2 '"bin"' package.json

# Should show:
# "bin": {
#   "apx": "./dist/cli.js"
# }
```

### Step 2: Build Package

```bash
# Clean previous builds
rm -rf dist/

# Build TypeScript
npm run build

# Verify build
ls -la dist/cli.js
```

### Step 3: Test Package Locally

```bash
# Test CLI works
node dist/cli.js --help

# Test with npm link (optional)
npm link
apx --help  # Should work globally
```

### Step 4: Check Package Contents

```bash
# See what will be published
npm pack --dry-run

# Review the tarball contents
npm pack
tar -tzf apx-toolkit-1.0.0.tgz | head -20
```

### Step 5: Publish to npm

```bash
# Dry run first (recommended)
npm publish --dry-run

# If everything looks good, publish
npm publish

# For scoped packages (@apx/toolkit), make it public:
npm publish --access public
```

### Step 6: Verify Installation

After publishing, test installation:

```bash
# Install globally
npm install -g @apx/toolkit

# Verify CLI works
apx --help

# Test with real API
apx --url https://jsonplaceholder.typicode.com/posts
```

---

## 3️⃣ Post-Deployment

### Apify Platform

- [ ] Monitor Actor runs
- [ ] Check error logs
- [ ] Review user feedback
- [ ] Update documentation if needed
- [ ] Monitor Actor Quality Score

### npm Package

- [ ] Test installation on different machines
- [ ] Monitor download statistics
- [ ] Respond to issues on GitHub
- [ ] Update package as needed

---

## 🔧 Troubleshooting

### Apify Deployment Issues

**Issue: Build fails on Apify**
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check build logs in Apify console

**Issue: Actor doesn't start**
- Verify `main` entry point in package.json
- Check Actor logs for errors
- Ensure `Actor.init()` is called

**Issue: Missing files**
- Check `.apifyignore` - ensure important files aren't ignored
- Verify all source files are included

### npm Publishing Issues

**Issue: Package name already taken**
- Choose different name or scope
- Update package.json and republish

**Issue: CLI doesn't work after install**
- Verify `bin` entry in package.json
- Check file permissions on `dist/cli.js`
- Ensure shebang `#!/usr/bin/env node` is present

**Issue: Missing dependencies**
- Check `dependencies` vs `devDependencies`
- Ensure all runtime deps are in `dependencies`

---

## 📊 Deployment Status

### Current Status

- ✅ **CLI Tested**: Working perfectly
- ✅ **Build Successful**: No errors
- ✅ **Dockerfile**: Configured
- ✅ **Actor Config**: Ready
- ⏳ **Apify Deployment**: Ready to deploy
- ⏳ **npm Publishing**: Ready to publish

### Next Actions

1. **Deploy to Apify**: `apify push`
2. **Test on Platform**: Create test run
3. **Publish Actor**: Make public
4. **Publish to npm**: `npm publish --access public`
5. **Verify Both**: Test installation and usage

---

## 🎉 Success Criteria

### Apify Platform
- ✅ Actor builds successfully
- ✅ Test run completes without errors
- ✅ Output dataset contains expected data
- ✅ Actor Quality Score > 65
- ✅ Actor is published and discoverable

### npm Package
- ✅ Package installs successfully
- ✅ `apx` command works globally
- ✅ CLI generates all artifacts correctly
- ✅ Package is discoverable on npm

---

## 📝 Notes

- **Version Management**: Update version in package.json before publishing
- **Changelog**: Consider creating CHANGELOG.md for version history
- **Documentation**: Keep README.md updated with latest features
- **Testing**: Always test locally before deploying

---

**Ready to deploy?** Follow the steps above and you'll have APX Toolkit available on both Apify platform and npm! 🚀

