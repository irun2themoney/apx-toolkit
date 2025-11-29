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
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface EnhancedOutputOptions {
    outputDir?: string;
    gitIntegration?: GitConfig;
    generateGitHubActions?: boolean;
    generateSecurityReport?: boolean;
    generateChangeReport?: boolean;
    generateDocs?: boolean;
    previousAPIs?: DiscoveredAPI[]; // For change detection
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
        previousAPIs = [],
    } = options;
    
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate GitHub Actions workflow
    if (generateGitHubActions) {
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
        
        console.log('✅ Generated GitHub Actions workflow');
    }
    
    // Generate security audit report
    if (generateSecurityReport && apis.length > 0) {
        const audit = auditAPIs(apis);
        const report = formatSecurityReport(audit);
        writeFileSync(join(outputDir, 'SECURITY-AUDIT.md'), report, 'utf-8');
        writeFileSync(join(outputDir, 'security-audit.json'), JSON.stringify(audit, null, 2), 'utf-8');
        console.log(`✅ Generated security audit report (Score: ${audit.score}/100)`);
    }
    
    // Generate change report
    if (generateChangeReport && previousAPIs.length > 0) {
        const changes = detectChanges(apis, previousAPIs);
        const report = formatChangeReport(changes);
        writeFileSync(join(outputDir, 'CHANGELOG-API.md'), report, 'utf-8');
        writeFileSync(join(outputDir, 'api-changes.json'), JSON.stringify(changes, null, 2), 'utf-8');
        console.log(`✅ Generated change report: ${changes.summary}`);
        
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
    }
    
    // Generate enhanced documentation
    if (generateDocs && apis.length > 0) {
        const docs = generateDocumentationPackage(apis);
        writeFileSync(join(outputDir, 'API.md'), docs.markdown, 'utf-8');
        writeFileSync(join(outputDir, 'README.md'), docs.readme, 'utf-8');
        writeFileSync(join(outputDir, 'jsdoc-comments.json'), JSON.stringify(docs.jsdoc, null, 2), 'utf-8');
        console.log('✅ Generated enhanced documentation');
    }
    
    // Git integration
    if (gitIntegration?.enabled) {
        const filesToCommit = [
            'API.md',
            'README.md',
            'SECURITY-AUDIT.md',
            '.github/workflows/apx-discovery.yml',
            'CHANGELOG.md',
        ].filter(f => existsSync(join(outputDir, f)));
        
        if (filesToCommit.length > 0) {
            autoCommitGeneratedFiles(filesToCommit, gitIntegration, outputDir);
        }
    }
}

