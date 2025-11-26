import { PlaywrightCrawler, HttpCrawler, Router, Dataset, RequestQueue } from 'crawlee';
import { Actor } from 'apify';
import type { ActorInput } from './types.js';
import { REQUEST_LABELS } from './types.js';
import { handleDiscovery } from './handlers/discovery-handler.js';
import { handleAPIProcessing } from './handlers/api-handler.js';
import { StatisticsCollector, formatStatistics } from './utils/statistics.js';

/**
 * APX - The API Toolkit
 * 
 * Automatically discovers internal API endpoints and generates complete API documentation
 * in OpenAPI, Postman, cURL, and Insomnia formats. Also generates code, types, tests, and SDKs.
 * 
 * @version 1.0.0
 * @author irun2themoney
 */
async function main() {
    // Initialize Apify Actor
    await Actor.init();

    // Get input configuration
    const input = (await Actor.getInput()) as ActorInput;

    // Validate required input
    if (!input.startUrls || input.startUrls.length === 0) {
        throw new Error('startUrls is required and must contain at least one URL');
    }

    // Validate each start URL
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

    // Validate optional parameters
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

    // Initialize statistics collector
    const statistics = new StatisticsCollector();
    // Make it globally accessible for handlers
    const { setStatistics } = await import('./utils/statistics.js');
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
        maxRequestsPerCrawl: input.startUrls.length, // Only process discovery URLs
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

    console.log('🚀 Starting APX - The API Toolkit');
    console.log('='.repeat(60));
    console.log(`📋 Configuration:`);
    console.log(`   Start URLs: ${input.startUrls.length}`);
    console.log(`   Max Pages: ${input.maxPages || 100}`);
    console.log(`   Max Concurrency: ${input.maxConcurrency || 5}`);
    console.log(`   Generate Documentation: ${input.generateDocumentation !== false ? 'Yes' : 'No'}`);
    console.log(`   Export Formats: ${input.exportFormats?.join(', ') || 'openapi, postman, curl'}`);
    console.log('='.repeat(60));
    console.log('');

    try {
        const discoveryStartTime = Date.now();
        
        // Run PlaywrightCrawler for discovery
        // This will discover APIs and enqueue API_PROCESS requests
        await playwrightCrawler.run(initialRequests);

        const discoveryDuration = (Date.now() - discoveryStartTime) / 1000;
        console.log(`✅ Discovery phase complete (${discoveryDuration.toFixed(1)}s)`);
        console.log('');

        // Get discovery stats
        const queueInfo = await requestQueue.getInfo();
        const apisDiscovered = (queueInfo?.totalRequestCount || 0) - input.startUrls.length;
        
        if (apisDiscovered > 0) {
            statistics.recordDiscovery(apisDiscovered, discoveryDuration);
            console.log(`🔍 Discovered ${apisDiscovered} API endpoint(s)`);
            
            // Check queue status before starting HttpCrawler
            const queueInfoBefore = await requestQueue.getInfo();
            const pendingRequests = (queueInfoBefore?.totalRequestCount || 0) - (queueInfoBefore?.handledRequestCount || 0);
            console.log(`📋 Queue status: ${queueInfoBefore?.totalRequestCount || 0} total, ${queueInfoBefore?.handledRequestCount || 0} handled, ${pendingRequests} pending`);
            console.log('⚡ Starting API processing phase...');
            console.log('');
        } else {
            console.log('⚠️  No APIs discovered. The site may not use API calls or they may require user interaction.');
            console.log('');
        }

        // Run HttpCrawler to process all API_PROCESS requests
        // It uses the same request queue, so it will pick up requests enqueued by discovery
        await httpCrawler.run();

        console.log('✅ API processing phase complete.');
        console.log('');

        // Get final statistics
        const finalQueueInfo = await requestQueue.getInfo();
        const dataset = await Dataset.open();
        const datasetInfo = await dataset.getInfo();
        
        console.log('📊 Execution Summary');
        console.log('='.repeat(60));
        console.log(`   APIs Discovered: ${apisDiscovered}`);
        console.log(`   Requests Processed: ${finalQueueInfo?.handledRequestCount || 0}`);
        console.log(`   Items Extracted: ${datasetInfo?.itemCount || 0}`);
        console.log('');

        // Save comprehensive statistics
        const summary = await statistics.saveSummary();
        console.log(formatStatistics(statistics.getStats()));
        console.log('');
        
        console.log('🎉 Execution completed successfully!');
        console.log(`📦 Output saved to dataset (${datasetInfo?.itemCount || 0} items)`);
        
        if (summary.summary.documentationGenerated) {
            console.log('📚 API documentation generated');
        }
        if (summary.summary.codeSnippetsGenerated) {
            console.log('💻 Code snippets generated (10 languages)');
        }
        if (summary.summary.typescriptTypesGenerated) {
            console.log('📘 TypeScript types generated');
        }
        if (summary.summary.examplesCaptured) {
            console.log('📝 Request/response examples captured');
        }
        
    } catch (error) {
        console.error('');
        console.error('❌ Error during execution');
        console.error('='.repeat(60));
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && error.stack) {
            console.error('');
            console.error('Stack trace:');
            console.error(error.stack);
        }
        console.error('');
        
        // Save error statistics
        try {
            await statistics.saveSummary();
        } catch (e) {
            // Ignore errors in statistics saving
        }
        
        throw error;
    } finally {
        await Actor.exit();
    }
}

// Run the main function
main().catch((error) => {
    // Use console.error here since Actor might not be initialized
    console.error('Fatal error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
    }
    process.exit(1);
});

