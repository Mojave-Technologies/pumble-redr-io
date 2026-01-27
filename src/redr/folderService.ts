/**
 * URL builders for REDR API endpoints.
 * Derives endpoint URLs from the base API URL.
 */

export function getFoldersUrl(apiUrl: string): string {
    const urlObject = new URL(apiUrl);
    urlObject.pathname = '/api/folders';
    urlObject.search = '';
    return urlObject.toString();
}

export function getDomainsUrl(apiUrl: string): string {
    const urlObject = new URL(apiUrl);
    urlObject.pathname = '/api/domains';
    urlObject.search = '';
    return urlObject.toString();
}
