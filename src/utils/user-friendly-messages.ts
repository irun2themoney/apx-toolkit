/**
 * User-Friendly Messages
 * 
 * Provides clear, helpful messages for users
 */

export const USER_MESSAGES = {
    welcome: () => `
🚀 Welcome to APX Toolkit!
==========================

APX automatically discovers APIs and generates everything you need:
• Code in 12 languages
• Complete documentation
• Test suites
• SDK packages
• Mock servers
• Performance reports
• And much more!

Let's get started! 🎯
`,

    discovery: {
        starting: (urlCount: number) => `🔍 Starting API discovery... (${urlCount} URL${urlCount > 1 ? 's' : ''})`,
        inProgress: (current: number, total: number) => `   Discovering... ${current}/${total}`,
        found: (count: number) => `✅ Found ${count} API endpoint${count !== 1 ? 's' : ''}!`,
        none: () => `⚠️  No APIs discovered. Try enabling interaction simulation or check your URLs.`,
    },

    processing: {
        starting: (count: number) => `⚡ Processing ${count} API${count !== 1 ? 's' : ''}...`,
        inProgress: (current: number, total: number) => `   Processing... ${current}/${total}`,
        complete: (count: number) => `✅ Processed ${count} API${count !== 1 ? 's' : ''}!`,
    },

    generation: {
        mockServer: () => `🔄 Generating mock server...`,
        performance: () => `📊 Benchmarking performance...`,
        contracts: () => `🧪 Generating contract tests...`,
        mcp: () => `🤖 Setting up MCP integration...`,
        x402: () => `💳 Detecting payment endpoints...`,
        dependencyGraph: () => `🔗 Analyzing dependencies...`,
        complete: (feature: string) => `✅ ${feature} complete!`,
    },

    output: {
        summary: (items: number) => `📦 Generated ${items} output item${items !== 1 ? 's' : ''}`,
        location: (location: string) => `📁 Output saved to: ${location}`,
        nextSteps: () => `
📋 Next Steps:
   1. Check the Dataset tab for all outputs
   2. Download the dataset to get all files
   3. Use the generated code, docs, and tools
   4. Check the different views for organized outputs
`,
    },

    errors: {
        invalidUrl: (url: string) => `❌ Invalid URL: "${url}". Please check the URL format.`,
        noUrls: () => `❌ No start URLs provided. Please add at least one URL to start.`,
        discoveryFailed: (url: string, reason: string) => `⚠️  Could not discover APIs from ${url}. ${reason}`,
        processingFailed: (url: string) => `⚠️  Could not process ${url}. Continuing with other APIs...`,
        validation: (field: string, message: string) => `❌ Invalid ${field}: ${message}`,
        suggestion: (suggestion: string) => `💡 Tip: ${suggestion}`,
    },

    tips: {
        betterDiscovery: () => `💡 Tip: Enable "Interaction Simulation" to discover more APIs by clicking buttons and scrolling.`,
        fasterProcessing: () => `💡 Tip: Increase "Max Concurrency" for faster processing (but may hit rate limits).`,
        moreApis: () => `💡 Tip: Try multiple start URLs or increase "Max Pages" to discover more APIs.`,
        authentication: () => `💡 Tip: Add authentication headers or tokens if the API requires login.`,
    },

    success: {
        complete: () => `🎉 All done! Your API integration package is ready!`,
        features: (count: number) => `✨ Generated ${count} feature${count !== 1 ? 's' : ''}!`,
    },
};

/**
 * Format progress message
 */
export function formatProgress(current: number, total: number, label: string): string {
    const percentage = Math.round((current / total) * 100);
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    return `${label} [${bar}] ${percentage}% (${current}/${total})`;
}

/**
 * Format time estimate
 */
export function formatTimeEstimate(seconds: number): string {
    if (seconds < 60) {
        return `~${Math.round(seconds)} seconds`;
    } else {
        const minutes = Math.round(seconds / 60);
        return `~${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
}

/**
 * Get helpful suggestion based on error
 */
export function getSuggestion(error: string): string | null {
    if (error.includes('URL') || error.includes('url')) {
        return USER_MESSAGES.tips.betterDiscovery();
    }
    if (error.includes('timeout') || error.includes('slow')) {
        return USER_MESSAGES.tips.fasterProcessing();
    }
    if (error.includes('auth') || error.includes('401') || error.includes('403')) {
        return USER_MESSAGES.tips.authentication();
    }
    if (error.includes('no APIs') || error.includes('discover')) {
        return USER_MESSAGES.tips.moreApis();
    }
    return null;
}

