import { PlaywrightCrawler, HttpCrawler, Router, Dataset, RequestQueue } from 'crawlee';
import { Actor } from 'apify';
import type { ActorInput } from './types.js';
import { REQUEST_LABELS } from './types.js';
import { handleDiscovery } from './handlers/discovery-handler.js';
import { handleAPIProcessing } from './handlers/api-handler.js';

/**
 * Main entry point for the API-First Auto-Tuner Actor
 */
async function main() {
    // Initialize Apify Actor
    await Actor.init();

    // Get input configuration
    const input = (await Actor.getInput()) as ActorInput;

    if (!input.startUrls || input.startUrls.length === 0) {
        throw new Error('startUrls is required');
    }

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

    console.log('Starting API-First Auto-Tuner', {
        startUrls: input.startUrls.length,
        maxPages: input.maxPages,
        maxConcurrency: input.maxConcurrency,
    });

    try {
        // Run PlaywrightCrawler for discovery
        // This will discover APIs and enqueue API_PROCESS requests
        await playwrightCrawler.run(initialRequests);

        console.log('Discovery phase complete. Starting API processing phase...');

        // Run HttpCrawler to process all API_PROCESS requests
        // It uses the same request queue, so it will pick up requests enqueued by discovery
        await httpCrawler.run();

        console.log('API processing phase complete.');

        // Get statistics
        const stats = await requestQueue.getInfo();
        console.log('Crawling statistics', {
            totalRequests: stats?.totalRequestCount || 0,
            handledRequests: stats?.handledRequestCount || 0,
        });

        // Get dataset statistics
        const dataset = await Dataset.open();
        const datasetInfo = await dataset.getInfo();
        console.log('Dataset statistics', {
            itemCount: datasetInfo?.itemCount || 0,
        });
    } catch (error) {
        console.error('Error during crawling', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
    } finally {
        await Actor.exit();
    }
}

// Run the main function
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

