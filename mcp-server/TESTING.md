# 🧪 MCP Server Testing Guide

## 🎯 Testing Options

### 1. **Manual Testing with MCP Client**
### 2. **Automated Test Scripts**
### 3. **Integration Testing**
### 4. **AI Assistant Testing**

---

## 🚀 Quick Start Testing

### Option 1: Test with MCP Inspector (Recommended)

The easiest way to test is using the MCP Inspector tool.

#### Install MCP Inspector:
```bash
npm install -g @modelcontextprotocol/inspector
```

#### Run Inspector:
```bash
mcp-inspector node dist/server.js
```

This will:
- Start the MCP server
- Open a web interface
- Let you test all tools interactively

---

### Option 2: Test with Node.js Script

Create a simple test script:

```bash
node test-mcp.js
```

---

## 📝 Manual Testing Steps

### 1. Start the Server

```bash
cd mcp-server
npm start
```

The server runs on stdio and waits for MCP requests.

### 2. Test Individual Tools

You can test tools by sending MCP requests. Here's how:

#### Test `generate_code` Tool:

Send this JSON via stdin:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "generate_code",
    "arguments": {
      "apiUrl": "https://api.example.com/users",
      "method": "GET",
      "language": "python"
    }
  }
}
```

Expected response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "# Generated Python code..."
      }
    ]
  }
}
```

---

## 🛠️ Automated Test Script

### Create Test Script

```bash
node test-tools.js
```

This will test all tools automatically.

---

## 🧪 Test Each Tool

### 1. Test `generate_code`

**Test Case:**
- Input: Python code for GET request
- Expected: Valid Python code snippet

**Command:**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_code","arguments":{"apiUrl":"https://api.example.com/users","method":"GET","language":"python"}}}' | node dist/server.js
```

### 2. Test `generate_typescript_types`

**Test Case:**
- Input: TypeScript types for an API
- Expected: Valid TypeScript declaration file

### 3. Test `generate_test_suite`

**Test Case:**
- Input: Jest test suite
- Expected: Valid Jest test file

### 4. Test `generate_sdk_package`

**Test Case:**
- Input: TypeScript SDK
- Expected: Complete SDK package structure

### 5. Test `generate_documentation`

**Test Case:**
- Input: OpenAPI format
- Expected: Valid OpenAPI 3.0 spec

---

## 🔍 Integration Testing

### Test with Real API Toolkit Functions

The MCP server should integrate with your existing codebase:

1. **Test Code Generation:**
   - Verify it uses `generateCodeSnippets`
   - Check output format
   - Validate all languages

2. **Test Type Generation:**
   - Verify it uses `generateTypeScriptDeclarationFile`
   - Check type inference
   - Validate output

3. **Test Test Generation:**
   - Verify it uses `generateTestSuites`
   - Check all frameworks
   - Validate test structure

---

## 🤖 AI Assistant Testing

### Test with Claude Desktop

1. **Configure Claude Desktop:**
   - Add MCP server to config
   - Restart Claude Desktop

2. **Test in Conversation:**
   - Ask: "Generate Python code for GET https://api.example.com/users"
   - Verify Claude uses the tool
   - Check output quality

### Test with Other AI Assistants

Similar process for other MCP-compatible assistants.

---

## 📊 Test Checklist

### Basic Functionality:
- [ ] Server starts without errors
- [ ] List tools works
- [ ] All 7 tools are listed
- [ ] Tool schemas are valid

### Tool Testing:
- [ ] `generate_code` works for all languages
- [ ] `generate_typescript_types` works
- [ ] `generate_test_suite` works for all frameworks
- [ ] `generate_sdk_package` works for all languages
- [ ] `generate_documentation` works for all formats
- [ ] Error handling works
- [ ] Invalid inputs are rejected

### Integration:
- [ ] Connects to existing codebase
- [ ] Uses real generator functions
- [ ] Output is valid
- [ ] Performance is acceptable

---

## 🐛 Debugging

### Enable Debug Logging

Add to server.ts:
```typescript
console.error("Debug: Tool called:", name, args);
```

### Check Server Output

The server logs to stderr, so you can see:
```bash
node dist/server.js 2>&1 | tee server.log
```

---

## ✅ Success Criteria

### Server Works If:
1. ✅ Starts without errors
2. ✅ Lists all 7 tools
3. ✅ Tools return valid responses
4. ✅ Error handling works
5. ✅ Integration with codebase works

---

## 🚀 Next Steps After Testing

1. **Fix any issues** found during testing
2. **Optimize performance** if needed
3. **Add more test cases** for edge cases
4. **Document any limitations**
5. **Prepare for production use**

---

**Ready to test!** 🧪

