/**
 * Core Runner - Decoupled execution logic for APX
 * This module contains the core APX functionality without Apify Actor dependencies
 * Can be used by CLI, test scripts, or other integrations
 * 
 * Key Decoupling Features:
 * - Accepts native TypeScript objects (ActorInput) instead of reading from Apify KeyValueStore
 * - Uses Crawlee's local storage (works without Apify platform)
 * - Returns structured results instead of pushing to global Dataset
 * - Fully executable outside Apify environment
 */

import { PlaywrightCrawler, HttpCrawler, Router, RequestQueue, Dataset } from 'crawlee';
import type { ActorInput, DiscoveredAPI } from './types.js';
import { REQUEST_LABELS } from './types.js';
import { handleDiscovery } from './handlers/discovery-handler.js';
import { handleAPIProcessing } from './handlers/api-handler.js';
import { StatisticsCollector } from './utils/statistics.js';
import { setStatistics } from './utils/statistics.js';
import { ProgressTracker, type ProgressCallback } from './utils/progress-tracker.js';

export interface CodeSnippet {
    language: string;
    code: string;
    apiUrl: string;
}

export interface TestSuite {
    framework: string;
    tests: string;
    filename: string;
}

export interface SDKPackage {
    language: string;
    packageName: string;
    files: Record<string, string>;
}

export interface Documentation {
    format: string;
    content: string;
    filename: string;
    mimeType?: string;
    [key: string]: unknown; // Allow additional properties
}

export interface APIExample {
    apiUrl: string;
    method: string;
    request?: Record<string, unknown>;
    response?: Record<string, unknown>;
    [key: string]: unknown; // Allow additional properties
}

export interface APXResult {
    summary: {
        apisDiscovered: number;
        requestsProcessed: number;
        itemsExtracted: number;
        discoveryDuration: number;
        totalDuration: number;
    };
    artifacts: {
        codeSnippets: Record<string, CodeSnippet[]>;
        typescriptTypes: string;
        testSuites: TestSuite[];
        sdkPackages: SDKPackage[];
        documentation: Documentation[];
        examples: APIExample[];
    };
    data: Record<string, unknown>[];
    statistics: import('./utils/statistics.js').ActorStatistics;
}

/**
 * Validates input configuration
 */
function validateInput(input: ActorInput): void {
    if (!input.startUrls || input.startUrls.length === 0) {
        throw new Error('startUrls is required and must contain at least one URL');
    }

    for (const urlObj of input.startUrls) {
        if (!urlObj.url || typeof urlObj.url !== 'string') {
            throw new Error('Each startUrl must have a valid url string');
        }
        try {
            new URL(urlObj.url);
        } catch (error) {
            throw new Error(`Invalid URL format: ${urlObj.url}`);
        }
    }

    if (input.minResponseSize !== undefined && input.minResponseSize < 0) {
        throw new Error('minResponseSize must be >= 0');
    }
    if (input.discoveryTimeout !== undefined && input.discoveryTimeout < 1000) {
        throw new Error('discoveryTimeout must be >= 1000ms');
    }
    if (input.maxPages !== undefined && input.maxPages < 1) {
        throw new Error('maxPages must be >= 1');
    }
    if (input.maxConcurrency !== undefined && input.maxConcurrency < 1) {
        throw new Error('maxConcurrency must be >= 1');
    }
    if (input.paginationType && !['auto', 'offset', 'page', 'cursor'].includes(input.paginationType)) {
        throw new Error('paginationType must be one of: auto, offset, page, cursor');
    }
    if (input.exportFormats) {
        const validFormats = ['openapi', 'postman', 'curl', 'insomnia'];
        for (const format of input.exportFormats) {
            if (!validFormats.includes(format)) {
                throw new Error(`Invalid export format: ${format}. Must be one of: ${validFormats.join(', ')}`);
            }
        }
    }
}

/**
 * Core APX execution function
 * Runs the complete APX workflow without Apify Actor dependencies
 * 
 * Decoupling Strategy:
 * 1. Input: Accepts native TypeScript object (ActorInput) instead of reading from Apify KeyValueStore
 * 2. Crawlee Setup: Uses Crawlee's local storage automatically (works without Apify platform)
 *    - RequestQueue, Dataset, and other storage clients work locally via file system
 *    - No special configuration needed - Crawlee detects environment automatically
 * 3. Output: Collects generated data into structured object (APXResult) for return
 *    - Data is collected from Dataset after processing
 *    - All artifacts are structured and returned to caller
 * 
 * This allows APX to run in multiple environments:
 * - Apify Actor (via main.ts)
 * - CLI tool (via cli.ts)
 * - Test scripts (via test-main.ts)
 * - Any Node.js environment
 * 
 * @param input - Configuration input (native TypeScript object)
 * @param options - Optional execution options (progress callbacks, error handlers)
 * @returns Structured result with all generated artifacts and data
 */
export async function runAPXCore(
    input: ActorInput,
    options?: {
        onProgress?: (message: string) => void;
        onError?: (error: Error) => void;
        progressTracker?: ProgressTracker;
    }
): Promise<APXResult> {
    const startTime = Date.now();
    const log = options?.onProgress || ((msg: string) => console.log(msg));
    const onError = options?.onError || ((err: Error) => console.error(err.message));
    
    // Initialize progress tracker
    const progressTracker = options?.progressTracker || new ProgressTracker();
    progressTracker.onProgress((event) => {
        const progressMsg = event.progress !== undefined 
            ? `[${event.progress}%] ${event.message}`
            : event.message;
        log(progressMsg);
    });

    // Validate input
    validateInput(input);

    // Initialize statistics collector
    const statistics = new StatisticsCollector();
    setStatistics(statistics);

    // Create a shared request queue
    // Crawlee automatically uses local storage when not on Apify platform
    // Storage location: ./storage/request_queues/default (local) or Apify cloud (on platform)
    // No special configuration needed - it works out of the box
    const requestQueue = await RequestQueue.open();

    // Create router for request handling
    const router = Router.create();

    // Register START_DISCOVERY handler (Playwright-based)
    router.addHandler(REQUEST_LABELS.START_DISCOVERY, async (context) => {
        await handleDiscovery(context as any, input);
    });

    // Register API_PROCESS handler (HTTP-based)
    router.addHandler(REQUEST_LABELS.API_PROCESS, async (context) => {
        await handleAPIProcessing(context as any, input);
    });

    // Configure PlaywrightCrawler for discovery phase
    // Crawlee automatically uses local storage when not on Apify platform
    const playwrightCrawler = new PlaywrightCrawler({
        requestHandler: router,
        requestQueue,
        maxRequestsPerCrawl: input.startUrls.length,
        launchContext: {
            launchOptions: {
                headless: true,
            },
        },
        requestHandlerTimeoutSecs: 60,
    });

    // Configure HttpCrawler for API processing phase
    // Crawlee automatically uses local storage when not on Apify platform
    const httpCrawler = new HttpCrawler({
        requestHandler: router,
        requestQueue,
        maxRequestsPerCrawl: (input.maxPages || 100) * (input.startUrls.length || 1),
        maxConcurrency: input.maxConcurrency || 5,
        requestHandlerTimeoutSecs: 30,
    });

    // Prepare initial requests with START_DISCOVERY label
    const initialRequests = input.startUrls.map((urlObj) => ({
        url: urlObj.url,
        label: REQUEST_LABELS.START_DISCOVERY,
    }));

    log('🚀 Starting APX - The API Toolkit');
    log('='.repeat(60));
    log(`📋 Configuration:`);
    log(`   Start URLs: ${input.startUrls.length}`);
    log(`   Max Pages: ${input.maxPages || 100}`);
    log(`   Max Concurrency: ${input.maxConcurrency || 5}`);
    log(`   Generate Documentation: ${input.generateDocumentation !== false ? 'Yes' : 'No'}`);
    log(`   Export Formats: ${input.exportFormats?.join(', ') || 'openapi, postman, curl'}`);
    log('='.repeat(60));
    log('');

    try {
        const discoveryStartTime = Date.now();
        progressTracker.discovery('Starting API discovery phase...');
        
        // Run PlaywrightCrawler for discovery
        await playwrightCrawler.run(initialRequests);

        const discoveryDuration = (Date.now() - discoveryStartTime) / 1000;
        progressTracker.discovery(`Discovery phase complete (${discoveryDuration.toFixed(1)}s)`, undefined, undefined, 100);
        log(`✅ Discovery phase complete (${discoveryDuration.toFixed(1)}s)`);
        log('');

        // Get discovery stats
        const queueInfo = await requestQueue.getInfo();
        const apisDiscovered = (queueInfo?.totalRequestCount || 0) - input.startUrls.length;
        
        if (apisDiscovered > 0) {
            statistics.recordDiscovery(apisDiscovered, discoveryDuration);
            progressTracker.discovery(`Discovered ${apisDiscovered} API endpoint(s)`, undefined, apisDiscovered, apisDiscovered);
            log(`🔍 Discovered ${apisDiscovered} API endpoint(s)`);
            
            const queueInfoBefore = await requestQueue.getInfo();
            const pendingRequests = (queueInfoBefore?.totalRequestCount || 0) - (queueInfoBefore?.handledRequestCount || 0);
            log(`📋 Queue status: ${queueInfoBefore?.totalRequestCount || 0} total, ${queueInfoBefore?.handledRequestCount || 0} handled, ${pendingRequests} pending`);
            progressTracker.processing('Starting API processing phase...', undefined, pendingRequests, 0);
            log('⚡ Starting API processing phase...');
            log('');
        } else {
            progressTracker.discovery('No APIs discovered', undefined, 0, 0);
            log('⚠️  No APIs discovered. The site may not use API calls or they may require user interaction.');
            log('');
        }

        // Run HttpCrawler to process all API_PROCESS requests
        await httpCrawler.run();

        const queueInfoAfter = await requestQueue.getInfo();
        const processed = queueInfoAfter?.handledRequestCount || 0;
        const total = queueInfoAfter?.totalRequestCount || 0;
        progressTracker.processing('API processing phase complete', undefined, total, processed);
        log('✅ API processing phase complete.');
        log('');

        // Get final statistics
        const finalQueueInfo = await requestQueue.getInfo();
        // Open dataset - Crawlee automatically uses local storage when not on Apify platform
        const dataset = await Dataset.open();
        const datasetInfo = await dataset.getInfo();
        
        // Collect all data items
        const data: Record<string, unknown>[] = [];
        if (datasetInfo && datasetInfo.itemCount && datasetInfo.itemCount > 0) {
            const { items } = await dataset.getData({ limit: datasetInfo.itemCount });
            data.push(...items);
        }

        // Collect generated artifacts from dataset
        const artifacts = {
            codeSnippets: {} as Record<string, CodeSnippet[]>,
            typescriptTypes: '',
            testSuites: [] as TestSuite[],
            sdkPackages: [] as SDKPackage[],
            documentation: [] as Documentation[],
            examples: [] as APIExample[],
        };

        // Extract artifacts from dataset items
        for (const item of data) {
            if (item._type === 'code_snippets') {
                // Code snippets are stored as a single object with snippets key
                if (item.snippets) {
                    Object.assign(artifacts.codeSnippets, item.snippets);
                }
            } else if (item._type === 'typescript_types') {
                artifacts.typescriptTypes = typeof item.content === 'string' ? item.content : '';
            } else if (item._type === 'test_suites') {
                // Test suites are stored with suites array
                if (item.suites && Array.isArray(item.suites)) {
                    const suites = item.suites.filter((suite): suite is TestSuite =>
                        typeof suite === 'object' &&
                        suite !== null &&
                        typeof (suite as Record<string, unknown>).framework === 'string' &&
                        typeof (suite as Record<string, unknown>).tests === 'string'
                    ).map(suite => ({
                        framework: (suite as Record<string, unknown>).framework as string,
                        tests: (suite as Record<string, unknown>).tests as string,
                        code: typeof (suite as Record<string, unknown>).code === 'string' 
                            ? (suite as Record<string, unknown>).code as string 
                            : undefined,
                        filename: typeof (suite as Record<string, unknown>).filename === 'string'
                            ? (suite as Record<string, unknown>).filename as string
                            : 'test.ts',
                    }));
                    artifacts.testSuites.push(...suites);
                } else if (
                    typeof item.framework === 'string' &&
                    typeof item.tests === 'string'
                ) {
                    artifacts.testSuites.push({
                        framework: item.framework,
                        tests: item.tests,
                        code: typeof item.code === 'string' ? item.code : undefined,
                        filename: typeof item.filename === 'string' ? item.filename : 'test.ts',
                    });
                }
            } else if (item._type === 'sdk_package') {
                artifacts.sdkPackages.push({
                    language: typeof item.language === 'string' ? item.language : 'unknown',
                    packageName: typeof item.packageName === 'string' ? item.packageName : 'unknown',
                    files: typeof item.files === 'object' && item.files !== null && !Array.isArray(item.files) 
                        ? item.files as Record<string, string> 
                        : {},
                });
            } else if (item._type === 'api_documentation') {
                artifacts.documentation.push({
                    format: typeof item.format === 'string' ? item.format : 'unknown',
                    filename: typeof item.filename === 'string' ? item.filename : 'unknown',
                    content: typeof item.content === 'string' ? item.content : '',
                    mimeType: typeof item.mimeType === 'string' ? item.mimeType : 'application/json',
                });
            } else if (item._type === 'api_examples') {
                if (item.examples && Array.isArray(item.examples)) {
                    const examples = item.examples.filter((ex): ex is APIExample => {
                        if (typeof ex !== 'object' || ex === null) return false;
                        const e = ex as unknown as Record<string, unknown>;
                        return typeof e.apiUrl === 'string' && typeof e.method === 'string';
                    }).map(ex => {
                        const e = ex as unknown as Record<string, unknown>;
                        return {
                            apiUrl: e.apiUrl as string,
                            method: e.method as string,
                            request: e.request as Record<string, unknown> | undefined,
                            response: e.response as Record<string, unknown> | undefined,
                        } as APIExample;
                    });
                    artifacts.examples.push(...examples);
                } else if (
                    typeof item.apiUrl === 'string' && 
                    typeof item.method === 'string'
                ) {
                    artifacts.examples.push({
                        apiUrl: item.apiUrl,
                        method: item.method,
                        request: item.request as Record<string, unknown> | undefined,
                        response: item.response as Record<string, unknown> | undefined,
                    });
                }
            }
        }

        const totalDuration = (Date.now() - startTime) / 1000;

        log('📊 Execution Summary');
        log('='.repeat(60));
        log(`   APIs Discovered: ${apisDiscovered}`);
        log(`   Requests Processed: ${finalQueueInfo?.handledRequestCount || 0}`);
        log(`   Items Extracted: ${datasetInfo?.itemCount || 0}`);
        log(`   Total Duration: ${totalDuration.toFixed(1)}s`);
        log('');

        const stats = statistics.getStats();
        const summary = await statistics.saveSummary();

        return {
            summary: {
                apisDiscovered,
                requestsProcessed: finalQueueInfo?.handledRequestCount || 0,
                itemsExtracted: datasetInfo?.itemCount || 0,
                discoveryDuration,
                totalDuration,
            },
            artifacts,
            data,
            statistics: stats,
        };
    } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

