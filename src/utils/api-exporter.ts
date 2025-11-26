import type { DiscoveredAPI } from '../types.js';
import type { APIExport } from '../types.js';

/**
 * Generates OpenAPI 3.0 specification from discovered APIs
 */
export function generateOpenAPISpec(
    apis: DiscoveredAPI[],
    baseUrl?: string
): string {
    const spec: any = {
        openapi: '3.0.0',
        info: {
            title: 'Discovered API',
            description: 'Auto-generated API documentation from discovered endpoints',
            version: '1.0.0',
        },
        servers: baseUrl
            ? [{ url: baseUrl }]
            : apis.length > 0
              ? [{ url: new URL(apis[0].baseUrl).origin }]
              : [],
        paths: {},
    };

    for (const api of apis) {
        const url = new URL(api.baseUrl);
        const path = url.pathname;
        const method = api.method.toLowerCase();

        if (!spec.paths[path]) {
            spec.paths[path] = {};
        }

        const operation: any = {
            summary: `Discovered ${api.method} endpoint`,
            description: `Auto-discovered API endpoint from ${api.url}`,
            operationId: `${method}_${path.replace(/[^a-zA-Z0-9]/g, '_')}`,
            tags: ['Discovered APIs'],
        };

        // Add query parameters
        if (api.queryParams && Object.keys(api.queryParams).length > 0) {
            operation.parameters = Object.entries(api.queryParams).map(([key, value]) => ({
                name: key,
                in: 'query',
                required: false,
                schema: {
                    type: typeof value === 'number' ? 'number' : 'string',
                    example: value,
                },
                description: inferFieldDescription(key, value),
            }));
        }

        // Add pagination parameters
        if (api.paginationInfo) {
            const paramName = api.paginationInfo.paramName || 'page';
            if (!operation.parameters) {
                operation.parameters = [];
            }
            operation.parameters.push({
                name: paramName,
                in: 'query',
                required: false,
                schema: {
                    type: api.paginationInfo.type === 'cursor' ? 'string' : 'integer',
                    example: api.paginationInfo.currentPage || api.paginationInfo.currentOffset || 1,
                },
                description: `Pagination parameter (${api.paginationInfo.type}). Used to navigate through paginated results.`,
            });
        }

        // Add request body for POST
        if (api.method === 'POST' && api.body) {
            operation.requestBody = {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            example: api.body,
                        },
                    },
                },
            };
        }

        // Add headers
        if (api.headers && Object.keys(api.headers).length > 0) {
            if (!operation.parameters) {
                operation.parameters = [];
            }
            for (const [key, value] of Object.entries(api.headers)) {
                if (key.toLowerCase() !== 'content-type') {
                    operation.parameters.push({
                        name: key,
                        in: 'header',
                        required: false,
                        schema: {
                            type: 'string',
                            example: value,
                        },
                        description: `Header: ${key}`,
                    });
                }
            }
        }

        // Add response schema
        operation.responses = {
            '200': {
                description: 'Successful response',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            description: 'API response (structure discovered from actual responses)',
                        },
                    },
                },
            },
        };

        spec.paths[path][method] = operation;
    }

    return JSON.stringify(spec, null, 2);
}

/**
 * Infers human-readable descriptions for API fields based on naming patterns
 */
function inferFieldDescription(fieldName: string, exampleValue: unknown): string {
    const name = fieldName.toLowerCase();
    
    // Common field patterns
    const patterns: Array<[RegExp, string]> = [
        [/^id$|_id$|Id$/, 'A unique identifier'],
        [/^name$|_name$/, 'The name of the item'],
        [/^email$|_email$/, 'An email address'],
        [/^url$|_url$|Url$/, 'A URL or web address'],
        [/^date$|_date$|Date$/, 'A date value'],
        [/^time$|_time$|Time$|timestamp$/, 'A timestamp or time value'],
        [/^page$|_page$/, 'Page number for pagination'],
        [/^limit$|_limit$/, 'Maximum number of items to return'],
        [/^offset$|_offset$/, 'Number of items to skip'],
        [/^total$|_total$/, 'Total number of items'],
        [/^count$|_count$/, 'Count of items'],
        [/^status$|_status$/, 'Status of the item'],
        [/^type$|_type$/, 'Type or category of the item'],
        [/^title$|_title$/, 'Title of the item'],
        [/^description$|_description$/, 'Description of the item'],
        [/^created$|_created$|created_at$/, 'Creation timestamp'],
        [/^updated$|_updated$|updated_at$/, 'Last update timestamp'],
        [/^user$|_user$/, 'User information'],
        [/^token$|_token$/, 'Authentication or access token'],
        [/^key$|_key$/, 'API key or identifier'],
    ];
    
    for (const [pattern, description] of patterns) {
        if (pattern.test(name)) {
            return description;
        }
    }
    
    // Default description based on type
    if (typeof exampleValue === 'number') {
        return `Numeric value: ${fieldName}`;
    } else if (typeof exampleValue === 'string') {
        return `String value: ${fieldName}`;
    } else if (typeof exampleValue === 'boolean') {
        return `Boolean flag: ${fieldName}`;
    }
    
    return `Query parameter: ${fieldName}`;
}

/**
 * Generates Postman collection from discovered APIs
 */
export function generatePostmanCollection(
    apis: DiscoveredAPI[],
    collectionName = 'Discovered APIs'
): string {
    const collection: any = {
        info: {
            name: collectionName,
            description: 'Auto-generated Postman collection from discovered API endpoints',
            schema:
                'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        item: [],
    };

    for (const api of apis) {
        const url = new URL(api.baseUrl);
        const queryParams: any[] = [];

        // Add query parameters
        if (api.queryParams) {
            for (const [key, value] of Object.entries(api.queryParams)) {
                queryParams.push({
                    key,
                    value: String(value),
                });
            }
        }

        // Add pagination parameters
        if (api.paginationInfo) {
            const paramName = api.paginationInfo.paramName || 'page';
            queryParams.push({
                key: paramName,
                value: String(
                    api.paginationInfo.currentPage ||
                        api.paginationInfo.currentOffset ||
                        1
                ),
                description: `Pagination: ${api.paginationInfo.type}`,
            });
        }

        const request: any = {
            name: `${api.method} ${url.pathname}`,
            request: {
                method: api.method,
                header: [],
                url: {
                    raw: api.baseUrl + (queryParams.length > 0 ? '?' : ''),
                    protocol: url.protocol.slice(0, -1),
                    host: url.hostname.split('.'),
                    path: url.pathname.split('/').filter(Boolean),
                    query: queryParams,
                },
            },
            response: [],
        };

        // Add headers
        if (api.headers) {
            for (const [key, value] of Object.entries(api.headers)) {
                request.request.header.push({
                    key,
                    value,
                });
            }
        }

        // Add body for POST
        if (api.method === 'POST' && api.body) {
            request.request.body = {
                mode: 'raw',
                raw: JSON.stringify(api.body, null, 2),
                options: {
                    raw: {
                        language: 'json',
                    },
                },
            };
        }

        collection.item.push(request);
    }

    return JSON.stringify(collection, null, 2);
}

/**
 * Generates cURL commands from discovered APIs
 */
export function generateCurlCommands(apis: DiscoveredAPI[]): string {
    const commands: string[] = [];

    for (const api of apis) {
        const url = new URL(api.baseUrl);
        let curl = `curl -X ${api.method}`;

        // Add headers
        if (api.headers) {
            for (const [key, value] of Object.entries(api.headers)) {
                curl += ` \\\n  -H "${key}: ${value}"`;
            }
        }

        // Add query parameters
        const queryParams: string[] = [];
        if (api.queryParams) {
            for (const [key, value] of Object.entries(api.queryParams)) {
                queryParams.push(`${key}=${encodeURIComponent(String(value))}`);
            }
        }

        // Add pagination parameters
        if (api.paginationInfo) {
            const paramName = api.paginationInfo.paramName || 'page';
            const paramValue =
                api.paginationInfo.currentPage ||
                api.paginationInfo.currentOffset ||
                1;
            queryParams.push(`${paramName}=${paramValue}`);
        }

        const fullUrl =
            api.baseUrl + (queryParams.length > 0 ? '?' + queryParams.join('&') : '');

        curl += ` \\\n  "${fullUrl}"`;

        // Add body for POST
        if (api.method === 'POST' && api.body) {
            curl += ` \\\n  -d '${JSON.stringify(api.body)}'`;
            curl += ` \\\n  -H "Content-Type: application/json"`;
        }

        commands.push(curl);
        commands.push(''); // Empty line between commands
    }

    return commands.join('\n');
}

/**
 * Generates Insomnia workspace from discovered APIs
 */
export function generateInsomniaWorkspace(
    apis: DiscoveredAPI[],
    workspaceName = 'Discovered APIs'
): string {
    const workspace: any = {
        _type: 'export',
        __export_format: 4,
        __export_date: new Date().toISOString(),
        __export_source: 'smart-api-finder-documenter',
        resources: [
            {
                _id: 'wrk_discovered',
                _type: 'workspace',
                name: workspaceName,
                description: 'Auto-generated Insomnia workspace from discovered APIs',
            },
        ],
    };

    for (let i = 0; i < apis.length; i++) {
        const api = apis[i];
        const url = new URL(api.baseUrl);
        const queryParams: any[] = [];

        // Add query parameters
        if (api.queryParams) {
            for (const [key, value] of Object.entries(api.queryParams)) {
                queryParams.push({
                    name: key,
                    value: String(value),
                });
            }
        }

        // Add pagination parameters
        if (api.paginationInfo) {
            const paramName = api.paginationInfo.paramName || 'page';
            queryParams.push({
                name: paramName,
                value: String(
                    api.paginationInfo.currentPage ||
                        api.paginationInfo.currentOffset ||
                        1
                ),
            });
        }

        const request: any = {
            _id: `req_${i}`,
            _type: 'request',
            parentId: 'wrk_discovered',
            name: `${api.method} ${url.pathname}`,
            url: api.baseUrl,
            method: api.method,
            headers: [],
            parameters: queryParams,
        };

        // Add headers
        if (api.headers) {
            for (const [key, value] of Object.entries(api.headers)) {
                request.headers.push({
                    name: key,
                    value,
                });
            }
        }

        // Add body for POST
        if (api.method === 'POST' && api.body) {
            request.body = {
                mimeType: 'application/json',
                text: JSON.stringify(api.body, null, 2),
            };
        }

        workspace.resources.push(request);
    }

    return JSON.stringify(workspace, null, 2);
}

/**
 * Generates all export formats for discovered APIs
 */
export function generateExports(
    apis: DiscoveredAPI[],
    formats: string[] = ['openapi', 'postman', 'curl'],
    baseUrl?: string
): APIExport[] {
    const exports: APIExport[] = [];

    if (formats.includes('openapi')) {
        exports.push({
            format: 'openapi',
            content: generateOpenAPISpec(apis, baseUrl),
            filename: 'api-spec.json',
            mimeType: 'application/json',
        });
    }

    if (formats.includes('postman')) {
        exports.push({
            format: 'postman',
            content: generatePostmanCollection(apis),
            filename: 'postman-collection.json',
            mimeType: 'application/json',
        });
    }

    if (formats.includes('curl')) {
        exports.push({
            format: 'curl',
            content: generateCurlCommands(apis),
            filename: 'curl-commands.sh',
            mimeType: 'text/plain',
        });
    }

    if (formats.includes('insomnia')) {
        exports.push({
            format: 'insomnia',
            content: generateInsomniaWorkspace(apis),
            filename: 'insomnia-workspace.json',
            mimeType: 'application/json',
        });
    }

    return exports;
}

