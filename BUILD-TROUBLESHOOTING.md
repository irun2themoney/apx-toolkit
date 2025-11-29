# 🔧 Build Troubleshooting Guide

**If your Apify build is failing, check these common issues:**

---

## ✅ Quick Checks

### 1. Local Build Works?
```bash
npm run build
```
If this fails, fix TypeScript errors first.

### 2. JSON Files Valid?
```bash
# Check actor.json
node -e "JSON.parse(require('fs').readFileSync('.actor/actor.json', 'utf8'))"

# Check dataset_schema.json
node -e "JSON.parse(require('fs').readFileSync('.actor/dataset_schema.json', 'utf8'))"
```

### 3. All Files Present?
- ✅ `Dockerfile`
- ✅ `.actor/actor.json`
- ✅ `.actor/dataset_schema.json`
- ✅ `package.json`
- ✅ `tsconfig.json`
- ✅ `src/main.ts`

---

## 🔍 Common Build Failures

### Issue 1: TypeScript Compilation Errors
**Symptom:** Build fails with TypeScript errors

**Fix:**
```bash
npm run build
# Fix any errors shown
```

### Issue 2: Missing Dependencies
**Symptom:** `npm install` fails or dependencies missing

**Fix:**
- Check `package.json` has all dependencies
- Ensure `devDependencies` includes `typescript`

### Issue 3: Dockerfile Issues
**Symptom:** Docker build fails

**Fix:**
- Check Dockerfile uses correct base image
- Ensure `npm install --include=dev` is used
- Verify file paths are correct

### Issue 4: JSON Schema Validation
**Symptom:** `actor.json` or `dataset_schema.json` validation errors

**Fix:**
- Validate JSON syntax
- Check schema matches Apify's requirements
- Ensure all required fields are present

### Issue 5: Missing Files
**Symptom:** Build can't find required files

**Fix:**
- Check `.apifyignore` doesn't exclude needed files
- Ensure `tsconfig.json` is not ignored
- Verify all source files are present

---

## 🚀 Trigger New Build

### Option 1: Push to GitHub
```bash
git add -A
git commit -m "Fix build issues"
git push origin main
```
Then trigger build on Apify Console.

### Option 2: Use Apify CLI
```bash
apify push
```

---

## 📋 Build Checklist

Before pushing:
- [ ] `npm run build` succeeds locally
- [ ] All JSON files are valid
- [ ] No TypeScript errors
- [ ] Dockerfile is correct
- [ ] All required files present
- [ ] `.apifyignore` is correct

---

## 💡 Still Failing?

1. Check Apify Console logs for specific error
2. Compare with last successful build
3. Check Apify platform status
4. Try rebuilding from scratch

---

**Need help?** [Open an Issue](https://github.com/irun2themoney/apx-toolkit/issues)

