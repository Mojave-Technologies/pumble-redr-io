/**
 * HTTP error types and utility functions for API interactions.
 */

import { AxiosResponse } from 'axios';

/** Base error for network-level failures (connection, DNS, etc.) */
export class NetworkError extends Error {
    constructor(message: string, public readonly code?: string) {
        super(message);
        this.name = 'NetworkError';
    }
}

/** Request timeout error */
export class TimeoutError extends NetworkError {
    constructor(message: string, code?: string) {
        super(message, code);
        this.name = 'TimeoutError';
    }
}

/** HTTP error with non-2xx status code */
export class ApiError extends Error {
    public readonly apiMessage?: string;

    constructor(
        public readonly status: number,
        public readonly contextLabel: string,
        public readonly bodySnippet: string
    ) {
        // Try to extract error message from response body
        const apiMessage = extractApiErrorMessage(bodySnippet, status);
        super(apiMessage);
        this.name = 'ApiError';
        this.apiMessage = apiMessage;
    }
}

/** Extracts user-friendly error message from API response body */
function extractApiErrorMessage(bodySnippet: string, status: number): string {
    try {
        const parsed = JSON.parse(bodySnippet);
        // REDR API returns { error: "message" } or { message: "message" }
        if (parsed?.error) return parsed.error;
        if (parsed?.message) return parsed.message;
    } catch {
        // Body is not JSON (e.g. HTML error page)
    }
    
    // Fallback to user-friendly messages based on status code
    if (status >= 500) {
        return 'REDR service is temporarily unavailable. Please try again later.';
    }
    if (status === 401 || status === 403) {
        return 'REDR authentication failed. Please contact support.';
    }
    if (status === 429) {
        return 'Too many requests. Please wait a moment and try again.';
    }
    return `REDR error (HTTP ${status}). Please try again.`;
}

/** Response validation error (missing required fields, invalid format) */
export class ValidationError extends Error {
    constructor(public readonly reason: string, public readonly details?: string) {
        super(details ? `${reason}: ${details}` : reason);
        this.name = 'ValidationError';
    }
}

/** Throws ApiError if response status is not 2xx */
export function assertOkResponse(response: AxiosResponse, contextLabel: string): void {
    if (response.status < 200 || response.status >= 300) {
        throw new ApiError(response.status, contextLabel, JSON.stringify(response.data));
    }
}

/** Normalizes string for case-insensitive comparison */
export function normalizeLowerTrim(value: string | null | undefined): string {
    return (value || '').trim().toLowerCase();
}
