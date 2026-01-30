import { listFolders, listDomains, createFolder, createShortUrl } from '../../src/api/redr/redrApi';
import { ApiError, ValidationError } from '../../src/api/helpers';
import { mockAxiosResponse, createMockHttpClient } from '../types';

describe('redrApi', () => {

    describe('listFolders', () => {
        it('should return parsed folder list', async () => {
            const response = mockAxiosResponse(200, [
                { id: 'folder1', name: 'Folder One' },
                { id: 'folder2', name: 'Folder Two' },
            ]);
            const client = createMockHttpClient(response);

            const result = await listFolders(client, 'https://api.test/folders');

            expect(result).toEqual([
                { id: 'folder1', name: 'Folder One' },
                { id: 'folder2', name: 'Folder Two' },
            ]);
        });

        it('should filter out items without id', async () => {
            const response = mockAxiosResponse(200, [
                { id: 'valid', name: 'Valid' },
                { name: 'No ID' },
                { id: '', name: 'Empty ID' },
            ]);
            const client = createMockHttpClient(response);

            const result = await listFolders(client, 'https://api.test/folders');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('valid');
        });

        it('should filter out items without name', async () => {
            const response = mockAxiosResponse(200, [
                { id: 'valid', name: 'Valid' },
                { id: 'no-name' },
                { id: 'empty-name', name: '' },
            ]);
            const client = createMockHttpClient(response);

            const result = await listFolders(client, 'https://api.test/folders');

            expect(result).toHaveLength(1);
        });

        it('should return empty array for non-array response', async () => {
            const response = mockAxiosResponse(200, { not: 'an array' });
            const client = createMockHttpClient(response);

            const result = await listFolders(client, 'https://api.test/folders');

            expect(result).toEqual([]);
        });

        it('should throw ApiError for non-2xx status', async () => {
            const response = mockAxiosResponse(500, { error: 'Server Error' });
            const client = createMockHttpClient(response);

            await expect(listFolders(client, 'https://api.test/folders'))
                .rejects.toThrow(ApiError);
        });
    });

    describe('listDomains', () => {
        it('should return parsed domain list', async () => {
            const response = mockAxiosResponse(200, [
                { id: 'dom1', url: 'https://rdr.im' },
                { id: 'dom2', url: 'https://rdr.ink' },
            ]);
            const client = createMockHttpClient(response);

            const result = await listDomains(client, 'https://api.test/domains');

            expect(result).toEqual([
                { id: 'dom1', url: 'https://rdr.im' },
                { id: 'dom2', url: 'https://rdr.ink' },
            ]);
        });

        it('should filter out items without id or url', async () => {
            const response = mockAxiosResponse(200, [
                { id: 'valid', url: 'https://valid.com' },
                { url: 'https://no-id.com' },
                { id: 'no-url' },
            ]);
            const client = createMockHttpClient(response);

            const result = await listDomains(client, 'https://api.test/domains');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('valid');
        });

        it('should return empty array for non-array response', async () => {
            const response = mockAxiosResponse(200, null);
            const client = createMockHttpClient(response);

            const result = await listDomains(client, 'https://api.test/domains');

            expect(result).toEqual([]);
        });
    });

    describe('createFolder', () => {
        it('should create folder and return id', async () => {
            const response = mockAxiosResponse(201, { id: 'new-folder-id', name: 'My Folder' });
            const client = createMockHttpClient(response);

            const result = await createFolder(client, 'https://api.test/folders', 'My Folder');

            expect(result).toBe('new-folder-id');
            expect(client.post).toHaveBeenCalledWith(
                'https://api.test/folders',
                { name: 'My Folder' },
                { headers: { 'Content-Type': 'application/json' } }
            );
        });

        it('should throw ValidationError if response missing id', async () => {
            const response = mockAxiosResponse(201, { name: 'My Folder' }); // no id
            const client = createMockHttpClient(response);

            await expect(createFolder(client, 'https://api.test/folders', 'My Folder'))
                .rejects.toThrow(ValidationError);
        });

        it('should throw ApiError for non-2xx status', async () => {
            const response = mockAxiosResponse(400, { error: 'Bad Request' });
            const client = createMockHttpClient(response);

            await expect(createFolder(client, 'https://api.test/folders', 'My Folder'))
                .rejects.toThrow(ApiError);
        });
    });

    describe('createShortUrl', () => {
        it('should create short URL and return redirect_url', async () => {
            const response = mockAxiosResponse(201, { 
                id: 'url-123',
                redirect_url: 'https://rdr.im/abc123',
            });
            const client = createMockHttpClient(response);
            const requestBody = {
                domain: 'domain-id',
                source: 'https://example.com',
                folder: 'folder-id',
            };

            const result = await createShortUrl(client, 'https://api.test/urls', requestBody);

            expect(result).toBe('https://rdr.im/abc123');
            expect(client.post).toHaveBeenCalledWith(
                'https://api.test/urls',
                requestBody,
                { headers: { 'Content-Type': 'application/json' } }
            );
        });

        it('should throw ValidationError if response missing redirect_url', async () => {
            const response = mockAxiosResponse(201, { id: 'url-123' }); // no redirect_url
            const client = createMockHttpClient(response);

            await expect(createShortUrl(client, 'https://api.test/urls', {}))
                .rejects.toThrow(ValidationError);
        });

        it('should throw ApiError for 500 status', async () => {
            const response = mockAxiosResponse(500, { message: 'Server Error' });
            const client = createMockHttpClient(response);

            await expect(createShortUrl(client, 'https://api.test/urls', {}))
                .rejects.toThrow(ApiError);
        });

        it('should throw ApiError for 302 redirect', async () => {
            const response = mockAxiosResponse(302, '<html>Redirect</html>');
            const client = createMockHttpClient(response);

            await expect(createShortUrl(client, 'https://api.test/urls', {}))
                .rejects.toThrow(ApiError);
        });
    });
});
