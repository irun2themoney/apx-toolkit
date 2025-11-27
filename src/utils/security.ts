/**
 * Security utilities for APX Toolkit
 * Provides path sanitization and input validation
 */

import * as path from 'path';
import * as fs from 'fs';

/**
 * Sanitizes a file path to prevent directory traversal attacks
 * Ensures the resolved path stays within the base directory
 * 
 * @param userPath - User-provided path (may be relative or contain ..)
 * @param baseDir - Base directory to resolve paths relative to
 * @returns Sanitized absolute path
 * @throws Error if path traversal is detected
 */
export function sanitizePath(userPath: string, baseDir: string): string {
    // Resolve base directory to absolute path
    const resolvedBase = path.resolve(baseDir);
    
    // Resolve user path relative to base directory
    const resolvedPath = path.resolve(resolvedBase, userPath);
    
    // Check if resolved path is within base directory
    if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
        throw new Error(`Path traversal detected: ${userPath} resolves outside base directory`);
    }
    
    return resolvedPath;
}

/**
 * Validates URL to ensure it's safe to request
 * 
 * @param urlString - URL to validate
 * @param allowLocalhost - Whether to allow localhost URLs (default: false)
 * @returns Validated URL object
 * @throws Error if URL is invalid or unsafe
 */
export function validateURL(urlString: string, allowLocalhost: boolean = false): URL {
    let url: URL;
    
    try {
        url = new URL(urlString);
    } catch (error) {
        throw new Error(`Invalid URL format: ${urlString}`);
    }
    
    // Enforce HTTPS for production (allow HTTP for localhost)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new Error(`Unsupported protocol: ${url.protocol}. Only http:// and https:// are allowed`);
    }
    
    // Check for localhost
    const isLocalhost = url.hostname === 'localhost' || 
                       url.hostname === '127.0.0.1' || 
                       url.hostname.startsWith('192.168.') ||
                       url.hostname.startsWith('10.') ||
                       url.hostname.startsWith('172.');
    
    // Enforce HTTPS for non-localhost (unless explicitly allowed)
    if (!allowLocalhost && !isLocalhost && url.protocol !== 'https:') {
        throw new Error(`HTTPS required for non-localhost URLs: ${urlString}`);
    }
    
    // Validate URL length
    const MAX_URL_LENGTH = 2048;
    if (urlString.length > MAX_URL_LENGTH) {
        throw new Error(`URL too long: ${urlString.length} characters (max: ${MAX_URL_LENGTH})`);
    }
    
    return url;
}

/**
 * Sanitizes log data to remove sensitive information
 * 
 * @param data - Data object to sanitize
 * @param sensitiveKeys - Keys to redact (default: common sensitive keys)
 * @returns Sanitized data object
 */
export function sanitizeLogData(
    data: any, 
    sensitiveKeys: string[] = ['authorization', 'x-api-key', 'cookie', 'token', 'password', 'secret', 'api-key', 'bearer']
): any {
    if (!data || typeof data !== 'object') {
        return data;
    }
    
    if (Array.isArray(data)) {
        return data.map(item => sanitizeLogData(item, sensitiveKeys));
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk.toLowerCase()));
        
        if (isSensitive && typeof value === 'string') {
            // Redact sensitive values (show first 4 and last 4 chars)
            const str = String(value);
            if (str.length > 8) {
                sanitized[key] = `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
            } else {
                sanitized[key] = '***REDACTED***';
            }
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeLogData(value, sensitiveKeys);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
}

/**
 * Validates input size limits
 * 
 * @param input - Input string to validate
 * @param maxSize - Maximum size in bytes
 * @param fieldName - Name of the field for error messages
 * @throws Error if input exceeds size limit
 */
export function validateInputSize(input: string, maxSize: number, fieldName: string): void {
    const size = Buffer.byteLength(input, 'utf8');
    if (size > maxSize) {
        throw new Error(`${fieldName} exceeds maximum size: ${size} bytes (max: ${maxSize} bytes)`);
    }
}

/**
 * Constants for input size limits
 */
export const INPUT_LIMITS = {
    MAX_URL_LENGTH: 2048,
    MAX_HEADER_SIZE: 8192,
    MAX_BODY_SIZE: 10485760, // 10MB
    MAX_FILENAME_LENGTH: 255,
} as const;

/**
 * Sanitizes a filename to prevent directory traversal and invalid characters
 * 
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
    // Remove path separators and null bytes
    let sanitized = filename.replace(/[\/\\\x00]/g, '');
    
    // Remove leading dots and spaces (Windows issue)
    sanitized = sanitized.replace(/^[.\s]+/, '');
    
    // Limit length
    if (sanitized.length > INPUT_LIMITS.MAX_FILENAME_LENGTH) {
        const ext = path.extname(sanitized);
        const name = path.basename(sanitized, ext);
        sanitized = name.substring(0, INPUT_LIMITS.MAX_FILENAME_LENGTH - ext.length) + ext;
    }
    
    // If empty after sanitization, use a default
    if (!sanitized || sanitized.trim().length === 0) {
        sanitized = 'file';
    }
    
    return sanitized;
}

