import type { HttpCrawlingContext } from 'crawlee';
import { Dataset } from 'crawlee';
import type { ActorInput, APIRequestUserData, APIResponse } from '../types.js';
import { REQUEST_LABELS } from '../types.js';
import { retryWithBackoff } from '../utils/retry.js';
import { getStatistics } from '../utils/statistics.js';

/**
 * Extracts data items from API response using the configured data path
 */
function extractDataItems(json: APIResponse, dataPath?: string): unknown[] {
    if (!dataPath) {
        // Try common patterns
        if (json.data?.items && Array.isArray(json.data.items)) {
            return json.data.items;
        }
        if (json.data?.results && Array.isArray(json.data.results)) {
            return json.data.results;
        }
        if (json.results && Array.isArray(json.results)) {
            return json.results;
        }
        if (json.items && Array.isArray(json.items)) {
            return json.items;
        }
        // Return empty array if no data found
        return [];
    }

    // Use JSONPath-like navigation
    const parts = dataPath.split('.');
    let current: unknown = json;

    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = (current as Record<string, unknown>)[part];
        } else {
            return [];
        }
    }

    return Array.isArray(current) ? current : [];
}

/**
 * Builds the API URL with pagination parameters
 */
function buildAPIUrl(
    baseUrl: string,
    userData: APIRequestUserData,
    queryParams?: Record<string, string>
): string {
    const url = new URL(baseUrl);
    const api = userData.discoveredAPI;

    // Add existing query parameters from discovery
    if (api.queryParams) {
        Object.entries(api.queryParams).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    }

    // Add custom query parameters
    if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    }

    // Add pagination parameters based on type
    const paginationInfo = api.paginationInfo;
    if (paginationInfo) {
        const paramName = paginationInfo.paramName || 'page';

        switch (paginationInfo.type) {
            case 'page':
                if (userData.page !== undefined) {
                    url.searchParams.set(paramName, userData.page.toString());
                }
                break;
            case 'offset':
                if (userData.offset !== undefined) {
                    url.searchParams.set(paramName, userData.offset.toString());
                }
                break;
            case 'cursor':
                if (userData.cursor) {
                    url.searchParams.set(paramName, userData.cursor);
                }
                break;
        }
    } else {
        // Default to page-based if no type specified
        if (userData.page !== undefined) {
            url.searchParams.set('page', userData.page.toString());
        }
    }

    return url.toString();
}

/**
 * Determines if there's a next page based on response and user data
 */
function hasNextPage(
    json: APIResponse,
    userData: APIRequestUserData,
    maxPages?: number
): boolean {
    // Check max pages limit
    if (maxPages && userData.page && userData.page >= maxPages) {
        return false;
    }

    const paginationInfo = userData.discoveredAPI.paginationInfo;
    if (!paginationInfo) {
        return false;
    }

    // Check explicit hasNext flag
    if (json.meta?.hasNext === false) {
        return false;
    }

    // Check total pages
    if (userData.totalPages && userData.page && userData.page >= userData.totalPages) {
        return false;
    }

    // Check total records vs current position
    if (paginationInfo.type === 'offset' && paginationInfo.pageSize) {
        const currentOffset = userData.offset || 0;
        const totalRecords = userData.totalRecords || 0;
        if (currentOffset + paginationInfo.pageSize >= totalRecords) {
            return false;
        }
    }

    // Check if we got any data (if empty, probably no more pages)
    const items = extractDataItems(json, userData.discoveredAPI.dataPath);
    if (items.length === 0) {
        return false;
    }

    return true;
}

/**
 * Calculates the next page parameters
 */
function getNextPageParams(
    userData: APIRequestUserData,
    responseJson?: APIResponse
): Partial<APIRequestUserData> {
    const paginationInfo = userData.discoveredAPI.paginationInfo;

    if (!paginationInfo) {
        return {};
    }

    switch (paginationInfo.type) {
        case 'page':
            return {
                page: (userData.page || 1) + 1,
            };
        case 'offset':
            const pageSize = paginationInfo.pageSize || 20;
            return {
                offset: (userData.offset || 0) + pageSize,
            };
        case 'cursor':
            // Cursor should be extracted from the response
            const nextCursor = responseJson?.meta?.nextCursor || userData.cursor;
            if (!nextCursor) {
                return {};
            }
            return {
                cursor: nextCursor,
            };
        default:
            return {
                page: (userData.page || 1) + 1,
            };
    }
}

/**
 * Handler for API_PROCESS requests
 * Uses HttpCrawler for fast data extraction with pagination support
 */
export async function handleAPIProcessing(
    context: HttpCrawlingContext,
    input: ActorInput
): Promise<void> {
    const { request, sendRequest, log, crawler } = context;
    const userData = request.userData as APIRequestUserData;

    if (!userData.discoveredAPI) {
        log.error('Missing discoveredAPI in userData');
        return;
    }

    const api = userData.discoveredAPI;
    log.info(`Processing API request: ${api.baseUrl}`, {
        page: userData.page,
        offset: userData.offset,
    });

    const statistics = getStatistics();
    
    try {
        // Build the API URL with pagination
        const apiUrl = buildAPIUrl(api.baseUrl, userData);

        // Make the HTTP request with retry logic
        const response = await retryWithBackoff(
            async () => {
                return await sendRequest({
                    url: apiUrl,
                    headers: api.headers,
                    method: api.method,
                    payload: api.body ? JSON.stringify(api.body) : undefined,
                });
            },
            {
                maxAttempts: 3,
                initialDelay: 1000,
            }
        );

        // Parse JSON response
        let json: APIResponse;
        try {
            json = JSON.parse(response.body);
        } catch (parseError) {
            log.error(`Failed to parse JSON response from ${apiUrl}`);
            statistics?.recordRequest(false);
            throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }

        // Extract data items
        const items = extractDataItems(json, api.dataPath);

        if (items.length === 0) {
            log.warning('No data items found in API response');
            statistics?.recordRequest(true, 0);
        } else {
            log.info(`Extracted ${items.length} items from API response`);

            // Batch dataset writes for better performance
            const itemsToSave = items.map((item) => ({
                ...(typeof item === 'object' && item !== null ? item : {}),
                _metadata: {
                    sourceUrl: request.url,
                    apiUrl: apiUrl,
                    page: userData.page,
                    offset: userData.offset,
                    extractedAt: new Date().toISOString(),
                },
            }));

            // Use pushData with array for batch write (more efficient)
            await Dataset.pushData(itemsToSave);
            statistics?.recordRequest(true, items.length);
        }

        // Update pagination info from response if available
        if (json.meta) {
            if (json.meta.total !== undefined) {
                userData.totalRecords = json.meta.total;
            }
            if (json.meta.page !== undefined) {
                userData.page = json.meta.page;
            }
            if (json.meta.limit && json.meta.total) {
                userData.totalPages = Math.ceil(json.meta.total / json.meta.limit);
            }
        }

        // Check if there's a next page and enqueue it
        if (hasNextPage(json, userData, input.maxPages)) {
            const nextPageParams = getNextPageParams(userData, json);

            await crawler.addRequests([
                {
                    url: api.baseUrl,
                    label: REQUEST_LABELS.API_PROCESS,
                    userData: {
                        ...userData,
                        ...nextPageParams,
                    },
                    headers: api.headers,
                },
            ]);

            log.info(`Enqueued next page: ${JSON.stringify(nextPageParams)}`);
            statistics?.recordPage();
        } else {
            log.info('Reached end of pagination or max pages limit');
        }
    } catch (error) {
        statistics?.recordRequest(false);
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error(`Error processing API request: ${errorMessage}`, {
            url: api.baseUrl,
            error: errorMessage,
        });
        
        // Provide helpful error message
        if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
            log.warning('Request timed out. The API may be slow or unavailable. Consider increasing timeout settings.');
        } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
            log.warning('Rate limit detected. The API may have rate limiting. Consider reducing concurrency or adding delays.');
        } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
            log.warning('Authentication failed. The API may require authentication tokens or credentials.');
        }
        
        throw error;
    }
}

