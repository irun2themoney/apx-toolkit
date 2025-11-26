# ⚡ Quick Testing Guide

## 🚀 Fastest Way to Test

### Option 1: Simple Test (Recommended First)

```bash
npm test
```

This tests one tool (`generate_code`) and shows you the output.

**What it does:**
- Starts the MCP server
- Sends a test request for Python code generation
- Shows you the response
- Verifies it works

---

### Option 2: Full Test Suite

```bash
npm run test:all
```

This tests all 7 tools automatically.

**What it does:**
- Tests all tools
- Shows pass/fail for each
- Gives you a summary

---

### Option 3: MCP Inspector (Best for Interactive Testing)

```bash
# Install inspector
npm install -g @modelcontextprotocol/inspector

# Run inspector
mcp-inspector node dist/server.js
```

This opens a web interface where you can:
- See all available tools
- Test each tool interactively
- See request/response in real-time
- Debug easily

---

## 📝 Manual Testing

### Start Server:
```bash
npm start
```

### Send Test Request:

Copy this JSON and paste it:
```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_code","arguments":{"apiUrl":"https://api.example.com/users","method":"GET","language":"python"}}}
```

Press Enter. You should see a response.

---

## ✅ What to Look For

### Success Indicators:
- ✅ Server starts without errors
- ✅ Tools are listed correctly
- ✅ Tools return valid responses
- ✅ Generated code is valid
- ✅ No errors in output

### Common Issues:
- ❌ "Cannot find module" - Run `npm run build` first
- ❌ "No response" - Check server is running
- ❌ "Invalid JSON" - Check request format

---

## 🎯 Test Checklist

- [ ] Server starts: `npm start`
- [ ] Simple test works: `npm test`
- [ ] All tools work: `npm run test:all`
- [ ] Inspector works: `mcp-inspector node dist/server.js`
- [ ] Integration with codebase works

---

## 🐛 Debugging

### See Server Logs:
```bash
npm start 2>&1 | tee server.log
```

### Test One Tool:
Edit `test-simple.js` to test different tools.

### Check Build:
```bash
npm run build
```

---

## 🚀 Next Steps

Once tests pass:
1. ✅ Test with AI assistant (Claude Desktop, etc.)
2. ✅ Test with real APIs
3. ✅ Test edge cases
4. ✅ Optimize if needed

---

**Ready to test!** 🧪

