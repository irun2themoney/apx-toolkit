/**
 * Retry Logic with Exponential Backoff
 * Improves reliability and user experience
 */

export interface RetryOptions {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
        'ETIMEDOUT',
        'ECONNRESET',
        'ENOTFOUND',
        'ECONNREFUSED',
        'timeout',
        'network',
        '429', // Rate limit
        '500', // Server error
        '502', // Bad gateway
        '503', // Service unavailable
        '504', // Gateway timeout
    ],
};

/**
 * Retries a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: Error | unknown;
    let delay = opts.initialDelay;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Check if error is retryable
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isRetryable = opts.retryableErrors.some((pattern) =>
                errorMessage.toLowerCase().includes(pattern.toLowerCase())
            );

            // Don't retry if it's the last attempt or error is not retryable
            if (attempt === opts.maxAttempts || !isRetryable) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            if (attempt < opts.maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
            }
        }
    }

    throw lastError;
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return DEFAULT_OPTIONS.retryableErrors.some((pattern) =>
        errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
}

