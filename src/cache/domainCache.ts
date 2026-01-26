/**
 * Domain cache loaded once at startup.
 * Provides available short URL domains for the modal dropdown.
 */

import { AxiosInstance } from 'axios';
import { listDomains, DomainInfo } from '../api/redr/redrApi';

export class DomainCache {
    private domains: DomainInfo[] = [];

    constructor(
        private readonly client: AxiosInstance,
        private readonly domainsUrl: string
    ) {}

    /** Fetches domains from API. Call once at startup. */
    async load(): Promise<void> {
        this.domains = await listDomains(this.client, this.domainsUrl);
    }

    getDomains(): DomainInfo[] {
        return this.domains;
    }
}
