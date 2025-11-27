# 🚀 Deploy APX Toolkit Now

## Current Status Check

Run these commands to check your setup:

```bash
# Check Apify CLI
which apify || npm install -g apify-cli

# Check npm login
npm whoami

# Check package availability
npm view @apx/toolkit
```

---

## Step 1: Deploy to Apify

### If Apify CLI is not installed:
```bash
npm install -g apify-cli
```

### Login and Deploy:
```bash
# Login (will prompt for credentials)
apify login

# Push to Apify
apify push
```

**What happens:**
- Apify CLI uploads your code
- Builds Docker image on Apify platform
- Creates/updates Actor

**After push:**
1. Go to https://console.apify.com
2. Find your Actor
3. Create a test run
4. Verify output
5. Publish Actor

---

## Step 2: Publish to npm

### Check npm login:
```bash
npm whoami
```

### If not logged in:
```bash
npm login
# Enter your npm username, password, and email
```

### Check package name:
```bash
npm view @apx/toolkit
```

If it says "404 Not Found", the name is available!

### Publish:
```bash
# Dry run first (recommended)
npm publish --dry-run

# If everything looks good, publish
npm publish --access public
```

**Note**: Scoped packages (`@apx/toolkit`) require `--access public` flag.

---

## Step 3: Verify Installations

### Test Apify Actor:
1. Go to https://console.apify.com
2. Find your Actor
3. Click "Start"
4. Use this input:
```json
{
  "startUrls": [{"url": "https://jsonplaceholder.typicode.com/posts"}],
  "maxPages": 1
}
```
5. Check output dataset

### Test npm Package:
```bash
# Install globally
npm install -g @apx/toolkit

# Test CLI
apx --help

# Test with real API
apx --url https://jsonplaceholder.typicode.com/posts --output ./test-install
```

---

## Step 4: Competition Submission

If this is for a competition:

1. **Get Actor URL**: From Apify console
2. **Go to Competition Page**: (competition-specific URL)
3. **Register**: Fill out submission form
4. **Submit**: Actor URL and description

---

## Troubleshooting

### Apify Issues:
- **"Not logged in"**: Run `apify login`
- **"Actor not found"**: Check actor name in `.actor/actor.json`
- **Build fails**: Check Dockerfile and build logs

### npm Issues:
- **"Not logged in"**: Run `npm login`
- **"Package name taken"**: Choose different name or scope
- **"Access denied"**: Check npm account permissions

---

## Quick Commands

```bash
# Deploy to Apify
apify login && apify push

# Publish to npm
npm login && npm publish --access public

# Test npm package
npm install -g @apx/toolkit && apx --help
```

---

**Ready?** Run the commands above and APX Toolkit will be live! 🎉

