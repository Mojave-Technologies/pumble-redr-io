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
        const apiMessage = extractApiErrorMessage(bodySnippet);
        super(apiMessage || `REDR ${contextLabel} HTTP ${status}`);
        this.name = 'ApiError';
        this.apiMessage = apiMessage;
    }
}

/** Extracts user-friendly error message from API response body */
function extractApiErrorMessage(bodySnippet: string): string | undefined {
    try {
        const parsed = JSON.parse(bodySnippet);
        // REDR API returns { error: "message" } or { message: "message" }
        return parsed?.error || parsed?.message || undefined;
    } catch {
        return undefined;
    }
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
