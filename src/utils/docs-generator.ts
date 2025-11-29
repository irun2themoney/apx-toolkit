/**
 * Enhanced Documentation Generator
 * Generates markdown documentation with JSDoc/TSDoc comments
 */

import type { DiscoveredAPI } from '../types.js';

export interface DocumentationOptions {
    includeExamples?: boolean;
    includeTypes?: boolean;
    includeTests?: boolean;
    format?: 'markdown' | 'html';
}

/**
 * Generate markdown API documentation
 */
export function generateMarkdownDocs(
    apis: DiscoveredAPI[],
    options: DocumentationOptions = {}
): string {
    const lines: string[] = [];
    
    lines.push('# API Documentation');
    lines.push('');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push(`**Total APIs:** ${apis.length}`);
    lines.push('');
    
    // Table of contents
    if (apis.length > 0) {
        lines.push('## Table of Contents');
        lines.push('');
        apis.forEach((api, index) => {
            const anchor = api.url.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            lines.push(`${index + 1}. [${api.method} ${api.url}](#${anchor})`);
        });
        lines.push('');
    }
    
    // API details
    apis.forEach(api => {
        const anchor = api.url.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        lines.push(`## ${api.method} ${api.url}`);
        lines.push('');
        lines.push(`**Base URL:** \`${api.baseUrl}\``);
        lines.push(`**Method:** \`${api.method}\``);
        lines.push('');
        
        // Headers
        if (Object.keys(api.headers || {}).length > 0) {
            lines.push('### Headers');
            lines.push('');
            lines.push('| Name | Value |');
            lines.push('|------|-------|');
            Object.entries(api.headers || {}).forEach(([key, value]) => {
                lines.push(`| ${key} | \`${value}\` |`);
            });
            lines.push('');
        }
        
        // Query parameters
        if (api.queryParams && Object.keys(api.queryParams).length > 0) {
            lines.push('### Query Parameters');
            lines.push('');
            lines.push('| Parameter | Type | Description |');
            lines.push('|-----------|------|-------------|');
            Object.entries(api.queryParams).forEach(([key, value]) => {
                lines.push(`| ${key} | string | ${typeof value} |`);
            });
            lines.push('');
        }
        
        // Pagination
        if (api.paginationInfo) {
            lines.push('### Pagination');
            lines.push('');
            lines.push(`**Type:** ${api.paginationInfo.type}`);
            if (api.paginationInfo.pageSize) {
                lines.push(`**Page Size:** ${api.paginationInfo.pageSize}`);
            }
            if (api.paginationInfo.totalPages) {
                lines.push(`**Total Pages:** ${api.paginationInfo.totalPages}`);
            }
            lines.push('');
        }
        
        // Rate limiting
        if (api.rateLimitInfo) {
            lines.push('### Rate Limiting');
            lines.push('');
            if (api.rateLimitInfo.limit) {
                lines.push(`**Limit:** ${api.rateLimitInfo.limit}`);
            }
            if (api.rateLimitInfo.remaining !== undefined) {
                lines.push(`**Remaining:** ${api.rateLimitInfo.remaining}`);
            }
            lines.push('');
        }
        
        // GraphQL
        if (api.isGraphQL && api.graphQLQuery) {
            lines.push('### GraphQL Query');
            lines.push('');
            lines.push('```graphql');
            lines.push(api.graphQLQuery);
            lines.push('```');
            lines.push('');
        }
        
        // WebSocket
        if (api.isWebSocket && api.webSocketUrl) {
            lines.push('### WebSocket');
            lines.push('');
            lines.push(`**URL:** \`${api.webSocketUrl}\``);
            if (api.webSocketProtocols && api.webSocketProtocols.length > 0) {
                lines.push(`**Protocols:** ${api.webSocketProtocols.join(', ')}`);
            }
            lines.push('');
        }
    });
    
    return lines.join('\n');
}

/**
 * Generate JSDoc comments for TypeScript
 */
export function generateJSDocComments(api: DiscoveredAPI): string {
    const lines: string[] = [];
    
    lines.push('/**');
    lines.push(` * ${api.method} ${api.url}`);
    lines.push(' *');
    
    if (api.queryParams && Object.keys(api.queryParams).length > 0) {
        lines.push(' * @param {object} params - Query parameters');
        Object.keys(api.queryParams).forEach(key => {
            lines.push(` * @param {string} params.${key} - Query parameter`);
        });
    }
    
    if (api.headers && Object.keys(api.headers).length > 0) {
        lines.push(' * @param {object} headers - Request headers');
        Object.keys(api.headers).forEach(key => {
            lines.push(` * @param {string} headers.${key} - ${key} header`);
        });
    }
    
    lines.push(' * @returns {Promise<object>} API response');
    lines.push(' */');
    
    return lines.join('\n');
}

/**
 * Generate complete documentation package
 */
export function generateDocumentationPackage(
    apis: DiscoveredAPI[],
    options: DocumentationOptions = {}
): {
    markdown: string;
    jsdoc: Record<string, string>;
    readme: string;
} {
    return {
        markdown: generateMarkdownDocs(apis, options),
        jsdoc: Object.fromEntries(
            apis.map(api => [api.url, generateJSDocComments(api)])
        ),
        readme: generateReadme(apis, options),
    };
}

/**
 * Generate README for API package
 */
function generateReadme(apis: DiscoveredAPI[], options: DocumentationOptions): string {
    const lines: string[] = [];
    
    lines.push('# API Client');
    lines.push('');
    lines.push('Auto-generated API client using APX Toolkit.');
    lines.push('');
    lines.push(`**APIs:** ${apis.length}`);
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push('');
    lines.push('## Installation');
    lines.push('');
    lines.push('```bash');
    lines.push('npm install');
    lines.push('```');
    lines.push('');
    lines.push('## Usage');
    lines.push('');
    lines.push('```typescript');
    lines.push('import { APIClient } from "./client";');
    lines.push('');
    lines.push('const client = new APIClient();');
    if (apis.length > 0) {
        const firstApi = apis[0];
        lines.push(`const response = await client.${firstApi.method.toLowerCase()}("${firstApi.url}");`);
    }
    lines.push('```');
    lines.push('');
    lines.push('## API Reference');
    lines.push('');
    lines.push('See [API.md](./API.md) for complete API reference.');
    lines.push('');
    
    return lines.join('\n');
}

