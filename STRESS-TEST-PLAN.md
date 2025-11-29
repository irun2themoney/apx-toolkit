# 🧪 Comprehensive Stress Test Plan

**Date:** November 29, 2025  
**Goal:** Thoroughly test APX Toolkit, find edge cases, and fix issues

---

## 🎯 Test Strategy

### 1. Baseline Tests
- ✅ Simple API discovery
- ✅ Valid configurations
- ✅ Standard use cases

### 2. Error Handling Tests
- ✅ Invalid URLs
- ✅ Empty inputs
- ✅ Missing required fields
- ✅ Invalid configurations
- ✅ Non-existent domains
- ✅ Network timeouts

### 3. Performance Tests
- ✅ High concurrency
- ✅ Large responses
- ✅ Multiple URLs
- ✅ Long-running operations

### 4. Feature Combination Tests
- ✅ All features enabled simultaneously
- ✅ Conflicting configurations
- ✅ Edge case combinations

### 5. Edge Cases
- ✅ Negative values
- ✅ Zero values
- ✅ Very large values
- ✅ Special characters in URLs
- ✅ Malformed JSON

---

## 📋 Test Scenarios

### Test 1: Simple API (Baseline)
**Purpose:** Verify basic functionality  
**Input:** Valid API URL, minimal config  
**Expected:** Should discover API and generate outputs  
**Status:** ✅ Started

---

### Test 2: Invalid URL
**Purpose:** Test error handling  
**Input:** `{"startUrls":[{"url":"not-a-valid-url"}]}`  
**Expected:** Should fail gracefully with clear error  
**Status:** ✅ Started

---

### Test 3: Empty Input
**Purpose:** Test validation  
**Input:** `{"maxPages":1}` (missing startUrls)  
**Expected:** Should reject with validation error  
**Status:** ✅ Started

---

### Test 4: All Features Enabled
**Purpose:** Test all features together  
**Input:** All options enabled  
**Expected:** Should handle all features without conflicts  
**Status:** ✅ Started

---

### Test 5: High Concurrency
**Purpose:** Stress test performance  
**Input:** `maxConcurrency: 15`  
**Expected:** Should handle high load gracefully  
**Status:** ✅ Started

---

### Test 6: Multiple URLs
**Purpose:** Test parallel processing  
**Input:** Multiple start URLs  
**Expected:** Should process all URLs correctly  
**Status:** ✅ Started

---

### Test 7: Invalid Configuration
**Purpose:** Test input validation  
**Input:** Negative values  
**Expected:** Should validate and reject  
**Status:** ✅ Started

---

### Test 8: Non-existent Domain
**Purpose:** Test network error handling  
**Input:** Unreachable domain  
**Expected:** Should handle gracefully  
**Status:** ✅ Started

---

## 🔍 What We're Looking For

### Issues to Identify:
1. **Crashes** - Actor fails unexpectedly
2. **Hangs** - Actor gets stuck
3. **Memory leaks** - Performance degradation
4. **Error messages** - Unclear or missing errors
5. **Data corruption** - Incorrect outputs
6. **Timeout issues** - Not handling timeouts
7. **Validation gaps** - Invalid inputs accepted
8. **Race conditions** - Concurrency issues

---

## 📊 Monitoring

### View Test Runs:
- Apify Console: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ/runs
- Use `monitor-test-runs.sh` script
- Check logs for each run

### Success Criteria:
- ✅ All baseline tests pass
- ✅ Error cases handled gracefully
- ✅ No crashes or hangs
- ✅ Clear error messages
- ✅ Performance acceptable

---

## 🔧 Fixes Needed

*Will be documented as issues are found*

---

## 📝 Results

*Will be updated as tests complete*

---

**Tests are running. Monitor progress and document any issues found!**

