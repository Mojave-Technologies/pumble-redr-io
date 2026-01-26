/**
 * URL shortening service.
 * Builds request body and calls REDR API.
 */

import { AxiosInstance } from 'axios';
import { createShortUrl } from '../api/redr/redrApi';

export interface ShortenUrlFields {
    longUrl: string;
    masked: boolean;              // Hide destination URL from visitors
    defaultRedirectUrl?: string;  // Fallback URL for expired/invalid links
    expiresAt?: string;           // ISO date string for link expiration
    password?: string;            // Optional password protection
}

/** Creates a short URL with the given options */
export async function shortenUrl(
    client: AxiosInstance,
    apiUrl: string,
    domainId: string,
    folderId: string,
    fields: ShortenUrlFields
): Promise<string> {
    const requestBody: Record<string, unknown> = {
        domain: domainId,
        source: fields.longUrl,
        folder: folderId,
    };

    if (fields.defaultRedirectUrl) {
        requestBody.default_redirect = fields.defaultRedirectUrl;
    }
    if (fields.expiresAt) {
        requestBody.expired_at = fields.expiresAt;
    }
    if (fields.password) {
        requestBody.password = fields.password;
    }

    if(fields.masked) {
        requestBody.masked = fields.masked;
    }

    return createShortUrl(client, apiUrl, requestBody);
}
