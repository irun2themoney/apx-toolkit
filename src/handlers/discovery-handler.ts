import type { PlaywrightCrawlingContext } from 'crawlee';
import { Dataset } from 'crawlee';
import type { Page } from 'playwright';
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
 * Simulates user interactions to trigger API calls on landing pages
 */
async function simulateInteractions(
    page: Page,
    log: any,
    lastAPIActivityTime: { value: number },
    discoveredAPIs: DiscoveredAPI[],
    discoveredBaseUrls: Set<string>,
    responseBodyCache: Map<string, Buffer>,
    responseExamples: Map<string, APIResponse>,
    input: ActorInput
): Promise<void> {
    const interactionWaitTime = input.interactionWaitTime || 2000;
    
    try {
        log.info('Starting interaction simulation: scrolling and clicking...');
        
        // Set up response listener for interactions
        const responseListener = async (response: any) => {
            try {
                const url = response.url();
                const isAPI = await isAPIResponse(response, {
                    apiPatterns: input.apiPatterns,
                    minResponseSize: input.minResponseSize || 1000,
                });

                if (isAPI) {
                    lastAPIActivityTime.value = Date.now();
                    log.info(`API discovered during interaction: ${url}`);

                    try {
                        const body = await response.body();
                        responseBodyCache.set(url, body);
                    } catch (error) {
                        log.debug(`Could not cache response body for ${url}`);
                    }

                    const cachedBody = responseBodyCache.get(url);
                    const apiMetadata = await extractAPIMetadata(response, input, cachedBody);

                    if (apiMetadata && !discoveredBaseUrls.has(apiMetadata.baseUrl)) {
                        discoveredBaseUrls.add(apiMetadata.baseUrl);
                        discoveredAPIs.push(apiMetadata);
                        
                        try {
                            const body = cachedBody || await response.body();
                            const json: APIResponse = JSON.parse(body.toString());
                            responseExamples.set(apiMetadata.url, json);
                        } catch (error) {
                            log.debug(`Could not capture response example for ${url}`);
                        }
                        
                        log.info(`Discovered API: ${apiMetadata.baseUrl}`);
                    }
                }
            } catch (error) {
                log.debug(`Error processing response during interaction: ${error}`);
            }
        };

        page.on('response', responseListener);

        // Scroll down to trigger lazy-loaded content
        log.info('Scrolling page to trigger lazy-loaded APIs...');
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 300;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
        await page.waitForTimeout(interactionWaitTime);

        // Try clicking common interactive elements
        log.info('Clicking interactive elements...');
        const clickableSelectors = [
            'button',
            'a[href]',
            '[role="button"]',
            '.btn',
            '.button',
            '[data-testid*="button"]',
            '[data-testid*="link"]',
        ];

        for (const selector of clickableSelectors) {
            try {
                const elements = await page.$$(selector);
                if (elements.length > 0 && elements.length <= 10) {
                    // Only click if there are a reasonable number of elements
                    for (let i = 0; i < Math.min(3, elements.length); i++) {
                        try {
                            const element = elements[i];
                            const isVisible = await element.isVisible();
                            if (isVisible) {
                                await element.click({ timeout: 1000 });
                                await page.waitForTimeout(1000);
                                
                                // If we found APIs, we can stop
                                if (discoveredAPIs.length > 0) {
                                    break;
                                }
                            }
                        } catch (error) {
                            // Element might not be clickable, continue
                        }
                    }
                }
                if (discoveredAPIs.length > 0) {
                    break;
                }
            } catch (error) {
                // Selector might not exist, continue
            }
        }

        // Wait a bit more for any delayed API calls
        await page.waitForTimeout(interactionWaitTime);

        // Remove the response listener
        page.off('response', responseListener);

        if (discoveredAPIs.length > 0) {
            log.info(`Interaction simulation successful! Discovered ${discoveredAPIs.length} API(s)`);
        } else {
            log.warning('Interaction simulation did not discover any APIs');
        }
    } catch (error) {
        log.warning(`Error during interaction simulation: ${error}`);
    }
}

/**
 * Handles OAuth 2.0 login flow and captures authentication tokens
 */
async function handleOAuthFlow(
    page: Page,
    loginUrl: string,
    log: any
): Promise<{ token?: string; cookies?: string; headers?: Record<string, string> }> {
    try {
        log.info(`Starting OAuth flow: navigating to login URL: ${loginUrl}`);
        
        const capturedTokens: string[] = [];
        const capturedCookies: string[] = [];
        const capturedHeaders: Record<string, string> = {};
        
        // Set up response listener to capture tokens
        const responseListener = async (response: any) => {
            try {
                const url = response.url();
                const headers = response.headers();
                
                // Look for Authorization headers in responses
                if (headers['authorization']) {
                    capturedTokens.push(headers['authorization']);
                    log.info(`Captured authorization token from: ${url}`);
                }
                
                // Look for tokens in response body
                try {
                    const body = await response.body();
                    const text = body.toString();
                    
                    // Common token patterns
                    const tokenPatterns = [
                        /"access_token"\s*:\s*"([^"]+)"/i,
                        /"token"\s*:\s*"([^"]+)"/i,
                        /"bearer"\s*:\s*"([^"]+)"/i,
                        /access_token=([^&\s]+)/i,
                    ];
                    
                    for (const pattern of tokenPatterns) {
                        const match = text.match(pattern);
                        if (match && match[1]) {
                            capturedTokens.push(match[1]);
                            log.info(`Captured token from response body: ${url}`);
                        }
                    }
                } catch (error) {
                    // Ignore body read errors
                }
            } catch (error) {
                // Ignore individual response errors
            }
        };
        
        page.on('response', responseListener);
        
        // Navigate to login page
        await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait a bit for any automatic redirects
        await page.waitForTimeout(2000);
        
        // Try to find and fill login form
        try {
            const emailInput = await page.$('input[type="email"], input[name*="email"], input[id*="email"]');
            const passwordInput = await page.$('input[type="password"], input[name*="password"], input[id*="password"]');
            const submitButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
            
            if (emailInput && passwordInput) {
                log.info('Found login form, attempting to fill (will need user credentials)');
                // Note: In production, user would need to provide credentials
                // For now, we'll just wait and capture tokens from the flow
            }
        } catch (error) {
            // Form not found or not fillable
        }
        
        // Wait for redirects and token capture
        await page.waitForTimeout(5000);
        
        // Get cookies
        const cookies = await page.context().cookies();
        const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
        
        // Remove listener
        page.off('response', responseListener);
        
        const result: { token?: string; cookies?: string; headers?: Record<string, string> } = {};
        
        if (capturedTokens.length > 0) {
            result.token = capturedTokens[0];
            result.headers = { Authorization: capturedTokens[0] };
            log.info('✅ OAuth flow completed: Token captured');
        }
        
        if (cookieString) {
            result.cookies = cookieString;
            if (!result.headers) result.headers = {};
            result.headers['Cookie'] = cookieString;
        }
        
        return result;
    } catch (error) {
        log.warning(`OAuth flow error: ${error}`);
        return {};
    }
}

/**
 * Handler for START_DISCOVERY requests
 * Uses Playwright to intercept network traffic and discover API endpoints
 */
export async function handleDiscovery(
    context: PlaywrightCrawlingContext,
    input: ActorInput
): Promise<void> {
    const { request, page, log, crawler } = context;
    
    // Handle OAuth flow if login URL provided
    let oauthAuthHeaders: Record<string, string> = {};
    if (input.loginUrl && input.oauthFlow) {
        const oauthResult = await handleOAuthFlow(page, input.loginUrl, log);
        if (oauthResult.headers) {
            oauthAuthHeaders = oauthResult.headers;
            log.info('OAuth authentication completed, using captured tokens for API requests');
        }
    }
    const discoveredAPIs: DiscoveredAPI[] = [];
    // Use Set for O(1) deduplication lookups
    const discoveredBaseUrls = new Set<string>();
    // Cache response bodies to avoid multiple reads
    const responseBodyCache = new Map<string, Buffer>();
    // Store response examples for TypeScript types and documentation
    const responseExamples = new Map<string, APIResponse>();

    log.info(`Starting API discovery for ${request.url}`);

    // Track API activity to enable early exit
    const lastAPIActivityTime = { value: Date.now() };
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
                lastAPIActivityTime.value = Date.now();
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
            const timeSinceLastActivity = Date.now() - lastAPIActivityTime.value;
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

        // If no APIs discovered yet and interaction simulation is enabled, try to trigger APIs
        if (discoveredAPIs.length === 0 && input.enableInteractionSimulation !== false) {
            log.info('No APIs discovered on initial load. Attempting interaction simulation...');
            await simulateInteractions(page, log, lastAPIActivityTime, discoveredAPIs, discoveredBaseUrls, responseBodyCache, responseExamples, input);
        }
    } catch (error) {
        log.warning(`Error navigating to page: ${error}`);
        // Continue anyway - we might have captured some responses
    } finally {
        // Clean up interval
        if (apiActivityCheckInterval) {
            clearInterval(apiActivityCheckInterval);
        }
    }

    // If no APIs were discovered, log a warning with helpful suggestions
    if (discoveredAPIs.length === 0) {
        log.warning(
            'No API endpoints discovered. The page might not use API calls, or they might be triggered by user interaction.'
        );
        log.warning(
            '💡 Tip: Try enabling interaction simulation or provide a direct API endpoint URL instead of a landing page.'
        );
        return;
    }

    // Enqueue discovered APIs for processing
    // Access the shared requestQueue from the crawler to ensure HttpCrawler can pick up requests
    const requestQueue = (crawler as any).requestQueue;
    
    for (const api of discoveredAPIs) {
        const initialUserData = {
            page: api.paginationInfo?.currentPage || 1,
            offset: api.paginationInfo?.currentOffset || 0,
            cursor: api.paginationInfo?.nextCursor,
            totalRecords: api.paginationInfo?.totalRecords,
            totalPages: api.paginationInfo?.totalPages,
            discoveredAPI: api,
        };

        // Merge OAuth headers with API headers if OAuth flow was used
        const mergedHeaders = { ...api.headers, ...oauthAuthHeaders };

        // Add the first API request directly to the shared requestQueue
        // This ensures HttpCrawler can pick it up
        if (requestQueue) {
            await requestQueue.addRequest({
                url: api.baseUrl,
                label: REQUEST_LABELS.API_PROCESS,
                userData: initialUserData,
                headers: mergedHeaders,
            });
        } else {
            // Fallback to crawler.addRequests if requestQueue not accessible
            await crawler.addRequests([
                {
                    url: api.baseUrl,
                    label: REQUEST_LABELS.API_PROCESS,
                    userData: initialUserData,
                    headers: mergedHeaders,
                },
            ]);
        }

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

