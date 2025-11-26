# APX CLI - Command Line Interface

The APX CLI allows you to run APX locally without the Apify platform, making it perfect for integration into your development workflow.

## Installation

### Global Installation

```bash
npm install -g @apx/toolkit
```

After installation, the `apx` command will be available globally.

### Local Installation

```bash
npm install @apx/toolkit
npx apx --help
```

## Usage

### Basic Usage

```bash
apx --url https://api.example.com
```

This will:
- Discover APIs from the URL
- Generate all artifacts (code, types, tests, SDKs, docs)
- Save everything to `./apx-output` directory

### Custom Output Directory

```bash
apx --url https://api.example.com --output ./my-api-files
```

### With Authentication

```bash
# API Key
apx --url https://api.example.com --api-key YOUR_API_KEY

# Bearer Token
apx --url https://api.example.com --bearer-token YOUR_TOKEN

# OAuth Flow
apx --url https://api.example.com --login-url https://api.example.com/login --oauth-flow
```

### Advanced Options

```bash
apx \
  --url https://api.example.com \
  --max-pages 50 \
  --max-concurrency 10 \
  --discovery-timeout 20000 \
  --export-formats openapi,postman,curl \
  --output ./output
```

## Command Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--url` | `-u` | Starting URL for API discovery | Required |
| `--output` | `-o` | Output directory | `./apx-output` |
| `--login-url` | | OAuth login URL | - |
| `--api-key` | | API key for authentication | - |
| `--bearer-token` | | Bearer token for authentication | - |
| `--max-pages` | | Maximum pages to scrape | 100 |
| `--max-concurrency` | | Max concurrent requests | 5 |
| `--discovery-timeout` | | Discovery timeout (ms) | 10000 |
| `--min-response-size` | | Minimum response size (bytes) | 1000 |
| `--api-patterns` | | Comma-separated URL patterns | - |
| `--data-path` | | JSONPath to extract data | - |
| `--pagination-type` | | Pagination type (auto/offset/page/cursor) | auto |
| `--export-formats` | | Comma-separated formats | openapi,postman,curl |
| `--generate-docs` | | Generate documentation | true |
| `--interaction-simulation` | | Enable interaction simulation | true |
| `--interaction-wait-time` | | Wait time after interactions (ms) | 2000 |
| `--oauth-flow` | | Enable OAuth flow | false |

## Output Structure

After running, the output directory will contain:

```
apx-output/
├── code-snippets/          # Code snippets for each API
│   └── api_name.json
├── types.d.ts              # TypeScript type definitions
├── test-suites/            # Test suites (Jest, pytest, etc.)
│   ├── api.test.js
│   └── api_test.py
├── sdk-packages/           # SDK packages (TypeScript, Python, Go)
│   ├── typescript-sdk/
│   ├── python-sdk/
│   └── go-sdk/
├── documentation/          # API documentation
│   ├── api-spec.json       # OpenAPI
│   ├── postman-collection.json
│   └── curl-commands.sh
├── examples.json           # Request/response examples
├── data.json              # Extracted data items
└── summary.json           # Execution summary and statistics
```

## Examples

### Discover GitHub API

```bash
apx --url https://api.github.com --output ./github-api
```

### Discover with OAuth

```bash
apx \
  --url https://api.example.com \
  --login-url https://api.example.com/login \
  --oauth-flow \
  --output ./authenticated-api
```

### Quick Discovery (Minimal Output)

```bash
apx \
  --url https://api.example.com \
  --max-pages 10 \
  --export-formats openapi \
  --output ./quick-output
```

## Integration Examples

### CI/CD Pipeline

```yaml
# .github/workflows/discover-api.yml
- name: Discover API
  run: |
    npm install -g @apx/toolkit
    apx --url ${{ secrets.API_URL }} --output ./api-artifacts
```

### npm Script

```json
{
  "scripts": {
    "discover-api": "apx --url https://api.example.com --output ./api"
  }
}
```

### Makefile

```makefile
discover:
	apx --url $(API_URL) --output ./api-artifacts
```

## Troubleshooting

### No APIs Discovered

- Try enabling interaction simulation: `--interaction-simulation true`
- Increase discovery timeout: `--discovery-timeout 20000`
- Check if the site requires authentication

### Authentication Errors

- Use `--api-key` or `--bearer-token` for simple auth
- Use `--login-url` and `--oauth-flow` for OAuth 2.0

### Performance Issues

- Reduce `--max-concurrency` if hitting rate limits
- Reduce `--max-pages` for faster runs

## Help

```bash
apx --help
```

## Version

```bash
apx --version
```

---

**Note:** The CLI uses the same core engine as the Apify Actor, so you get identical results whether running locally or on Apify platform.

