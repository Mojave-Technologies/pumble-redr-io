"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const folderCache_1 = require("../../src/cache/folderCache");
const redrApi = __importStar(require("../../src/api/redr/redrApi"));
const helpers_1 = require("../../src/api/helpers");
// Mock the redrApi module
jest.mock('../../src/api/redr/redrApi');
const mockedListFolders = redrApi.listFolders;
const mockedCreateFolder = redrApi.createFolder;
describe('InMemoryFolderCache', () => {
    const mockClient = {};
    const foldersUrl = 'https://rdr.im/api/folders';
    const folderName = 'pumble-redr';
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getOrCreateFolderId', () => {
        it('should return configured folderId if set', () => __awaiter(void 0, void 0, void 0, function* () {
            const config = { redrFolderId: 'configured-folder-123' };
            const cache = new folderCache_1.InMemoryFolderCache(config, mockClient, foldersUrl);
            const result = yield cache.getOrCreateFolderId(folderName);
            expect(result).toBe('configured-folder-123');
            expect(mockedListFolders).not.toHaveBeenCalled();
            expect(mockedCreateFolder).not.toHaveBeenCalled();
        }));
        it('should find existing folder by name', () => __awaiter(void 0, void 0, void 0, function* () {
            const config = { redrFolderId: undefined };
            mockedListFolders.mockResolvedValue([
                { id: 'folder-1', name: 'other-folder' },
                { id: 'folder-2', name: 'pumble-redr' },
            ]);
            const cache = new folderCache_1.InMemoryFolderCache(config, mockClient, foldersUrl);
            const result = yield cache.getOrCreateFolderId(folderName);
            expect(result).toBe('folder-2');
            expect(mockedListFolders).toHaveBeenCalledWith(mockClient, foldersUrl);
            expect(mockedCreateFolder).not.toHaveBeenCalled();
        }));
        it('should find folder case-insensitively', () => __awaiter(void 0, void 0, void 0, function* () {
            const config = { redrFolderId: undefined };
            mockedListFolders.mockResolvedValue([
                { id: 'folder-1', name: 'PUMBLE-REDR' },
            ]);
            const cache = new folderCache_1.InMemoryFolderCache(config, mockClient, foldersUrl);
            const result = yield cache.getOrCreateFolderId('pumble-redr');
            expect(result).toBe('folder-1');
        }));
        it('should create folder if not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const config = { redrFolderId: undefined };
            mockedListFolders.mockResolvedValue([]);
            mockedCreateFolder.mockResolvedValue('new-folder-id');
            const cache = new folderCache_1.InMemoryFolderCache(config, mockClient, foldersUrl);
            const result = yield cache.getOrCreateFolderId(folderName);
            expect(result).toBe('new-folder-id');
            expect(mockedCreateFolder).toHaveBeenCalledWith(mockClient, foldersUrl, folderName);
        }));
        it('should cache folder ID after first call', () => __awaiter(void 0, void 0, void 0, function* () {
            const config = { redrFolderId: undefined };
            mockedListFolders.mockResolvedValue([{ id: 'cached-id', name: 'pumble-redr' }]);
            const cache = new folderCache_1.InMemoryFolderCache(config, mockClient, foldersUrl);
            yield cache.getOrCreateFolderId(folderName);
            yield cache.getOrCreateFolderId(folderName);
            yield cache.getOrCreateFolderId(folderName);
            expect(mockedListFolders).toHaveBeenCalledTimes(1);
        }));
        it('should handle 409 conflict by retrying lookup', () => __awaiter(void 0, void 0, void 0, function* () {
            const config = { redrFolderId: undefined };
            // First call: folder not found
            mockedListFolders
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: 'race-condition-id', name: 'pumble-redr' }]);
            // Create fails with 409
            mockedCreateFolder.mockRejectedValue(new helpers_1.ApiError(409, 'create folder', 'Conflict'));
            const cache = new folderCache_1.InMemoryFolderCache(config, mockClient, foldersUrl);
            const result = yield cache.getOrCreateFolderId(folderName);
            expect(result).toBe('race-condition-id');
            expect(mockedListFolders).toHaveBeenCalledTimes(2);
        }));
        it('should deduplicate concurrent requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const config = { redrFolderId: undefined };
            let resolveList;
            const listPromise = new Promise((resolve) => {
                resolveList = resolve;
            });
            mockedListFolders.mockImplementation(() => listPromise);
            const cache = new folderCache_1.InMemoryFolderCache(config, mockClient, foldersUrl);
            // Start multiple concurrent requests
            const promise1 = cache.getOrCreateFolderId(folderName);
            const promise2 = cache.getOrCreateFolderId(folderName);
            const promise3 = cache.getOrCreateFolderId(folderName);
            // Resolve the list call
            resolveList([{ id: 'deduped-id', name: 'pumble-redr' }]);
            const [result1, result2, result3] = yield Promise.all([promise1, promise2, promise3]);
            expect(result1).toBe('deduped-id');
            expect(result2).toBe('deduped-id');
            expect(result3).toBe('deduped-id');
            expect(mockedListFolders).toHaveBeenCalledTimes(1);
        }));
        it('should propagate errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const config = { redrFolderId: undefined };
            mockedListFolders.mockRejectedValue(new Error('Network Error'));
            const cache = new folderCache_1.InMemoryFolderCache(config, mockClient, foldersUrl);
            yield expect(cache.getOrCreateFolderId(folderName)).rejects.toThrow('Network Error');
        }));
    });
});
