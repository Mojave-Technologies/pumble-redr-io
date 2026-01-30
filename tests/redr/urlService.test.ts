import { shortenUrl, ShortenUrlFields } from '../../src/redr/urlService';
import * as redrApi from '../../src/api/redr/redrApi';

// Mock the redrApi module
jest.mock('../../src/api/redr/redrApi');

const mockedCreateShortUrl = redrApi.createShortUrl as jest.MockedFunction<typeof redrApi.createShortUrl>;

describe('urlService', () => {
    const mockClient = {} as any;
    const apiUrl = 'https://rdr.im/api/urls';
    const domainId = 'domain123';
    const folderId = 'folder456';

    beforeEach(() => {
        jest.clearAllMocks();
        mockedCreateShortUrl.mockResolvedValue('https://rdr.im/abc123');
    });

    describe('shortenUrl', () => {
        it('should build basic request body with required fields', async () => {
            const fields: ShortenUrlFields = {
                longUrl: 'https://example.com/very/long/url',
                masked: false,
            };

            await shortenUrl(mockClient, apiUrl, domainId, folderId, fields);

            expect(mockedCreateShortUrl).toHaveBeenCalledWith(
                mockClient,
                apiUrl,
                {
                    domain: domainId,
                    source: 'https://example.com/very/long/url',
                    folder: folderId,
                }
            );
        });

        it('should include masked flag when true', async () => {
            const fields: ShortenUrlFields = {
                longUrl: 'https://example.com',
                masked: true,
            };

            await shortenUrl(mockClient, apiUrl, domainId, folderId, fields);

            expect(mockedCreateShortUrl).toHaveBeenCalledWith(
                mockClient,
                apiUrl,
                expect.objectContaining({
                    masked: true,
                })
            );
        });

        it('should not include masked when false', async () => {
            const fields: ShortenUrlFields = {
                longUrl: 'https://example.com',
                masked: false,
            };

            await shortenUrl(mockClient, apiUrl, domainId, folderId, fields);

            const callArgs = mockedCreateShortUrl.mock.calls[0][2];
            expect(callArgs).not.toHaveProperty('masked');
        });

        it('should include defaultRedirectUrl when provided', async () => {
            const fields: ShortenUrlFields = {
                longUrl: 'https://example.com',
                masked: false,
                defaultRedirectUrl: 'https://fallback.com',
            };

            await shortenUrl(mockClient, apiUrl, domainId, folderId, fields);

            expect(mockedCreateShortUrl).toHaveBeenCalledWith(
                mockClient,
                apiUrl,
                expect.objectContaining({
                    default_redirect: 'https://fallback.com',
                })
            );
        });

        it('should include expiresAt when provided', async () => {
            const fields: ShortenUrlFields = {
                longUrl: 'https://example.com',
                masked: false,
                expiresAt: '2026-12-31T23:59:59.000Z',
            };

            await shortenUrl(mockClient, apiUrl, domainId, folderId, fields);

            expect(mockedCreateShortUrl).toHaveBeenCalledWith(
                mockClient,
                apiUrl,
                expect.objectContaining({
                    expired_at: '2026-12-31T23:59:59.000Z',
                })
            );
        });

        it('should include password when provided', async () => {
            const fields: ShortenUrlFields = {
                longUrl: 'https://example.com',
                masked: false,
                password: 'secret123',
            };

            await shortenUrl(mockClient, apiUrl, domainId, folderId, fields);

            expect(mockedCreateShortUrl).toHaveBeenCalledWith(
                mockClient,
                apiUrl,
                expect.objectContaining({
                    password: 'secret123',
                })
            );
        });

        it('should include all optional fields when provided', async () => {
            const fields: ShortenUrlFields = {
                longUrl: 'https://example.com',
                masked: true,
                defaultRedirectUrl: 'https://fallback.com',
                expiresAt: '2026-12-31T23:59:59.000Z',
                password: 'secret123',
            };

            await shortenUrl(mockClient, apiUrl, domainId, folderId, fields);

            expect(mockedCreateShortUrl).toHaveBeenCalledWith(
                mockClient,
                apiUrl,
                {
                    domain: domainId,
                    source: 'https://example.com',
                    folder: folderId,
                    masked: true,
                    default_redirect: 'https://fallback.com',
                    expired_at: '2026-12-31T23:59:59.000Z',
                    password: 'secret123',
                }
            );
        });

        it('should return the short URL from API', async () => {
            const fields: ShortenUrlFields = {
                longUrl: 'https://example.com',
                masked: false,
            };

            const result = await shortenUrl(mockClient, apiUrl, domainId, folderId, fields);

            expect(result).toBe('https://rdr.im/abc123');
        });

        it('should propagate API errors', async () => {
            mockedCreateShortUrl.mockRejectedValue(new Error('API Error'));

            const fields: ShortenUrlFields = {
                longUrl: 'https://example.com',
                masked: false,
            };

            await expect(shortenUrl(mockClient, apiUrl, domainId, folderId, fields))
                .rejects.toThrow('API Error');
        });
    });
});
