"use strict";
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
const redrApi_1 = require("../../src/api/redr/redrApi");
const helpers_1 = require("../../src/api/helpers");
describe('redrApi', () => {
    // Create a mock axios client
    const createMockClient = (response) => ({
        get: jest.fn().mockResolvedValue(response),
        post: jest.fn().mockResolvedValue(response),
    });
    describe('listFolders', () => {
        it('should return parsed folder list', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 200,
                data: [
                    { id: 'folder1', name: 'Folder One' },
                    { id: 'folder2', name: 'Folder Two' },
                ],
            };
            const client = createMockClient(mockResponse);
            const result = yield (0, redrApi_1.listFolders)(client, 'https://api.test/folders');
            expect(result).toEqual([
                { id: 'folder1', name: 'Folder One' },
                { id: 'folder2', name: 'Folder Two' },
            ]);
        }));
        it('should filter out items without id', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 200,
                data: [
                    { id: 'valid', name: 'Valid' },
                    { name: 'No ID' },
                    { id: '', name: 'Empty ID' },
                ],
            };
            const client = createMockClient(mockResponse);
            const result = yield (0, redrApi_1.listFolders)(client, 'https://api.test/folders');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('valid');
        }));
        it('should filter out items without name', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 200,
                data: [
                    { id: 'valid', name: 'Valid' },
                    { id: 'no-name' },
                    { id: 'empty-name', name: '' },
                ],
            };
            const client = createMockClient(mockResponse);
            const result = yield (0, redrApi_1.listFolders)(client, 'https://api.test/folders');
            expect(result).toHaveLength(1);
        }));
        it('should return empty array for non-array response', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 200,
                data: { not: 'an array' },
            };
            const client = createMockClient(mockResponse);
            const result = yield (0, redrApi_1.listFolders)(client, 'https://api.test/folders');
            expect(result).toEqual([]);
        }));
        it('should throw ApiError for non-2xx status', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 500,
                data: { error: 'Server Error' },
            };
            const client = createMockClient(mockResponse);
            yield expect((0, redrApi_1.listFolders)(client, 'https://api.test/folders'))
                .rejects.toThrow(helpers_1.ApiError);
        }));
    });
    describe('listDomains', () => {
        it('should return parsed domain list', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 200,
                data: [
                    { id: 'dom1', url: 'https://rdr.im' },
                    { id: 'dom2', url: 'https://rdr.ink' },
                ],
            };
            const client = createMockClient(mockResponse);
            const result = yield (0, redrApi_1.listDomains)(client, 'https://api.test/domains');
            expect(result).toEqual([
                { id: 'dom1', url: 'https://rdr.im' },
                { id: 'dom2', url: 'https://rdr.ink' },
            ]);
        }));
        it('should filter out items without id or url', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 200,
                data: [
                    { id: 'valid', url: 'https://valid.com' },
                    { url: 'https://no-id.com' },
                    { id: 'no-url' },
                ],
            };
            const client = createMockClient(mockResponse);
            const result = yield (0, redrApi_1.listDomains)(client, 'https://api.test/domains');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('valid');
        }));
        it('should return empty array for non-array response', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 200,
                data: null,
            };
            const client = createMockClient(mockResponse);
            const result = yield (0, redrApi_1.listDomains)(client, 'https://api.test/domains');
            expect(result).toEqual([]);
        }));
    });
    describe('createFolder', () => {
        it('should create folder and return id', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 201,
                data: { id: 'new-folder-id', name: 'My Folder' },
            };
            const client = createMockClient(mockResponse);
            const result = yield (0, redrApi_1.createFolder)(client, 'https://api.test/folders', 'My Folder');
            expect(result).toBe('new-folder-id');
            expect(client.post).toHaveBeenCalledWith('https://api.test/folders', { name: 'My Folder' }, { headers: { 'Content-Type': 'application/json' } });
        }));
        it('should throw ValidationError if response missing id', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 201,
                data: { name: 'My Folder' }, // no id
            };
            const client = createMockClient(mockResponse);
            yield expect((0, redrApi_1.createFolder)(client, 'https://api.test/folders', 'My Folder'))
                .rejects.toThrow(helpers_1.ValidationError);
        }));
        it('should throw ApiError for non-2xx status', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 400,
                data: { error: 'Bad Request' },
            };
            const client = createMockClient(mockResponse);
            yield expect((0, redrApi_1.createFolder)(client, 'https://api.test/folders', 'My Folder'))
                .rejects.toThrow(helpers_1.ApiError);
        }));
    });
    describe('createShortUrl', () => {
        it('should create short URL and return redirect_url', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield (0, redrApi_1.createShortUrl)(client, 'https://api.test/urls', requestBody);
            expect(result).toBe('https://rdr.im/abc123');
            expect(client.post).toHaveBeenCalledWith('https://api.test/urls', requestBody, { headers: { 'Content-Type': 'application/json' } });
        }));
        it('should throw ValidationError if response missing redirect_url', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 201,
                data: { id: 'url-123' }, // no redirect_url
            };
            const client = createMockClient(mockResponse);
            yield expect((0, redrApi_1.createShortUrl)(client, 'https://api.test/urls', {}))
                .rejects.toThrow(helpers_1.ValidationError);
        }));
        it('should throw ApiError for 500 status', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 500,
                data: { message: 'Server Error' },
            };
            const client = createMockClient(mockResponse);
            yield expect((0, redrApi_1.createShortUrl)(client, 'https://api.test/urls', {}))
                .rejects.toThrow(helpers_1.ApiError);
        }));
        it('should throw ApiError for 302 redirect', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                status: 302,
                data: '<html>Redirect</html>',
            };
            const client = createMockClient(mockResponse);
            yield expect((0, redrApi_1.createShortUrl)(client, 'https://api.test/urls', {}))
                .rejects.toThrow(helpers_1.ApiError);
        }));
    });
});
