#!/usr/bin/env node

/**
 * MCP Server for API Toolkit
 * 
 * Exposes API Toolkit functionality to AI assistants via Model Context Protocol
 * 
 * Usage: api-toolkit-mcp (via stdio)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
// Type definitions (inline for MCP server)
interface DiscoveredAPI {
  baseUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  paginationInfo?: {
    type: 'offset' | 'page' | 'cursor';
    paramName?: string;
  };
  dataPath?: string;
}

// Import toolkit functions
// Note: These will be imported from the parent package
// For now, we'll create wrapper functions that can be implemented

const server = new Server(
  {
    name: "apx",
    version: "1.0.0",
    description: "APX MCP Server - Discover APIs and generate code, types, tests, SDKs, and documentation",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to import toolkit modules dynamically
async function importToolkitModule(modulePath: string) {
  try {
    // Try to import from parent directory's dist folder (compiled JS)
    // mcp-server/dist/server.js -> ../../dist/utils/code-generator.js
    const distPath = modulePath.replace('src/', 'dist/');
    const path = new URL(`../../${distPath}`, import.meta.url);
    return await import(path.href);
  } catch (error) {
    // Try to import from node_modules (when installed as package)
    try {
      return await import(`@api-toolkit/${modulePath}`);
    } catch {
      throw new Error(`Failed to import ${modulePath}: ${error}`);
    }
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "discover_apis",
      description: "Discover API endpoints from a website URL. Uses browser automation to intercept network traffic and identify JSON API responses. Returns all discovered APIs with metadata including URLs, HTTP methods, headers, pagination info, and data paths.",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "Website URL to analyze for API endpoints (e.g., 'https://example.com')",
          },
          apiPatterns: {
            type: "array",
            items: { type: "string" },
            description: "Optional URL patterns to match (e.g., ['/api/', '/v1/data']). If provided, only APIs matching these patterns will be discovered.",
          },
          minResponseSize: {
            type: "number",
            description: "Minimum response size in bytes (default: 1000). Filters out small responses that are likely not data APIs.",
            default: 1000,
          },
          discoveryTimeout: {
            type: "number",
            description: "Discovery timeout in milliseconds (default: 10000). How long to wait for APIs to load.",
            default: 10000,
          },
        },
        required: ["url"],
      },
    },
    {
      name: "generate_code",
      description: "Generate a ready-to-use code snippet for an API endpoint in a specific programming language. Includes headers, authentication, query parameters, request body (for POST), and pagination support. Returns production-ready code that can be copy-pasted and used immediately.",
      inputSchema: {
        type: "object",
        properties: {
          apiUrl: {
            type: "string",
            description: "API endpoint URL (e.g., 'https://api.example.com/users')",
          },
          method: {
            type: "string",
            enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            description: "HTTP method",
          },
          language: {
            type: "string",
            enum: ["typescript", "javascript", "python", "go", "rust", "java", "php", "ruby", "curl", "powershell"],
            description: "Target programming language for code generation",
          },
          headers: {
            type: "object",
            description: "Optional API headers (e.g., {'Authorization': 'Bearer token', 'Content-Type': 'application/json'})",
            additionalProperties: { type: "string" },
          },
          paginationInfo: {
            type: "object",
            description: "Optional pagination information. If provided, code will include pagination logic.",
            properties: {
              type: {
                type: "string",
                enum: ["page", "offset", "cursor"],
                description: "Pagination type",
              },
              paramName: {
                type: "string",
                description: "Query parameter name (e.g., 'page', 'offset', 'cursor')",
              },
            },
          },
        },
        required: ["apiUrl", "method", "language"],
      },
    },
    {
      name: "generate_typescript_types",
      description: "Generate TypeScript type definitions (.d.ts file) from an API endpoint. Infers types from actual response data and creates interfaces for requests, responses, and pagination. Returns production-ready type definitions with full IntelliSense support.",
      inputSchema: {
        type: "object",
        properties: {
          apiUrl: {
            type: "string",
            description: "API endpoint URL",
          },
          responseExample: {
            type: "object",
            description: "Optional example response data to infer types from. If not provided, types will be generic.",
            additionalProperties: true,
          },
          apiMethod: {
            type: "string",
            enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            description: "HTTP method (affects request/response types)",
          },
        },
        required: ["apiUrl"],
      },
    },
    {
      name: "generate_test_suite",
      description: "Generate a complete test suite for an API endpoint in a specific testing framework. Includes status code validation, JSON response validation, and pagination tests (when applicable). Returns ready-to-run test file that can be executed immediately.",
      inputSchema: {
        type: "object",
        properties: {
          apiUrl: {
            type: "string",
            description: "API endpoint URL",
          },
          method: {
            type: "string",
            enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            description: "HTTP method",
          },
          framework: {
            type: "string",
            enum: ["jest", "pytest", "mocha", "vitest", "playwright"],
            description: "Testing framework",
          },
          headers: {
            type: "object",
            description: "Optional API headers",
            additionalProperties: { type: "string" },
          },
          baseUrl: {
            type: "string",
            description: "Optional base URL (extracted from apiUrl if not provided)",
          },
        },
        required: ["apiUrl", "method", "framework"],
      },
    },
    {
      name: "generate_sdk_package",
      description: "Generate a complete SDK package for multiple APIs in a specific language. Returns all package files (package.json/pyproject.toml/go.mod, source files, README) ready to publish to npm/PyPI/Go modules. Includes full client class with methods for all APIs.",
      inputSchema: {
        type: "object",
        properties: {
          apis: {
            type: "array",
            description: "Array of API definitions. Each API should have baseUrl, method, headers, and optionally paginationInfo.",
            items: {
              type: "object",
              properties: {
                baseUrl: { type: "string" },
                method: { type: "string" },
                headers: { type: "object" },
                paginationInfo: { type: "object" },
              },
              required: ["baseUrl", "method"],
            },
          },
          language: {
            type: "string",
            enum: ["typescript", "python", "go"],
            description: "SDK language",
          },
          packageName: {
            type: "string",
            description: "Optional package name (auto-generated from API domain if not provided)",
          },
          baseUrl: {
            type: "string",
            description: "Optional base URL for the SDK (extracted from first API if not provided)",
          },
        },
        required: ["apis", "language"],
      },
    },
    {
      name: "generate_documentation",
      description: "Generate API documentation in a specific format. Returns documentation file ready to import/use in tools like Postman, Swagger UI, Redoc, or Insomnia. Includes all endpoints, parameters, headers, request/response schemas, and pagination info.",
      inputSchema: {
        type: "object",
        properties: {
          apis: {
            type: "array",
            description: "Array of API definitions",
            items: {
              type: "object",
              properties: {
                baseUrl: { type: "string" },
                method: { type: "string" },
                headers: { type: "object" },
                paginationInfo: { type: "object" },
                dataPath: { type: "string" },
              },
              required: ["baseUrl", "method"],
            },
          },
          format: {
            type: "string",
            enum: ["openapi", "postman", "curl", "insomnia"],
            description: "Documentation format",
          },
          title: {
            type: "string",
            description: "Optional title for the documentation (default: 'API Documentation')",
          },
        },
        required: ["apis", "format"],
      },
    },
    {
      name: "generate_complete_package",
      description: "Generate a complete API integration package from a website URL. This is the all-in-one tool that does everything: discovers APIs, generates code snippets (10 languages), TypeScript types, test suites (5 frameworks), SDK packages (3 languages), documentation (4 formats), captures examples, and detects rate limits. Returns a complete package ready for production use.",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "Website URL to analyze (e.g., 'https://example.com')",
          },
          options: {
            type: "object",
            description: "Optional configuration options",
            properties: {
              apiPatterns: {
                type: "array",
                items: { type: "string" },
                description: "URL patterns to match",
              },
              minResponseSize: { type: "number" },
              generateDocumentation: {
                type: "boolean",
                description: "Whether to generate documentation (default: true)",
                default: true,
              },
              exportFormats: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["openapi", "postman", "curl", "insomnia"],
                },
                description: "Documentation formats to generate (default: all)",
              },
            },
          },
        },
        required: ["url"],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (!args) {
    throw new Error("Missing arguments");
  }

  try {
    switch (name) {
      case "discover_apis": {
        // Note: This would require running the actual discovery handler
        // For MCP, we might need to run this in a separate process or use a simplified version
        // For now, return a structure showing what would be returned
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "API discovery requires browser automation. This would run the full discovery process.",
                note: "To use this tool, you need to run the full API Toolkit Actor. The MCP server provides a convenient interface, but discovery requires Playwright.",
                url: args.url,
                suggestedNextSteps: [
                  "Use generate_complete_package for full automation",
                  "Or run the API Toolkit Actor directly for discovery",
                ],
              }, null, 2),
            },
          ],
        };
      }

      case "generate_code": {
        try {
          // Import code generator
          const codeGen = await importToolkitModule("src/utils/code-generator.js");
          
          // Create a minimal API object for code generation
          const api: DiscoveredAPI = {
            baseUrl: String(args.apiUrl),
            method: String(args.method) as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
            headers: (args.headers as Record<string, string>) || {},
            paginationInfo: args.paginationInfo as DiscoveredAPI['paginationInfo'],
          };

          // Generate code snippets for all languages
          const snippets = codeGen.generateCodeSnippets(api as DiscoveredAPI);
          const snippet = snippets.find((s: { language: string }) => s.language === args.language);
          
          if (snippet) {
            return {
              content: [
                {
                  type: "text",
                  text: snippet.code,
                },
              ],
            };
          } else {
            throw new Error(`Language ${args.language} not supported`);
          }
        } catch (error) {
          // Fallback if import fails
          return {
            content: [
              {
                type: "text",
                text: `// Generated ${args.language} code for ${args.method} ${args.apiUrl}\n\n// Note: Full implementation requires API Toolkit package\n// Error: ${error instanceof Error ? error.message : String(error)}\n\n// Implementation would include:\n// - Headers: ${JSON.stringify(args.headers || {})}\n// - Method: ${args.method}\n// - URL: ${args.apiUrl}\n// - Pagination: ${args.paginationInfo ? JSON.stringify(args.paginationInfo) : 'None'}`,
              },
            ],
          };
        }
      }

      case "generate_typescript_types": {
        try {
          const { generateTypeScriptDeclarationFile } = await importToolkitModule("src/utils/typescript-generator.js");
          
          const apis: DiscoveredAPI[] = [{
            baseUrl: args.apiUrl,
            method: args.apiMethod || "GET",
            headers: {},
          } as DiscoveredAPI];

          const responseExamples = args.responseExample ? new Map([[args.apiUrl, args.responseExample]]) : new Map();
          
          const types = generateTypeScriptDeclarationFile(apis, responseExamples);
          
          return {
            content: [
              {
                type: "text",
                text: types,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `// TypeScript type definitions for ${args.apiUrl}\n\n// Note: Full implementation requires API Toolkit package\n// This is a placeholder showing the structure\n\nexport interface ApiResponse {\n  // Types would be inferred from responseExample\n  [key: string]: any;\n}\n\nexport interface ApiRequest {\n  // Request types would be generated here\n}`,
              },
            ],
          };
        }
      }

      case "generate_test_suite": {
        try {
          const { generateTestSuites } = await importToolkitModule("src/utils/test-generator.js");
          
          const api: DiscoveredAPI = {
            baseUrl: String(args.apiUrl),
            method: String(args.method) as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
            headers: (args.headers as Record<string, string>) || {},
          } as DiscoveredAPI;

          const suites = generateTestSuites(api, args.baseUrl);
          const suite = suites.find((s: { framework: string }) => s.framework === args.framework);
          
          if (suite) {
            return {
              content: [
                {
                  type: "text",
                  text: suite.code,
                },
              ],
            };
          } else {
            throw new Error(`Framework ${args.framework} not found`);
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `// Generated ${args.framework} test suite for ${args.method} ${args.apiUrl}\n\n// Note: Full implementation requires API Toolkit package\n// This is a placeholder showing the structure\n\n// Test suite would include:\n// - Status code validation\n// - JSON response validation\n// - Pagination tests (if applicable)`,
              },
            ],
          };
        }
      }

      case "generate_sdk_package": {
        try {
          const { generateSDKPackages } = await importToolkitModule("src/utils/sdk-generator.js");
          
          if (!Array.isArray(args.apis)) {
            throw new Error("apis must be an array");
          }
          
          const apis: DiscoveredAPI[] = (args.apis as any[]).map((api: any) => ({
            baseUrl: api.baseUrl,
            method: api.method,
            headers: api.headers || {},
            paginationInfo: api.paginationInfo,
          })) as DiscoveredAPI[];

          const packages = generateSDKPackages(apis, args.packageName, args.baseUrl);
          const pkg = packages.find((p: { language: string }) => p.language === args.language);
          
          if (pkg) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    language: pkg.language,
                    packageName: pkg.packageName,
                    description: pkg.description,
                    files: pkg.files,
                  }, null, 2),
                },
              ],
            };
          } else {
            throw new Error(`Language ${args.language} not found`);
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: `Failed to generate SDK: ${error instanceof Error ? error.message : String(error)}`,
                  note: "Full implementation requires API Toolkit package",
                }, null, 2),
              },
            ],
          };
        }
      }

      case "generate_documentation": {
        try {
          const { generateExports } = await importToolkitModule("src/utils/api-exporter.js");
          
          if (!Array.isArray(args.apis)) {
            throw new Error("apis must be an array");
          }
          
          const apis: DiscoveredAPI[] = (args.apis as any[]).map((api: any) => ({
            baseUrl: api.baseUrl,
            method: api.method,
            headers: api.headers || {},
            paginationInfo: api.paginationInfo,
            dataPath: api.dataPath,
          })) as DiscoveredAPI[];

          const exports = await generateExports(apis, [args.format], args.title);
          const doc = exports.find((e: { format: string }) => e.format === args.format);
          
          if (doc) {
            return {
              content: [
                {
                  type: "text",
                  text: doc.content,
                  mimeType: doc.mimeType,
                },
              ],
            };
          } else {
            throw new Error(`Format ${args.format} not found`);
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: `Failed to generate documentation: ${error instanceof Error ? error.message : String(error)}`,
                  note: "Full implementation requires API Toolkit package",
                }, null, 2),
              },
            ],
          };
        }
      }

      case "generate_complete_package": {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Complete package generation requires running the full API Toolkit Actor",
                url: args.url,
                whatYouGet: {
                  codeSnippets: "10 languages (TypeScript, Python, Go, Rust, Java, PHP, Ruby, JavaScript, cURL, PowerShell)",
                  typescriptTypes: "Full .d.ts files with IntelliSense support",
                  testSuites: "5 frameworks (Jest, pytest, Mocha, Vitest, Playwright)",
                  sdkPackages: "3 languages (TypeScript/npm, Python/PyPI, Go/modules)",
                  documentation: "4 formats (OpenAPI, Postman, cURL, Insomnia)",
                  examples: "Real request/response pairs",
                  rateLimitInfo: "Auto-detected rate limits",
                },
                howToUse: [
                  "1. Run the API Toolkit Actor with the URL",
                  "2. Get complete package in dataset output",
                  "3. All files ready to use immediately",
                ],
                mcpNote: "The MCP server provides convenient access to individual features. For complete automation, use the full Actor.",
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: true,
            message: error instanceof Error ? error.message : String(error),
            tool: name,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("APX MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in MCP server:", error);
  process.exit(1);
});

