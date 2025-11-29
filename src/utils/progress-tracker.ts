/**
 * Progress Tracker - Enhanced progress reporting with structured events
 * Supports real-time progress updates for better developer experience
 */

export interface ProgressEvent {
    type: 'discovery' | 'processing' | 'generation' | 'complete' | 'error';
    message: string;
    progress?: number; // 0-100
    current?: string; // Current item being processed
    total?: number; // Total items
    completed?: number; // Completed items
    estimatedTimeRemaining?: number; // Seconds
    metadata?: Record<string, any>;
}

export type ProgressCallback = (event: ProgressEvent) => void;

export class ProgressTracker {
    private callbacks: ProgressCallback[] = [];
    private startTime: number;
    private events: ProgressEvent[] = [];

    constructor() {
        this.startTime = Date.now();
    }

    /**
     * Register a progress callback
     */
    onProgress(callback: ProgressCallback): void {
        this.callbacks.push(callback);
    }

    /**
     * Emit a progress event
     */
    emit(event: ProgressEvent): void {
        this.events.push(event);
        this.callbacks.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('Progress callback error:', error);
            }
        });
    }

    /**
     * Discovery phase progress
     */
    discovery(message: string, current?: string, total?: number, completed?: number): void {
        const progress = total && completed ? Math.round((completed / total) * 100) : undefined;
        this.emit({
            type: 'discovery',
            message,
            progress,
            current,
            total,
            completed,
            estimatedTimeRemaining: this.calculateETA(completed, total),
        });
    }

    /**
     * API processing phase progress
     */
    processing(message: string, current?: string, total?: number, completed?: number): void {
        const progress = total && completed ? Math.round((completed / total) * 100) : undefined;
        this.emit({
            type: 'processing',
            message,
            progress,
            current,
            total,
            completed,
            estimatedTimeRemaining: this.calculateETA(completed, total),
        });
    }

    /**
     * Code/documentation generation progress
     */
    generation(message: string, artifact?: string): void {
        this.emit({
            type: 'generation',
            message,
            current: artifact,
            metadata: { artifact },
        });
    }

    /**
     * Completion event
     */
    complete(message: string, summary?: Record<string, any>): void {
        const duration = (Date.now() - this.startTime) / 1000;
        this.emit({
            type: 'complete',
            message,
            progress: 100,
            metadata: {
                duration,
                ...summary,
            },
        });
    }

    /**
     * Error event
     */
    error(message: string, error?: Error): void {
        this.emit({
            type: 'error',
            message,
            metadata: {
                error: error?.message,
                stack: error?.stack,
            },
        });
    }

    /**
     * Calculate estimated time remaining
     */
    private calculateETA(completed?: number, total?: number): number | undefined {
        if (!completed || !total || completed === 0) return undefined;
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        const rate = completed / elapsed;
        const remaining = total - completed;
        return Math.round(remaining / rate);
    }

    /**
     * Get all events (for logging/reporting)
     */
    getEvents(): ProgressEvent[] {
        return [...this.events];
    }

    /**
     * Get formatted progress summary
     */
    getSummary(): string {
        const duration = (Date.now() - this.startTime) / 1000;
        const discoveryEvents = this.events.filter(e => e.type === 'discovery').length;
        const processingEvents = this.events.filter(e => e.type === 'processing').length;
        const generationEvents = this.events.filter(e => e.type === 'generation').length;
        const errors = this.events.filter(e => e.type === 'error').length;

        return [
            `Duration: ${duration.toFixed(1)}s`,
            `Discovery events: ${discoveryEvents}`,
            `Processing events: ${processingEvents}`,
            `Generation events: ${generationEvents}`,
            errors > 0 ? `Errors: ${errors}` : null,
        ].filter(Boolean).join(' | ');
    }
}

