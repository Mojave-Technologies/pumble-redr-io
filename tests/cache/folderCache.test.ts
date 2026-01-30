import { InMemoryFolderCache } from '../../src/cache/folderCache';
import * as redrApi from '../../src/api/redr/redrApi';
import { ApiError } from '../../src/api/helpers';

// Mock the redrApi module
jest.mock('../../src/api/redr/redrApi');

const mockedListFolders = redrApi.listFolders as jest.MockedFunction<typeof redrApi.listFolders>;
const mockedCreateFolder = redrApi.createFolder as jest.MockedFunction<typeof redrApi.createFolder>;

describe('InMemoryFolderCache', () => {
    const mockClient = {} as any;
    const foldersUrl = 'https://rdr.im/api/folders';
    const folderName = 'pumble-redr';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getOrCreateFolderId', () => {
        it('should return configured folderId if set', async () => {
            const config = { redrFolderId: 'configured-folder-123' };
            const cache = new InMemoryFolderCache(config, mockClient, foldersUrl);

            const result = await cache.getOrCreateFolderId(folderName);

            expect(result).toBe('configured-folder-123');
            expect(mockedListFolders).not.toHaveBeenCalled();
            expect(mockedCreateFolder).not.toHaveBeenCalled();
        });

        it('should find existing folder by name', async () => {
            const config = { redrFolderId: undefined };
            mockedListFolders.mockResolvedValue([
                { id: 'folder-1', name: 'other-folder' },
                { id: 'folder-2', name: 'pumble-redr' },
            ]);

            const cache = new InMemoryFolderCache(config, mockClient, foldersUrl);
            const result = await cache.getOrCreateFolderId(folderName);

            expect(result).toBe('folder-2');
            expect(mockedListFolders).toHaveBeenCalledWith(mockClient, foldersUrl);
            expect(mockedCreateFolder).not.toHaveBeenCalled();
        });

        it('should find folder case-insensitively', async () => {
            const config = { redrFolderId: undefined };
            mockedListFolders.mockResolvedValue([
                { id: 'folder-1', name: 'PUMBLE-REDR' },
            ]);

            const cache = new InMemoryFolderCache(config, mockClient, foldersUrl);
            const result = await cache.getOrCreateFolderId('pumble-redr');

            expect(result).toBe('folder-1');
        });

        it('should create folder if not found', async () => {
            const config = { redrFolderId: undefined };
            mockedListFolders.mockResolvedValue([]);
            mockedCreateFolder.mockResolvedValue('new-folder-id');

            const cache = new InMemoryFolderCache(config, mockClient, foldersUrl);
            const result = await cache.getOrCreateFolderId(folderName);

            expect(result).toBe('new-folder-id');
            expect(mockedCreateFolder).toHaveBeenCalledWith(mockClient, foldersUrl, folderName);
        });

        it('should cache folder ID after first call', async () => {
            const config = { redrFolderId: undefined };
            mockedListFolders.mockResolvedValue([{ id: 'cached-id', name: 'pumble-redr' }]);

            const cache = new InMemoryFolderCache(config, mockClient, foldersUrl);
            
            await cache.getOrCreateFolderId(folderName);
            await cache.getOrCreateFolderId(folderName);
            await cache.getOrCreateFolderId(folderName);

            expect(mockedListFolders).toHaveBeenCalledTimes(1);
        });

        it('should handle 409 conflict by retrying lookup', async () => {
            const config = { redrFolderId: undefined };
            
            // First call: folder not found
            mockedListFolders
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: 'race-condition-id', name: 'pumble-redr' }]);
            
            // Create fails with 409
            mockedCreateFolder.mockRejectedValue(new ApiError(409, 'create folder', 'Conflict'));

            const cache = new InMemoryFolderCache(config, mockClient, foldersUrl);
            const result = await cache.getOrCreateFolderId(folderName);

            expect(result).toBe('race-condition-id');
            expect(mockedListFolders).toHaveBeenCalledTimes(2);
        });

        it('should deduplicate concurrent requests', async () => {
            const config = { redrFolderId: undefined };
            
            let resolveList: (value: any) => void;
            const listPromise = new Promise((resolve) => {
                resolveList = resolve;
            });
            
            mockedListFolders.mockImplementation(() => listPromise as any);

            const cache = new InMemoryFolderCache(config, mockClient, foldersUrl);
            
            // Start multiple concurrent requests
            const promise1 = cache.getOrCreateFolderId(folderName);
            const promise2 = cache.getOrCreateFolderId(folderName);
            const promise3 = cache.getOrCreateFolderId(folderName);

            // Resolve the list call
            resolveList!([{ id: 'deduped-id', name: 'pumble-redr' }]);

            const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

            expect(result1).toBe('deduped-id');
            expect(result2).toBe('deduped-id');
            expect(result3).toBe('deduped-id');
            expect(mockedListFolders).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors', async () => {
            const config = { redrFolderId: undefined };
            mockedListFolders.mockRejectedValue(new Error('Network Error'));

            const cache = new InMemoryFolderCache(config, mockClient, foldersUrl);

            await expect(cache.getOrCreateFolderId(folderName)).rejects.toThrow('Network Error');
        });
    });
});
