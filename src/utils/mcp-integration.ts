/**
 * Model Context Protocol (MCP) Integration
 * 
 * Enables APX to work with AI assistants via MCP protocol
 * Allows AI models to discover and interact with APIs
 */

import type { DiscoveredAPI } from '../types.js';

export interface MCPResource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}

export interface MCPTool {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
}

/**
 * Generate MCP server configuration for discovered APIs
 */
export function generateMCPServer(apis: DiscoveredAPI[]): {
    resources: MCPResource[];
    tools: MCPTool[];
    serverConfig: string;
} {
    const resources: MCPResource[] = apis.map((api, index) => ({
        uri: `apx://api/${index}`,
        name: `API: ${api.method} ${api.url}`,
        description: `Discovered API endpoint: ${api.method} ${api.url}`,
        mimeType: 'application/json',
    }));

    const tools: MCPTool[] = apis.map((api, index) => ({
        name: `call_api_${index}`,
        description: `Call API endpoint: ${api.method} ${api.url}`,
        inputSchema: {
            type: 'object',
            properties: {
                endpoint: {
                    type: 'string',
                    description: 'API endpoint URL',
                    default: api.url,
                },
                method: {
                    type: 'string',
                    enum: [api.method],
                    description: 'HTTP method',
                },
                headers: {
                    type: 'object',
                    description: 'Request headers',
                    default: api.headers || {},
                },
                body: {
                    type: 'object',
                    description: 'Request body (for POST/PUT)',
                },
            },
            required: ['endpoint', 'method'],
        },
    }));

    const serverConfig = generateMCPServerConfig(apis, resources, tools);

    return {
        resources,
        tools,
        serverConfig,
    };
}

/**
 * Generate MCP server configuration file
 */
function generateMCPServerConfig(
    apis: DiscoveredAPI[],
    resources: MCPResource[],
    tools: MCPTool[]
): string {
    return `// MCP Server Configuration for APX Toolkit
// Model Context Protocol integration

export const mcpServer = {
  name: 'apx-toolkit',
  version: '1.0.0',
  description: 'APX Toolkit MCP Server - API Discovery and Integration',
  
  resources: ${JSON.stringify(resources, null, 2)},
  
  tools: ${JSON.stringify(tools, null, 2)},
  
  // API endpoints discovered by APX
  apis: ${JSON.stringify(apis.map(api => ({
    url: api.url,
    method: api.method,
    description: `${api.method} endpoint discovered by APX`,
    headers: api.headers,
    exampleRequest: api.requestExample,
    exampleResponse: api.responseExample,
  })), null, 2)},
  
  // MCP protocol handlers
  handlers: {
    // List available APIs
    list_apis: () => {
      return apis.map(api => ({
        url: api.url,
        method: api.method,
        description: \`\${api.method} \${api.url}\`,
      }));
    },
    
    // Call an API endpoint
    call_api: async (endpoint: string, method: string, options: Record<string, unknown> = {}) => {
      const api = apis.find(a => a.url === endpoint && a.method === method);
      if (!api) {
        throw new Error(\`API not found: \${method} \${endpoint}\`);
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          ...api.headers,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.json(),
      };
    },
    
    // Get API documentation
    get_api_docs: (endpoint: string) => {
      const api = apis.find(a => a.url === endpoint);
      if (!api) {
        throw new Error(\`API not found: \${endpoint}\`);
      }
      
      return {
        url: api.url,
        method: api.method,
        headers: api.headers,
        requestExample: api.requestExample,
        responseExample: api.responseExample,
        documentation: \`API endpoint discovered by APX Toolkit\\n\\nMethod: \${api.method}\\nURL: \${api.url}\`,
      };
    },
  },
};

// Export for MCP client integration
export default mcpServer;
`;
}

/**
 * Generate MCP client integration code
 */
export function generateMCPClient(): string {
    return `// MCP Client for APX Toolkit
// Use this to connect AI assistants to APX-discovered APIs

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class APXMCPClient {
  private client: Client;
  
  constructor(serverPath: string) {
    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
    });
    
    this.client = new Client({
      name: 'apx-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });
    
    this.client.connect(transport);
  }
  
  async listAPIs() {
    return await this.client.callTool({
      name: 'list_apis',
      arguments: {},
    });
  }
  
  async callAPI(endpoint: string, method: string, options: Record<string, unknown> = {}) {
    return await this.client.callTool({
      name: 'call_api',
      arguments: {
        endpoint,
        method,
        ...options,
      },
    });
  }
  
  async getAPIDocs(endpoint: string) {
    return await this.client.callTool({
      name: 'get_api_docs',
      arguments: { endpoint },
    });
  }
}

// Usage example:
// const client = new APXMCPClient('./mcp-server.js');
// const apis = await client.listAPIs();
// const result = await client.callAPI('https://api.example.com/posts', 'GET');
`;
}

/**
 * Save MCP integration files
 */
export async function saveMCPIntegration(
    mcpConfig: ReturnType<typeof generateMCPServer>,
    outputPath: string
): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    await fs.mkdir(outputPath, { recursive: true });
    
    // Save MCP server config
    await fs.writeFile(
        path.join(outputPath, 'mcp-server.js'),
        mcpConfig.serverConfig
    );
    
    // Save MCP client
    await fs.writeFile(
        path.join(outputPath, 'mcp-client.js'),
        generateMCPClient()
    );
    
    // Save resources and tools as JSON
    await fs.writeFile(
        path.join(outputPath, 'mcp-resources.json'),
        JSON.stringify(mcpConfig.resources, null, 2)
    );
    
    await fs.writeFile(
        path.join(outputPath, 'mcp-tools.json'),
        JSON.stringify(mcpConfig.tools, null, 2)
    );
    
    // Save README
    const readme = `# MCP Integration for APX Toolkit

Model Context Protocol (MCP) integration allows AI assistants to discover and interact with APIs.

## Setup

1. Install MCP SDK:
\`\`\`bash
npm install @modelcontextprotocol/sdk
\`\`\`

2. Start MCP server:
\`\`\`bash
node mcp-server.js
\`\`\`

3. Connect AI assistant to MCP server

## Available Tools

${mcpConfig.tools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

## Resources

${mcpConfig.resources.map(resource => `- **${resource.name}**: ${resource.description}`).join('\n')}

## Usage

\`\`\`javascript
import { APXMCPClient } from './mcp-client.js';

const client = new APXMCPClient('./mcp-server.js');
const apis = await client.listAPIs();
const result = await client.callAPI('https://api.example.com/posts', 'GET');
\`\`\`

---
Generated by APX Toolkit
`;
    
    await fs.writeFile(
        path.join(outputPath, 'MCP-README.md'),
        readme
    );
}

