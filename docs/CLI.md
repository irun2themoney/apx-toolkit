# 💻 APX Toolkit - CLI Documentation

**Command-line interface for APX Toolkit**

---

## Installation

```bash
npm install -g apx-toolkit
```

---

## Basic Usage

### Discover API from URL

```bash
apx --url https://api.example.com
```

### With Output Directory

```bash
apx --url https://api.example.com --output ./my-api
```

### With Options

```bash
apx \
  --url https://api.example.com \
  --max-pages 50 \
  --max-concurrency 10 \
  --export-formats openapi,postman,curl
```

---

## Command Options

### Required

| Option | Description | Example |
|--------|-------------|---------|
| `--url` | API URL to discover | `--url https://api.example.com` |

### Optional

| Option | Description | Default |
|--------|-------------|---------|
| `--output` | Output directory | `./apx-output` |
| `--max-pages` | Maximum pages to process | 100 |
| `--max-concurrency` | Concurrent requests | 5 |
| `--export-formats` | Comma-separated formats | `openapi,postman,curl` |
| `--generate-docs` | Generate documentation | true |
| `--interaction-simulation` | Enable interaction simulation | true |
| `--bearer-token` | Bearer token for auth | - |
| `--api-key` | API key for auth | - |
| `--oauth-flow` | Enable OAuth flow | false |
| `--login-url` | OAuth login URL | - |
| `--generate-github-actions` | Generate GitHub Actions | true |
| `--generate-security-report` | Generate security audit | true |
| `--generate-enhanced-docs` | Generate enhanced docs | true |
| `--enable-git-integration` | Auto-commit to git | false |

---

## Examples

### Quick Discovery

```bash
apx --url https://jsonplaceholder.typicode.com/posts --max-pages 1
```

### Full Features

```bash
apx \
  --url https://api.example.com \
  --max-pages 50 \
  --export-formats openapi,postman,curl,insomnia \
  --generate-security-report \
  --generate-github-actions \
  --enable-git-integration
```

### With Authentication

```bash
apx \
  --url https://api.example.com \
  --bearer-token "your-token-here"
```

### OAuth Flow

```bash
apx \
  --url https://api.example.com \
  --login-url https://api.example.com/login \
  --oauth-flow
```

---

## Output Structure

After running, output directory contains:

```
apx-output/
├── code-snippets/          # Code in 12 languages
├── types.d.ts              # TypeScript types
├── test-suites/            # Test suites
├── sdk-packages/           # SDK packages
├── documentation/          # API documentation
├── examples.json           # Request/response examples
├── data.json              # Extracted data
├── summary.json           # Execution summary
├── .github/
│   └── workflows/
│       └── apx-discovery.yml  # GitHub Actions (NEW)
├── SECURITY-AUDIT.md       # Security report (NEW)
├── API.md                  # Enhanced docs (NEW)
└── README.md               # Package README (NEW)
```

---

## Integration

### npm Scripts

```json
{
  "scripts": {
    "discover-api": "apx --url $API_URL --output ./api-artifacts"
  }
}
```

### CI/CD

```yaml
- name: Discover API
  run: |
    npm install -g apx-toolkit
    apx --url ${{ secrets.API_URL }} --output ./api-artifacts
```

---

## Troubleshooting

### Command Not Found

```bash
# Make sure apx-toolkit is installed globally
npm install -g apx-toolkit

# Verify installation
apx --version
```

### Permission Errors

```bash
# Use sudo (Linux/Mac)
sudo npm install -g apx-toolkit

# Or use npx
npx apx-toolkit --url https://api.example.com
```

---

## Advanced Usage

### Using Input File

```bash
apx --input-file config.json
```

**config.json:**
```json
{
  "startUrls": [{"url": "https://api.example.com"}],
  "maxPages": 50,
  "generateDocumentation": true
}
```

---

## See Also

- **[User Guide](USER-GUIDE.md)** - Complete feature documentation
- **[Getting Started](GETTING-STARTED.md)** - Quick start guide
- **[Developer Guide](DEVELOPER-GUIDE.md)** - Development documentation

---

**Happy CLI usage!** 💻
