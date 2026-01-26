/**
 * REDR API client functions.
 * Low-level HTTP calls for folders, domains, and URL shortening.
 */

import { AxiosInstance, AxiosResponse } from 'axios';
import { assertOkResponse, ValidationError } from '../helpers';

interface FolderInfo {
    id: string;
    name: string;
}

export interface DomainInfo {
    id: string;
    url: string;
}

/** Fetches all folders from REDR API */
export async function listFolders(client: AxiosInstance, foldersUrl: string): Promise<FolderInfo[]> {
    const response: AxiosResponse = await client.get(foldersUrl);

    assertOkResponse(response, 'folders');

    if (!Array.isArray(response.data)) return [];

    return response.data
        .map((folderItem: any) => ({ id: String(folderItem?.id || ''), name: String(folderItem?.name || '') }))
        .filter((folderItem) => folderItem.id && folderItem.name);
}

/** Fetches all available domains for URL shortening */
export async function listDomains(client: AxiosInstance, domainsUrl: string): Promise<DomainInfo[]> {
    const response: AxiosResponse = await client.get(domainsUrl);

    assertOkResponse(response, 'domains');

    if (!Array.isArray(response.data)) return [];

    return response.data
        .map((item: any) => ({ id: String(item?.id || ''), url: String(item?.url || '') }))
        .filter((item) => item.id && item.url);
}

/** Creates a new folder, returns folder ID */
export async function createFolder(client: AxiosInstance, foldersUrl: string, folderName: string): Promise<string> {
    const response: AxiosResponse = await client.post(
        foldersUrl,
        { name: folderName },
        { headers: { 'Content-Type': 'application/json' } }
    );

    assertOkResponse(response, 'create folder');

    const folderId = response.data.id;
    if (!folderId) {
        throw new ValidationError('REDR create folder response missing id', JSON.stringify(response.data));
    }

    return folderId;
}

/** Creates a shortened URL, returns the short URL string */
export async function createShortUrl(
    client: AxiosInstance,
    apiUrl: string,
    requestBody: Record<string, unknown>
): Promise<string> {
    const response: AxiosResponse = await client.post(apiUrl, requestBody, {
        headers: { 'Content-Type': 'application/json' },
    });

    assertOkResponse(response, 'HTTP');

    const shortUrl = response.data.redirect_url;
    if (!shortUrl) {
        throw new ValidationError('REDR response missing short url', JSON.stringify(response.data));
    }

    return shortUrl;
}
