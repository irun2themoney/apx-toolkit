/**
 * EXTREME TEST SUITE for APX Toolkit
 * 
 * This test suite pushes APX to its limits with:
 * - Multiple diverse API types
 * - Edge cases and error scenarios
 * - Performance testing
 * - Real-world complex scenarios
 * - Comprehensive reporting
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const TEST_SCENARIOS = [
    // Category 1: Public APIs (well-documented)
    {
        name: "REST API - ReqRes",
        url: "https://reqres.in/",
        description: "Standard REST API with pagination",
        expectedApis: 1,
        expectedFeatures: ["pagination", "code_generation", "types", "docs"]
    },
    {
        name: "JSONPlaceholder",
        url: "https://jsonplaceholder.typicode.com/",
        description: "Fake REST API for testing",
        expectedApis: 1,
        expectedFeatures: ["pagination", "code_generation"]
    },
    
    // Category 2: Complex APIs
    {
        name: "GitHub API",
        url: "https://api.github.com/",
        description: "Complex API with authentication, rate limits",
        expectedApis: 0, // Direct API endpoint, may not discover
        expectedFeatures: ["rate_limits"]
    },
    
    // Category 3: E-commerce
    {
        name: "Fake Store API",
        url: "https://fakestoreapi.com/",
        description: "E-commerce API",
        expectedApis: 1,
        expectedFeatures: ["pagination", "data_extraction"]
    },
    
    // Category 4: News/Content
    {
        name: "NewsAPI Demo",
        url: "https://newsapi.org/",
        description: "News API (may require auth)",
        expectedApis: 0,
        expectedFeatures: []
    },
    
    // Category 5: Social Media APIs
    {
        name: "JSONPlaceholder Posts",
        url: "https://jsonplaceholder.typicode.com/posts",
        description: "Blog posts API",
        expectedApis: 1,
        expectedFeatures: ["pagination"]
    },
    
    // Category 6: Edge Cases
    {
        name: "No API Site",
        url: "https://example.com/",
        description: "Site with no APIs (should handle gracefully)",
        expectedApis: 0,
        expectedFeatures: []
    },
    {
        name: "Single Page App",
        url: "https://reactjs.org/",
        description: "React SPA (may have APIs)",
        expectedApis: 0,
        expectedFeatures: []
    },
    
    // Category 7: API Documentation Sites
    {
        name: "Swagger Petstore",
        url: "https://petstore.swagger.io/",
        description: "Swagger UI with API",
        expectedApis: 1,
        expectedFeatures: ["docs", "openapi"]
    },
    
    // Category 8: Real-world Complex
    {
        name: "Rick and Morty API",
        url: "https://rickandmortyapi.com/",
        description: "Character API with complex structure",
        expectedApis: 1,
        expectedFeatures: ["pagination", "nested_data"]
    }
];

const TEST_CONFIG = {
    timeout: 60000, // 60 seconds per test (increased for complex sites)
    maxPages: 3,
    maxConcurrency: 2,
    minResponseSize: 100,
    discoveryTimeout: 25000
};

class ExtremeTestRunner {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
        this.stats = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            totalApisDiscovered: 0,
            totalItemsExtracted: 0,
            totalCodeSnippets: 0,
            totalTypesGenerated: 0,
            totalTestsGenerated: 0,
            totalSDKsGenerated: 0,
            totalDocsGenerated: 0
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            test: '🧪'
        }[type] || 'ℹ️';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async runSingleTest(scenario) {
        this.log(`\n${'='.repeat(60)}`, 'test');
        this.log(`Testing: ${scenario.name}`, 'test');
        this.log(`URL: ${scenario.url}`, 'info');
        this.log(`Description: ${scenario.description}`, 'info');
        
        const testStartTime = Date.now();
        const testResult = {
            scenario: scenario.name,
            url: scenario.url,
            description: scenario.description,
            startTime: new Date(testStartTime).toISOString(),
            status: 'running',
            errors: [],
            warnings: [],
            metrics: {},
            output: {}
        };

        try {
            // Create test input
            const testInput = {
                startUrls: [{ url: scenario.url }],
                apiPatterns: [],
                minResponseSize: TEST_CONFIG.minResponseSize,
                discoveryTimeout: TEST_CONFIG.discoveryTimeout,
                maxPages: TEST_CONFIG.maxPages,
                maxConcurrency: TEST_CONFIG.maxConcurrency,
                dataPath: "",
                paginationType: "auto",
                generateDocumentation: true,
                exportFormats: ["openapi", "postman", "curl"]
            };

            writeFileSync('test-input.json', JSON.stringify(testInput, null, 2));

            // Run the test
            this.log('Running APX test...', 'info');
            const output = execSync('npm test 2>&1', { 
                encoding: 'utf-8',
                timeout: TEST_CONFIG.timeout,
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer
            });

            testResult.output.raw = output;

            // Parse results
            const apisDiscovered = this.extractMetric(output, /Discovered (\d+) API/i) || 
                                  this.extractMetric(output, /Found (\d+) API/i) || 0;
            const itemsExtracted = this.extractMetric(output, /Items Extracted: (\d+)/i) || 0;
            const requestsProcessed = this.extractMetric(output, /Handled Requests: (\d+)/i) || 0;
            const totalRequests = this.extractMetric(output, /Total Requests: (\d+)/i) || 0;

            testResult.metrics = {
                apisDiscovered: parseInt(apisDiscovered),
                itemsExtracted: parseInt(itemsExtracted),
                requestsProcessed: parseInt(requestsProcessed),
                totalRequests: parseInt(totalRequests),
                duration: Date.now() - testStartTime
            };

            // Check for errors
            if (output.includes('ERROR') || output.includes('Error processing')) {
                const errors = output.match(/ERROR[^\n]*/g) || [];
                testResult.errors = errors;
                testResult.warnings.push('Errors detected in output');
            }

            // Check for warnings
            if (output.includes('WARN') || output.includes('Warning')) {
                const warnings = output.match(/WARN[^\n]*/g) || [];
                testResult.warnings.push(...warnings);
            }

            // Validate results
            const validation = this.validateTest(scenario, testResult);
            testResult.validation = validation;

            // Determine status
            if (validation.passed) {
                testResult.status = 'passed';
                this.stats.passed++;
                this.log(`✅ PASSED: ${scenario.name}`, 'success');
            } else {
                testResult.status = 'failed';
                this.stats.failed++;
                this.log(`❌ FAILED: ${scenario.name}`, 'error');
                this.log(`   Reason: ${validation.reason}`, 'error');
            }

            // Update global stats
            this.stats.totalApisDiscovered += testResult.metrics.apisDiscovered;
            this.stats.totalItemsExtracted += testResult.metrics.itemsExtracted;

        } catch (error) {
            testResult.status = 'error';
            testResult.errors.push(error.message);
            testResult.metrics.duration = Date.now() - testStartTime;
            this.stats.failed++;
            this.log(`❌ ERROR: ${scenario.name} - ${error.message}`, 'error');
        }

        testResult.endTime = new Date().toISOString();
        this.results.push(testResult);
        this.stats.total++;

        return testResult;
    }

    extractMetric(text, regex) {
        const match = text.match(regex);
        return match ? match[1] : null;
    }

    validateTest(scenario, result) {
        const validation = {
            passed: true,
            reason: '',
            checks: []
        };

        // Check if APIs were discovered (if expected)
        if (scenario.expectedApis > 0) {
            const apisFound = result.metrics.apisDiscovered >= scenario.expectedApis;
            validation.checks.push({
                name: 'APIs Discovered',
                passed: apisFound,
                expected: scenario.expectedApis,
                actual: result.metrics.apisDiscovered
            });
            if (!apisFound) {
                validation.passed = false;
                validation.reason = `Expected ${scenario.expectedApis} APIs, found ${result.metrics.apisDiscovered}`;
            }
        }

        // Check for errors
        if (result.errors.length > 0) {
            validation.checks.push({
                name: 'No Errors',
                passed: false,
                errors: result.errors
            });
            validation.passed = false;
            if (!validation.reason) {
                validation.reason = `Errors detected: ${result.errors.length}`;
            }
        }

        // Check if test completed
        if (result.status === 'error') {
            validation.passed = false;
            validation.reason = 'Test execution failed';
        }

        // Check duration (should complete in reasonable time)
        if (result.metrics.duration > TEST_CONFIG.timeout) {
            validation.checks.push({
                name: 'Performance',
                passed: false,
                duration: result.metrics.duration,
                timeout: TEST_CONFIG.timeout
            });
            validation.passed = false;
            if (!validation.reason) {
                validation.reason = 'Test exceeded timeout';
            }
        }

        return validation;
    }

    async runAllTests() {
        this.log('🚀 Starting EXTREME TEST SUITE', 'test');
        this.log(`Testing ${TEST_SCENARIOS.length} scenarios`, 'info');
        this.log(`Timeout: ${TEST_CONFIG.timeout}ms per test`, 'info');
        this.log(`Max Pages: ${TEST_CONFIG.maxPages}`, 'info');
        this.log('', 'info');

        for (let i = 0; i < TEST_SCENARIOS.length; i++) {
            const scenario = TEST_SCENARIOS[i];
            this.log(`\n[${i + 1}/${TEST_SCENARIOS.length}]`, 'test');
            
            try {
                await this.runSingleTest(scenario);
            } catch (error) {
                this.log(`Fatal error in test ${i + 1}: ${error.message}`, 'error');
                this.stats.failed++;
            }

            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        this.generateReport();
    }

    generateReport() {
        const totalDuration = Date.now() - this.startTime;
        const report = {
            summary: {
                totalTests: this.stats.total,
                passed: this.stats.passed,
                failed: this.stats.failed,
                skipped: this.stats.skipped,
                passRate: ((this.stats.passed / this.stats.total) * 100).toFixed(2) + '%',
                totalDuration: totalDuration,
                averageDuration: (totalDuration / this.stats.total).toFixed(0) + 'ms'
            },
            metrics: {
                totalApisDiscovered: this.stats.totalApisDiscovered,
                totalItemsExtracted: this.stats.totalItemsExtracted,
                averageApisPerTest: (this.stats.totalApisDiscovered / this.stats.total).toFixed(2),
                averageItemsPerTest: (this.stats.totalItemsExtracted / this.stats.total).toFixed(2)
            },
            results: this.results,
            timestamp: new Date().toISOString()
        };

        // Save report
        const reportFile = `extreme-test-report-${Date.now()}.json`;
        writeFileSync(reportFile, JSON.stringify(report, null, 2));

        // Print summary
        this.log('\n' + '='.repeat(60), 'test');
        this.log('📊 EXTREME TEST SUITE RESULTS', 'test');
        this.log('='.repeat(60), 'test');
        this.log(`Total Tests: ${this.stats.total}`, 'info');
        this.log(`✅ Passed: ${this.stats.passed}`, 'success');
        this.log(`❌ Failed: ${this.stats.failed}`, 'error');
        this.log(`Pass Rate: ${report.summary.passRate}`, 'info');
        this.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`, 'info');
        this.log(`Average Duration: ${(totalDuration / this.stats.total / 1000).toFixed(2)}s per test`, 'info');
        this.log('', 'info');
        this.log(`📈 Metrics:`, 'info');
        this.log(`   Total APIs Discovered: ${this.stats.totalApisDiscovered}`, 'info');
        this.log(`   Total Items Extracted: ${this.stats.totalItemsExtracted}`, 'info');
        this.log(`   Average APIs/Test: ${report.metrics.averageApisPerTest}`, 'info');
        this.log(`   Average Items/Test: ${report.metrics.averageItemsPerTest}`, 'info');
        this.log('', 'info');
        this.log(`📄 Detailed report saved to: ${reportFile}`, 'info');
        this.log('='.repeat(60), 'test');

        // Print failures
        const failures = this.results.filter(r => r.status === 'failed' || r.status === 'error');
        if (failures.length > 0) {
            this.log('\n❌ FAILED TESTS:', 'error');
            failures.forEach(f => {
                this.log(`   - ${f.scenario}: ${f.validation?.reason || f.errors[0]}`, 'error');
            });
        }

        // Print top performers
        const topPerformers = this.results
            .filter(r => r.status === 'passed')
            .sort((a, b) => b.metrics.apisDiscovered - a.metrics.apisDiscovered)
            .slice(0, 3);
        
        if (topPerformers.length > 0) {
            this.log('\n🏆 TOP PERFORMERS:', 'success');
            topPerformers.forEach((p, i) => {
                this.log(`   ${i + 1}. ${p.scenario}: ${p.metrics.apisDiscovered} APIs, ${p.metrics.itemsExtracted} items`, 'success');
            });
        }

        return report;
    }
}

// Run the tests
const runner = new ExtremeTestRunner();
runner.runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

