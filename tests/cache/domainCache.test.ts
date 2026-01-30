import { DomainCache } from '../../src/cache/domainCache';
import * as redrApi from '../../src/api/redr/redrApi';
import { emptyMockClient, MockHttpClient } from '../types';

// Mock the redrApi module
jest.mock('../../src/api/redr/redrApi');

const mockedListDomains = redrApi.listDomains as jest.MockedFunction<typeof redrApi.listDomains>;

// Suppress console.log in tests
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('DomainCache', () => {
    const mockClient: MockHttpClient = emptyMockClient;
    const domainsUrl = 'https://rdr.im/api/domains';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create cache with empty domains', () => {
            const cache = new DomainCache(mockClient, domainsUrl);
            expect(cache.getDomains()).toEqual([]);
        });
    });

    describe('load', () => {
        it('should fetch domains from API', async () => {
            const mockDomains = [
                { id: '1', url: 'https://rdr.im' },
                { id: '2', url: 'https://rdr.ink' },
            ];
            mockedListDomains.mockResolvedValue(mockDomains);

            const cache = new DomainCache(mockClient, domainsUrl);
            await cache.load();

            expect(mockedListDomains).toHaveBeenCalledWith(mockClient, domainsUrl);
            expect(cache.getDomains()).toEqual(mockDomains);
        });

        it('should handle empty response', async () => {
            mockedListDomains.mockResolvedValue([]);

            const cache = new DomainCache(mockClient, domainsUrl);
            await cache.load();

            expect(cache.getDomains()).toEqual([]);
        });

        it('should propagate API errors', async () => {
            mockedListDomains.mockRejectedValue(new Error('API Error'));

            const cache = new DomainCache(mockClient, domainsUrl);

            await expect(cache.load()).rejects.toThrow('API Error');
        });

        it('should overwrite previous domains on reload', async () => {
            const cache = new DomainCache(mockClient, domainsUrl);

            mockedListDomains.mockResolvedValue([{ id: '1', url: 'https://old.com' }]);
            await cache.load();
            expect(cache.getDomains()).toHaveLength(1);

            mockedListDomains.mockResolvedValue([
                { id: '2', url: 'https://new1.com' },
                { id: '3', url: 'https://new2.com' },
            ]);
            await cache.load();
            expect(cache.getDomains()).toHaveLength(2);
            expect(cache.getDomains()[0].url).toBe('https://new1.com');
        });
    });

    describe('getDomains', () => {
        it('should return domains array', async () => {
            const mockDomains = [
                { id: '1', url: 'https://rdr.im' },
            ];
            mockedListDomains.mockResolvedValue(mockDomains);

            const cache = new DomainCache(mockClient, domainsUrl);
            await cache.load();

            const domains = cache.getDomains();
            expect(domains).toBeInstanceOf(Array);
            expect(domains).toHaveLength(1);
        });
    });
});
