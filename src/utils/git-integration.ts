/**
 * Git Integration
 * Automatically commit generated code and create changelogs
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface GitConfig {
    enabled?: boolean;
    autoCommit?: boolean;
    createBranch?: boolean;
    branchName?: string;
    commitMessage?: string;
    generateChangelog?: boolean;
    tagVersion?: boolean;
    userEmail?: string;
    userName?: string;
}

export interface ChangelogEntry {
    version?: string;
    date: string;
    changes: {
        added?: string[];
        modified?: string[];
        removed?: string[];
    };
    apis?: {
        discovered: number;
        modified: number;
        removed: number;
    };
}

/**
 * Check if git is initialized
 */
export function isGitInitialized(directory: string = process.cwd()): boolean {
    try {
        execSync('git rev-parse --git-dir', { cwd: directory, stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Initialize git repository if not exists
 */
export function initializeGit(directory: string = process.cwd()): void {
    if (!isGitInitialized(directory)) {
        execSync('git init', { cwd: directory, stdio: 'inherit' });
        console.log('✅ Git repository initialized');
    }
}

/**
 * Check if there are uncommitted changes
 */
export function hasChanges(directory: string = process.cwd(), path?: string): boolean {
    try {
        const command = path 
            ? `git status --porcelain ${path}`
            : 'git status --porcelain';
        const output = execSync(command, { cwd: directory, encoding: 'utf-8' });
        return output.trim().length > 0;
    } catch {
        return false;
    }
}

/**
 * Create a new branch
 */
export function createBranch(branchName: string, directory: string = process.cwd()): void {
    try {
        execSync(`git checkout -b ${branchName}`, { cwd: directory, stdio: 'inherit' });
        console.log(`✅ Created branch: ${branchName}`);
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            execSync(`git checkout ${branchName}`, { cwd: directory, stdio: 'inherit' });
            console.log(`✅ Switched to existing branch: ${branchName}`);
        } else {
            throw error;
        }
    }
}

/**
 * Stage files
 */
export function stageFiles(files: string[], directory: string = process.cwd()): void {
    if (files.length === 0) return;
    
    const filesToStage = files.filter(f => existsSync(join(directory, f)));
    if (filesToStage.length === 0) return;
    
    execSync(`git add ${filesToStage.join(' ')}`, { cwd: directory, stdio: 'inherit' });
    console.log(`✅ Staged ${filesToStage.length} file(s)`);
}

/**
 * Commit changes
 */
export function commitChanges(
    message: string,
    directory: string = process.cwd(),
    config?: { email?: string; name?: string }
): void {
    if (config?.email) {
        execSync(`git config user.email "${config.email}"`, { cwd: directory, stdio: 'ignore' });
    }
    if (config?.name) {
        execSync(`git config user.name "${config.name}"`, { cwd: directory, stdio: 'ignore' });
    }
    
    try {
        execSync(`git commit -m "${message}"`, { cwd: directory, stdio: 'inherit' });
        console.log(`✅ Committed: ${message}`);
    } catch (error: any) {
        if (error.message.includes('nothing to commit')) {
            console.log('ℹ️  No changes to commit');
        } else {
            throw error;
        }
    }
}

/**
 * Create a git tag
 */
export function createTag(tag: string, message?: string, directory: string = process.cwd()): void {
    try {
        const tagMessage = message || `APX discovery update: ${tag}`;
        execSync(`git tag -a ${tag} -m "${tagMessage}"`, { cwd: directory, stdio: 'inherit' });
        console.log(`✅ Created tag: ${tag}`);
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            console.log(`ℹ️  Tag ${tag} already exists`);
        } else {
            throw error;
        }
    }
}

/**
 * Generate changelog entry
 */
export function generateChangelogEntry(entry: ChangelogEntry): string {
    const lines: string[] = [];
    
    if (entry.version) {
        lines.push(`## [${entry.version}] - ${entry.date}`);
    } else {
        lines.push(`## ${entry.date}`);
    }
    lines.push('');
    
    if (entry.apis) {
        lines.push('### API Changes');
        if (entry.apis.discovered > 0) {
            lines.push(`- ✅ Discovered ${entry.apis.discovered} new API(s)`);
        }
        if (entry.apis.modified > 0) {
            lines.push(`- 🔄 Modified ${entry.apis.modified} API(s)`);
        }
        if (entry.apis.removed > 0) {
            lines.push(`- ❌ Removed ${entry.apis.removed} API(s)`);
        }
        lines.push('');
    }
    
    if (entry.changes.added && entry.changes.added.length > 0) {
        lines.push('### Added');
        entry.changes.added.forEach(item => lines.push(`- ${item}`));
        lines.push('');
    }
    
    if (entry.changes.modified && entry.changes.modified.length > 0) {
        lines.push('### Modified');
        entry.changes.modified.forEach(item => lines.push(`- ${item}`));
        lines.push('');
    }
    
    if (entry.changes.removed && entry.changes.removed.length > 0) {
        lines.push('### Removed');
        entry.changes.removed.forEach(item => lines.push(`- ${item}`));
        lines.push('');
    }
    
    return lines.join('\n');
}

/**
 * Append to changelog file
 */
export function appendChangelog(
    entry: ChangelogEntry,
    changelogPath: string = 'CHANGELOG.md',
    directory: string = process.cwd()
): void {
    const fullPath = join(directory, changelogPath);
    const entryText = generateChangelogEntry(entry);
    
    let existingContent = '';
    if (existsSync(fullPath)) {
        existingContent = readFileSync(fullPath, 'utf-8');
    }
    
    const newContent = entryText + '\n\n' + existingContent;
    writeFileSync(fullPath, newContent, 'utf-8');
    console.log(`✅ Updated changelog: ${changelogPath}`);
}

/**
 * Auto-commit generated files
 */
export function autoCommitGeneratedFiles(
    files: string[],
    config: GitConfig = {},
    directory: string = process.cwd()
): void {
    if (!config.enabled && config.enabled !== undefined) {
        return;
    }
    
    if (!isGitInitialized(directory)) {
        if (config.autoCommit) {
            initializeGit(directory);
        } else {
            console.log('ℹ️  Git not initialized. Skipping auto-commit.');
            return;
        }
    }
    
    if (!hasChanges(directory)) {
        console.log('ℹ️  No changes detected. Skipping commit.');
        return;
    }
    
    if (config.createBranch && config.branchName) {
        createBranch(config.branchName, directory);
    }
    
    stageFiles(files, directory);
    
    if (config.autoCommit !== false) {
        const message = config.commitMessage || 'chore: auto-update API discovery [skip ci]';
        commitChanges(message, directory, {
            email: config.userEmail,
            name: config.userName,
        });
    }
    
    if (config.tagVersion) {
        const tag = `apx-${new Date().toISOString().split('T')[0]}`;
        createTag(tag, undefined, directory);
    }
}

