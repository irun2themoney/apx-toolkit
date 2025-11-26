# 🔌 APX MCP Server

**Make APX accessible to AI assistants via Model Context Protocol**

This MCP server exposes APX's functionality to AI assistants, allowing them to discover APIs, generate code, create test suites, build SDKs, and generate documentation.

---

## 🎯 What It Does

The MCP server provides 7 powerful tools:

1. **`discover_apis`** - Discover API endpoints from a website
2. **`generate_code`** - Generate code snippets in 10 languages
3. **`generate_typescript_types`** - Generate TypeScript type definitions
4. **`generate_test_suite`** - Generate test suites in 5 frameworks
5. **`generate_sdk_package`** - Generate complete SDK packages
6. **`generate_documentation`** - Generate API documentation in 4 formats
7. **`generate_complete_package`** - Generate everything at once

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- The API Toolkit package (parent directory)

### Install Dependencies

```bash
cd mcp-server
npm install
```

### Build

```bash
npm run build
```

---

## 💻 Usage

### As Standalone Server

```bash
npm start
```

The server runs on stdio and communicates via Model Context Protocol.

### With AI Assistants

Configure your AI assistant (Claude, ChatGPT, etc.) to use this MCP server:

```json
{
  "mcpServers": {
    "api-toolkit": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/server.js"]
    }
  }
}
```

---

## 🛠️ Available Tools

### 1. discover_apis

Discover API endpoints from a website URL.

**Input:**
```json
{
  "url": "https://example.com",
  "apiPatterns": ["/api/"],
  "minResponseSize": 1000
}
```

**Output:** Array of discovered APIs with metadata

---

### 2. generate_code

Generate code snippet in a specific language.

**Input:**
```json
{
  "apiUrl": "https://api.example.com/users",
  "method": "GET",
  "language": "python",
  "headers": {"Authorization": "Bearer token"}
}
```

**Output:** Ready-to-use code snippet

---

### 3. generate_typescript_types

Generate TypeScript type definitions.

**Input:**
```json
{
  "apiUrl": "https://api.example.com/users",
  "responseExample": {"id": 1, "name": "John"},
  "apiMethod": "GET"
}
```

**Output:** TypeScript `.d.ts` file content

---

### 4. generate_test_suite

Generate test suite in a specific framework.

**Input:**
```json
{
  "apiUrl": "https://api.example.com/users",
  "method": "GET",
  "framework": "jest",
  "headers": {}
}
```

**Output:** Complete test suite file

---

### 5. generate_sdk_package

Generate complete SDK package.

**Input:**
```json
{
  "apis": [
    {
      "baseUrl": "https://api.example.com/users",
      "method": "GET",
      "headers": {}
    }
  ],
  "language": "typescript",
  "packageName": "example-api-client"
}
```

**Output:** Complete SDK package files (package.json, source files, README)

---

### 6. generate_documentation

Generate API documentation in a specific format.

**Input:**
```json
{
  "apis": [
    {
      "baseUrl": "https://api.example.com/users",
      "method": "GET"
    }
  ],
  "format": "openapi",
  "title": "Example API"
}
```

**Output:** Documentation file (OpenAPI, Postman, cURL, or Insomnia)

---

### 7. generate_complete_package

Generate everything at once from a URL.

**Input:**
```json
{
  "url": "https://example.com",
  "options": {
    "generateDocumentation": true,
    "exportFormats": ["openapi", "postman"]
  }
}
```

**Output:** Complete package information

---

## 📦 Integration with API Toolkit

The MCP server uses APX's existing functions:

- `src/utils/code-generator.ts` - Code generation
- `src/utils/typescript-generator.ts` - Type definitions
- `src/utils/test-generator.ts` - Test suites
- `src/utils/sdk-generator.ts` - SDK packages
- `src/utils/api-exporter.ts` - Documentation

---

## 🔧 Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Test

Test the server by running it and sending MCP requests via stdio.

---

## 📝 Example Usage in AI Assistant

**User asks:**
> "Generate Python code for GET https://api.example.com/users"

**AI Assistant:**
1. Calls `generate_code` tool
2. Gets Python code snippet
3. Returns to user

**Result:** User gets ready-to-use Python code!

---

## 🎯 Benefits

### For AI Assistants:
- ✅ Access to powerful API toolkit
- ✅ Generate code, types, tests, SDKs
- ✅ Complete API integration packages

### For Users:
- ✅ Natural language interface
- ✅ Get everything they need
- ✅ Production-ready code

### For API Toolkit:
- ✅ Viral distribution
- ✅ AI ecosystem access
- ✅ Competitive advantage

---

## 📚 Documentation

For more information:
- [APX README](../README.md)
- [MCP Integration Plan](../MCP-INTEGRATION-PLAN.md)
- [Model Context Protocol](https://modelcontextprotocol.io)

---

## 🚀 Status

**MCP Server: ✅ IMPLEMENTED**

Ready to use with AI assistants!

---

**License:** MIT

