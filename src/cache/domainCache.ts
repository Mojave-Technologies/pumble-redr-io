/**
 * Domain cache loaded once at startup.
 * Provides available short URL domains for the modal dropdown.
 */

import { HttpClient } from '../api/httpClient';
import { listDomains, DomainInfo } from '../api/redr/redrApi';

export class DomainCache {
    private domains: DomainInfo[] = [];

    constructor(
        private readonly client: HttpClient,
        private readonly domainsUrl: string
    ) {}

    /** Fetches domains from API. Call once at startup. */
    async load(): Promise<void> {
        console.log(`[DomainCache] Loading domains from: ${this.domainsUrl}`);
        this.domains = await listDomains(this.client, this.domainsUrl);
        console.log(`[DomainCache] Loaded ${this.domains.length} domains:`, this.domains.map(d => d.url));
    }

    getDomains(): DomainInfo[] {
        return this.domains;
    }
}
