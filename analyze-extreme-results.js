/**
 * Analyze Extreme Test Results
 * 
 * Extracts insights, patterns, and improvement opportunities
 * from extreme test suite results
 */

import { readFileSync, readdirSync } from 'fs';

function analyzeReport(reportFile) {
    console.log(`\n📊 Analyzing: ${reportFile}\n`);
    console.log('='.repeat(60));
    
    const report = JSON.parse(readFileSync(reportFile, 'utf-8'));
    
    // Overall Statistics
    console.log('\n📈 OVERALL STATISTICS');
    console.log('-'.repeat(60));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Pass Rate: ${report.summary.passRate}`);
    console.log(`Total Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`);
    console.log(`Average Duration: ${(report.summary.totalDuration / report.summary.totalTests / 1000).toFixed(2)}s per test`);
    
    // Success Metrics
    console.log('\n✅ SUCCESS METRICS');
    console.log('-'.repeat(60));
    console.log(`Total APIs Discovered: ${report.metrics.totalApisDiscovered}`);
    console.log(`Total Items Extracted: ${report.metrics.totalItemsExtracted}`);
    console.log(`Average APIs per Test: ${report.metrics.averageApisPerTest}`);
    console.log(`Average Items per Test: ${report.metrics.averageItemsPerTest}`);
    
    // Test Results Analysis
    console.log('\n🔍 DETAILED ANALYSIS');
    console.log('-'.repeat(60));
    
    const passed = report.results.filter(r => r.status === 'passed');
    const failed = report.results.filter(r => r.status === 'failed' || r.status === 'error');
    
    console.log(`\n✅ PASSED TESTS (${passed.length}):`);
    passed.forEach(test => {
        console.log(`   • ${test.scenario}`);
        console.log(`     APIs: ${test.metrics.apisDiscovered}, Items: ${test.metrics.itemsExtracted}, Duration: ${(test.metrics.duration / 1000).toFixed(2)}s`);
    });
    
    if (failed.length > 0) {
        console.log(`\n❌ FAILED TESTS (${failed.length}):`);
        failed.forEach(test => {
            console.log(`   • ${test.scenario}`);
            console.log(`     Reason: ${test.validation?.reason || test.errors[0] || 'Unknown'}`);
            if (test.errors.length > 0) {
                console.log(`     Errors: ${test.errors.slice(0, 2).join(', ')}`);
            }
        });
    }
    
    // Performance Analysis
    console.log('\n⚡ PERFORMANCE ANALYSIS');
    console.log('-'.repeat(60));
    const durations = report.results.map(r => r.metrics.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    console.log(`Fastest Test: ${(minDuration / 1000).toFixed(2)}s`);
    console.log(`Slowest Test: ${(maxDuration / 1000).toFixed(2)}s`);
    console.log(`Average: ${(avgDuration / 1000).toFixed(2)}s`);
    
    // API Discovery Analysis
    console.log('\n🔎 API DISCOVERY ANALYSIS');
    console.log('-'.repeat(60));
    const testsWithApis = report.results.filter(r => r.metrics.apisDiscovered > 0);
    const testsWithoutApis = report.results.filter(r => r.metrics.apisDiscovered === 0);
    
    console.log(`Tests with APIs discovered: ${testsWithApis.length}`);
    console.log(`Tests without APIs: ${testsWithoutApis.length}`);
    
    if (testsWithApis.length > 0) {
        console.log('\n   Successful discoveries:');
        testsWithApis.forEach(test => {
            console.log(`   • ${test.scenario}: ${test.metrics.apisDiscovered} APIs`);
        });
    }
    
    if (testsWithoutApis.length > 0) {
        console.log('\n   No APIs found:');
        testsWithoutApis.forEach(test => {
            console.log(`   • ${test.scenario}`);
        });
    }
    
    // Error Patterns
    console.log('\n⚠️  ERROR PATTERNS');
    console.log('-'.repeat(60));
    const allErrors = [];
    report.results.forEach(test => {
        test.errors.forEach(error => {
            allErrors.push(error);
        });
    });
    
    if (allErrors.length > 0) {
        const errorTypes = {};
        allErrors.forEach(error => {
            const type = error.split(':')[0] || error.substring(0, 50);
            errorTypes[type] = (errorTypes[type] || 0) + 1;
        });
        
        console.log('Most common errors:');
        Object.entries(errorTypes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([error, count]) => {
                console.log(`   • ${error}: ${count} times`);
            });
    } else {
        console.log('No errors detected! 🎉');
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(60));
    
    const recommendations = [];
    
    if (failed.length > passed.length) {
        recommendations.push('⚠️  High failure rate - investigate common failure patterns');
    }
    
    if (avgDuration > 20000) {
        recommendations.push('⚡ Performance optimization needed - average test duration is high');
    }
    
    if (testsWithoutApis.length > testsWithApis.length) {
        recommendations.push('🔍 API discovery needs improvement - many tests found no APIs');
    }
    
    if (report.metrics.averageItemsPerTest < 10) {
        recommendations.push('📊 Data extraction could be improved - low item count per test');
    }
    
    if (allErrors.length > 0) {
        recommendations.push('🐛 Error handling needs attention - multiple errors detected');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('✅ All systems performing well!');
    }
    
    recommendations.forEach(rec => console.log(`   ${rec}`));
    
    // Key Insights
    console.log('\n🎯 KEY INSIGHTS');
    console.log('-'.repeat(60));
    
    const insights = [];
    
    // Best performing test
    const bestTest = report.results
        .filter(r => r.status === 'passed')
        .sort((a, b) => (b.metrics.apisDiscovered + b.metrics.itemsExtracted) - (a.metrics.apisDiscovered + a.metrics.itemsExtracted))[0];
    
    if (bestTest) {
        insights.push(`🏆 Best performer: ${bestTest.scenario} (${bestTest.metrics.apisDiscovered} APIs, ${bestTest.metrics.itemsExtracted} items)`);
    }
    
    // Most reliable test type
    const testTypes = {};
    report.results.forEach(test => {
        const type = test.description.split(' ')[0] || 'Unknown';
        if (!testTypes[type]) {
            testTypes[type] = { total: 0, passed: 0 };
        }
        testTypes[type].total++;
        if (test.status === 'passed') {
            testTypes[type].passed++;
        }
    });
    
    const mostReliable = Object.entries(testTypes)
        .map(([type, stats]) => ({
            type,
            reliability: (stats.passed / stats.total) * 100
        }))
        .sort((a, b) => b.reliability - a.reliability)[0];
    
    if (mostReliable) {
        insights.push(`📈 Most reliable type: ${mostReliable.type} (${mostReliable.reliability.toFixed(0)}% success)`);
    }
    
    // Discovery success rate
    const discoveryRate = (testsWithApis.length / report.summary.totalTests) * 100;
    insights.push(`🔍 API Discovery Rate: ${discoveryRate.toFixed(1)}%`);
    
    insights.forEach(insight => console.log(`   ${insight}`));
    
    console.log('\n' + '='.repeat(60));
}

// Find and analyze latest report
const files = readdirSync('.').filter(f => f.startsWith('extreme-test-report-') && f.endsWith('.json'));
if (files.length === 0) {
    console.log('❌ No test reports found. Run "npm run test:extreme" first.');
    process.exit(1);
}

// Sort by timestamp and analyze the latest
files.sort().reverse();
const latestReport = files[0];

analyzeReport(latestReport);

