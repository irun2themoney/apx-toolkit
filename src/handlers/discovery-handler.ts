import type { PlaywrightCrawlingContext } from 'crawlee';
import { Dataset } from 'crawlee';
import type { ActorInput, DiscoveredAPI, APIResponse } from '../types.js';
import { REQUEST_LABELS } from '../types.js';
import { isAPIResponse, extractAPIMetadata } from '../utils/api-detector.js';
import { generateExports } from '../utils/api-exporter.js';
import { generateAllCodeSnippets } from '../utils/code-generator.js';
import { generateTypeScriptDeclarationFile } from '../utils/typescript-generator.js';
import { generateAllTestSuites } from '../utils/test-generator.js';
import { generateSDKPackages } from '../utils/sdk-generator.js';
import { getStatistics } from '../utils/statistics.js';

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
    // Use Set for O(1) deduplication lookups
    const discoveredBaseUrls = new Set<string>();
    // Cache response bodies to avoid multiple reads
    const responseBodyCache = new Map<string, Buffer>();
    // Store response examples for TypeScript types and documentation
    const responseExamples = new Map<string, APIResponse>();

    log.info(`Starting API discovery for ${request.url}`);

    // Track API activity to enable early exit
    let lastAPIActivityTime = Date.now();
    const API_ACTIVITY_TIMEOUT = 3000; // 3 seconds of no activity = likely done
    let apiActivityCheckInterval: NodeJS.Timeout | null = null;

    // Set up response interceptor
    page.on('response', async (response) => {
        try {
            const url = response.url();
            
            // Check if this response matches our API criteria
            const isAPI = await isAPIResponse(response, {
                apiPatterns: input.apiPatterns,
                minResponseSize: input.minResponseSize || 1000,
            });

            if (isAPI) {
                lastAPIActivityTime = Date.now();
                log.info(`Potential API endpoint found: ${url}`);

                // Cache response body for later use
                try {
                    const body = await response.body();
                    responseBodyCache.set(url, body);
                } catch (error) {
                    // If we can't cache, continue anyway
                    log.debug(`Could not cache response body for ${url}`);
                }

                // Extract API metadata (will use cached body if available)
                const cachedBody = responseBodyCache.get(url);
                const apiMetadata = await extractAPIMetadata(response, input, cachedBody);

                if (apiMetadata) {
                    // Check if we already discovered this API (O(1) lookup)
                    if (!discoveredBaseUrls.has(apiMetadata.baseUrl)) {
                        discoveredBaseUrls.add(apiMetadata.baseUrl);
                        discoveredAPIs.push(apiMetadata);
                        
                        // Capture response example for TypeScript types
                        try {
                            const body = cachedBody || await response.body();
                            const json: APIResponse = JSON.parse(body.toString());
                            responseExamples.set(apiMetadata.url, json);
                        } catch (error) {
                            // If we can't parse, continue without example
                            log.debug(`Could not capture response example for ${url}`);
                        }
                        
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

    // Navigate to the page with optimized wait strategy
    try {
        // Use 'domcontentloaded' for faster initial load, then wait for network activity
        await page.goto(request.url, {
            waitUntil: 'domcontentloaded',
            timeout: input.discoveryTimeout || 10000,
        });

        // Wait for network activity with early exit
        const startTime = Date.now();
        const maxWaitTime = Math.min((input.discoveryTimeout || 10000) - 2000, 8000); // Reserve 2s buffer
        
        // Monitor for API activity
        apiActivityCheckInterval = setInterval(() => {
            const timeSinceLastActivity = Date.now() - lastAPIActivityTime;
            if (timeSinceLastActivity > API_ACTIVITY_TIMEOUT && discoveredAPIs.length > 0) {
                // We have APIs and no recent activity - likely done
                log.debug('No recent API activity, proceeding with discovered APIs');
            }
        }, 500);

        // Wait for network idle or timeout, but with shorter timeout
        try {
            await page.waitForLoadState('networkidle', {
                timeout: maxWaitTime,
            });
        } catch (error) {
            // Network idle timeout is OK - we might have captured APIs already
            log.debug('Network idle timeout, proceeding with discovered APIs');
        }

        // Short wait for any final lazy-loaded calls (reduced from 2s to 1s)
        await page.waitForTimeout(1000);
    } catch (error) {
        log.warning(`Error navigating to page: ${error}`);
        // Continue anyway - we might have captured some responses
    } finally {
        // Clean up interval
        if (apiActivityCheckInterval) {
            clearInterval(apiActivityCheckInterval);
        }
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

    // Record statistics
    const statistics = getStatistics();
    if (statistics && discoveredAPIs.length > 0) {
        statistics.recordDocumentation(discoveredAPIs.length);
    }

    // Generate API documentation exports if requested
    const shouldGenerateDocs =
        input.generateDocumentation !== false &&
        (input.exportFormats && input.exportFormats.length > 0);
    
    if (shouldGenerateDocs && discoveredAPIs.length > 0) {
        log.info('Generating API documentation exports...');
        
        const baseUrl = discoveredAPIs[0]?.baseUrl
            ? new URL(discoveredAPIs[0].baseUrl).origin
            : undefined;
        
        const exports = generateExports(
            discoveredAPIs,
            input.exportFormats || ['openapi', 'postman', 'curl'],
            baseUrl
        );

        // Save exports to dataset
        for (const exportData of exports) {
            await Dataset.pushData({
                _type: 'api_documentation',
                format: exportData.format,
                filename: exportData.filename,
                content: exportData.content,
                mimeType: exportData.mimeType,
                apiCount: discoveredAPIs.length,
                generatedAt: new Date().toISOString(),
                sourceUrl: request.url,
            });

            log.info(`Generated ${exportData.format.toUpperCase()} export: ${exportData.filename}`);
        }

        // Generate code snippets for all APIs (DEVELOPER DREAM FEATURE!)
        log.info('Generating code snippets in multiple languages...');
        const codeSnippets = generateAllCodeSnippets(discoveredAPIs);
        
        await Dataset.pushData({
            _type: 'code_snippets',
            snippets: codeSnippets,
            languages: Object.values(codeSnippets)[0]?.map(s => s.language) || [],
            totalApis: discoveredAPIs.length,
            generatedAt: new Date().toISOString(),
            sourceUrl: request.url,
        });

        log.info(`Generated code snippets for ${discoveredAPIs.length} API(s) in 10 languages`);

        // Generate TypeScript type definitions (DEVELOPER DREAM FEATURE!)
        log.info('Generating TypeScript type definitions...');
        const tsTypes = generateTypeScriptDeclarationFile(discoveredAPIs, responseExamples);
        
        await Dataset.pushData({
            _type: 'typescript_types',
            content: tsTypes,
            filename: 'api-types.d.ts',
            mimeType: 'text/typescript',
            totalApis: discoveredAPIs.length,
            generatedAt: new Date().toISOString(),
            sourceUrl: request.url,
        });

        log.info(`Generated TypeScript types for ${discoveredAPIs.length} API(s)`);

        // Save response examples for documentation
        if (responseExamples.size > 0) {
            log.info('Saving request/response examples...');
            const examples: Array<{
                apiUrl: string;
                method: string;
                request?: unknown;
                response: APIResponse;
            }> = [];

            for (const api of discoveredAPIs) {
                const example = responseExamples.get(api.url);
                if (example) {
                    examples.push({
                        apiUrl: api.baseUrl,
                        method: api.method,
                        request: api.body,
                        response: example,
                    });
                }
            }

            await Dataset.pushData({
                _type: 'api_examples',
                examples,
                totalApis: examples.length,
                generatedAt: new Date().toISOString(),
                sourceUrl: request.url,
            });

            log.info(`Saved ${examples.length} request/response example(s)`);
            statistics?.recordExamples(examples.length);
        }

        // Generate test suites (DEVELOPER DREAM FEATURE!)
        log.info('Generating test suites...');
        const testSuites = generateAllTestSuites(discoveredAPIs, baseUrl);
        
        await Dataset.pushData({
            _type: 'test_suites',
            suites: testSuites,
            frameworks: ['jest', 'pytest', 'mocha', 'vitest', 'playwright'],
            totalApis: discoveredAPIs.length,
            generatedAt: new Date().toISOString(),
            sourceUrl: request.url,
        });

        log.info(`Generated test suites for ${discoveredAPIs.length} API(s) in 5 frameworks`);

        // Generate SDK packages (DEVELOPER DREAM FEATURE!)
        log.info('Generating SDK packages...');
        const sdkPackages = generateSDKPackages(discoveredAPIs, undefined, baseUrl);
        
        for (const sdk of sdkPackages) {
            await Dataset.pushData({
                _type: 'sdk_package',
                language: sdk.language,
                packageName: sdk.packageName,
                files: sdk.files,
                description: sdk.description,
                totalApis: discoveredAPIs.length,
                generatedAt: new Date().toISOString(),
                sourceUrl: request.url,
            });
        }

        log.info(`Generated ${sdkPackages.length} SDK package(s) (TypeScript, Python, Go)`);

        // Also save a summary of discovered APIs
        await Dataset.pushData({
            _type: 'api_summary',
            totalApis: discoveredAPIs.length,
            apis: discoveredAPIs.map((api) => ({
                url: api.baseUrl,
                method: api.method,
                hasPagination: !!api.paginationInfo,
                dataPath: api.dataPath,
            })),
            generatedAt: new Date().toISOString(),
            sourceUrl: request.url,
        });
    }
}

