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
const urlService_1 = require("../../src/redr/urlService");
const redrApi = __importStar(require("../../src/api/redr/redrApi"));
// Mock the redrApi module
jest.mock('../../src/api/redr/redrApi');
const mockedCreateShortUrl = redrApi.createShortUrl;
describe('urlService', () => {
    const mockClient = {};
    const apiUrl = 'https://rdr.im/api/urls';
    const domainId = 'domain123';
    const folderId = 'folder456';
    beforeEach(() => {
        jest.clearAllMocks();
        mockedCreateShortUrl.mockResolvedValue('https://rdr.im/abc123');
    });
    describe('shortenUrl', () => {
        it('should build basic request body with required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const fields = {
                longUrl: 'https://example.com/very/long/url',
                masked: false,
            };
            yield (0, urlService_1.shortenUrl)(mockClient, apiUrl, domainId, folderId, fields);
            expect(mockedCreateShortUrl).toHaveBeenCalledWith(mockClient, apiUrl, {
                domain: domainId,
                source: 'https://example.com/very/long/url',
                folder: folderId,
            });
        }));
        it('should include masked flag when true', () => __awaiter(void 0, void 0, void 0, function* () {
            const fields = {
                longUrl: 'https://example.com',
                masked: true,
            };
            yield (0, urlService_1.shortenUrl)(mockClient, apiUrl, domainId, folderId, fields);
            expect(mockedCreateShortUrl).toHaveBeenCalledWith(mockClient, apiUrl, expect.objectContaining({
                masked: true,
            }));
        }));
        it('should not include masked when false', () => __awaiter(void 0, void 0, void 0, function* () {
            const fields = {
                longUrl: 'https://example.com',
                masked: false,
            };
            yield (0, urlService_1.shortenUrl)(mockClient, apiUrl, domainId, folderId, fields);
            const callArgs = mockedCreateShortUrl.mock.calls[0][2];
            expect(callArgs).not.toHaveProperty('masked');
        }));
        it('should include defaultRedirectUrl when provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const fields = {
                longUrl: 'https://example.com',
                masked: false,
                defaultRedirectUrl: 'https://fallback.com',
            };
            yield (0, urlService_1.shortenUrl)(mockClient, apiUrl, domainId, folderId, fields);
            expect(mockedCreateShortUrl).toHaveBeenCalledWith(mockClient, apiUrl, expect.objectContaining({
                default_redirect: 'https://fallback.com',
            }));
        }));
        it('should include expiresAt when provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const fields = {
                longUrl: 'https://example.com',
                masked: false,
                expiresAt: '2026-12-31T23:59:59.000Z',
            };
            yield (0, urlService_1.shortenUrl)(mockClient, apiUrl, domainId, folderId, fields);
            expect(mockedCreateShortUrl).toHaveBeenCalledWith(mockClient, apiUrl, expect.objectContaining({
                expired_at: '2026-12-31T23:59:59.000Z',
            }));
        }));
        it('should include password when provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const fields = {
                longUrl: 'https://example.com',
                masked: false,
                password: 'secret123',
            };
            yield (0, urlService_1.shortenUrl)(mockClient, apiUrl, domainId, folderId, fields);
            expect(mockedCreateShortUrl).toHaveBeenCalledWith(mockClient, apiUrl, expect.objectContaining({
                password: 'secret123',
            }));
        }));
        it('should include all optional fields when provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const fields = {
                longUrl: 'https://example.com',
                masked: true,
                defaultRedirectUrl: 'https://fallback.com',
                expiresAt: '2026-12-31T23:59:59.000Z',
                password: 'secret123',
            };
            yield (0, urlService_1.shortenUrl)(mockClient, apiUrl, domainId, folderId, fields);
            expect(mockedCreateShortUrl).toHaveBeenCalledWith(mockClient, apiUrl, {
                domain: domainId,
                source: 'https://example.com',
                folder: folderId,
                masked: true,
                default_redirect: 'https://fallback.com',
                expired_at: '2026-12-31T23:59:59.000Z',
                password: 'secret123',
            });
        }));
        it('should return the short URL from API', () => __awaiter(void 0, void 0, void 0, function* () {
            const fields = {
                longUrl: 'https://example.com',
                masked: false,
            };
            const result = yield (0, urlService_1.shortenUrl)(mockClient, apiUrl, domainId, folderId, fields);
            expect(result).toBe('https://rdr.im/abc123');
        }));
        it('should propagate API errors', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedCreateShortUrl.mockRejectedValue(new Error('API Error'));
            const fields = {
                longUrl: 'https://example.com',
                masked: false,
            };
            yield expect((0, urlService_1.shortenUrl)(mockClient, apiUrl, domainId, folderId, fields))
                .rejects.toThrow('API Error');
        }));
    });
});
