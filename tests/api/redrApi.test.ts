import { listFolders, listDomains, createFolder, createShortUrl } from '../../src/api/redr/redrApi';
import { ApiError, ValidationError } from '../../src/api/helpers';

describe('redrApi', () => {
    // Create a mock axios client
    const createMockClient = (response: any) => ({
        get: jest.fn().mockResolvedValue(response),
        post: jest.fn().mockResolvedValue(response),
    });

    describe('listFolders', () => {
        it('should return parsed folder list', async () => {
            const mockResponse = {
                status: 200,
                data: [
                    { id: 'folder1', name: 'Folder One' },
                    { id: 'folder2', name: 'Folder Two' },
                ],
            };
            const client = createMockClient(mockResponse);

            const result = await listFolders(client as any, 'https://api.test/folders');

            expect(result).toEqual([
                { id: 'folder1', name: 'Folder One' },
                { id: 'folder2', name: 'Folder Two' },
            ]);
        });

        it('should filter out items without id', async () => {
            const mockResponse = {
                status: 200,
                data: [
                    { id: 'valid', name: 'Valid' },
                    { name: 'No ID' },
                    { id: '', name: 'Empty ID' },
                ],
            };
            const client = createMockClient(mockResponse);

            const result = await listFolders(client as any, 'https://api.test/folders');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('valid');
        });

        it('should filter out items without name', async () => {
            const mockResponse = {
                status: 200,
                data: [
                    { id: 'valid', name: 'Valid' },
                    { id: 'no-name' },
                    { id: 'empty-name', name: '' },
                ],
            };
            const client = createMockClient(mockResponse);

            const result = await listFolders(client as any, 'https://api.test/folders');

            expect(result).toHaveLength(1);
        });

        it('should return empty array for non-array response', async () => {
            const mockResponse = {
                status: 200,
                data: { not: 'an array' },
            };
            const client = createMockClient(mockResponse);

            const result = await listFolders(client as any, 'https://api.test/folders');

            expect(result).toEqual([]);
        });

        it('should throw ApiError for non-2xx status', async () => {
            const mockResponse = {
                status: 500,
                data: { error: 'Server Error' },
            };
            const client = createMockClient(mockResponse);

            await expect(listFolders(client as any, 'https://api.test/folders'))
                .rejects.toThrow(ApiError);
        });
    });

    describe('listDomains', () => {
        it('should return parsed domain list', async () => {
            const mockResponse = {
                status: 200,
                data: [
                    { id: 'dom1', url: 'https://rdr.im' },
                    { id: 'dom2', url: 'https://rdr.ink' },
                ],
            };
            const client = createMockClient(mockResponse);

            const result = await listDomains(client as any, 'https://api.test/domains');

            expect(result).toEqual([
                { id: 'dom1', url: 'https://rdr.im' },
                { id: 'dom2', url: 'https://rdr.ink' },
            ]);
        });

        it('should filter out items without id or url', async () => {
            const mockResponse = {
                status: 200,
                data: [
                    { id: 'valid', url: 'https://valid.com' },
                    { url: 'https://no-id.com' },
                    { id: 'no-url' },
                ],
            };
            const client = createMockClient(mockResponse);

            const result = await listDomains(client as any, 'https://api.test/domains');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('valid');
        });

        it('should return empty array for non-array response', async () => {
            const mockResponse = {
                status: 200,
                data: null,
            };
            const client = createMockClient(mockResponse);

            const result = await listDomains(client as any, 'https://api.test/domains');

            expect(result).toEqual([]);
        });
    });

    describe('createFolder', () => {
        it('should create folder and return id', async () => {
            const mockResponse = {
                status: 201,
                data: { id: 'new-folder-id', name: 'My Folder' },
            };
            const client = createMockClient(mockResponse);

            const result = await createFolder(client as any, 'https://api.test/folders', 'My Folder');

            expect(result).toBe('new-folder-id');
            expect(client.post).toHaveBeenCalledWith(
                'https://api.test/folders',
                { name: 'My Folder' },
                { headers: { 'Content-Type': 'application/json' } }
            );
        });

        it('should throw ValidationError if response missing id', async () => {
            const mockResponse = {
                status: 201,
                data: { name: 'My Folder' }, // no id
            };
            const client = createMockClient(mockResponse);

            await expect(createFolder(client as any, 'https://api.test/folders', 'My Folder'))
                .rejects.toThrow(ValidationError);
        });

        it('should throw ApiError for non-2xx status', async () => {
            const mockResponse = {
                status: 400,
                data: { error: 'Bad Request' },
            };
            const client = createMockClient(mockResponse);

            await expect(createFolder(client as any, 'https://api.test/folders', 'My Folder'))
                .rejects.toThrow(ApiError);
        });
    });

    describe('createShortUrl', () => {
        it('should create short URL and return redirect_url', async () => {
            const mockResponse = {
                status: 201,
                data: { 
                    id: 'url-123',
                    redirect_url: 'https://rdr.im/abc123',
                },
            };
            const client = createMockClient(mockResponse);
            const requestBody = {
                domain: 'domain-id',
                source: 'https://example.com',
                folder: 'folder-id',
            };

            const result = await createShortUrl(client as any, 'https://api.test/urls', requestBody);

            expect(result).toBe('https://rdr.im/abc123');
            expect(client.post).toHaveBeenCalledWith(
                'https://api.test/urls',
                requestBody,
                { headers: { 'Content-Type': 'application/json' } }
            );
        });

        it('should throw ValidationError if response missing redirect_url', async () => {
            const mockResponse = {
                status: 201,
                data: { id: 'url-123' }, // no redirect_url
            };
            const client = createMockClient(mockResponse);

            await expect(createShortUrl(client as any, 'https://api.test/urls', {}))
                .rejects.toThrow(ValidationError);
        });

        it('should throw ApiError for 500 status', async () => {
            const mockResponse = {
                status: 500,
                data: { message: 'Server Error' },
            };
            const client = createMockClient(mockResponse);

            await expect(createShortUrl(client as any, 'https://api.test/urls', {}))
                .rejects.toThrow(ApiError);
        });

        it('should throw ApiError for 302 redirect', async () => {
            const mockResponse = {
                status: 302,
                data: '<html>Redirect</html>',
            };
            const client = createMockClient(mockResponse);

            await expect(createShortUrl(client as any, 'https://api.test/urls', {}))
                .rejects.toThrow(ApiError);
        });
    });
});
