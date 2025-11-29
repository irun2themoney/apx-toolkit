# 📁 APX Toolkit - Project Structure

**Clean, organized project structure**

---

## 📂 Directory Structure

```
apx-toolkit/
├── .actor/                    # Apify Actor configuration
│   ├── actor.json            # Actor metadata and input schema
│   ├── dataset_schema.json   # Dataset schema with views
│   └── output_schema.json    # Output schema
│
├── src/                      # Source code
│   ├── main.ts               # Apify Actor entry point
│   ├── cli.ts                # CLI tool entry point
│   ├── core-runner.ts        # Core execution logic
│   ├── types.ts               # TypeScript type definitions
│   ├── handlers/             # Request handlers
│   │   ├── discovery-handler.ts
│   │   └── api-handler.ts
│   └── utils/                # Utility modules
│       ├── api-detector.ts
│       ├── code-generator.ts
│       ├── sdk-generator.ts
│       ├── security-audit.ts      # NEW
│       ├── change-detector.ts     # NEW
│       ├── progress-tracker.ts     # NEW
│       ├── github-actions-generator.ts  # NEW
│       ├── git-integration.ts     # NEW
│       ├── docs-generator.ts      # NEW
│       └── output-generator.ts    # NEW
│
├── docs/                      # Documentation
│   ├── GETTING-STARTED.md    # Start here!
│   ├── USER-GUIDE.md         # Complete user guide
│   ├── DEVELOPER-GUIDE.md    # Developer documentation
│   ├── CLI.md                # CLI documentation
│   ├── TEST-RUN-GUIDE.md     # Testing guide
│   ├── MONETIZATION-TIERED-PRICING.md
│   └── README.md             # Documentation index
│
├── test-scenarios/            # Test configurations
│   ├── simple-api.json
│   ├── multiple-apis.json
│   └── full-features.json
│
├── scripts/                   # Utility scripts
│   └── research-competitors.js
│
├── vscode-extension/          # VS Code extension
│   ├── package.json
│   ├── src/extension.ts
│   └── README.md
│
├── web-ui/                    # Interactive API explorer
│   └── index.html
│
├── dist/                      # Build output (generated)
├── storage/                   # Local storage (generated)
│
├── README.md                  # Main README
├── package.json               # npm package config
├── tsconfig.json              # TypeScript config
├── Dockerfile                 # Docker configuration
└── .gitignore                 # Git ignore rules
```

---

## 📄 Key Files

### Configuration
- **`package.json`** - npm package configuration
- **`tsconfig.json`** - TypeScript compiler config
- **`.actor/actor.json`** - Apify Actor configuration
- **`Dockerfile`** - Docker build configuration

### Documentation
- **`README.md`** - Main project README
- **`docs/GETTING-STARTED.md`** - User getting started guide
- **`docs/USER-GUIDE.md`** - Complete user documentation
- **`docs/DEVELOPER-GUIDE.md`** - Developer documentation

### Source Code
- **`src/main.ts`** - Apify Actor entry point
- **`src/cli.ts`** - CLI tool entry point
- **`src/core-runner.ts`** - Core execution logic
- **`src/handlers/`** - Request handlers
- **`src/utils/`** - Utility modules

### Extensions
- **`vscode-extension/`** - VS Code extension
- **`web-ui/`** - Interactive API explorer

---

## 🎯 File Purposes

### Core Files (Don't Delete)
- All files in `src/`
- `package.json`, `tsconfig.json`
- `.actor/actor.json`, `.actor/dataset_schema.json`
- `Dockerfile`, `.gitignore`
- `README.md`
- `docs/GETTING-STARTED.md`, `docs/USER-GUIDE.md`, `docs/DEVELOPER-GUIDE.md`
- `test-scenarios/`

### Generated Files (Auto-created)
- `dist/` - Build output
- `storage/` - Local storage
- `node_modules/` - Dependencies

### Optional Files (Can Delete)
- Temporary status files
- Duplicate documentation
- Old test files

---

## 📦 Package Contents

### npm Package
- Source code (`src/`)
- Built files (`dist/`)
- Type definitions (`.d.ts`)
- Documentation (`docs/`)
- Configuration files

### Apify Actor
- Source code
- Configuration (`.actor/`)
- Dockerfile
- README

---

**Clean, organized, and ready for production!** ✨
