/**
 * Core Runner - Decoupled execution logic for APX
 * This module contains the core APX functionality without Apify Actor dependencies
 * Can be used by CLI, test scripts, or other integrations
 */

import { PlaywrightCrawler, HttpCrawler, Router, RequestQueue } from 'crawlee';
import type { ActorInput, DiscoveredAPI } from './types.js';
import { REQUEST_LABELS } from './types.js';
import { handleDiscovery } from './handlers/discovery-handler.js';
import { handleAPIProcessing } from './handlers/api-handler.js';
import { StatisticsCollector } from './utils/statistics.js';
import { setStatistics } from './utils/statistics.js';
import { generateExports } from './utils/api-exporter.js';
import { generateAllCodeSnippets } from './utils/code-generator.js';
import { generateTypeScriptDeclarationFile } from './utils/typescript-generator.js';
import { generateAllTestSuites } from './utils/test-generator.js';
import { generateSDKPackages } from './utils/sdk-generator.js';
import { Dataset } from 'crawlee';

export interface APXResult {
    summary: {
        apisDiscovered: number;
        requestsProcessed: number;
        itemsExtracted: number;
        discoveryDuration: number;
        totalDuration: number;
    };
    artifacts: {
        codeSnippets: Record<string, any[]>;
        typescriptTypes: string;
        testSuites: any[];
        sdkPackages: any[];
        documentation: any[];
        examples: any[];
    };
    data: any[];
    statistics: any;
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
 * @param input - Configuration input
 * @param options - Optional execution options
 * @returns Structured result with all generated artifacts
 */
export async function runAPXCore(
    input: ActorInput,
    options?: {
        onProgress?: (message: string) => void;
        onError?: (error: Error) => void;
    }
): Promise<APXResult> {
    const startTime = Date.now();
    const log = options?.onProgress || ((msg: string) => console.log(msg));
    const onError = options?.onError || ((err: Error) => console.error(err.message));

    // Validate input
    validateInput(input);

    // Initialize statistics collector
    const statistics = new StatisticsCollector();
    setStatistics(statistics);

    // Create a shared request queue
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
        
        // Run PlaywrightCrawler for discovery
        await playwrightCrawler.run(initialRequests);

        const discoveryDuration = (Date.now() - discoveryStartTime) / 1000;
        log(`✅ Discovery phase complete (${discoveryDuration.toFixed(1)}s)`);
        log('');

        // Get discovery stats
        const queueInfo = await requestQueue.getInfo();
        const apisDiscovered = (queueInfo?.totalRequestCount || 0) - input.startUrls.length;
        
        if (apisDiscovered > 0) {
            statistics.recordDiscovery(apisDiscovered, discoveryDuration);
            log(`🔍 Discovered ${apisDiscovered} API endpoint(s)`);
            
            const queueInfoBefore = await requestQueue.getInfo();
            const pendingRequests = (queueInfoBefore?.totalRequestCount || 0) - (queueInfoBefore?.handledRequestCount || 0);
            log(`📋 Queue status: ${queueInfoBefore?.totalRequestCount || 0} total, ${queueInfoBefore?.handledRequestCount || 0} handled, ${pendingRequests} pending`);
            log('⚡ Starting API processing phase...');
            log('');
        } else {
            log('⚠️  No APIs discovered. The site may not use API calls or they may require user interaction.');
            log('');
        }

        // Run HttpCrawler to process all API_PROCESS requests
        await httpCrawler.run();

        log('✅ API processing phase complete.');
        log('');

        // Get final statistics
        const finalQueueInfo = await requestQueue.getInfo();
        const dataset = await Dataset.open();
        const datasetInfo = await dataset.getInfo();
        
        // Collect all data items
        const data: any[] = [];
        if (datasetInfo && datasetInfo.itemCount && datasetInfo.itemCount > 0) {
            const { items } = await dataset.getData({ limit: datasetInfo.itemCount });
            data.push(...items);
        }

        // Collect generated artifacts from dataset
        const artifacts = {
            codeSnippets: {} as Record<string, any[]>,
            typescriptTypes: '',
            testSuites: [] as any[],
            sdkPackages: [] as any[],
            documentation: [] as any[],
            examples: [] as any[],
        };

        // Extract artifacts from dataset items
        for (const item of data) {
            if (item._type === 'code_snippets') {
                // Code snippets are stored as a single object with snippets key
                if (item.snippets) {
                    Object.assign(artifacts.codeSnippets, item.snippets);
                }
            } else if (item._type === 'typescript_types') {
                artifacts.typescriptTypes = item.content || '';
            } else if (item._type === 'test_suites') {
                // Test suites are stored with suites array
                if (item.suites && Array.isArray(item.suites)) {
                    artifacts.testSuites.push(...item.suites);
                } else {
                    artifacts.testSuites.push(item);
                }
            } else if (item._type === 'sdk_package') {
                artifacts.sdkPackages.push({
                    language: item.language,
                    packageName: item.packageName,
                    files: item.files,
                    description: item.description,
                });
            } else if (item._type === 'api_documentation') {
                artifacts.documentation.push({
                    format: item.format,
                    filename: item.filename,
                    content: item.content,
                    mimeType: item.mimeType,
                });
            } else if (item._type === 'api_examples') {
                if (item.examples && Array.isArray(item.examples)) {
                    artifacts.examples.push(...item.examples);
                } else {
                    artifacts.examples.push(item);
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
            statistics: {
                stats,
                summary: summary.summary,
            },
        };
    } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

