# 🧪 Complete Testing Guide - All Features

**How to test every aspect of APX Toolkit**

---

## 🎯 Testing Strategy

### Phase 1: Individual Feature Tests
Test each feature in isolation to verify it works correctly.

### Phase 2: Integration Tests
Test features working together.

### Phase 3: End-to-End Tests
Test complete workflows from discovery to output.

### Phase 4: Edge Cases
Test error handling, invalid inputs, edge cases.

---

## 📋 Test Scenarios

### ✅ Test 1: Comprehensive Test (All Features)
**File:** `test-scenarios/comprehensive-test.json`

**What it tests:**
- All 6 new features enabled simultaneously
- Multiple APIs
- Integration between features

**Expected outputs:**
- Mock server (`mock-server/`)
- Performance reports (`performance/`)
- Contract tests (`contracts/`)
- MCP integration (`mcp/`)
- x402 integration (`x402/`)
- Dependency graph (`dependency-graph/`)

**Run:**
```bash
apify call apx-toolkit --input-file=test-scenarios/comprehensive-test.json -t 600
```

---

### ✅ Test 2: Mock Server Generator
**File:** `test-scenarios/mock-server-test.json`

**What it tests:**
- Mock server generation
- Express.js server code
- Data files
- Test files

**Expected outputs:**
- `mock-server/server.js`
- `mock-server/package.json`
- `mock-server/data/*.json`
- `mock-server/test/*.js`

**Run:**
```bash
apify call apx-toolkit --input-file=test-scenarios/mock-server-test.json -t 600
```

**Verify:**
1. Check dataset for `mock-server` folder
2. Verify `server.js` contains Express.js code
3. Verify `package.json` has correct dependencies
4. Verify data files contain API responses

---

### ✅ Test 3: Performance Benchmarking
**File:** `test-scenarios/performance-test.json`

**What it tests:**
- Performance benchmarking
- Latency metrics
- Throughput calculation
- Load test script generation

**Expected outputs:**
- `performance/PERFORMANCE-REPORT.md`
- `performance/performance-metrics.json`
- `performance/load-test.js`

**Run:**
```bash
apify call apx-toolkit --input-file=test-scenarios/performance-test.json -t 600
```

**Verify:**
1. Check performance report exists
2. Verify metrics include latency (min, max, avg, p50, p95, p99)
3. Verify k6 load test script is valid
4. Check recommendations are provided

---

### ✅ Test 4: Contract Testing
**File:** `test-scenarios/contract-test.json` (create if needed)

**What it tests:**
- Pact contract generation
- Schemathesis test generation
- CI/CD integration

**Expected outputs:**
- `contracts/pact-contracts.test.js`
- `contracts/schemathesis_tests.py`
- `contracts/contracts.json`
- `.github/workflows/contract-tests.yml`

**Run:**
```bash
apify call apx-toolkit --input-file=test-scenarios/contract-test.json -t 600
```

**Verify:**
1. Check Pact contracts are valid JavaScript
2. Verify Schemathesis tests are valid Python
3. Check contract JSON is valid
4. Verify CI/CD workflow is valid YAML

---

### ✅ Test 5: MCP Integration
**File:** `test-scenarios/mcp-integration-test.json`

**What it tests:**
- MCP server generation
- MCP client generation
- MCP resources and tools

**Expected outputs:**
- `mcp/mcp-server.js`
- `mcp/mcp-client.js`
- `mcp/mcp-resources.json`
- `mcp/mcp-tools.json`

**Run:**
```bash
apify call apx-toolkit --input-file=test-scenarios/mcp-integration-test.json -t 600
```

**Verify:**
1. Check MCP server code is valid
2. Verify MCP client code is valid
3. Check resources JSON is valid
4. Verify tools JSON is valid

---

### ✅ Test 6: Dependency Graph
**File:** `test-scenarios/dependency-graph-test.json`

**What it tests:**
- Dependency analysis
- Graph generation
- Critical path detection

**Expected outputs:**
- `dependency-graph/dependency-graph.html`
- `dependency-graph/dependency-graph.mmd`
- `dependency-graph/dependency-graph.json`
- `dependency-graph/CRITICAL-PATHS.md`

**Run:**
```bash
apify call apx-toolkit --input-file=test-scenarios/dependency-graph-test.json -t 600
```

**Verify:**
1. Check HTML graph opens in browser
2. Verify Mermaid diagram is valid
3. Check JSON contains nodes and edges
4. Verify critical paths are identified

---

### ✅ Test 7: x402 Integration
**File:** `test-scenarios/x402-test.json` (create if needed)

**What it tests:**
- Payment endpoint detection
- Payment client generation
- Payment handler generation

**Expected outputs:**
- `x402/x402-client.ts`
- `x402/x402-payment-handler.ts`
- `x402/x402-api-info.json`

**Run:**
```bash
apify call apx-toolkit --input-file=test-scenarios/x402-test.json -t 600
```

**Verify:**
1. Check payment client code is valid TypeScript
2. Verify payment handler code is valid
3. Check API info JSON is valid

---

## 🔍 Verification Steps

### Step 1: Check Run Status
After running a test, verify:
- ✅ Run status is "SUCCEEDED"
- ✅ No errors in logs
- ✅ APIs were discovered

### Step 2: Check Dataset
1. Go to Apify Console
2. Open the dataset from the run
3. Check for output items

### Step 3: Verify Output Files
Use the verification script:
```bash
# After downloading dataset to ./apx-output
node verify-outputs.js
```

### Step 4: Manual Verification
For each feature, manually check:
- Files exist
- Files are not empty
- Files have correct structure
- Files are valid (JSON, code, etc.)

---

## 🐛 Testing Edge Cases

### Test Invalid URLs
```json
{
  "startUrls": [{"url": "https://invalid-domain-that-does-not-exist.com"}]
}
```
**Expected:** Graceful error handling, no crash

### Test Empty Input
```json
{
  "startUrls": []
}
```
**Expected:** Validation error, clear message

### Test Large Responses
```json
{
  "startUrls": [{"url": "https://api.example.com/large-endpoint"}],
  "maxPages": 100
}
```
**Expected:** Handles large responses efficiently

### Test Network Errors
Test with endpoints that timeout or fail.
**Expected:** Continues with other APIs, logs errors

---

## 📊 Test Results Template

For each test, record:

```markdown
## Test: [Feature Name]
- **Date:** [Date]
- **Run ID:** [Run ID]
- **Status:** PASS/FAIL/PARTIAL
- **Duration:** [Time]
- **APIs Discovered:** [Count]
- **Outputs Generated:** [List]
- **Issues Found:** [List]
- **Notes:** [Notes]
```

---

## 🚀 Quick Test Commands

### Run All Tests
```bash
./test-comprehensive.sh
```

### Run Individual Test
```bash
apify call apx-toolkit --input-file=test-scenarios/[test-name].json -t 600
```

### Check Run Status
```bash
apify run [RUN_ID] --status-only
```

### Download Dataset
```bash
apify dataset get [DATASET_ID] --output-dir=./apx-output
```

### Verify Outputs
```bash
node verify-outputs.js
```

---

## ✅ Success Criteria

A test passes if:
1. ✅ Run completes successfully (SUCCEEDED)
2. ✅ APIs are discovered
3. ✅ Expected output files are generated
4. ✅ Output files are valid
5. ✅ No errors in logs
6. ✅ Features work as expected

---

**Ready to test!** 🧪

