/**
 * API Mock Server Generator
 * 
 * Automatically generates production-ready mock servers from discovered APIs.
 * Uses real API response data to create realistic mocks.
 */

import type { DiscoveredAPI } from '../types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface MockServerConfig {
    framework?: 'express' | 'fastify' | 'koa';
    port?: number;
    includeErrors?: boolean;
    includeRateLimiting?: boolean;
    dataSource?: 'real' | 'generated';
    outputPath?: string;
}

export interface MockServerOutput {
    serverCode: string;
    packageJson: string;
    readme: string;
    testCode: string;
    dataFiles: Record<string, any>;
    errorScenarios: any[];
}

/**
 * Generate complete mock server from discovered APIs
 */
export async function generateMockServer(
    apis: DiscoveredAPI[],
    config: MockServerConfig = {}
): Promise<MockServerOutput> {
    const {
        framework = 'express',
        port = 3000,
        includeErrors = true,
        includeRateLimiting = true,
        dataSource = 'real',
        outputPath = './mock-server',
    } = config;

    // Extract mock data from APIs
    const dataFiles: Record<string, any> = {};
    const errorScenarios: any[] = [];

    for (const api of apis) {
        const endpointName = extractEndpointName(api.url);
        
        // Use real response data if available
        if (api.responseExample) {
            dataFiles[`${endpointName}.json`] = api.responseExample;
        } else if (api.data) {
            dataFiles[`${endpointName}.json`] = api.data;
        }

        // Generate error scenarios
        if (includeErrors) {
            errorScenarios.push({
                endpoint: api.url,
                method: api.method,
                errors: [
                    { status: 400, message: 'Bad Request' },
                    { status: 401, message: 'Unauthorized' },
                    { status: 404, message: 'Not Found' },
                    { status: 500, message: 'Internal Server Error' },
                ],
            });
        }
    }

    // Generate server code based on framework
    const serverCode = generateServerCode(apis, {
        framework,
        port,
        includeErrors,
        includeRateLimiting,
        dataFiles,
        errorScenarios,
    });

    // Generate package.json
    const packageJson = generatePackageJson(framework);

    // Generate README
    const readme = generateReadme(apis, framework, port);

    // Generate test code
    const testCode = generateTestCode(apis, framework);

    return {
        serverCode,
        packageJson,
        readme,
        testCode,
        dataFiles,
        errorScenarios,
    };
}

/**
 * Generate server code for Express.js
 */
function generateServerCode(
    apis: DiscoveredAPI[],
    options: {
        framework: string;
        port: number;
        includeErrors: boolean;
        includeRateLimiting: boolean;
        dataFiles: Record<string, any>;
        errorScenarios: any[];
    }
): string {
    const { framework, port, includeErrors, includeRateLimiting } = options;

    if (framework === 'express') {
        return generateExpressServer(apis, port, includeErrors, includeRateLimiting);
    } else if (framework === 'fastify') {
        return generateFastifyServer(apis, port, includeErrors, includeRateLimiting);
    } else {
        return generateExpressServer(apis, port, includeErrors, includeRateLimiting);
    }
}

/**
 * Generate Express.js server
 */
function generateExpressServer(
    apis: DiscoveredAPI[],
    port: number,
    includeErrors: boolean,
    includeRateLimiting: boolean
): string {
    const routes = apis.map(api => {
        const endpointName = extractEndpointName(api.url);
        const method = api.method.toLowerCase();
        const route = extractRoute(api.url);
        
        return `
// ${api.method} ${route}
app.${method}('${route}', (req, res) => {
  try {
    const data = require('./data/${endpointName}.json');
    
    ${handlePagination(api)}
    ${handleQueryParams(api)}
    ${handlePathParams(api)}
    ${includeRateLimiting ? handleRateLimiting() : ''}
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});`;
    }).join('\n');

    const errorRoutes = includeErrors ? generateErrorRoutes(apis) : '';

    return `// Auto-generated Mock Server by APX Toolkit
// Generated from real API responses

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting simulation
${includeRateLimiting ? generateRateLimitMiddleware() : ''}

// Routes
${routes}

// Error simulation routes
${errorRoutes}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || ${port};
app.listen(PORT, () => {
  console.log(\`🚀 Mock server running on http://localhost:\${PORT}\`);
  console.log(\`📡 Mocking ${apis.length} API endpoint(s)\`);
});

module.exports = app;
`;
}

/**
 * Generate Fastify server
 */
function generateFastifyServer(
    apis: DiscoveredAPI[],
    port: number,
    includeErrors: boolean,
    includeRateLimiting: boolean
): string {
    // Similar to Express but with Fastify syntax
    return `// Auto-generated Mock Server by APX Toolkit (Fastify)
const fastify = require('fastify')({ logger: true });

// Register routes
${apis.map(api => {
    const route = extractRoute(api.url);
    const method = api.method.toLowerCase();
    return `fastify.${method}('${route}', async (request, reply) => {
  const data = require('./data/${extractEndpointName(api.url)}.json');
  return data;
});`;
}).join('\n')}

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: ${port} });
    console.log(\`🚀 Mock server running on http://localhost:${port}\`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
`;
}

function extractEndpointName(url: string): string {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    return pathParts[pathParts.length - 1] || 'root';
}

function extractRoute(url: string): string {
    const urlObj = new URL(url);
    return urlObj.pathname;
}

function handlePagination(api: DiscoveredAPI): string {
    if (api.paginationInfo) {
        return `
    // Handle pagination
    if (Array.isArray(data)) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = data.slice(start, end);
      return res.json({
        data: paginated,
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit)
      });
    }`;
    }
    return '';
}

function handleQueryParams(api: DiscoveredAPI): string {
    return `
    // Handle query parameters
    // Add custom logic based on your API requirements
    `;
}

function handlePathParams(api: DiscoveredAPI): string {
    if (api.url.includes(':')) {
        return `
    // Handle path parameters
    const { id } = req.params;
    if (id && Array.isArray(data)) {
      const item = data.find(d => d.id === parseInt(id));
      if (!item) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.json(item);
    }`;
    }
    return '';
}

function handleRateLimiting(): string {
    return `
    // Simulate rate limiting (optional)
    if (Math.random() < 0.1) { // 10% chance
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }`;
}

function generateRateLimitMiddleware(): string {
    return `
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
`;
}

function generateErrorRoutes(apis: DiscoveredAPI[]): string {
    return `
// Error simulation endpoints
app.get('/api/error/:status', (req, res) => {
  const status = parseInt(req.params.status);
  const errors = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    503: 'Service Unavailable'
  };
  res.status(status).json({ 
    error: errors[status] || 'Unknown Error',
    status,
    message: 'Simulated error for testing'
  });
});
`;
}

function generatePackageJson(framework: string): string {
    const dependencies: Record<string, string> = {
        express: '^4.18.2',
        cors: '^2.8.5',
    };

    if (framework === 'fastify') {
        return JSON.stringify({
            name: 'apx-mock-server',
            version: '1.0.0',
            description: 'Auto-generated mock server by APX Toolkit',
            main: 'server.js',
            scripts: {
                start: 'node server.js',
                dev: 'nodemon server.js',
                test: 'jest',
            },
            dependencies: {
                fastify: '^4.24.0',
            },
            devDependencies: {
                nodemon: '^3.0.1',
                jest: '^29.7.0',
            },
        }, null, 2);
    }

    return JSON.stringify({
        name: 'apx-mock-server',
        version: '1.0.0',
        description: 'Auto-generated mock server by APX Toolkit',
        main: 'server.js',
        scripts: {
            start: 'node server.js',
            dev: 'nodemon server.js',
            test: 'jest',
        },
        dependencies,
        devDependencies: {
            nodemon: '^3.0.1',
            jest: '^29.7.0',
            '@types/express': '^4.17.21',
            '@types/cors': '^2.8.17',
        },
    }, null, 2);
}

function generateReadme(apis: DiscoveredAPI[], framework: string, port: number): string {
    return `# Mock Server - Auto-generated by APX Toolkit

This mock server was automatically generated from discovered APIs.

## 🚀 Quick Start

\`\`\`bash
npm install
npm start
\`\`\`

Server will run on http://localhost:${port}

## 📡 Mocked Endpoints

${apis.map(api => `- **${api.method}** ${api.url}`).join('\n')}

## 🧪 Testing

\`\`\`bash
npm test
\`\`\`

## 🔧 Configuration

- Framework: ${framework}
- Port: ${port}
- Data Source: Real API responses

## 📝 Notes

- All endpoints use real response data from discovered APIs
- Error scenarios are available at \`/api/error/:status\`
- Rate limiting simulation is enabled
- Health check available at \`/health\`

## 🔄 Regenerating

To regenerate this mock server:

\`\`\`bash
apx generate-mocks --api-url=https://api.example.com
\`\`\`

---
Generated by APX Toolkit - https://apify.com/actors/2eXbQISXqhTnIxWNJ
`;
}

function generateTestCode(apis: DiscoveredAPI[], framework: string): string {
    return `// Auto-generated tests for mock server
const request = require('supertest');
const app = require('./server');

describe('Mock Server Tests', () => {
${apis.map(api => {
    const route = extractRoute(api.url);
    const method = api.method.toLowerCase();
    return `
  test('${api.method} ${route}', async () => {
    const response = await request(app)
      .${method}('${route}')
      .expect(200);
    
    expect(response.body).toBeDefined();
  });`;
}).join('\n')}

  test('Health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
  });
});
`;
}

/**
 * Save mock server to filesystem
 */
export async function saveMockServer(
    output: MockServerOutput,
    outputPath: string
): Promise<void> {
    await fs.mkdir(outputPath, { recursive: true });
    await fs.mkdir(path.join(outputPath, 'data'), { recursive: true });
    await fs.mkdir(path.join(outputPath, 'test'), { recursive: true });

    // Save server code
    await fs.writeFile(path.join(outputPath, 'server.js'), output.serverCode);

    // Save package.json
    await fs.writeFile(path.join(outputPath, 'package.json'), output.packageJson);

    // Save README
    await fs.writeFile(path.join(outputPath, 'README.md'), output.readme);

    // Save test code
    await fs.writeFile(path.join(outputPath, 'test', 'server.test.js'), output.testCode);

    // Save data files
    for (const [filename, data] of Object.entries(output.dataFiles)) {
        await fs.writeFile(
            path.join(outputPath, 'data', filename),
            JSON.stringify(data, null, 2)
        );
    }

    // Save error scenarios
    await fs.writeFile(
        path.join(outputPath, 'errors.json'),
        JSON.stringify(output.errorScenarios, null, 2)
    );
}

