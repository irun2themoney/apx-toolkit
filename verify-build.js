#!/usr/bin/env node

/**
 * Quick verification script to check if the build is ready
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verifying build...\n');

// Check if dist directory exists
const distPath = join(__dirname, 'dist');
if (!existsSync(distPath)) {
    console.error('❌ dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
}

// Check if main files exist
const mainFiles = [
    'dist/main.js',
    'dist/test-main.js',
    'dist/types.js',
    'dist/handlers/discovery-handler.js',
    'dist/handlers/api-handler.js',
    'dist/utils/api-detector.js',
];

let allExist = true;
for (const file of mainFiles) {
    const filePath = join(__dirname, file);
    if (!existsSync(filePath)) {
        console.error(`❌ Missing: ${file}`);
        allExist = false;
    } else {
        console.log(`✅ Found: ${file}`);
    }
}

// Check test input
const testInputPath = join(__dirname, 'test-input.json');
if (!existsSync(testInputPath)) {
    console.error('❌ test-input.json not found');
    allExist = false;
} else {
    console.log('✅ Found: test-input.json');
    try {
        const input = JSON.parse(readFileSync(testInputPath, 'utf-8'));
        if (!input.startUrls || input.startUrls.length === 0) {
            console.error('❌ test-input.json missing startUrls');
            allExist = false;
        } else {
            console.log(`✅ test-input.json has ${input.startUrls.length} start URL(s)`);
        }
    } catch (error) {
        console.error('❌ test-input.json is invalid JSON');
        allExist = false;
    }
}

console.log('\n');

if (allExist) {
    console.log('✅ Build verification passed! Ready to test.');
    console.log('   Run: npm test');
    process.exit(0);
} else {
    console.error('❌ Build verification failed. Fix the issues above.');
    process.exit(1);
}

