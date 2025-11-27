#!/usr/bin/env node

/**
 * APX CLI - Command Line Interface for APX Toolkit
 * Allows developers to run APX locally without Apify platform
 */

import { runAPXCore } from './core-runner.js';
import type { ActorInput } from './types.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import * as path from 'path';
import { sanitizePath, sanitizeFilename, validateURL, INPUT_LIMITS } from './utils/security.js';

interface CLIArgs {
    url: string;
    output?: string;
    'login-url'?: string;
    'api-key'?: string;
    'bearer-token'?: string;
    'max-pages'?: number;
    'max-concurrency'?: number;
    'discovery-timeout'?: number;
    'min-response-size'?: number;
    'api-patterns'?: string;
    'data-path'?: string;
    'pagination-type'?: 'auto' | 'offset' | 'page' | 'cursor';
    'export-formats'?: string;
    'generate-docs'?: boolean;
    'interaction-simulation'?: boolean;
    'interaction-wait-time'?: number;
    'oauth-flow'?: boolean;
}

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .option('url', {
            alias: 'u',
            type: 'string',
            description: 'The starting URL for API discovery',
            demandOption: true,
        })
        .option('output', {
            alias: 'o',
            type: 'string',
            description: 'Local directory to save generated files (default: ./apx-output)',
            default: './apx-output',
        })
        .option('login-url', {
            type: 'string',
            description: 'URL to initiate the OAuth/Login flow',
        })
        .option('api-key', {
            type: 'string',
            description: 'API key for authentication (added as X-API-Key header)',
        })
        .option('bearer-token', {
            type: 'string',
            description: 'Bearer token for authentication (added as Authorization header)',
        })
        .option('max-pages', {
            type: 'number',
            description: 'Maximum pages to scrape (default: 100)',
            default: 100,
        })
        .option('max-concurrency', {
            type: 'number',
            description: 'Maximum concurrent requests (default: 5)',
            default: 5,
        })
        .option('discovery-timeout', {
            type: 'number',
            description: 'Discovery timeout in milliseconds (default: 10000)',
            default: 10000,
        })
        .option('min-response-size', {
            type: 'number',
            description: 'Minimum response size in bytes (default: 1000)',
            default: 1000,
        })
        .option('api-patterns', {
            type: 'string',
            description: 'Comma-separated URL patterns to match (e.g., "/api/,/v1/data")',
        })
        .option('data-path', {
            type: 'string',
            description: 'JSONPath to extract data (e.g., "data.items")',
        })
        .option('pagination-type', {
            type: 'string',
            choices: ['auto', 'offset', 'page', 'cursor'],
            description: 'Type of pagination to use (default: auto)',
            default: 'auto',
        })
        .option('export-formats', {
            type: 'string',
            description: 'Comma-separated export formats (openapi,postman,curl,insomnia)',
            default: 'openapi,postman,curl',
        })
        .option('generate-docs', {
            type: 'boolean',
            description: 'Generate API documentation (default: true)',
            default: true,
        })
        .option('interaction-simulation', {
            type: 'boolean',
            description: 'Enable interaction simulation (default: true)',
            default: true,
        })
        .option('interaction-wait-time', {
            type: 'number',
            description: 'Wait time after interactions in milliseconds (default: 2000)',
            default: 2000,
        })
        .option('oauth-flow', {
            type: 'boolean',
            description: 'Enable OAuth flow (requires login-url)',
            default: false,
        })
        .help()
        .alias('help', 'h')
        .version()
        .alias('version', 'v')
        .parse() as CLIArgs;

    // Construct the input object for the core runner
    const coreInput: ActorInput = {
        startUrls: [{ url: argv.url }],
        maxPages: argv['max-pages'],
        maxConcurrency: argv['max-concurrency'],
        discoveryTimeout: argv['discovery-timeout'],
        minResponseSize: argv['min-response-size'],
        dataPath: argv['data-path'],
        paginationType: argv['pagination-type'],
        generateDocumentation: argv['generate-docs'],
        exportFormats: argv['export-formats']?.split(',').map(f => f.trim()) as any,
        enableInteractionSimulation: argv['interaction-simulation'],
        interactionWaitTime: argv['interaction-wait-time'],
        loginUrl: argv['login-url'],
        oauthFlow: argv['oauth-flow'],
    };

    // Add API patterns if provided
    if (argv['api-patterns']) {
        coreInput.apiPatterns = argv['api-patterns'].split(',').map(p => p.trim());
    }

    // Add authentication if provided
    if (argv['api-key']) {
        coreInput.apiKey = argv['api-key'];
    }
    if (argv['bearer-token']) {
        coreInput.bearerToken = argv['bearer-token'];
    }

    try {
        console.log('🚀 APX CLI - The API Toolkit');
        console.log('='.repeat(60));
        console.log(`📋 Target URL: ${argv.url}`);
        console.log(`📁 Output Directory: ${argv.output}`);
        console.log('='.repeat(60));
        console.log('');

        const result = await runAPXCore(coreInput, {
            onProgress: (msg: string) => console.log(msg),
            onError: (err: Error) => console.error(`❌ Error: ${err.message}`),
        });

        // Save results to local files
        const outputDir = path.resolve(argv.output || './apx-output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Save code snippets
        const codeSnippetsDir = path.join(outputDir, 'code-snippets');
        if (!fs.existsSync(codeSnippetsDir)) {
            fs.mkdirSync(codeSnippetsDir, { recursive: true });
        }
        for (const [apiKey, snippets] of Object.entries(result.artifacts.codeSnippets)) {
            const safeKey = apiKey.replace(/[^a-zA-Z0-9]/g, '_');
            fs.writeFileSync(
                path.join(codeSnippetsDir, `${safeKey}.json`),
                JSON.stringify(snippets, null, 2)
            );
        }

        // Save TypeScript types
        if (result.artifacts.typescriptTypes) {
            fs.writeFileSync(
                path.join(outputDir, 'types.d.ts'),
                result.artifacts.typescriptTypes
            );
        }

        // Save test suites
        if (result.artifacts.testSuites.length > 0) {
            const testSuitesDir = path.join(outputDir, 'test-suites');
            if (!fs.existsSync(testSuitesDir)) {
                fs.mkdirSync(testSuitesDir, { recursive: true });
            }
            for (const suite of result.artifacts.testSuites) {
                const filename = sanitizeFilename(suite.filename || `test-${Date.now()}.js`);
                fs.writeFileSync(
                    path.join(testSuitesDir, filename),
                    suite.code || ''
                );
            }
        }

        // Save SDK packages
        if (result.artifacts.sdkPackages.length > 0) {
            const sdkDir = path.join(outputDir, 'sdk-packages');
            if (!fs.existsSync(sdkDir)) {
                fs.mkdirSync(sdkDir, { recursive: true });
            }
            for (const pkg of result.artifacts.sdkPackages) {
                const pkgDir = path.join(sdkDir, pkg.packageName || 'sdk');
                if (!fs.existsSync(pkgDir)) {
                    fs.mkdirSync(pkgDir, { recursive: true });
                }
                for (const [filename, content] of Object.entries(pkg.files || {})) {
                    const safeFilename = sanitizeFilename(filename);
                    const filePath = sanitizePath(path.join(pkgDir, safeFilename), pkgDir);
                    const dir = path.dirname(filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
                    fs.writeFileSync(filePath, fileContent);
                }
            }
        }

        // Save documentation
        if (result.artifacts.documentation.length > 0) {
            const docsDir = path.join(outputDir, 'documentation');
            if (!fs.existsSync(docsDir)) {
                fs.mkdirSync(docsDir, { recursive: true });
            }
            for (const doc of result.artifacts.documentation) {
                const filename = sanitizeFilename(doc.filename || `doc-${doc.format}.${doc.format === 'openapi' ? 'json' : 'json'}`);
                const content = typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content, null, 2);
                fs.writeFileSync(
                    path.join(docsDir, filename),
                    content
                );
            }
        }

        // Save examples
        if (result.artifacts.examples.length > 0) {
            fs.writeFileSync(
                path.join(outputDir, 'examples.json'),
                JSON.stringify(result.artifacts.examples, null, 2)
            );
        }

        // Save summary
        fs.writeFileSync(
            path.join(outputDir, 'summary.json'),
            JSON.stringify({
                summary: result.summary,
                statistics: result.statistics,
            }, null, 2)
        );

        // Save all extracted data
        if (result.data.length > 0) {
            fs.writeFileSync(
                path.join(outputDir, 'data.json'),
                JSON.stringify(result.data, null, 2)
            );
        }

        console.log('');
        console.log('🎉 APX Toolkit run successful!');
        console.log('='.repeat(60));
        console.log(`📁 Artifacts saved to: ${outputDir}`);
        console.log(`📊 Summary:`);
        console.log(`   APIs Discovered: ${result.summary.apisDiscovered} (REST, GraphQL, WebSocket)`);
        console.log(`   Requests Processed: ${result.summary.requestsProcessed}`);
        console.log(`   Items Extracted: ${result.summary.itemsExtracted}`);
        console.log(`   Total Duration: ${result.summary.totalDuration.toFixed(1)}s`);
        console.log('');
        console.log(`📂 Generated Files:`);
        console.log(`   - Code Snippets: ${Object.keys(result.artifacts.codeSnippets).length} API(s)`);
        console.log(`   - TypeScript Types: ${result.artifacts.typescriptTypes ? 'Yes' : 'No'}`);
        console.log(`   - Test Suites: ${result.artifacts.testSuites.length}`);
        console.log(`   - SDK Packages: ${result.artifacts.sdkPackages.length}`);
        console.log(`   - Documentation: ${result.artifacts.documentation.length} format(s)`);
        console.log('');

    } catch (error) {
        console.error('');
        console.error('❌ APX CLI encountered a fatal error');
        console.error('='.repeat(60));
        console.error(error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error('');
            console.error('Stack trace:');
            console.error(error.stack);
        }
        console.error('');
        process.exit(1);
    }
}

main();

