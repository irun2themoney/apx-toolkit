/**
 * Change Detector
 * Compares API versions to detect changes and breaking changes
 */

import type { DiscoveredAPI } from '../types.js';

export interface APIChange {
    type: 'added' | 'modified' | 'removed' | 'breaking';
    api: string;
    field?: string;
    oldValue?: any;
    newValue?: any;
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ChangeReport {
    timestamp: string;
    apisAdded: number;
    apisRemoved: number;
    apisModified: number;
    breakingChanges: number;
    changes: APIChange[];
    summary: string;
}

/**
 * Compare two API sets and detect changes
 */
export function detectChanges(
    currentAPIs: DiscoveredAPI[],
    previousAPIs: DiscoveredAPI[]
): ChangeReport {
    const changes: APIChange[] = [];
    const currentMap = new Map(currentAPIs.map(api => [api.url, api]));
    const previousMap = new Map(previousAPIs.map(api => [api.url, api]));
    
    // Detect added APIs
    currentAPIs.forEach(api => {
        if (!previousMap.has(api.url)) {
            changes.push({
                type: 'added',
                api: api.url,
                message: `New API endpoint discovered: ${api.method} ${api.url}`,
                severity: 'low',
            });
        }
    });
    
    // Detect removed APIs
    previousAPIs.forEach(api => {
        if (!currentMap.has(api.url)) {
            changes.push({
                type: 'removed',
                api: api.url,
                message: `API endpoint removed: ${api.method} ${api.url}`,
                severity: 'high',
            });
        }
    });
    
    // Detect modified APIs
    currentAPIs.forEach(currentAPI => {
        const previousAPI = previousMap.get(currentAPI.url);
        if (!previousAPI) return;
        
        // Check method changes
        if (currentAPI.method !== previousAPI.method) {
            changes.push({
                type: 'breaking',
                api: currentAPI.url,
                field: 'method',
                oldValue: previousAPI.method,
                newValue: currentAPI.method,
                message: `Breaking change: Method changed from ${previousAPI.method} to ${currentAPI.method}`,
                severity: 'critical',
            });
        }
        
        // Check header changes
        const currentHeaders = Object.keys(currentAPI.headers || {});
        const previousHeaders = Object.keys(previousAPI.headers || {});
        const removedHeaders = previousHeaders.filter(h => !currentHeaders.includes(h));
        const addedHeaders = currentHeaders.filter(h => !previousHeaders.includes(h));
        
        removedHeaders.forEach(header => {
            changes.push({
                type: 'breaking',
                api: currentAPI.url,
                field: `header:${header}`,
                oldValue: previousAPI.headers?.[header],
                message: `Breaking change: Required header removed: ${header}`,
                severity: 'high',
            });
        });
        
        addedHeaders.forEach(header => {
            changes.push({
                type: 'modified',
                api: currentAPI.url,
                field: `header:${header}`,
                newValue: currentAPI.headers?.[header],
                message: `New header required: ${header}`,
                severity: 'medium',
            });
        });
        
        // Check query parameter changes
        const currentParams = Object.keys(currentAPI.queryParams || {});
        const previousParams = Object.keys(previousAPI.queryParams || {});
        const removedParams = previousParams.filter(p => !currentParams.includes(p));
        
        removedParams.forEach(param => {
            changes.push({
                type: 'breaking',
                api: currentAPI.url,
                field: `query:${param}`,
                oldValue: previousAPI.queryParams?.[param],
                message: `Breaking change: Query parameter removed: ${param}`,
                severity: 'high',
            });
        });
        
        // Check pagination changes
        if (currentAPI.paginationInfo?.type !== previousAPI.paginationInfo?.type) {
            changes.push({
                type: 'breaking',
                api: currentAPI.url,
                field: 'pagination',
                oldValue: previousAPI.paginationInfo?.type,
                newValue: currentAPI.paginationInfo?.type,
                message: `Breaking change: Pagination type changed`,
                severity: 'high',
            });
        }
    });
    
    const apisAdded = changes.filter(c => c.type === 'added').length;
    const apisRemoved = changes.filter(c => c.type === 'removed').length;
    const apisModified = changes.filter(c => c.type === 'modified').length;
    const breakingChanges = changes.filter(c => c.type === 'breaking').length;
    
    const summary = [
        `${apisAdded} API(s) added`,
        `${apisRemoved} API(s) removed`,
        `${apisModified} API(s) modified`,
        `${breakingChanges} breaking change(s)`,
    ].join(', ');
    
    return {
        timestamp: new Date().toISOString(),
        apisAdded,
        apisRemoved,
        apisModified,
        breakingChanges,
        changes,
        summary,
    };
}

/**
 * Format change report as markdown
 */
export function formatChangeReport(report: ChangeReport): string {
    const lines: string[] = [];
    
    lines.push('# API Change Report');
    lines.push('');
    lines.push(`**Date:** ${new Date(report.timestamp).toLocaleString()}`);
    lines.push(`**Summary:** ${report.summary}`);
    lines.push('');
    
    // Breaking changes first
    const breaking = report.changes.filter(c => c.type === 'breaking');
    if (breaking.length > 0) {
        lines.push('## 🔴 Breaking Changes');
        lines.push('');
        breaking.forEach((change, index) => {
            lines.push(`### ${index + 1}. ${change.message}`);
            lines.push('');
            lines.push(`**API:** \`${change.api}\``);
            if (change.field) {
                lines.push(`**Field:** ${change.field}`);
            }
            if (change.oldValue !== undefined) {
                lines.push(`**Old Value:** ${JSON.stringify(change.oldValue)}`);
            }
            if (change.newValue !== undefined) {
                lines.push(`**New Value:** ${JSON.stringify(change.newValue)}`);
            }
            lines.push('');
        });
    }
    
    // Removed APIs
    const removed = report.changes.filter(c => c.type === 'removed');
    if (removed.length > 0) {
        lines.push('## ❌ Removed APIs');
        lines.push('');
        removed.forEach((change, index) => {
            lines.push(`${index + 1}. \`${change.api}\``);
        });
        lines.push('');
    }
    
    // Added APIs
    const added = report.changes.filter(c => c.type === 'added');
    if (added.length > 0) {
        lines.push('## ✅ Added APIs');
        lines.push('');
        added.forEach((change, index) => {
            lines.push(`${index + 1}. \`${change.api}\``);
        });
        lines.push('');
    }
    
    // Modified APIs
    const modified = report.changes.filter(c => c.type === 'modified');
    if (modified.length > 0) {
        lines.push('## 🔄 Modified APIs');
        lines.push('');
        modified.forEach((change, index) => {
            lines.push(`### ${index + 1}. ${change.api}`);
            lines.push('');
            lines.push(`**Change:** ${change.message}`);
            if (change.field) {
                lines.push(`**Field:** ${change.field}`);
            }
            if (change.newValue !== undefined) {
                lines.push(`**New Value:** ${JSON.stringify(change.newValue)}`);
            }
            lines.push('');
        });
    }
    
    return lines.join('\n');
}

