#!/usr/bin/env node
/**
 * Comprehensive Apify Build Verification Script
 * Validates all aspects of the Actor configuration before deployment
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let errors = [];
let warnings = [];
let passed = [];

function check(name, condition, errorMsg) {
    if (condition) {
        passed.push(name);
        console.log(`${GREEN}✓${RESET} ${name}`);
        return true;
    } else {
        errors.push(name);
        console.log(`${RED}✗${RESET} ${name}: ${errorMsg}`);
        return false;
    }
}

function warn(name, message) {
    warnings.push(name);
    console.log(`${YELLOW}⚠${RESET} ${name}: ${message}`);
}

console.log(`${BLUE}=== Apify Build Verification ===${RESET}\n`);

// 1. Check TypeScript build
console.log(`${BLUE}[1] Checking TypeScript Build...${RESET}`);
try {
    if (existsSync('dist/main.js')) {
        const mainContent = readFileSync('dist/main.js', 'utf8');
        check('dist/main.js exists', true);
        check('dist/main.js has content', mainContent.length > 0);
        check('dist/main.js imports Actor', mainContent.includes("from 'apify'"));
        check('dist/main.js imports crawlee', mainContent.includes("from 'crawlee'"));
    } else {
        check('dist/main.js exists', false, 'Run npm run build first');
    }
} catch (e) {
    check('dist/main.js readable', false, e.message);
}

// 2. Check package.json
console.log(`\n${BLUE}[2] Checking package.json...${RESET}`);
try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    check('package.json is valid JSON', true);
    check('package.json has name', !!pkg.name);
    check('package.json has version', !!pkg.version);
    check('package.json has main entry', !!pkg.main);
    check('package.json main points to dist/main.js', pkg.main === 'dist/main.js');
    check('package.json has build script', !!(pkg.scripts && pkg.scripts.build));
    check('package.json has start script', !!(pkg.scripts && pkg.scripts.start));
    
    const requiredDeps = ['apify', 'crawlee', 'playwright'];
    requiredDeps.forEach(dep => {
        check(`package.json has ${dep} dependency`, !!(pkg.dependencies && pkg.dependencies[dep]));
    });
} catch (e) {
    check('package.json readable', false, e.message);
}

// 3. Check actor.json
console.log(`\n${BLUE}[3] Checking .actor/actor.json...${RESET}`);
try {
    const actor = JSON.parse(readFileSync('.actor/actor.json', 'utf8'));
    check('actor.json is valid JSON', true);
    check('actor.json has actorSpecification', actor.actorSpecification === 1);
    check('actor.json has name', !!actor.name);
    check('actor.json has title', !!actor.title);
    check('actor.json has input schema', !!actor.input);
    check('actor.json has storages', !!actor.storages);
    check('storages.dataset is string', typeof actor.storages?.dataset === 'string');
    
    if (actor.storages?.dataset) {
        const datasetPath = join('.actor', actor.storages.dataset.replace('./', ''));
        check('dataset_schema.json file exists', existsSync(datasetPath));
    }
} catch (e) {
    check('actor.json readable', false, e.message);
}

// 4. Check dataset_schema.json
console.log(`\n${BLUE}[4] Checking .actor/dataset_schema.json...${RESET}`);
try {
    const schema = JSON.parse(readFileSync('.actor/dataset_schema.json', 'utf8'));
    check('dataset_schema.json is valid JSON', true);
    check('dataset_schema.json has actorSpecification', schema.actorSpecification === 1);
    check('dataset_schema.json has fields', !!schema.fields);
    check('fields.type is object', schema.fields?.type === 'object');
    check('dataset_schema.json has views', Object.keys(schema.views || {}).length > 0);
    
    const viewNames = Object.keys(schema.views || {});
    viewNames.forEach(viewName => {
        const view = schema.views[viewName];
        check(`view '${viewName}' has title`, !!view.title);
        check(`view '${viewName}' has transformation`, !!view.transformation);
        check(`view '${viewName}' transformation has fields`, Array.isArray(view.transformation?.fields));
        check(`view '${viewName}' has display`, !!view.display);
        check(`view '${viewName}' display has component`, view.display?.component === 'table');
    });
    
    console.log(`  ${GREEN}→${RESET} Found ${viewNames.length} views`);
} catch (e) {
    check('dataset_schema.json readable', false, e.message);
}

// 5. Check Dockerfile
console.log(`\n${BLUE}[5] Checking Dockerfile...${RESET}`);
try {
    const dockerfile = readFileSync('Dockerfile', 'utf8');
    check('Dockerfile exists', true);
    check('Dockerfile uses Apify base image', dockerfile.includes('apify/actor-node-playwright'));
    check('Dockerfile has WORKDIR', dockerfile.includes('WORKDIR'));
    check('Dockerfile has npm install', dockerfile.includes('npm install'));
    check('Dockerfile has npm run build', dockerfile.includes('npm run build'));
    check('Dockerfile has CMD', dockerfile.includes('CMD'));
    check('Dockerfile CMD uses npm start', dockerfile.includes('npm start') || dockerfile.includes('["npm", "start"]'));
} catch (e) {
    check('Dockerfile readable', false, e.message);
}

// 6. Check .apifyignore
console.log(`\n${BLUE}[6] Checking .apifyignore...${RESET}`);
try {
    const apifyignore = readFileSync('.apifyignore', 'utf8');
    check('.apifyignore exists', true);
    check('tsconfig.json NOT excluded', !apifyignore.includes('^tsconfig.json$') && !apifyignore.split('\n').includes('tsconfig.json'));
    check('package.json NOT excluded', !apifyignore.includes('package.json'));
    check('Dockerfile NOT excluded', !apifyignore.includes('Dockerfile'));
    check('.actor/ NOT excluded', !apifyignore.includes('.actor/'));
} catch (e) {
    check('.apifyignore readable', false, e.message);
}

// 7. Check tsconfig.json
console.log(`\n${BLUE}[7] Checking tsconfig.json...${RESET}`);
try {
    if (existsSync('tsconfig.json')) {
        const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
        check('tsconfig.json exists', true);
        check('tsconfig.json is valid JSON', true);
        check('tsconfig.json has outDir', tsconfig.compilerOptions?.outDir === './dist');
        check('tsconfig.json has rootDir', tsconfig.compilerOptions?.rootDir === './src');
    } else {
        check('tsconfig.json exists', false, 'Required for TypeScript build');
    }
} catch (e) {
    check('tsconfig.json readable', false, e.message);
}

// Summary
console.log(`\n${BLUE}=== Summary ===${RESET}`);
console.log(`${GREEN}Passed:${RESET} ${passed.length}`);
if (warnings.length > 0) {
    console.log(`${YELLOW}Warnings:${RESET} ${warnings.length}`);
}
if (errors.length > 0) {
    console.log(`${RED}Errors:${RESET} ${errors.length}`);
    console.log(`\n${RED}Failed checks:${RESET}`);
    errors.forEach(err => console.log(`  - ${err}`));
    process.exit(1);
} else {
    console.log(`\n${GREEN}✓ All checks passed! Ready for Apify deployment.${RESET}`);
    process.exit(0);
}

