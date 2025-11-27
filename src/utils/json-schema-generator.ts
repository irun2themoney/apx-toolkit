/**
 * JSON Schema Generator
 * Generates JSON Schema from API responses for validation and OpenAPI integration
 * Based on JSON Schema best practices and OpenAPI 3.1 specifications
 */

import type { APIResponse } from '../types.js';

export interface JSONSchema {
    $schema?: string;
    type?: string;
    properties?: Record<string, JSONSchema>;
    items?: JSONSchema;
    required?: string[];
    description?: string;
    example?: unknown;
    examples?: unknown[];
    enum?: unknown[];
    format?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    additionalProperties?: boolean | JSONSchema;
    oneOf?: JSONSchema[];
    anyOf?: JSONSchema[];
    allOf?: JSONSchema[];
    $ref?: string;
}

/**
 * Generates JSON Schema from API response data
 * Follows JSON Schema best practices:
 * - Uses $ref for reusability
 * - Avoids overusing allOf/anyOf/oneOf
 * - Includes proper types and formats
 * - Adds descriptions and examples
 */
export function generateJSONSchema(
    data: unknown,
    schemaName?: string,
    depth = 0,
    maxDepth = 10
): JSONSchema {
    // Prevent infinite recursion
    if (depth > maxDepth) {
        return {
            type: 'object',
            description: 'Complex nested structure',
            additionalProperties: true,
        };
    }

    // Handle null/undefined
    // OpenAPI 3.1 best practice: use nullable: true instead of type: 'null'
    if (data === null || data === undefined) {
        return {
            type: 'string', // Default to string, can be overridden by context
            nullable: true,
            description: 'Nullable value',
        };
    }

    // Handle arrays
    if (Array.isArray(data)) {
        if (data.length === 0) {
            return {
                type: 'array',
                items: {
                    type: 'object',
                    additionalProperties: true,
                },
                description: 'Empty array',
            };
        }

        // Generate schema for first item (assume homogeneous arrays)
        const itemSchema = generateJSONSchema(data[0], `${schemaName}Item`, depth + 1, maxDepth);
        
        return {
            type: 'array',
            items: itemSchema,
            description: `Array of ${itemSchema.type || 'items'}`,
            example: data.slice(0, 3), // Include up to 3 examples
        };
    }

    // Handle primitives
    if (typeof data !== 'object') {
        const schema: JSONSchema = {
            type: getJSONSchemaType(typeof data),
        };

        // Add format for specific types
        if (typeof data === 'string') {
            const format = inferStringFormat(data);
            if (format) {
                schema.format = format;
            }
            schema.minLength = data.length > 0 ? 1 : 0;
            schema.maxLength = data.length;
            schema.example = data;
        } else if (typeof data === 'number') {
            schema.example = data;
            if (Number.isInteger(data)) {
                schema.type = 'integer';
            }
        } else if (typeof data === 'boolean') {
            schema.example = data;
        }

        return schema;
    }

    // Handle objects
    const obj = data as Record<string, unknown>;
    const properties: Record<string, JSONSchema> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
        // Skip metadata fields
        if (key.startsWith('_')) {
            continue;
        }

        const propSchema = generateJSONSchema(value, `${schemaName}_${key}`, depth + 1, maxDepth);
        
        // Add description based on field name
        propSchema.description = propSchema.description || inferFieldDescription(key, value);
        
        // Add example
        if (value !== null && value !== undefined) {
            propSchema.example = value;
        }

        properties[key] = propSchema;

        // Mark as required if not null/undefined
        if (value !== null && value !== undefined) {
            required.push(key);
        }
    }

    return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
        additionalProperties: false, // Strict schema - no extra properties
        description: schemaName ? `Schema for ${schemaName}` : 'Object schema',
        example: obj,
    };
}

/**
 * Infers JSON Schema type from JavaScript type
 */
function getJSONSchemaType(jsType: string): string {
    const typeMap: Record<string, string> = {
        string: 'string',
        number: 'number',
        boolean: 'boolean',
        object: 'object',
        array: 'array',
    };
    return typeMap[jsType] || 'string';
}

/**
 * Infers string format from value
 */
function inferStringFormat(value: string): string | undefined {
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'email';
    }
    
    // URI/URL
    if (/^https?:\/\//.test(value)) {
        return 'uri';
    }
    
    // Date (ISO 8601)
    if (/^\d{4}-\d{2}-\d{2}/.test(value) && !isNaN(Date.parse(value))) {
        return 'date-time';
    }
    
    // UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        return 'uuid';
    }
    
    // IP address
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
        return 'ipv4';
    }
    
    return undefined;
}

/**
 * Infers human-readable description for fields
 */
function inferFieldDescription(fieldName: string, value: unknown): string {
    const name = fieldName.toLowerCase();
    
    const patterns: Array<[RegExp, string]> = [
        [/^id$|_id$/, 'Unique identifier'],
        [/^name$|_name$/, 'Name of the item'],
        [/^email$|_email$/, 'Email address'],
        [/^url$|_url$/, 'URL or web address'],
        [/^date$|_date$|Date$/, 'Date value'],
        [/^time$|_time$|timestamp$|_at$/, 'Timestamp'],
        [/^page$|_page$/, 'Page number'],
        [/^limit$|_limit$/, 'Maximum number of items'],
        [/^offset$|_offset$/, 'Number of items to skip'],
        [/^total$|_total$/, 'Total count'],
        [/^count$|_count$/, 'Count of items'],
        [/^status$|_status$/, 'Status value'],
        [/^type$|_type$/, 'Type or category'],
        [/^title$|_title$/, 'Title'],
        [/^description$|_description$/, 'Description'],
        [/^created$|created_at$/, 'Creation timestamp'],
        [/^updated$|updated_at$/, 'Last update timestamp'],
        [/^user$|_user$/, 'User information'],
        [/^token$|_token$/, 'Authentication token'],
        [/^key$|_key$/, 'API key or identifier'],
    ];
    
    for (const [pattern, description] of patterns) {
        if (pattern.test(name)) {
            return description;
        }
    }
    
    // Default based on type
    if (typeof value === 'number') {
        return `Numeric value: ${fieldName}`;
    } else if (typeof value === 'string') {
        return `String value: ${fieldName}`;
    } else if (typeof value === 'boolean') {
        return `Boolean flag: ${fieldName}`;
    }
    
    return `Field: ${fieldName}`;
}

/**
 * Generates reusable schema components for OpenAPI
 * Uses $ref for reusability (JSON Schema best practice)
 */
export function generateSchemaComponents(
    schemas: Map<string, JSONSchema>
): Record<string, JSONSchema> {
    const components: Record<string, JSONSchema> = {};
    
    for (const [name, schema] of schemas.entries()) {
        // Remove $schema if present (not needed in OpenAPI components)
        const { $schema, ...openAPISchema } = schema;
        components[name] = openAPISchema;
    }
    
    return components;
}

/**
 * Creates a $ref reference to a component schema
 */
export function createSchemaRef(componentName: string): JSONSchema {
    return {
        $ref: `#/components/schemas/${componentName}`,
    };
}

