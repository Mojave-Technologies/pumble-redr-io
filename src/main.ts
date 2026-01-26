/**
 * Application entry point.
 * Initializes configuration, caches, and starts the Pumble app.
 */

import { start } from 'pumble-sdk';
import { loadConfig } from './config/env';
import { createRedrHttpClient } from './api/httpClient';
import { InMemoryFolderCache } from './cache/folderCache';
import { DomainCache } from './cache/domainCache';
import { getFoldersUrl, getDomainsUrl } from './redr/folderService';
import { createApp } from './app';

async function main() {
    const config = loadConfig();

    const client = createRedrHttpClient(config.redrApiKey, config.redrHttpTimeoutMs);

    // Graceful shutdown: cleanup HTTP connections
    const shutdown = () => {
        try {
            client.destroyAgents?.();
        } finally {
            process.exit(0);
        }
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    const foldersUrl = getFoldersUrl(config.redrApiUrl);
    const folderCache = new InMemoryFolderCache(config, client, foldersUrl);

    const domainsUrl = getDomainsUrl(config.redrApiUrl);
    const domainCache = new DomainCache(client, domainsUrl);
    await domainCache.load();

    const app = createApp(config, folderCache, domainCache, client);
    await start(app);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
