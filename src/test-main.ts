/**
 * Test version of main.ts that works locally without Apify platform
 * This mocks the Apify Actor SDK for local testing
 */

import { PlaywrightCrawler, HttpCrawler, Router, Dataset, RequestQueue } from 'crawlee';
import type { ActorInput } from './types.js';
import { REQUEST_LABELS } from './types.js';
import { handleDiscovery } from './handlers/discovery-handler.js';
import { handleAPIProcessing } from './handlers/api-handler.js';
import { StatisticsCollector, setStatistics, formatStatistics } from './utils/statistics.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Mock Apify Actor for local testing
const mockActor = {
    init: async () => {
        console.log('[MOCK] Actor.init() called');
    },
    getInput: async (): Promise<ActorInput> => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        // When compiled, dist/test-main.js needs to go up one level to find test-input.json
        const inputPath = join(__dirname, '../test-input.json');
        const input = JSON.parse(readFileSync(inputPath, 'utf-8'));
        console.log('[MOCK] Actor.getInput() - loaded from test-input.json');
        return input;
    },
    log: {
        info: (message: string, data?: unknown) => {
            console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
        },
        warning: (message: string, data?: unknown) => {
            console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
        },
        error: (message: string, data?: unknown) => {
            console.error(`[ERROR] ${message}`, data ? JSON.stringify(data, null, 2) : '');
        },
        debug: (message: string, data?: unknown) => {
            console.debug(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
        },
    },
    exit: async () => {
        console.log('[MOCK] Actor.exit() called');
    },
};

// Replace Actor import with mock
(global as any).Actor = mockActor;

/**
 * Test version of main function
 */
async function testMain() {
    console.log('🧪 Starting APX - The API Toolkit - TEST MODE');
    console.log('==========================================\n');

    // Initialize mock Actor
    await mockActor.init();

    // Get input configuration
    const input = await mockActor.getInput();

    if (!input.startUrls || input.startUrls.length === 0) {
        throw new Error('startUrls is required');
    }

    console.log('📋 Test Configuration:');
    console.log(`   Start URLs: ${input.startUrls.length}`);
    console.log(`   Max Pages: ${input.maxPages || 100}`);
    console.log(`   Max Concurrency: ${input.maxConcurrency || 5}`);
    console.log(`   Discovery Timeout: ${input.discoveryTimeout || 10000}ms\n`);

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

    console.log('🚀 Starting discovery phase...\n');

    try {
        // Run PlaywrightCrawler for discovery
        await playwrightCrawler.run(initialRequests);

        console.log('\n✅ Discovery phase complete. Starting API processing phase...\n');

        // Run HttpCrawler to process all API_PROCESS requests
        await httpCrawler.run();

        console.log('\n✅ API processing phase complete.\n');

        // Get statistics
        const stats = await requestQueue.getInfo();
        console.log('📊 Crawling Statistics:');
        console.log(`   Total Requests: ${stats?.totalRequestCount || 0}`);
        console.log(`   Handled Requests: ${stats?.handledRequestCount || 0}\n`);

        // Get dataset statistics
        const dataset = await Dataset.open();
        const datasetInfo = await dataset.getInfo();
        console.log('📦 Dataset Statistics:');
        console.log(`   Items Extracted: ${datasetInfo?.itemCount || 0}\n`);

        // Show sample data if available
        if (datasetInfo && datasetInfo.itemCount && datasetInfo.itemCount > 0) {
            console.log('📄 Sample Data (first 3 items):');
            const { items } = await dataset.getData({ limit: 3 });
            items.forEach((item, index) => {
                console.log(`\n   Item ${index + 1}:`);
                console.log(JSON.stringify(item, null, 4));
            });
            console.log('\n');
        }

        console.log('✅ Test completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed with error:');
        console.error(error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error('\nStack trace:');
            console.error(error.stack);
        }
        throw error;
    } finally {
        await mockActor.exit();
    }
}

// Run the test
testMain().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

