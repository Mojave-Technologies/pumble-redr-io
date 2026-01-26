/**
 * In-memory folder cache with lazy initialization.
 * Finds or creates folder on first request, then caches the ID.
 */

import { AxiosInstance } from 'axios';
import { type AppConfig } from '../config/env';
import { normalizeLowerTrim, ApiError } from '../api/helpers';
import { listFolders, createFolder } from '../api/redr/redrApi';

export class InMemoryFolderCache {
    private cachedId?: string;
    private inFlight?: Promise<string>; // Prevents duplicate concurrent requests

    constructor(
        private readonly config: Pick<AppConfig, 'redrFolderId'>,
        private readonly client: AxiosInstance,
        private readonly foldersUrl: string
    ) {}

    /**
     * Returns folder ID, creating the folder if it doesn't exist.
     * Uses in-flight deduplication to prevent race conditions.
     */
    async getOrCreateFolderId(folderName: string): Promise<string> {
        // Use explicit folder ID if configured
        if (this.config.redrFolderId) {
            return this.config.redrFolderId;
        }
        // Return cached ID if available
        if (this.cachedId) {
            return this.cachedId;
        }
        // Wait for in-flight request if one exists
        if (this.inFlight) {
            return this.inFlight;
        }

        const resolution = this.resolveFolderId(folderName);
        this.inFlight = resolution.finally(() => {
            this.inFlight = undefined;
        });
        return this.inFlight;
    }

    private async resolveFolderId(folderName: string): Promise<string> {
        const desiredNameLower = normalizeLowerTrim(folderName);
        let folderId = await this.findFolderId(desiredNameLower);

        if (!folderId) {
            try {
                folderId = await createFolder(this.client, this.foldersUrl, folderName);
            } catch (error) {
                // Handle race condition: folder may have been created by another request
                if (shouldRetryCreateFolder(error)) {
                    folderId = await this.findFolderId(desiredNameLower);
                }
                if (!folderId) {
                    throw error;
                }
            }
        }

        this.cachedId = folderId;
        return folderId;
    }

    private async findFolderId(desiredNameLower: string): Promise<string | undefined> {
        const folderList = await listFolders(this.client, this.foldersUrl);
        return folderList.find((folderItem) => normalizeLowerTrim(folderItem.name) === desiredNameLower)?.id;
    }
}

export type FolderCache = InMemoryFolderCache;

/** Checks if error indicates folder already exists (409 Conflict) */
function shouldRetryCreateFolder(error: unknown): boolean {
    if (error instanceof ApiError) return error.status === 409;
    if (isHttpStatus(error, 409)) return true;
    return getErrorMessage(error).toLowerCase().includes('already exists');
}

function isHttpStatus(error: unknown, expected: number): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const responseStatus = (error as any)?.response?.status ?? (error as any)?.status;
    if (typeof responseStatus === 'number') return responseStatus === expected;
    if (typeof responseStatus === 'string') {
        const numeric = Number(responseStatus);
        return !Number.isNaN(numeric) && numeric === expected;
    }
    return false;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}
