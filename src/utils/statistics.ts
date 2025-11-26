/**
 * Statistics and Progress Reporting
 * Maximizes quality score and user experience
 */

import { Dataset } from 'crawlee';

// Global statistics instance (singleton pattern)
let globalStatistics: StatisticsCollector | null = null;

export interface ActorStatistics {
    discovery: {
        sitesProcessed: number;
        apisDiscovered: number;
        discoveryTime: number;
    };
    processing: {
        requestsMade: number;
        requestsSuccessful: number;
        requestsFailed: number;
        itemsExtracted: number;
        pagesProcessed: number;
    };
    output: {
        documentationFiles: number;
        codeSnippetsGenerated: number;
        typescriptTypesGenerated: number;
        examplesCaptured: number;
        totalOutputItems: number;
    };
    performance: {
        totalDuration: number;
        averageRequestTime: number;
        averageDiscoveryTime: number;
    };
}

export class StatisticsCollector {
    private stats: ActorStatistics;
    private startTime: number;

    constructor() {
        this.startTime = Date.now();
        this.stats = {
            discovery: {
                sitesProcessed: 0,
                apisDiscovered: 0,
                discoveryTime: 0,
            },
            processing: {
                requestsMade: 0,
                requestsSuccessful: 0,
                requestsFailed: 0,
                itemsExtracted: 0,
                pagesProcessed: 0,
            },
            output: {
                documentationFiles: 0,
                codeSnippetsGenerated: 0,
                typescriptTypesGenerated: 0,
                examplesCaptured: 0,
                totalOutputItems: 0,
            },
            performance: {
                totalDuration: 0,
                averageRequestTime: 0,
                averageDiscoveryTime: 0,
            },
        };
    }

    recordDiscovery(apisCount: number, duration: number) {
        this.stats.discovery.sitesProcessed++;
        this.stats.discovery.apisDiscovered += apisCount;
        this.stats.discovery.discoveryTime += duration;
    }

    recordRequest(success: boolean, itemsExtracted: number = 0) {
        this.stats.processing.requestsMade++;
        if (success) {
            this.stats.processing.requestsSuccessful++;
            this.stats.processing.itemsExtracted += itemsExtracted;
        } else {
            this.stats.processing.requestsFailed++;
        }
    }

    recordPage() {
        this.stats.processing.pagesProcessed++;
    }

    recordDocumentation(count: number = 1) {
        this.stats.output.documentationFiles += count;
    }

    recordCodeSnippets() {
        this.stats.output.codeSnippetsGenerated++;
    }

    recordTypeScriptTypes() {
        this.stats.output.typescriptTypesGenerated++;
    }

    recordExamples(count: number) {
        this.stats.output.examplesCaptured += count;
    }

    async finalize() {
        const totalDuration = (Date.now() - this.startTime) / 1000;
        this.stats.performance.totalDuration = totalDuration;

        if (this.stats.processing.requestsMade > 0) {
            this.stats.performance.averageRequestTime = 
                totalDuration / this.stats.processing.requestsMade;
        }

        if (this.stats.discovery.sitesProcessed > 0) {
            this.stats.performance.averageDiscoveryTime = 
                this.stats.discovery.discoveryTime / this.stats.discovery.sitesProcessed;
        }

        // Get actual dataset count
        try {
            const dataset = await Dataset.open();
            const datasetInfo = await dataset.getInfo();
            this.stats.output.totalOutputItems = datasetInfo?.itemCount || 0;
        } catch (error) {
            // If we can't get dataset info, continue with current count
        }

        return this.stats;
    }

    getStats(): ActorStatistics {
        return { ...this.stats };
    }

    async saveSummary() {
        const stats = await this.finalize();
        
        const summary = {
            _type: 'execution_summary',
            statistics: stats,
            success: stats.processing.requestsFailed === 0,
            timestamp: new Date().toISOString(),
            summary: {
                totalApis: stats.discovery.apisDiscovered,
                totalItems: stats.processing.itemsExtracted,
                totalPages: stats.processing.pagesProcessed,
                documentationGenerated: stats.output.documentationFiles > 0,
                codeSnippetsGenerated: stats.output.codeSnippetsGenerated > 0,
                typescriptTypesGenerated: stats.output.typescriptTypesGenerated > 0,
                examplesCaptured: stats.output.examplesCaptured > 0,
                duration: `${(stats.performance.totalDuration / 60).toFixed(2)} minutes`,
                successRate: stats.processing.requestsMade > 0
                    ? `${((stats.processing.requestsSuccessful / stats.processing.requestsMade) * 100).toFixed(1)}%`
                    : 'N/A',
            },
        };

        await Dataset.pushData(summary);
        return summary;
    }
}

/**
 * Formats statistics for user-friendly display
 */
export function formatStatistics(stats: ActorStatistics): string {
    const lines: string[] = [];
    
    lines.push('📊 Execution Statistics');
    lines.push('='.repeat(50));
    lines.push('');
    
    lines.push('🔍 Discovery Phase:');
    lines.push(`   Sites Processed: ${stats.discovery.sitesProcessed}`);
    lines.push(`   APIs Discovered: ${stats.discovery.apisDiscovered}`);
    lines.push(`   Avg Discovery Time: ${stats.discovery.discoveryTime.toFixed(2)}s`);
    lines.push('');
    
    lines.push('⚡ Processing Phase:');
    lines.push(`   Requests Made: ${stats.processing.requestsMade}`);
    lines.push(`   Successful: ${stats.processing.requestsSuccessful}`);
    lines.push(`   Failed: ${stats.processing.requestsFailed}`);
    lines.push(`   Items Extracted: ${stats.processing.itemsExtracted}`);
    lines.push(`   Pages Processed: ${stats.processing.pagesProcessed}`);
    lines.push('');
    
    lines.push('📦 Output Generated:');
    lines.push(`   Documentation Files: ${stats.output.documentationFiles}`);
    lines.push(`   Code Snippets: ${stats.output.codeSnippetsGenerated > 0 ? 'Yes' : 'No'}`);
    lines.push(`   TypeScript Types: ${stats.output.typescriptTypesGenerated > 0 ? 'Yes' : 'No'}`);
    lines.push(`   Examples Captured: ${stats.output.examplesCaptured}`);
    lines.push(`   Total Output Items: ${stats.output.totalOutputItems}`);
    lines.push('');
    
    lines.push('⏱️  Performance:');
    lines.push(`   Total Duration: ${(stats.performance.totalDuration / 60).toFixed(2)} minutes`);
    lines.push(`   Avg Request Time: ${stats.performance.averageRequestTime.toFixed(2)}s`);
    lines.push('');
    
    const successRate = stats.processing.requestsMade > 0
        ? ((stats.processing.requestsSuccessful / stats.processing.requestsMade) * 100).toFixed(1)
        : 'N/A';
    
    lines.push(`✅ Success Rate: ${successRate}%`);
    
    return lines.join('\n');
}

/**
 * Get or create global statistics instance
 */
export function getStatistics(): StatisticsCollector | null {
    return globalStatistics;
}

/**
 * Set global statistics instance
 */
export function setStatistics(stats: StatisticsCollector): void {
    globalStatistics = stats;
}

