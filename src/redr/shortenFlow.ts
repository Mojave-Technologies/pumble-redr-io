/**
 * URL shortening workflow orchestrator.
 * Resolves folder, creates short URL, and calls success callback.
 */

import { randomUUID } from 'crypto';
import { HttpClient } from '../api/httpClient';
import { AppConfig } from '../config/env';
import { FolderCache } from '../cache/folderCache';
import { ShortenUrlFields, shortenUrl } from './urlService';

interface ShortenFlowParams {
    config: AppConfig;
    cache: FolderCache;
    client: HttpClient;
    fields: ShortenUrlFields;
    domainId?: string;  // Optional override for default domain
    onSuccess(shortUrl: string, context: { requestId: string }): Promise<void>;
}

interface ShortenFlowResult {
    shortUrl: string;
    requestId: string;  // Unique ID for logging/debugging
}

/**
 * Executes the full URL shortening flow:
 * 1. Resolves folder ID (from config or cache)
 * 2. Creates short URL via REDR API
 * 3. Calls onSuccess callback with result
 */
export async function runShortenFlow(params: ShortenFlowParams): Promise<ShortenFlowResult> {
    const requestId = randomUUID();

    const folderId =
        params.config.redrFolderId ?? (await params.cache.getOrCreateFolderId(params.config.redrFolderName));

    const domainId = params.domainId || params.config.redrDomainId;

    const shortUrl = await shortenUrl(
        params.client,
        params.config.redrApiUrl,
        domainId,
        folderId,
        params.fields
    );

    await params.onSuccess(shortUrl, { requestId });

    return { shortUrl, requestId };
}
