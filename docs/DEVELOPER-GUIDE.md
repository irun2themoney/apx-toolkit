# 👨‍💻 APX Toolkit - Developer Guide

**Complete guide for developers working with APX Toolkit**

---

## Table of Contents

1. [Architecture](#architecture)
2. [Code Structure](#code-structure)
3. [Adding Features](#adding-features)
4. [Testing](#testing)
5. [Building](#building)
6. [Contributing](#contributing)

---

## Architecture

### Core Components

```
src/
├── main.ts              # Apify Actor entry point
├── cli.ts               # CLI tool entry point
├── core-runner.ts       # Core execution logic (decoupled)
├── types.ts             # TypeScript type definitions
├── handlers/
│   ├── discovery-handler.ts    # API discovery logic
│   └── api-handler.ts          # API processing logic
└── utils/
    ├── api-detector.ts         # API detection
    ├── code-generator.ts       # Code generation
    ├── sdk-generator.ts        # SDK generation
    ├── test-generator.ts       # Test generation
    ├── security-audit.ts       # Security auditing (NEW)
    ├── change-detector.ts      # Change detection (NEW)
    ├── progress-tracker.ts     # Progress tracking (NEW)
    ├── github-actions-generator.ts  # GitHub Actions (NEW)
    ├── git-integration.ts      # Git automation (NEW)
    ├── docs-generator.ts       # Enhanced docs (NEW)
    └── output-generator.ts     # Unified output (NEW)
```

### Execution Flow

1. **Discovery Phase** (PlaywrightCrawler)
   - Load pages
   - Intercept network traffic
   - Discover APIs (REST, GraphQL, WebSocket)
   - Enqueue API processing requests

2. **Processing Phase** (HttpCrawler)
   - Process discovered APIs
   - Extract data
   - Handle pagination
   - Generate artifacts

3. **Generation Phase**
   - Generate code snippets
   - Create documentation
   - Build SDK packages
   - Generate test suites
   - Create enhanced outputs (NEW)

---

## Code Structure

### Core Runner (`src/core-runner.ts`)

Decoupled execution logic that works:
- ✅ In Apify Actor environment
- ✅ In CLI tool
- ✅ In test scripts
- ✅ In any Node.js environment

**Key Features:**
- Accepts native TypeScript objects
- Uses Crawlee's local storage
- Returns structured results
- Progress tracking support

### Handlers

#### Discovery Handler (`src/handlers/discovery-handler.ts`)

**Responsibilities:**
- Load pages with Playwright
- Intercept network traffic
- Detect APIs (REST, GraphQL, WebSocket)
- Handle OAuth flows
- Simulate interactions for SPAs

#### API Handler (`src/handlers/api-handler.ts`)

**Responsibilities:**
- Process API requests
- Extract data from responses
- Handle pagination
- Generate code snippets
- Create documentation
- Build SDK packages

### Utilities

#### New Utilities (Developer Experience)

- **`progress-tracker.ts`**: Structured progress events
- **`github-actions-generator.ts`**: CI/CD workflow generation
- **`git-integration.ts`**: Git automation
- **`security-audit.ts`**: Security analysis
- **`change-detector.ts`**: API change tracking
- **`docs-generator.ts`**: Enhanced documentation
- **`output-generator.ts`**: Unified output interface

---

## Adding Features

### Adding a New Code Language

1. **Update `code-generator.ts`:**
   ```typescript
   export type CodeLanguage = 
       | 'typescript'
       | 'javascript'
       | 'your-language';  // Add here
   ```

2. **Add generator function:**
   ```typescript
   function generateYourLanguageSnippet(api: DiscoveredAPI): CodeSnippet {
       return {
           language: 'your-language',
           code: '...',
           description: '...',
       };
   }
   ```

3. **Add to generation logic:**
   ```typescript
   snippets.push(generateYourLanguageSnippet(api));
   ```

### Adding a New Output Format

1. **Update `api-exporter.ts`:**
   ```typescript
   export type ExportFormat = 
       | 'openapi'
       | 'postman'
       | 'your-format';  // Add here
   ```

2. **Add exporter function:**
   ```typescript
   function exportYourFormat(apis: DiscoveredAPI[]): APIExport {
       return {
           format: 'your-format',
           content: '...',
           filename: '...',
           mimeType: '...',
       };
   }
   ```

### Adding a New Utility

1. **Create file:** `src/utils/your-utility.ts`
2. **Export functions:**
   ```typescript
   export function yourFunction(): void {
       // Implementation
   }
   ```
3. **Import where needed:**
   ```typescript
   import { yourFunction } from './utils/your-utility.js';
   ```

---

## Testing

### Running Tests

```bash
# Build first
npm run build

# Run tests
npm test

# Run specific test
npm run test -- test-scenarios/simple-api.json
```

### Test Scenarios

Located in `test-scenarios/`:

- `simple-api.json` - Quick test
- `multiple-apis.json` - Multiple APIs
- `full-features.json` - All features

### Writing Tests

Create test input file:

```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "maxPages": 1
}
```

Run test:

```bash
apify call apx-toolkit --input-file=your-test.json
```

---

## Building

### Local Build

```bash
npm run build
```

Output: `dist/` directory

### Type Checking

```bash
npx tsc --noEmit
```

### Build Verification

```bash
npm run verify
```

---

## Contributing

### Development Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/irun2themoney/apx-toolkit.git
   cd apx-toolkit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Test:**
   ```bash
   npm test
   ```

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Add JSDoc comments
- Update types in `types.ts`

### Pull Request Process

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Update documentation
5. Submit PR

---

## Key Concepts

### DiscoveredAPI Interface

```typescript
interface DiscoveredAPI {
    url: string;
    baseUrl: string;
    method: 'GET' | 'POST';
    headers: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: unknown;
    paginationInfo?: PaginationInfo;
    rateLimitInfo?: RateLimitInfo;
    isGraphQL?: boolean;
    isWebSocket?: boolean;
}
```

### Progress Events

```typescript
interface ProgressEvent {
    type: 'discovery' | 'processing' | 'generation' | 'complete' | 'error';
    message: string;
    progress?: number;  // 0-100
    current?: string;
    total?: number;
    completed?: number;
    estimatedTimeRemaining?: number;
}
```

### Enhanced Outputs

```typescript
interface EnhancedOutputOptions {
    outputDir?: string;
    gitIntegration?: GitConfig;
    generateGitHubActions?: boolean;
    generateSecurityReport?: boolean;
    generateChangeReport?: boolean;
    generateDocs?: boolean;
}
```

---

## Extension Points

### Custom Code Generators

Extend `code-generator.ts` to add new languages or formats.

### Custom Export Formats

Extend `api-exporter.ts` to add new documentation formats.

### Custom Handlers

Add new handlers in `handlers/` directory.

---

## Resources

- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **Crawlee Docs:** https://crawlee.dev/
- **Apify Docs:** https://docs.apify.com/
- **Playwright Docs:** https://playwright.dev/

---

**Happy coding!** 💻

