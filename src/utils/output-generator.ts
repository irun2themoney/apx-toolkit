/**
 * Output Generator
 * Generates all enhanced outputs: GitHub Actions, Git integration, security reports, etc.
 */

import type { DiscoveredAPI } from '../types.js';
import type { APXResult } from '../core-runner.js';
import { generateGitHubActionsWorkflow, generateApifyInput } from './github-actions-generator.js';
import { auditAPIs, formatSecurityReport } from './security-audit.js';
import { detectChanges, formatChangeReport } from './change-detector.js';
import { generateDocumentationPackage } from './docs-generator.js';
import { autoCommitGeneratedFiles, appendChangelog, type GitConfig, type ChangelogEntry } from './git-integration.js';
import { generateMockServer as generateMockServerFn, saveMockServer, type MockServerConfig } from './mock-server-generator.js';
import { benchmarkAPIs, savePerformanceReport } from './performance-benchmark.js';
import { generateContractTests as generateContractTestsFn, saveContractTests } from './contract-test-generator.js';
import { generateMCPServer, saveMCPIntegration } from './mcp-integration.js';
import { detectX402Endpoints, saveX402Integration } from './x402-integration.js';
import { analyzeDependencies, saveDependencyGraph } from './dependency-graph.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface EnhancedOutputOptions {
    outputDir?: string;
    gitIntegration?: GitConfig;
    generateGitHubActions?: boolean;
    generateSecurityReport?: boolean;
    generateChangeReport?: boolean;
    generateDocs?: boolean;
    generateMockServer?: boolean;
    generatePerformanceBenchmark?: boolean;
    generateContractTests?: boolean;
    generateMCPIntegration?: boolean;
    generateX402Integration?: boolean;
    generateDependencyGraph?: boolean;
    previousAPIs?: DiscoveredAPI[]; // For change detection
    onProgress?: (message: string) => void;
    onError?: (error: Error) => void;
}

/**
 * Generate all enhanced outputs
 */
export async function generateEnhancedOutputs(
    result: APXResult,
    apis: DiscoveredAPI[],
    options: EnhancedOutputOptions = {}
): Promise<void> {
    const {
        outputDir = './apx-output',
        gitIntegration,
        generateGitHubActions = true,
        generateSecurityReport = true,
        generateChangeReport = true,
        generateDocs = true,
        generateMockServer = true,
        generatePerformanceBenchmark = true,
        generateContractTests = true,
        generateMCPIntegration = true,
        generateX402Integration = true,
        generateDependencyGraph = true,
        previousAPIs = [],
        onProgress,
        onError,
    } = options;
    
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate GitHub Actions workflow
    if (generateGitHubActions) {
        try {
            const workflowsDir = join(outputDir, '.github', 'workflows');
            if (!existsSync(workflowsDir)) {
                mkdirSync(workflowsDir, { recursive: true });
            }
            
            const workflow = generateGitHubActionsWorkflow();
            writeFileSync(join(workflowsDir, 'apx-discovery.yml'), workflow, 'utf-8');
            
            // Generate input file
            if (apis.length > 0) {
                const input = generateApifyInput(apis[0].baseUrl);
                const inputDir = join(outputDir, '.github');
                if (!existsSync(inputDir)) {
                    mkdirSync(inputDir, { recursive: true });
                }
                writeFileSync(join(inputDir, 'apx-input.json'), input, 'utf-8');
            }
            
            if (onProgress) onProgress('GitHub Actions workflow generated');
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    
    // Generate security audit report
    if (generateSecurityReport && apis.length > 0) {
        try {
            const audit = auditAPIs(apis);
            const report = formatSecurityReport(audit);
            writeFileSync(join(outputDir, 'SECURITY-AUDIT.md'), report, 'utf-8');
            writeFileSync(join(outputDir, 'security-audit.json'), JSON.stringify(audit, null, 2), 'utf-8');
            if (onProgress) onProgress(`Security audit report generated (Score: ${audit.score}/100)`);
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    
    // Generate change report
    if (generateChangeReport && previousAPIs.length > 0) {
        try {
            const changes = detectChanges(apis, previousAPIs);
            const report = formatChangeReport(changes);
            writeFileSync(join(outputDir, 'CHANGELOG-API.md'), report, 'utf-8');
            writeFileSync(join(outputDir, 'api-changes.json'), JSON.stringify(changes, null, 2), 'utf-8');
            if (onProgress) onProgress(`Change report generated: ${changes.summary}`);
            
            // Append to changelog if git integration enabled
            if (gitIntegration?.generateChangelog) {
                const changelogEntry: ChangelogEntry = {
                    date: new Date().toISOString().split('T')[0],
                    changes: {
                        added: changes.apisAdded > 0 ? [`${changes.apisAdded} API(s) added`] : undefined,
                        modified: changes.apisModified > 0 ? [`${changes.apisModified} API(s) modified`] : undefined,
                        removed: changes.apisRemoved > 0 ? [`${changes.apisRemoved} API(s) removed`] : undefined,
                    },
                    apis: {
                        discovered: changes.apisAdded,
                        modified: changes.apisModified,
                        removed: changes.apisRemoved,
                    },
                };
                appendChangelog(changelogEntry, 'CHANGELOG.md', outputDir);
            }
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    
    // Generate enhanced documentation
    if (generateDocs && apis.length > 0) {
        try {
            const docs = generateDocumentationPackage(apis);
            writeFileSync(join(outputDir, 'API.md'), docs.markdown, 'utf-8');
            writeFileSync(join(outputDir, 'README.md'), docs.readme, 'utf-8');
            writeFileSync(join(outputDir, 'jsdoc-comments.json'), JSON.stringify(docs.jsdoc, null, 2), 'utf-8');
            if (onProgress) onProgress('Enhanced documentation generated');
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    
    // Generate mock server
    if (generateMockServer && apis.length > 0) {
        try {
            if (onProgress) onProgress('Generating mock server...');
            const mockServer = await generateMockServerFn(apis, {
                framework: 'express',
                port: 3000,
                includeErrors: true,
                includeRateLimiting: true,
            });
            await saveMockServer(mockServer, join(outputDir, 'mock-server'));
            if (onProgress) onProgress('Mock server generated');
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    
    // Generate performance benchmark
    if (generatePerformanceBenchmark && apis.length > 0) {
        try {
            if (onProgress) onProgress('Benchmarking API performance...');
            const report = await benchmarkAPIs(apis, 10);
            await savePerformanceReport(report, join(outputDir, 'performance'));
            if (onProgress) onProgress('Performance benchmark complete');
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    
    // Generate contract tests
    if (generateContractTests && apis.length > 0) {
        try {
            if (onProgress) onProgress('Generating contract tests...');
            const contractTests = generateContractTestsFn(apis);
            await saveContractTests(contractTests, join(outputDir, 'contracts'));
            if (onProgress) onProgress('Contract tests generated');
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    
    // Generate MCP integration
    if (generateMCPIntegration && apis.length > 0) {
        try {
            if (onProgress) onProgress('Generating MCP integration...');
            const mcpConfig = generateMCPServer(apis);
            await saveMCPIntegration(mcpConfig, join(outputDir, 'mcp'));
            if (onProgress) onProgress('MCP integration generated');
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    
    // Generate x402 integration
    if (generateX402Integration && apis.length > 0) {
        try {
            if (onProgress) onProgress('Detecting x402 payment endpoints...');
            const x402APIs = detectX402Endpoints(apis);
            await saveX402Integration(x402APIs, join(outputDir, 'x402'));
            if (onProgress) onProgress('x402 integration generated');
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    
    // Generate dependency graph
    if (generateDependencyGraph && apis.length > 0) {
        try {
            if (onProgress) onProgress('Analyzing API dependencies...');
            const graph = analyzeDependencies(apis);
            await saveDependencyGraph(graph, join(outputDir, 'dependency-graph'));
            if (onProgress) onProgress('Dependency graph generated');
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    
    // Git integration
    if (gitIntegration?.enabled) {
        try {
            const filesToCommit = [
                'API.md',
                'README.md',
                'SECURITY-AUDIT.md',
                '.github/workflows/apx-discovery.yml',
                'CHANGELOG.md',
                'mock-server',
                'performance',
                'contracts',
                'mcp',
                'x402',
                'dependency-graph',
            ].filter(f => existsSync(join(outputDir, f)));
            
            if (filesToCommit.length > 0) {
                autoCommitGeneratedFiles(filesToCommit, gitIntegration, outputDir);
                if (onProgress) onProgress('Files committed to Git');
            }
        } catch (error) {
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
