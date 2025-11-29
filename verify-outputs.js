#!/usr/bin/env node

/**
 * Verify that all expected outputs are generated correctly
 * Checks file existence, structure, and validity
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = './apx-output';

const EXPECTED_OUTPUTS = {
    'mock-server': [
        'server.js',
        'package.json',
        'README.md',
        'data',
        'test',
    ],
    'performance': [
        'PERFORMANCE-REPORT.md',
        'performance-metrics.json',
        'load-test.js',
    ],
    'contracts': [
        'pact-contracts.test.js',
        'schemathesis_tests.py',
        'contracts.json',
        '.github/workflows/contract-tests.yml',
    ],
    'mcp': [
        'mcp-server.js',
        'mcp-client.js',
        'mcp-resources.json',
        'mcp-tools.json',
        'MCP-README.md',
    ],
    'x402': [
        'x402-client.ts',
        'x402-payment-handler.ts',
        'x402-api-info.json',
        'X402-README.md',
    ],
    'dependency-graph': [
        'dependency-graph.html',
        'dependency-graph.mmd',
        'dependency-graph.json',
        'CRITICAL-PATHS.md',
    ],
};

function checkFile(path) {
    if (!existsSync(path)) {
        return { exists: false, error: 'File does not exist' };
    }
    
    const stats = statSync(path);
    if (stats.size === 0) {
        return { exists: true, error: 'File is empty' };
    }
    
    return { exists: true, size: stats.size };
}

function checkJSON(path) {
    const fileCheck = checkFile(path);
    if (!fileCheck.exists || fileCheck.error) {
        return fileCheck;
    }
    
    try {
        const content = readFileSync(path, 'utf-8');
        JSON.parse(content);
        return { exists: true, valid: true, size: fileCheck.size };
    } catch (error) {
        return { exists: true, valid: false, error: `Invalid JSON: ${error.message}` };
    }
}

function checkDirectory(path) {
    if (!existsSync(path)) {
        return { exists: false, error: 'Directory does not exist' };
    }
    
    const stats = statSync(path);
    if (!stats.isDirectory()) {
        return { exists: false, error: 'Path is not a directory' };
    }
    
    const files = readdirSync(path);
    return { exists: true, fileCount: files.length, files };
}

function verifyOutputs() {
    console.log('🔍 Verifying Generated Outputs\n');
    console.log('='.repeat(60));
    console.log('');
    
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;
    
    for (const [feature, files] of Object.entries(EXPECTED_OUTPUTS)) {
        console.log(`📦 ${feature.toUpperCase()}`);
        console.log('-'.repeat(60));
        
        for (const file of files) {
            totalChecks++;
            const fullPath = join(OUTPUT_DIR, feature, file);
            
            let result;
            if (file.endsWith('.json')) {
                result = checkJSON(fullPath);
            } else if (file.includes('/') || !file.includes('.')) {
                // Directory or nested path
                result = checkDirectory(fullPath);
            } else {
                result = checkFile(fullPath);
            }
            
            if (result.exists && !result.error && (result.valid !== false)) {
                passedChecks++;
                const size = result.size ? ` (${result.size} bytes)` : '';
                const fileCount = result.fileCount ? ` (${result.fileCount} files)` : '';
                console.log(`  ✅ ${file}${size}${fileCount}`);
            } else {
                failedChecks++;
                const error = result.error || (result.valid === false ? result.error : 'Unknown error');
                console.log(`  ❌ ${file}: ${error}`);
            }
        }
        
        console.log('');
    }
    
    console.log('='.repeat(60));
    console.log('');
    console.log('📊 Summary:');
    console.log(`  Total Checks: ${totalChecks}`);
    console.log(`  ✅ Passed: ${passedChecks}`);
    console.log(`  ❌ Failed: ${failedChecks}`);
    console.log(`  Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
    console.log('');
    
    if (failedChecks === 0) {
        console.log('🎉 All outputs verified successfully!');
        process.exit(0);
    } else {
        console.log('⚠️  Some outputs are missing or invalid.');
        process.exit(1);
    }
}

verifyOutputs();

