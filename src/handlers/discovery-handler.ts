import type { PlaywrightCrawlingContext } from 'crawlee';
import type { ActorInput, DiscoveredAPI } from '../types.js';
import { REQUEST_LABELS } from '../types.js';
import { isAPIResponse, extractAPIMetadata } from '../utils/api-detector.js';

/**
 * Handler for START_DISCOVERY requests
 * Uses Playwright to intercept network traffic and discover API endpoints
 */
export async function handleDiscovery(
    context: PlaywrightCrawlingContext,
    input: ActorInput
): Promise<void> {
    const { request, page, log, crawler } = context;
    const discoveredAPIs: DiscoveredAPI[] = [];

    log.info(`Starting API discovery for ${request.url}`);

    // Set up response interceptor
    page.on('response', async (response) => {
        try {
            // Check if this response matches our API criteria
            const isAPI = await isAPIResponse(response, {
                apiPatterns: input.apiPatterns,
                minResponseSize: input.minResponseSize || 1000,
            });

            if (isAPI) {
                log.info(`Potential API endpoint found: ${response.url()}`);

                // Extract API metadata
                const apiMetadata = await extractAPIMetadata(response, input);

                if (apiMetadata) {
                    // Check if we already discovered this API (by base URL)
                    const alreadyDiscovered = discoveredAPIs.some(
                        (api) => api.baseUrl === apiMetadata.baseUrl
                    );

                    if (!alreadyDiscovered) {
                        discoveredAPIs.push(apiMetadata);
                        log.info(`Discovered API: ${apiMetadata.baseUrl}`, {
                            method: apiMetadata.method,
                            hasPagination: !!apiMetadata.paginationInfo,
                            dataPath: apiMetadata.dataPath,
                        });
                    }
                }
            }
        } catch (error) {
            // Log but don't fail on individual response errors
            log.debug(`Error processing response: ${error}`);
        }
    });

    // Navigate to the page
    try {
        await page.goto(request.url, {
            waitUntil: 'networkidle',
            timeout: input.discoveryTimeout || 10000,
        });

        // Wait a bit more for any lazy-loaded API calls
        await page.waitForTimeout(2000);
    } catch (error) {
        log.warning(`Error navigating to page: ${error}`);
        // Continue anyway - we might have captured some responses
    }

    // If no APIs were discovered, log a warning
    if (discoveredAPIs.length === 0) {
        log.warning(
            'No API endpoints discovered. The page might not use API calls, or they might be triggered by user interaction.'
        );
        return;
    }

    // Enqueue discovered APIs for processing
    for (const api of discoveredAPIs) {
        const initialUserData = {
            page: api.paginationInfo?.currentPage || 1,
            offset: api.paginationInfo?.currentOffset || 0,
            cursor: api.paginationInfo?.nextCursor,
            totalRecords: api.paginationInfo?.totalRecords,
            totalPages: api.paginationInfo?.totalPages,
            discoveredAPI: api,
        };

        // Add the first API request
        await crawler.addRequests([
            {
                url: api.baseUrl,
                label: REQUEST_LABELS.API_PROCESS,
                userData: initialUserData,
                headers: api.headers,
            },
        ]);

        log.info(`Enqueued API request: ${api.baseUrl}`, {
            label: REQUEST_LABELS.API_PROCESS,
            initialPage: initialUserData.page,
        });
    }

    log.info(`Discovery complete. Found ${discoveredAPIs.length} API endpoint(s).`);
}

