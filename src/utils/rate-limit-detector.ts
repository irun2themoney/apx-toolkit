/**
 * Rate Limit Detector
 * Automatically detects rate limiting information from API responses
 * Makes the tool a developer's dream by providing rate limit awareness
 */

import type { Response } from 'playwright';
import type { RateLimitInfo } from '../types.js';

/**
 * Detects rate limiting information from response headers
 */
export function detectRateLimits(response: Response): RateLimitInfo | undefined {
    const headers = response.headers();
    const rateLimitInfo: Partial<RateLimitInfo> = {};

    // Common rate limit header patterns
    const headerPatterns = {
        limit: [
            'x-ratelimit-limit',
            'x-rate-limit-limit',
            'ratelimit-limit',
            'rate-limit-limit',
        ],
        remaining: [
            'x-ratelimit-remaining',
            'x-rate-limit-remaining',
            'ratelimit-remaining',
            'rate-limit-remaining',
        ],
        reset: [
            'x-ratelimit-reset',
            'x-rate-limit-reset',
            'ratelimit-reset',
            'rate-limit-reset',
        ],
        resetAfter: [
            'x-ratelimit-reset-after',
            'x-rate-limit-reset-after',
            'retry-after',
        ],
        retryAfter: [
            'retry-after',
            'x-retry-after',
        ],
    };

    // Check for limit
    for (const pattern of headerPatterns.limit) {
        const value = findHeader(headers, pattern);
        if (value) {
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
                rateLimitInfo.limit = num;
                break;
            }
        }
    }

    // Check for remaining
    for (const pattern of headerPatterns.remaining) {
        const value = findHeader(headers, pattern);
        if (value) {
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
                rateLimitInfo.remaining = num;
                break;
            }
        }
    }

    // Check for reset timestamp
    for (const pattern of headerPatterns.reset) {
        const value = findHeader(headers, pattern);
        if (value) {
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
                rateLimitInfo.reset = num;
                break;
            }
        }
    }

    // Check for reset after (seconds)
    for (const pattern of headerPatterns.resetAfter) {
        const value = findHeader(headers, pattern);
        if (value) {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                rateLimitInfo.resetAfter = num;
                break;
            }
        }
    }

    // Check for retry after
    for (const pattern of headerPatterns.retryAfter) {
        const value = findHeader(headers, pattern);
        if (value) {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                rateLimitInfo.retryAfter = num;
                break;
            }
        }
    }

    // Only return if we found at least one rate limit indicator
    if (Object.keys(rateLimitInfo).length > 0) {
        return rateLimitInfo as RateLimitInfo;
    }

    return undefined;
}

/**
 * Finds header value (case-insensitive)
 */
function findHeader(headers: Record<string, string>, pattern: string): string | undefined {
    const lowerPattern = pattern.toLowerCase();
    
    // Direct match
    if (headers[lowerPattern]) {
        return headers[lowerPattern];
    }

    // Case-insensitive search
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === lowerPattern) {
            return value;
        }
    }

    return undefined;
}

/**
 * Formats rate limit info for documentation
 */
export function formatRateLimitInfo(rateLimit: RateLimitInfo): string {
    const parts: string[] = [];

    if (rateLimit.limit !== undefined) {
        parts.push(`Limit: ${rateLimit.limit}`);
    }
    if (rateLimit.remaining !== undefined) {
        parts.push(`Remaining: ${rateLimit.remaining}`);
    }
    if (rateLimit.reset !== undefined) {
        const resetDate = new Date(rateLimit.reset * 1000);
        parts.push(`Resets at: ${resetDate.toISOString()}`);
    }
    if (rateLimit.resetAfter !== undefined) {
        parts.push(`Resets in: ${rateLimit.resetAfter}s`);
    }
    if (rateLimit.retryAfter !== undefined) {
        parts.push(`Retry after: ${rateLimit.retryAfter}s`);
    }

    return parts.join(', ');
}

