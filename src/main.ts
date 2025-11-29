/**
 * APX - The API Toolkit
 * 
 * Automatically discovers internal API endpoints and generates complete API documentation
 * in OpenAPI, Postman, cURL, and Insomnia formats. Also generates code, types, tests, and SDKs.
 * 
 * @version 1.0.0
 * @author irun2themoney
 */

import { PlaywrightCrawler, HttpCrawler, Router, Dataset, RequestQueue } from 'crawlee';
import { Actor } from 'apify';
import type { ActorInput, DiscoveredAPI } from './types.js';
import { REQUEST_LABELS } from './types.js';
import { handleDiscovery } from './handlers/discovery-handler.js';
import { handleAPIProcessing } from './handlers/api-handler.js';
import { StatisticsCollector, formatStatistics } from './utils/statistics.js';
import { generateEnhancedOutputs } from './utils/output-generator.js';
import { ProgressTracker } from './utils/progress-tracker.js';
import { USER_MESSAGES, getSuggestion } from './utils/user-friendly-messages.js';

async function main() {
    // Initialize Apify Actor
    await Actor.init();

    // Detect user discount tier for premium features
    const userTier = process.env.APIFY_USER_DISCOUNT_TIER || 'FREE';
    const isPremiumTier = ['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'].includes(userTier);
    
    if (isPremiumTier) {
        console.log(`[Premium] User tier: ${userTier} - Premium features enabled`);
    }

    // Get input configuration
    const input = (await Actor.getInput()) as ActorInput;

    // Validate required input with user-friendly messages
    if (!input.startUrls || input.startUrls.length === 0) {
        throw new Error(USER_MESSAGES.errors.noUrls());
    }

    // Validate each start URL
    for (const urlObj of input.startUrls) {
        if (!urlObj.url || typeof urlObj.url !== 'string') {
            throw new Error(USER_MESSAGES.errors.validation('startUrl', 'Each URL must be a valid string'));
        }
        try {
            new URL(urlObj.url);
        } catch (error) {
            throw new Error(USER_MESSAGES.errors.invalidUrl(urlObj.url));
        }
    }

    // Validate optional parameters with user-friendly messages
    if (input.minResponseSize !== undefined && input.minResponseSize < 0) {
        throw new Error(USER_MESSAGES.errors.validation('minResponseSize', 'must be 0 or greater'));
    }
    if (input.discoveryTimeout !== undefined && input.discoveryTimeout < 1000) {
        throw new Error(USER_MESSAGES.errors.validation('discoveryTimeout', 'must be at least 1000ms (1 second)'));
    }
    if (input.maxPages !== undefined && input.maxPages < 1) {
        throw new Error(USER_MESSAGES.errors.validation('maxPages', 'must be at least 1'));
    }
    if (input.maxConcurrency !== undefined && input.maxConcurrency < 1) {
        throw new Error(USER_MESSAGES.errors.validation('maxConcurrency', 'must be at least 1'));
    }
    if (input.paginationType && !['auto', 'offset', 'page', 'cursor'].includes(input.paginationType)) {
        throw new Error(USER_MESSAGES.errors.validation('paginationType', `must be one of: auto, offset, page, or cursor`));
    }
    if (input.exportFormats) {
        const validFormats = ['openapi', 'postman', 'curl', 'insomnia'];
        for (const format of input.exportFormats) {
            if (!validFormats.includes(format)) {
                throw new Error(USER_MESSAGES.errors.validation('exportFormats', `"${format}" is not valid. Choose from: ${validFormats.join(', ')}`));
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
        failedRequestHandler: async ({ request, error }) => {
            console.error(`❌ PlaywrightCrawler failed to process ${request.url}: ${error instanceof Error ? error.message : String(error)}`);
            statistics?.recordRequest(false);
        },
    });

    // Configure HttpCrawler for API processing phase
    const httpCrawler = new HttpCrawler({
        requestHandler: router,
        requestQueue,
        maxRequestsPerCrawl: (input.maxPages || 100) * (input.startUrls.length || 1),
        maxConcurrency: input.maxConcurrency || 5,
        requestHandlerTimeoutSecs: 30,
        failedRequestHandler: async ({ request, error }) => {
            console.error(`❌ HttpCrawler failed to process ${request.url}: ${error instanceof Error ? error.message : String(error)}`);
            statistics?.recordRequest(false);
        },
    });

    // Prepare initial requests with START_DISCOVERY label
    const initialRequests = input.startUrls.map((urlObj) => ({
        url: urlObj.url,
        label: REQUEST_LABELS.START_DISCOVERY,
    }));

    // Show welcome message and configuration
    console.log(USER_MESSAGES.welcome());
    console.log('📋 Your Configuration:');
    console.log(`   • Start URLs: ${input.startUrls.length} URL${input.startUrls.length > 1 ? 's' : ''}`);
    console.log(`   • Max Pages: ${input.maxPages || 100}`);
    console.log(`   • Max Concurrency: ${input.maxConcurrency || 5}`);
    console.log(`   • Generate Documentation: ${input.generateDocumentation !== false ? '✅ Yes' : '❌ No'}`);
    console.log(`   • Export Formats: ${input.exportFormats?.join(', ') || 'openapi, postman, curl'}`);
    console.log('');
    
    // Show enabled features
    const enabledFeatures: string[] = [];
    if (input.generateMockServer !== false) enabledFeatures.push('Mock Server');
    if (input.generatePerformanceBenchmark !== false) enabledFeatures.push('Performance');
    if (input.generateContractTests !== false) enabledFeatures.push('Contract Tests');
    if (input.generateMCPIntegration !== false) enabledFeatures.push('MCP Integration');
    if (input.generateX402Integration !== false) enabledFeatures.push('x402 Integration');
    if (input.generateDependencyGraph !== false) enabledFeatures.push('Dependency Graph');
    
    if (enabledFeatures.length > 0) {
        console.log('✨ Enhanced Features Enabled:');
        enabledFeatures.forEach(feature => console.log(`   • ${feature}`));
        console.log('');
    }

    const discoveryStartTime = Date.now();
    
    try {
        // Show discovery progress
        console.log(USER_MESSAGES.discovery.starting(input.startUrls.length));
        if (input.enableInteractionSimulation !== false) {
            console.log(USER_MESSAGES.tips.betterDiscovery());
        }
        console.log('');
        
        // Run PlaywrightCrawler for discovery
        // This will discover APIs and enqueue API_PROCESS requests
        // Errors in individual requests are handled by failedRequestHandler
        try {
            await playwrightCrawler.run(initialRequests);
        } catch (error) {
            // Only log if it's a critical error (not individual request failures)
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (!errorMessage.includes('Request failed') && !errorMessage.includes('Navigation')) {
                console.warn(`⚠️  Discovery phase encountered errors: ${errorMessage}`);
                console.warn('   Some URLs may have failed, but continuing with successful discoveries...');
            }
            // Don't throw - allow processing to continue
        }

        const discoveryDuration = (Date.now() - discoveryStartTime) / 1000;
        console.log(`✅ Discovery phase complete (${discoveryDuration.toFixed(1)}s)`);
        console.log('');

        // Get discovery stats
        const queueInfo = await requestQueue.getInfo();
        const apisDiscovered = (queueInfo?.totalRequestCount || 0) - input.startUrls.length;
        
        if (apisDiscovered > 0) {
            statistics.recordDiscovery(apisDiscovered, discoveryDuration);
            console.log(USER_MESSAGES.discovery.found(apisDiscovered));
            
            // Check queue status before starting HttpCrawler
            const queueInfoBefore = await requestQueue.getInfo();
            const pendingRequests = (queueInfoBefore?.totalRequestCount || 0) - (queueInfoBefore?.handledRequestCount || 0);
            console.log(`📋 Queue status: ${queueInfoBefore?.totalRequestCount || 0} total, ${queueInfoBefore?.handledRequestCount || 0} handled, ${pendingRequests} pending`);
            console.log('');
            console.log(USER_MESSAGES.processing.starting(apisDiscovered));
            console.log('');
        } else {
            console.log(USER_MESSAGES.discovery.none());
            console.log('');
            if (input.enableInteractionSimulation === false) {
                console.log(USER_MESSAGES.tips.betterDiscovery());
            }
            console.log(USER_MESSAGES.tips.moreApis());
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

        console.log('');
        console.log('📊 Execution Summary');
        console.log('='.repeat(60));
        console.log(`   ✅ APIs Discovered: ${apisDiscovered}`);
        console.log(`   ✅ Requests Processed: ${finalQueueInfo?.handledRequestCount || 0}`);
        console.log(`   ✅ Items Extracted: ${datasetInfo?.itemCount || 0}`);
        console.log('');

        // Save comprehensive statistics
        const summary = await statistics.saveSummary();
        console.log(formatStatistics(statistics.getStats()));
        console.log('');
        
        console.log(USER_MESSAGES.success.complete());
        console.log(USER_MESSAGES.output.summary(datasetInfo?.itemCount || 0));
        
        const generatedFeatures: string[] = [];
        if (summary.summary.documentationGenerated) {
            generatedFeatures.push('📚 API Documentation');
        }
        if (summary.summary.codeSnippetsGenerated) {
            generatedFeatures.push('💻 Code Snippets (12 languages)');
        }
        if (summary.summary.typescriptTypesGenerated) {
            generatedFeatures.push('📘 TypeScript Types');
        }
        if (summary.summary.examplesCaptured) {
            generatedFeatures.push('📝 Request/Response Examples');
        }
        
        if (generatedFeatures.length > 0) {
            console.log('✨ Generated:');
            generatedFeatures.forEach(feature => console.log(`   ${feature}`));
            console.log('');
        }
        
        console.log(USER_MESSAGES.output.nextSteps());

        // Generate enhanced outputs (GitHub Actions, security reports, etc.)
        if (apisDiscovered > 0) {
            console.log('');
            console.log('🚀 Generating Enhanced Features...');
            console.log('');
            
            try {
                // Collect discovered APIs from dataset
                const discoveredAPIs: DiscoveredAPI[] = [];
                if (datasetInfo && datasetInfo.itemCount && datasetInfo.itemCount > 0) {
                    const items = await dataset.getData();
                    for (const item of items.items || []) {
                        if (item._type === 'api_summary' && item.apis) {
                            discoveredAPIs.push(...(item.apis as DiscoveredAPI[]));
                        } else if (item.discoveredAPI) {
                            discoveredAPIs.push(item.discoveredAPI as DiscoveredAPI);
                        }
                    }
                }
                
                if (discoveredAPIs.length > 0) {
                    await generateEnhancedOutputs(
                        {
                            summary: {
                                apisDiscovered,
                                requestsProcessed: finalQueueInfo?.handledRequestCount || 0,
                                itemsExtracted: datasetInfo?.itemCount || 0,
                                discoveryDuration: (Date.now() - discoveryStartTime) / 1000,
                                totalDuration: (Date.now() - discoveryStartTime) / 1000,
                            },
                            artifacts: {} as any,
                            data: [],
                            statistics: {} as any,
                        },
                        discoveredAPIs,
                        {
                            generateGitHubActions: input.generateGitHubActions !== false,
                            generateSecurityReport: input.generateSecurityReport !== false,
                            generateChangeReport: false,
                            generateDocs: input.generateEnhancedDocs !== false,
                            generateMockServer: input.generateMockServer !== false,
                            generatePerformanceBenchmark: input.generatePerformanceBenchmark !== false,
                            generateContractTests: input.generateContractTests !== false,
                            generateMCPIntegration: input.generateMCPIntegration !== false,
                            generateX402Integration: input.generateX402Integration !== false,
                            generateDependencyGraph: input.generateDependencyGraph !== false,
                            onProgress: (msg) => {
                                // Use user-friendly messages
                                if (msg.includes('mock')) console.log(USER_MESSAGES.generation.complete('Mock Server'));
                                else if (msg.includes('performance')) console.log(USER_MESSAGES.generation.complete('Performance Benchmark'));
                                else if (msg.includes('contract')) console.log(USER_MESSAGES.generation.complete('Contract Tests'));
                                else if (msg.includes('MCP')) console.log(USER_MESSAGES.generation.complete('MCP Integration'));
                                else if (msg.includes('x402')) console.log(USER_MESSAGES.generation.complete('x402 Integration'));
                                else if (msg.includes('dependency')) console.log(USER_MESSAGES.generation.complete('Dependency Graph'));
                                else console.log(`   ✅ ${msg}`);
                            },
                            onError: (err) => {
                                const suggestion = getSuggestion(err.message);
                                console.error(`   ⚠️  ${err.message}`);
                                if (suggestion) console.log(`   ${suggestion}`);
                            },
                        }
                    );
                    console.log('');
                    console.log('✨ All enhanced features generated successfully!');
                } else {
                    console.log('⚠️ No APIs discovered, skipping enhanced output generation.');
                    console.log(USER_MESSAGES.tips.moreApis());
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn('⚠️  Enhanced outputs generation failed:', errorMessage);
                const suggestion = getSuggestion(errorMessage);
                if (suggestion) console.log(suggestion);
                // Don't fail the entire run
            }
        }
        
    } catch (error) {
        console.error('');
        console.error('❌ Something went wrong');
        console.error('='.repeat(60));
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${errorMessage}`);
        
        // Provide helpful suggestions
        const suggestion = getSuggestion(errorMessage);
        if (suggestion) {
            console.error('');
            console.error(suggestion);
        }
        
        console.error('');
        console.error('💡 Need help?');
        console.error('   • Check the README for examples');
        console.error('   • Verify your input configuration');
        console.error('   • Try the "Simple Discovery" preset');
        console.error('');
        
        if (error instanceof Error && error.stack && process.env.NODE_ENV === 'development') {
            console.error('Technical details:');
            console.error(error.stack);
            console.error('');
        }

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

// Call the main function
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
