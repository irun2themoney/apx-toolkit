/**
 * Logger Utility
 * Provides consistent logging across Apify and local environments
 */

import { Actor } from 'apify';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
    level?: LogLevel;
    prefix?: string;
}

class Logger {
    private level: LogLevel;
    private prefix: string;
    private isApify: boolean;

    constructor(options: LoggerOptions = {}) {
        this.level = options.level || 'info';
        this.prefix = options.prefix || '';
        // Check if running in Apify environment
        this.isApify = typeof Actor !== 'undefined' && 
            typeof (Actor as any).isAtHome === 'function' && 
            (Actor as any).isAtHome() === true;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    private formatMessage(level: LogLevel, message: string, data?: unknown): string {
        const prefix = this.prefix ? `[${this.prefix}] ` : '';
        const levelPrefix = `[${level.toUpperCase()}] `;
        return `${prefix}${levelPrefix}${message}`;
    }

    debug(message: string, data?: unknown): void {
        if (!this.shouldLog('debug')) return;
        
        if (this.isApify && (Actor as any).log) {
            (Actor as any).log.debug(message, data);
        } else {
            console.debug(this.formatMessage('debug', message), data || '');
        }
    }

    info(message: string, data?: unknown): void {
        if (!this.shouldLog('info')) return;
        
        if (this.isApify && (Actor as any).log) {
            (Actor as any).log.info(message, data);
        } else {
            console.log(this.formatMessage('info', message), data || '');
        }
    }

    warn(message: string, data?: unknown): void {
        if (!this.shouldLog('warn')) return;
        
        if (this.isApify && (Actor as any).log) {
            (Actor as any).log.warning(message, data);
        } else {
            console.warn(this.formatMessage('warn', message), data || '');
        }
    }

    error(message: string, error?: unknown): void {
        if (!this.shouldLog('error')) return;
        
        if (this.isApify && (Actor as any).log) {
            (Actor as any).log.error(message, error);
        } else {
            console.error(this.formatMessage('error', message), error || '');
        }
    }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export { Logger };

