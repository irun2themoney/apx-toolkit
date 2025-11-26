/**
 * Test script for Deep Interaction Fuzzer
 * Tests the fuzzer against various complex SPAs and landing pages
 */

import { Actor } from 'apify';
import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { REQUEST_LABELS } from './src/types.js';
import { handleDiscovery } from './src/handlers/discovery-handler.js';

// Test scenarios for the fuzzer
const TEST_SCENARIOS = [
    {
        name: 'JSONPlaceholder (Landing Page)',
        url: 'https://jsonplaceholder.typicode.com/',
        expectedAPIs: 1, // Should discover /posts endpoint
        description: 'Simple landing page that requires interaction',
    },
    {
        name: 'Fake Store API (Landing Page)',
        url: 'https://fakestoreapi.com/',
        expectedAPIs: 1, // Should discover products endpoint
        description: 'Landing page with API documentation',
    },
    {
        name: 'ReqRes API (Landing Page)',
        url: 'https://reqres.in/',
        expectedAPIs: 1, // Should discover /api/users endpoint
        description: 'Landing page with interactive examples',
    },
    {
        name: 'Swagger Petstore (Interactive)',
        url: 'https://petstore.swagger.io/',
        expectedAPIs: 1, // Should discover Swagger API endpoints
        description: 'Complex SPA with Swagger UI',
    },
    {
        name: 'GitHub (Public API)',
        url: 'https://api.github.com/',
        expectedAPIs: 1, // Direct API endpoint
        description: 'Direct API endpoint (should work immediately)',
    },
];

async function testFuzzer() {
    console.log('🧪 Testing Deep Interaction Fuzzer\n');
    console.log('='.repeat(60));
    console.log('');

    const results = [];

    for (const scenario of TEST_SCENARIOS) {
        console.log(`Testing: ${scenario.name}`);
        console.log(`URL: ${scenario.url}`);
        console.log(`Expected: ${scenario.expectedAPIs} API(s)`);
        console.log(`Description: ${scenario.description}`);
        console.log('');

        try {
            const startTime = Date.now();
            
            // Initialize Apify Actor (mocked for local testing)
            await Actor.init({ 
                token: process.env.APIFY_TOKEN || 'test-token',
                actorId: 'test-actor',
            });

            // Create request queue
            const requestQueue = await RequestQueue.open();
            
            // Create Playwright crawler
            const crawler = new PlaywrightCrawler({
                requestHandlerTimeoutSecs: 60,
                requestHandler: async (context) => {
                    const input = {
                        startUrls: [{ url: scenario.url }],
                        enableInteractionSimulation: true,
                        interactionWaitTime: 500,
                        discoveryTimeout: 15000,
                        apiPatterns: [],
                        minResponseSize: 100,
                    };

                    await handleDiscovery(context, input);
                },
            });

            // Add initial request
            await requestQueue.addRequest({
                url: scenario.url,
                label: REQUEST_LABELS.START_DISCOVERY,
            });

            // Run crawler
            await crawler.run([scenario.url]);

            // Get discovered APIs from the queue
            const queueInfo = await requestQueue.getInfo();
            const discoveredCount = (queueInfo?.totalRequestCount || 0) - 1; // Subtract initial request

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            
            const passed = discoveredCount >= scenario.expectedAPIs;
            const status = passed ? '✅ PASS' : '❌ FAIL';
            
            console.log(`Result: ${status}`);
            console.log(`APIs Discovered: ${discoveredCount} (expected: ${scenario.expectedAPIs})`);
            console.log(`Duration: ${duration}s`);
            console.log('');

            results.push({
                ...scenario,
                discoveredCount,
                duration: parseFloat(duration),
                passed,
            });

            await Actor.exit();
        } catch (error) {
            console.error(`❌ ERROR: ${error.message}`);
            console.error(error.stack);
            console.log('');

            results.push({
                ...scenario,
                discoveredCount: 0,
                duration: 0,
                passed: false,
                error: error.message,
            });
        }
    }

    // Print summary
    console.log('='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log('');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = (totalDuration / results.length).toFixed(1);

    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Average Duration: ${avgDuration}s`);
    console.log('');

    // Detailed results
    console.log('Detailed Results:');
    console.log('-'.repeat(60));
    for (const result of results) {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.name}`);
        console.log(`   APIs: ${result.discoveredCount}/${result.expectedAPIs} | Duration: ${result.duration}s`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    }
    console.log('');

    // Fuzzer effectiveness
    const fuzzerTests = results.filter(r => 
        r.name.includes('Landing Page') || r.name.includes('Interactive')
    );
    const fuzzerPassed = fuzzerTests.filter(r => r.passed).length;
    
    if (fuzzerTests.length > 0) {
        console.log('Fuzzer Effectiveness (Landing Pages & SPAs):');
        console.log(`   ${fuzzerPassed}/${fuzzerTests.length} passed (${((fuzzerPassed / fuzzerTests.length) * 100).toFixed(0)}%)`);
        console.log('');
    }

    return {
        total: results.length,
        passed,
        failed,
        avgDuration: parseFloat(avgDuration),
        results,
    };
}

// Run tests
testFuzzer()
    .then((summary) => {
        console.log('✅ Test suite complete!');
        process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });

