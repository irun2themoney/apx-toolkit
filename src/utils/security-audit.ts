/**
 * Security Audit
 * Analyzes discovered APIs for security issues and best practices
 */

import type { DiscoveredAPI } from '../types.js';

export interface SecurityIssue {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    type: string;
    message: string;
    api?: string;
    recommendation?: string;
}

export interface SecurityAuditReport {
    timestamp: string;
    apisAnalyzed: number;
    issues: SecurityIssue[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };
    score: number; // 0-100
    recommendations: string[];
}

/**
 * Perform security audit on discovered APIs
 */
export function auditAPIs(apis: DiscoveredAPI[]): SecurityAuditReport {
    const issues: SecurityIssue[] = [];
    const recommendations: string[] = [];
    
    apis.forEach(api => {
        // Check for HTTP (not HTTPS)
        if (api.url.startsWith('http://')) {
            issues.push({
                severity: 'high',
                type: 'insecure-protocol',
                message: 'API uses HTTP instead of HTTPS',
                api: api.url,
                recommendation: 'Use HTTPS to encrypt data in transit',
            });
        }
        
        // Check for exposed API keys in URLs
        if (api.url.includes('api_key=') || api.url.includes('apikey=') || api.url.includes('key=')) {
            issues.push({
                severity: 'critical',
                type: 'exposed-credentials',
                message: 'API key found in URL (visible in logs, browser history)',
                api: api.url,
                recommendation: 'Use headers or request body for API keys, never in URLs',
            });
        }
        
        // Check for authentication
        const hasAuth = api.headers['Authorization'] || api.headers['X-API-Key'] || api.headers['authorization'];
        if (!hasAuth && api.method === 'POST') {
            issues.push({
                severity: 'medium',
                type: 'missing-authentication',
                message: 'POST endpoint without authentication',
                api: api.url,
                recommendation: 'Implement authentication for write operations',
            });
        }
        
        // Check for rate limiting
        if (!api.rateLimitInfo) {
            issues.push({
                severity: 'info',
                type: 'no-rate-limit-info',
                message: 'No rate limit information detected',
                api: api.url,
                recommendation: 'Monitor API responses for rate limit headers',
            });
        }
        
        // Check for sensitive data in URLs
        const sensitivePatterns = ['password', 'token', 'secret', 'key', 'auth'];
        const urlLower = api.url.toLowerCase();
        sensitivePatterns.forEach(pattern => {
            if (urlLower.includes(pattern) && urlLower.includes('=')) {
                issues.push({
                    severity: 'high',
                    type: 'sensitive-data-in-url',
                    message: `Potential sensitive data in URL: ${pattern}`,
                    api: api.url,
                    recommendation: 'Move sensitive parameters to headers or request body',
                });
            }
        });
        
        // Check for CORS headers
        if (!api.headers['Access-Control-Allow-Origin']) {
            issues.push({
                severity: 'info',
                type: 'cors-not-configured',
                message: 'No CORS headers detected',
                api: api.url,
                recommendation: 'Configure CORS appropriately for your use case',
            });
        }
        
        // Check for versioning
        if (!api.url.match(/\/v\d+\//) && !api.url.match(/\/api\/v\d+\//)) {
            issues.push({
                severity: 'low',
                type: 'no-versioning',
                message: 'API endpoint does not appear to be versioned',
                api: api.url,
                recommendation: 'Consider API versioning for future compatibility',
            });
        }
    });
    
    // Calculate summary
    const summary = {
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length,
        info: issues.filter(i => i.severity === 'info').length,
    };
    
    // Calculate security score (0-100)
    const score = calculateSecurityScore(summary, apis.length);
    
    // Generate recommendations
    if (summary.critical > 0) {
        recommendations.push('Address critical security issues immediately');
    }
    if (summary.high > 0) {
        recommendations.push('Review and fix high-severity issues');
    }
    if (issues.some(i => i.type === 'insecure-protocol')) {
        recommendations.push('Migrate all APIs to HTTPS');
    }
    if (issues.some(i => i.type === 'exposed-credentials')) {
        recommendations.push('Remove API keys from URLs and use secure headers');
    }
    if (summary.medium > 0) {
        recommendations.push('Consider implementing authentication for write operations');
    }
    
    return {
        timestamp: new Date().toISOString(),
        apisAnalyzed: apis.length,
        issues,
        summary,
        score,
        recommendations,
    };
}

/**
 * Calculate security score (0-100)
 */
function calculateSecurityScore(summary: SecurityAuditReport['summary'], apiCount: number): number {
    if (apiCount === 0) return 100;
    
    let score = 100;
    
    // Deduct points for issues
    score -= summary.critical * 20; // -20 per critical
    score -= summary.high * 10; // -10 per high
    score -= summary.medium * 5; // -5 per medium
    score -= summary.low * 2; // -2 per low
    score -= summary.info * 0.5; // -0.5 per info
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Format security report as markdown
 */
export function formatSecurityReport(report: SecurityAuditReport): string {
    const lines: string[] = [];
    
    lines.push('# Security Audit Report');
    lines.push('');
    lines.push(`**Date:** ${new Date(report.timestamp).toLocaleString()}`);
    lines.push(`**APIs Analyzed:** ${report.apisAnalyzed}`);
    lines.push(`**Security Score:** ${report.score}/100`);
    lines.push('');
    
    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push('| Severity | Count |');
    lines.push('|----------|-------|');
    lines.push(`| 🔴 Critical | ${report.summary.critical} |`);
    lines.push(`| 🟠 High | ${report.summary.high} |`);
    lines.push(`| 🟡 Medium | ${report.summary.medium} |`);
    lines.push(`| 🟢 Low | ${report.summary.low} |`);
    lines.push(`| ℹ️ Info | ${report.summary.info} |`);
    lines.push('');
    
    // Issues by severity
    const severityOrder: SecurityIssue['severity'][] = ['critical', 'high', 'medium', 'low', 'info'];
    severityOrder.forEach(severity => {
        const severityIssues = report.issues.filter(i => i.severity === severity);
        if (severityIssues.length === 0) return;
        
        const emoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢',
            info: 'ℹ️',
        }[severity];
        
        lines.push(`## ${emoji} ${severity.toUpperCase()} Issues (${severityIssues.length})`);
        lines.push('');
        
        severityIssues.forEach((issue, index) => {
            lines.push(`### ${index + 1}. ${issue.type}`);
            lines.push('');
            lines.push(`**Message:** ${issue.message}`);
            if (issue.api) {
                lines.push(`**API:** \`${issue.api}\``);
            }
            if (issue.recommendation) {
                lines.push(`**Recommendation:** ${issue.recommendation}`);
            }
            lines.push('');
        });
    });
    
    // Recommendations
    if (report.recommendations.length > 0) {
        lines.push('## Recommendations');
        lines.push('');
        report.recommendations.forEach((rec, index) => {
            lines.push(`${index + 1}. ${rec}`);
        });
        lines.push('');
    }
    
    return lines.join('\n');
}

