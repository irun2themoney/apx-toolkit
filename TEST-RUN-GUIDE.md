# 🚀 Test Run Guide - APX Toolkit Actor

## ✅ Actor Successfully Deployed!

**Actor URL:** https://console.apify.com/actors/2eXbQISXqhTnIxWNJ  
**Status:** ✅ Built and Ready

---

## 🧪 How to Create a Test Run

### Option 1: Via Apify Console (Recommended)

1. **Go to your Actor:**
   - Visit: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
   - Or search for "apx-toolkit" in the Apify Console

2. **Click "Start" button** (top right)

3. **Configure Input:**
   Use this test input:
   ```json
   {
     "startUrls": [
       {
         "url": "https://jsonplaceholder.typicode.com/posts"
       }
     ],
     "maxPages": 1,
     "maxConcurrency": 2,
     "generateDocumentation": true,
     "exportFormats": ["openapi", "postman", "curl"],
     "enableInteractionSimulation": false
   }
   ```

4. **Click "Start"** to begin the run

5. **Monitor Execution:**
   - Watch logs in real-time
   - See progress as it discovers APIs
   - Check the dataset for results

### Option 2: Via Apify CLI

```bash
# Create a test run
apify call apx-toolkit --input=test-apify-run.json

# Or with inline input
apify call apx-toolkit --input='{"startUrls":[{"url":"https://jsonplaceholder.typicode.com/posts"}],"maxPages":1}'
```

---

## 📊 What to Expect

### During Execution:
1. **Discovery Phase:**
   - Actor navigates to start URLs
   - Monitors network traffic
   - Discovers API endpoints

2. **Processing Phase:**
   - Fetches data from discovered APIs
   - Extracts structured data
   - Generates code snippets
   - Creates documentation

3. **Output:**
   - Dataset with all discovered APIs
   - Generated code in 12 languages
   - API documentation (OpenAPI, Postman, cURL)
   - TypeScript type definitions
   - Test suites
   - SDK packages

### Expected Results:
- ✅ APIs discovered and documented
- ✅ Code snippets generated
- ✅ Documentation created
- ✅ Dataset populated with results

---

## 🔍 Monitoring Your Run

### In Apify Console:
1. **Logs Tab:**
   - Real-time execution logs
   - Progress updates
   - Any errors or warnings

2. **Dataset Tab:**
   - View all extracted data
   - See generated artifacts
   - Download results

3. **Statistics:**
   - APIs discovered count
   - Requests processed
   - Items extracted
   - Execution time

---

## 🎯 Test Scenarios

### Simple Test (Quick):
```json
{
  "startUrls": [{"url": "https://jsonplaceholder.typicode.com/posts"}],
  "maxPages": 1
}
```

### Full Test (Comprehensive):
```json
{
  "startUrls": [
    {"url": "https://jsonplaceholder.typicode.com/posts"},
    {"url": "https://jsonplaceholder.typicode.com/users"}
  ],
  "maxPages": 10,
  "maxConcurrency": 5,
  "generateDocumentation": true,
  "exportFormats": ["openapi", "postman", "curl", "insomnia"],
  "enableInteractionSimulation": true
}
```

### Real-World Test:
```json
{
  "startUrls": [{"url": "https://api.github.com"}],
  "apiPatterns": ["/api/"],
  "maxPages": 5,
  "authHeaders": {
    "Authorization": "Bearer YOUR_TOKEN"
  }
}
```

---

## ✅ Success Indicators

Your run is successful if you see:
- ✅ Run status: "SUCCEEDED"
- ✅ Dataset contains items
- ✅ Logs show "Execution completed successfully"
- ✅ Statistics show APIs discovered > 0
- ✅ Generated artifacts in dataset

---

## 🐛 Troubleshooting

### If Run Fails:
1. **Check Logs:**
   - Look for error messages
   - Check input validation errors

2. **Verify Input:**
   - Ensure startUrls are valid URLs
   - Check JSON syntax

3. **Common Issues:**
   - Invalid URLs → Use valid HTTP/HTTPS URLs
   - Timeout → Increase `discoveryTimeout`
   - No APIs found → Try different URLs or enable interaction simulation

---

## 📝 Next Steps After Successful Test

1. **Publish Actor:**
   - Go to Actor Settings
   - Set visibility to "Public"
   - Add description and tags
   - Click "Publish"

2. **Submit to Competition:**
   - Get Actor URL
   - Fill out competition form
   - Submit for evaluation

3. **Monitor Usage:**
   - Track runs
   - Monitor performance
   - Collect feedback

---

## 🎉 You're Ready!

Your Actor is:
- ✅ Built successfully
- ✅ Deployed to Apify
- ✅ Ready to test
- ✅ Ready to publish
- ✅ Ready to compete

**Go create your first test run and see the magic happen!** 🚀

