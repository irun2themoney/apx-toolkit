/**
 * TypeScript Type Generator
 * Generates TypeScript type definitions from API responses
 * Makes the tool a developer's dream with full type safety
 */

import type { DiscoveredAPI, APIResponse } from '../types.js';

export interface TypeScriptTypes {
    types: string;
    interfaces: string[];
    filename: string;
}

/**
 * Generates TypeScript type definitions from API response structure
 */
export function generateTypeScriptTypes(
    api: DiscoveredAPI,
    responseExample?: APIResponse
): TypeScriptTypes {
    const interfaces: string[] = [];
    const url = new URL(api.baseUrl);
    const pathName = url.pathname.replace(/[^a-zA-Z0-9]/g, '') || 'Api';
    const baseName = `${capitalize(pathName)}${api.method}`;

    // Generate response interface
    if (responseExample) {
        const responseInterface = generateInterfaceFromJSON(
            responseExample,
            `${baseName}Response`
        );
        interfaces.push(responseInterface);
    } else {
        // Generate generic response interface
        interfaces.push(generateGenericResponseInterface(baseName, api));
    }

    // Generate request interface for POST
    if (api.method === 'POST' && api.body) {
        const requestInterface = generateInterfaceFromJSON(
            api.body as Record<string, unknown>,
            `${baseName}Request`
        );
        interfaces.push(requestInterface);
    }

    // Generate pagination types if applicable
    if (api.paginationInfo) {
        interfaces.push(generatePaginationTypes(baseName, api.paginationInfo));
    }

    // Combine all interfaces
    const types = interfaces.join('\n\n');

    return {
        types,
        interfaces: interfaces.map(i => extractInterfaceName(i)),
        filename: `${baseName.toLowerCase()}.d.ts`,
    };
}

/**
 * Generates TypeScript interface from JSON object
 */
function generateInterfaceFromJSON(
    json: unknown,
    interfaceName: string,
    depth = 0
): string {
    if (depth > 5) {
        // Prevent infinite recursion
        return `export interface ${interfaceName} {\n  [key: string]: unknown;\n}`;
    }

    if (json === null || json === undefined) {
        return `export interface ${interfaceName} {\n  // null or undefined\n}`;
    }

    if (Array.isArray(json)) {
        if (json.length === 0) {
            return `export type ${interfaceName} = unknown[];`;
        }
        const itemType = inferType(json[0], `${interfaceName}Item`, depth + 1);
        return `export type ${interfaceName} = ${extractInterfaceName(itemType)}[];`;
    }

    if (typeof json !== 'object') {
        return `export type ${interfaceName} = ${typeof json};`;
    }

    const obj = json as Record<string, unknown>;
    const properties: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
        const propName = sanitizePropertyName(key);
        const propType = inferType(value, `${interfaceName}${capitalize(key)}`, depth + 1);
        const typeName = extractInterfaceName(propType);
        const optional = value === null || value === undefined ? '?' : '';
        
        properties.push(`  ${propName}${optional}: ${typeName};`);
    }

    return `export interface ${interfaceName} {\n${properties.join('\n')}\n}`;
}

/**
 * Infers TypeScript type from value
 */
function inferType(value: unknown, suggestedName: string, depth: number): string {
    if (value === null) {
        return 'null';
    }
    if (value === undefined) {
        return 'undefined';
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return 'unknown[]';
        }
        const itemType = inferType(value[0], `${suggestedName}Item`, depth + 1);
        return `${itemType}[]`;
    }
    if (typeof value === 'object') {
        return generateInterfaceFromJSON(value, suggestedName, depth);
    }
    return typeof value;
}

/**
 * Generates generic response interface when no example available
 */
function generateGenericResponseInterface(baseName: string, api: DiscoveredAPI): string {
    const properties: string[] = [];

    // Add data path if known
    if (api.dataPath) {
        const dataType = api.paginationInfo ? `${baseName}Item[]` : 'unknown[]';
        properties.push(`  data?: ${dataType};`);
    } else {
        properties.push(`  data?: unknown;`);
    }

    // Add meta if pagination exists
    if (api.paginationInfo) {
        properties.push(`  meta?: ${baseName}Meta;`);
    }

    return `export interface ${baseName}Response {\n${properties.join('\n')}\n}`;
}

/**
 * Generates pagination-related types
 */
function generatePaginationTypes(baseName: string, paginationInfo: DiscoveredAPI['paginationInfo']): string {
    if (!paginationInfo) {
        return '';
    }

    const metaProperties: string[] = [];

    if (paginationInfo.type === 'page') {
        metaProperties.push('  page?: number;');
        metaProperties.push('  totalPages?: number;');
    } else if (paginationInfo.type === 'offset') {
        metaProperties.push('  offset?: number;');
        metaProperties.push('  limit?: number;');
    } else if (paginationInfo.type === 'cursor') {
        metaProperties.push('  cursor?: string;');
        metaProperties.push('  nextCursor?: string;');
    }

    metaProperties.push('  total?: number;');
    metaProperties.push('  hasNext?: boolean;');

    return `export interface ${baseName}Meta {\n${metaProperties.join('\n')}\n}`;
}

/**
 * Generates TypeScript types for all discovered APIs
 */
export function generateAllTypeScriptTypes(
    apis: DiscoveredAPI[],
    responseExamples?: Map<string, APIResponse>
): Record<string, TypeScriptTypes> {
    const result: Record<string, TypeScriptTypes> = {};

    for (const api of apis) {
        const url = new URL(api.baseUrl);
        const key = `${api.method}_${url.pathname}`;
        const example = responseExamples?.get(api.url);
        result[key] = generateTypeScriptTypes(api, example);
    }

    return result;
}

/**
 * Generates a complete TypeScript declaration file for all APIs
 */
export function generateTypeScriptDeclarationFile(
    apis: DiscoveredAPI[],
    responseExamples?: Map<string, APIResponse>,
    packageName = 'discovered-api'
): string {
    const allTypes = generateAllTypeScriptTypes(apis, responseExamples);
    const interfaces: string[] = [];
    const imports: string[] = [];

    // Collect all interfaces
    for (const types of Object.values(allTypes)) {
        interfaces.push(types.types);
    }

    // Generate index file
    let content = `/**\n * Auto-generated TypeScript types for discovered APIs\n`;
    content += ` * Generated by APX\n`;
    content += ` * Package: ${packageName}\n`;
    content += ` * Generated at: ${new Date().toISOString()}\n */\n\n`;

    if (imports.length > 0) {
        content += imports.join('\n') + '\n\n';
    }

    content += interfaces.join('\n\n');

    // Add utility types
    content += '\n\n// Utility types\n';
    content += 'export type ApiResponse<T> = T;\n';
    content += 'export type ApiError = {\n  message: string;\n  code?: string;\n};\n';

    return content;
}

// Helper functions
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function sanitizePropertyName(name: string): string {
    // Replace invalid characters
    let sanitized = name.replace(/[^a-zA-Z0-9_$]/g, '_');
    // Can't start with number
    if (/^\d/.test(sanitized)) {
        sanitized = '_' + sanitized;
    }
    return sanitized;
}

function extractInterfaceName(interfaceCode: string): string {
    // Extract interface name from interface code
    const match = interfaceCode.match(/export\s+(?:interface|type)\s+(\w+)/);
    return match ? match[1] : 'unknown';
}

