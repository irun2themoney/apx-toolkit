/**
 * Request labels for routing between discovery and API processing phases
 */
export const REQUEST_LABELS = {
    START_DISCOVERY: 'START_DISCOVERY',
    API_PROCESS: 'API_PROCESS',
} as const;

export type RequestLabel = typeof REQUEST_LABELS[keyof typeof REQUEST_LABELS];

/**
 * Input configuration for the Actor
 */
export interface ActorInput {
    startUrls: Array<{ url: string }>;
    apiPatterns?: string[];
    minResponseSize?: number;
    discoveryTimeout?: number;
    maxPages?: number;
    maxConcurrency?: number;
    dataPath?: string;
    paginationType?: 'auto' | 'offset' | 'page' | 'cursor';
    exportFormats?: ExportFormat[];
    generateDocumentation?: boolean;
}

/**
 * Export format options
 */
export type ExportFormat = 'openapi' | 'postman' | 'curl' | 'insomnia';

/**
 * API documentation export
 */
export interface APIExport {
    format: ExportFormat;
    content: string;
    filename: string;
    mimeType: string;
}

/**
 * Discovered API endpoint metadata
 */
export interface DiscoveredAPI {
    url: string;
    baseUrl: string;
    method: 'GET' | 'POST';
    headers: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: unknown;
    paginationInfo?: PaginationInfo;
    dataPath?: string;
}

/**
 * Pagination information extracted from API response
 */
export interface PaginationInfo {
    type: 'offset' | 'page' | 'cursor';
    currentPage?: number;
    currentOffset?: number;
    pageSize?: number;
    totalRecords?: number;
    totalPages?: number;
    hasNext?: boolean;
    nextCursor?: string;
    paramName?: string;
}

/**
 * User data stored with API_PROCESS requests
 */
export interface APIRequestUserData {
    page?: number;
    offset?: number;
    cursor?: string;
    totalRecords?: number;
    totalPages?: number;
    discoveredAPI: DiscoveredAPI;
}

/**
 * API response structure (common patterns)
 */
export interface APIResponse {
    data?: {
        items?: unknown[];
        results?: unknown[];
        list?: unknown[];
    };
    results?: unknown[];
    items?: unknown[];
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        offset?: number;
        hasNext?: boolean;
        nextCursor?: string;
    };
    pagination?: {
        page?: number;
        total?: number;
        limit?: number;
    };
    [key: string]: unknown;
}

