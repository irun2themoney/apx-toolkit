import type { Response } from 'playwright';
import type { DiscoveredAPI, APIResponse, PaginationInfo, ActorInput } from '../types.js';

/**
 * Checks if a response matches the criteria for an API endpoint
 */
export async function isAPIResponse(
    response: Response,
    config: { apiPatterns?: string[]; minResponseSize?: number }
): Promise<boolean> {
    const url = response.url();
    const headers = response.headers();
    const contentType = headers['content-type'] || '';

    // Must be JSON response
    if (!contentType.includes('application/json')) {
        return false;
    }

    // Check URL patterns if provided
    if (config.apiPatterns && config.apiPatterns.length > 0) {
        const matchesPattern = config.apiPatterns.some((pattern) => url.includes(pattern));
        if (!matchesPattern) {
            return false;
        }
    }

    // Check response size
    try {
        const body = await response.body();
        if (config.minResponseSize && body.length < config.minResponseSize) {
            return false;
        }
    } catch (error) {
        // If we can't read the body, skip this response
        return false;
    }

    // Exclude common non-data endpoints
    const excludePatterns = [
        '/config',
        '/settings',
        '/manifest',
        '/health',
        '/status',
        '.json', // Often config files
    ];

    const shouldExclude = excludePatterns.some((pattern) => url.includes(pattern));
    if (shouldExclude) {
        return false;
    }

    return true;
}

/**
 * Extracts API metadata from a network response
 */
export async function extractAPIMetadata(
    response: Response,
    config: ActorInput
): Promise<DiscoveredAPI | null> {
    try {
        const url = new URL(response.url());
        const headers = response.headers();
        const method = response.request().method() as 'GET' | 'POST';

        // Extract base URL (without query parameters)
        const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;

        // Extract query parameters
        const queryParams: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });

        // Extract headers (especially authentication)
        const relevantHeaders: Record<string, string> = {};
        const headerKeys = [
            'authorization',
            'x-api-key',
            'x-auth-token',
            'cookie',
            'referer',
            'origin',
            'user-agent',
        ];

        headerKeys.forEach((key) => {
            const value = headers[key.toLowerCase()];
            if (value) {
                relevantHeaders[key] = value;
            }
        });

        // Try to extract pagination info from response body
        let paginationInfo: PaginationInfo | undefined;
        let dataPath: string | undefined = config.dataPath;

        try {
            const body = await response.body();
            const json: APIResponse = JSON.parse(body.toString());

            // Auto-detect data path if not provided
            if (!dataPath) {
                dataPath = detectDataPath(json);
            }

            // Extract pagination information
            paginationInfo = extractPaginationInfo(json, queryParams);
        } catch (error) {
            // If we can't parse JSON, still return the API metadata
            // The handler will handle parsing errors
        }

        // Extract request body if POST
        let body: unknown;
        if (method === 'POST') {
            try {
                const postData = response.request().postData();
                if (postData) {
                    body = JSON.parse(postData);
                }
            } catch (error) {
                // Ignore parsing errors
            }
        }

        return {
            url: response.url(),
            baseUrl,
            method,
            headers: relevantHeaders,
            queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
            body,
            paginationInfo,
            dataPath,
        };
    } catch (error) {
        return null;
    }
}

/**
 * Auto-detects the path to data items in the JSON response
 */
function detectDataPath(json: APIResponse): string | undefined {
    // Common patterns
    if (json.data?.items && Array.isArray(json.data.items)) {
        return 'data.items';
    }
    if (json.data?.results && Array.isArray(json.data.results)) {
        return 'data.results';
    }
    if (json.data?.list && Array.isArray(json.data.list)) {
        return 'data.list';
    }
    if (json.results && Array.isArray(json.results)) {
        return 'results';
    }
    if (json.items && Array.isArray(json.items)) {
        return 'items';
    }

    // Look for any array property at root level
    for (const [key, value] of Object.entries(json)) {
        if (Array.isArray(value) && value.length > 0) {
            return key;
        }
    }

    return undefined;
}

/**
 * Extracts pagination information from API response
 */
function extractPaginationInfo(
    json: APIResponse,
    queryParams: Record<string, string>
): PaginationInfo | undefined {
    const info: Partial<PaginationInfo> = {};

    // Extract from meta object
    if (json.meta) {
        if (json.meta.total !== undefined) {
            info.totalRecords = json.meta.total;
        }
        if (json.meta.page !== undefined) {
            info.currentPage = json.meta.page;
            info.type = 'page';
            info.paramName = 'page';
        }
        if (json.meta.offset !== undefined) {
            info.currentOffset = json.meta.offset;
            info.type = 'offset';
            info.paramName = 'offset';
        }
        if (json.meta.limit !== undefined) {
            info.pageSize = json.meta.limit;
        }
        if (json.meta.hasNext !== undefined) {
            info.hasNext = json.meta.hasNext;
        }
        if (json.meta.nextCursor) {
            info.nextCursor = json.meta.nextCursor;
            info.type = 'cursor';
            info.paramName = 'cursor';
        }
    }

    // Extract from pagination object
    if (json.pagination) {
        if (json.pagination.page !== undefined) {
            info.currentPage = json.pagination.page;
            info.type = 'page';
            info.paramName = 'page';
        }
        if (json.pagination.total !== undefined) {
            info.totalRecords = json.pagination.total;
        }
        if (json.pagination.limit !== undefined) {
            info.pageSize = json.pagination.limit;
        }
    }

    // Calculate total pages if we have total records and page size
    if (info.totalRecords && info.pageSize) {
        info.totalPages = Math.ceil(info.totalRecords / info.pageSize);
    }

    // Infer from query parameters if not found in response
    if (!info.type) {
        if (queryParams.page) {
            info.type = 'page';
            info.currentPage = parseInt(queryParams.page, 10);
            info.paramName = 'page';
        } else if (queryParams.offset) {
            info.type = 'offset';
            info.currentOffset = parseInt(queryParams.offset, 10);
            info.paramName = 'offset';
        } else if (queryParams.cursor) {
            info.type = 'cursor';
            info.nextCursor = queryParams.cursor;
            info.paramName = 'cursor';
        }
    }

    // If we still don't have a type, default to page-based
    if (!info.type) {
        info.type = 'page';
        info.paramName = 'page';
    }

    return Object.keys(info).length > 1 ? (info as PaginationInfo) : undefined;
}

