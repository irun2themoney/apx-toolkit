/**
 * API Performance Benchmarking
 * 
 * Automatically benchmarks discovered APIs and generates performance reports
 */

import type { DiscoveredAPI } from '../types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface PerformanceMetrics {
    endpoint: string;
    method: string;
    latency: {
        min: number;
        max: number;
        avg: number;
        p50: number;
        p95: number;
        p99: number;
    };
    throughput: number; // requests per second
    errorRate: number; // percentage
    successRate: number; // percentage
    sampleSize: number;
}

export interface PerformanceReport {
    summary: {
        totalEndpoints: number;
        averageLatency: number;
        slowestEndpoint: string;
        fastestEndpoint: string;
        totalErrors: number;
        overallSuccessRate: number;
    };
    metrics: PerformanceMetrics[];
    recommendations: string[];
    loadTestScript?: string;
}

/**
 * Benchmark a single API endpoint
 */
export async function benchmarkEndpoint(
    api: DiscoveredAPI,
    iterations: number = 10
): Promise<PerformanceMetrics> {
    const latencies: number[] = [];
    let errors = 0;
    let successes = 0;

    for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        try {
            const response = await fetch(api.url, {
                method: api.method,
                headers: api.headers || {},
            });

            const endTime = Date.now();
            const latency = endTime - startTime;

            if (response.ok) {
                latencies.push(latency);
                successes++;
            } else {
                errors++;
            }
        } catch (error) {
            errors++;
        }
    }

    latencies.sort((a, b) => a - b);

    return {
        endpoint: api.url,
        method: api.method,
        latency: {
            min: latencies[0] || 0,
            max: latencies[latencies.length - 1] || 0,
            avg: latencies.reduce((a, b) => a + b, 0) / latencies.length || 0,
            p50: latencies[Math.floor(latencies.length * 0.5)] || 0,
            p95: latencies[Math.floor(latencies.length * 0.95)] || 0,
            p99: latencies[Math.floor(latencies.length * 0.99)] || 0,
        },
        throughput: (successes / iterations) * 1000, // requests per second estimate
        errorRate: (errors / iterations) * 100,
        successRate: (successes / iterations) * 100,
        sampleSize: iterations,
    };
}

/**
 * Benchmark all discovered APIs
 */
export async function benchmarkAPIs(
    apis: DiscoveredAPI[],
    iterations: number = 10
): Promise<PerformanceReport> {
    const metrics: PerformanceMetrics[] = [];

    for (const api of apis) {
        const metric = await benchmarkEndpoint(api, iterations);
        metrics.push(metric);
    }

    // Calculate summary
    const allLatencies = metrics.flatMap(m => [m.latency.avg]);
    const averageLatency = allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length;
    
    const slowest = metrics.reduce((prev, curr) => 
        curr.latency.avg > prev.latency.avg ? curr : prev
    );
    
    const fastest = metrics.reduce((prev, curr) => 
        curr.latency.avg < prev.latency.avg ? curr : prev
    );

    const totalErrors = metrics.reduce((sum, m) => sum + (m.errorRate * m.sampleSize / 100), 0);
    const overallSuccessRate = metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;

    // Generate recommendations
    const recommendations = generateRecommendations(metrics);

    // Generate load test script
    const loadTestScript = generateLoadTestScript(apis);

    return {
        summary: {
            totalEndpoints: apis.length,
            averageLatency,
            slowestEndpoint: slowest.endpoint,
            fastestEndpoint: fastest.endpoint,
            totalErrors: Math.round(totalErrors),
            overallSuccessRate,
        },
        metrics,
        recommendations,
        loadTestScript,
    };
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(metrics: PerformanceMetrics[]): string[] {
    const recommendations: string[] = [];

    // Check for slow endpoints
    const slowEndpoints = metrics.filter(m => m.latency.avg > 1000);
    if (slowEndpoints.length > 0) {
        recommendations.push(
            `⚠️  ${slowEndpoints.length} endpoint(s) have average latency > 1s. Consider caching or optimization.`
        );
    }

    // Check for high error rates
    const errorEndpoints = metrics.filter(m => m.errorRate > 5);
    if (errorEndpoints.length > 0) {
        recommendations.push(
            `❌ ${errorEndpoints.length} endpoint(s) have error rate > 5%. Investigate stability issues.`
        );
    }

    // Check for low throughput
    const lowThroughput = metrics.filter(m => m.throughput < 10);
    if (lowThroughput.length > 0) {
        recommendations.push(
            `🐌 ${lowThroughput.length} endpoint(s) have low throughput. Consider batching or parallelization.`
        );
    }

    // General recommendations
    recommendations.push('💡 Consider implementing caching for frequently accessed endpoints');
    recommendations.push('💡 Use connection pooling to improve throughput');
    recommendations.push('💡 Implement retry logic with exponential backoff for failed requests');

    return recommendations;
}

/**
 * Generate k6 load test script
 */
function generateLoadTestScript(apis: DiscoveredAPI[]): string {
    return `// Auto-generated k6 load test script by APX Toolkit
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
  },
};

export default function () {
${apis.map(api => {
    const method = api.method.toLowerCase();
    const url = api.url;
    return `
  // Test ${api.method} ${url}
  const res${apis.indexOf(api)} = http.${method}('${url}', {
    headers: ${JSON.stringify(api.headers || {})},
  });
  check(res${apis.indexOf(api)}, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);`;
}).join('\n')}
}
`;
}

/**
 * Format performance report as markdown
 */
export function formatPerformanceReport(report: PerformanceReport): string {
    return `# API Performance Benchmark Report

Generated by APX Toolkit

## 📊 Summary

- **Total Endpoints:** ${report.summary.totalEndpoints}
- **Average Latency:** ${report.summary.averageLatency.toFixed(2)}ms
- **Slowest Endpoint:** ${report.summary.slowestEndpoint}
- **Fastest Endpoint:** ${report.summary.fastestEndpoint}
- **Overall Success Rate:** ${report.summary.overallSuccessRate.toFixed(2)}%

## 📈 Detailed Metrics

${report.metrics.map(m => `
### ${m.method} ${m.endpoint}

- **Average Latency:** ${m.latency.avg.toFixed(2)}ms
- **Min/Max:** ${m.latency.min}ms / ${m.latency.max}ms
- **P95:** ${m.latency.p95}ms
- **P99:** ${m.latency.p99}ms
- **Throughput:** ${m.throughput.toFixed(2)} req/s
- **Success Rate:** ${m.successRate.toFixed(2)}%
- **Error Rate:** ${m.errorRate.toFixed(2)}%
`).join('\n')}

## 💡 Recommendations

${report.recommendations.map(r => `- ${r}`).join('\n')}

## 🧪 Load Testing

A k6 load test script has been generated. Run it with:

\`\`\`bash
k6 run load-test.js
\`\`\`

---
Generated by APX Toolkit
`;
}

/**
 * Save performance report
 */
export async function savePerformanceReport(
    report: PerformanceReport,
    outputPath: string
): Promise<void> {
    await fs.mkdir(outputPath, { recursive: true });

    // Save markdown report
    await fs.writeFile(
        path.join(outputPath, 'PERFORMANCE-REPORT.md'),
        formatPerformanceReport(report)
    );

    // Save JSON data
    await fs.writeFile(
        path.join(outputPath, 'performance-metrics.json'),
        JSON.stringify(report, null, 2)
    );

    // Save load test script
    if (report.loadTestScript) {
        await fs.writeFile(
            path.join(outputPath, 'load-test.js'),
            report.loadTestScript
        );
    }
}

