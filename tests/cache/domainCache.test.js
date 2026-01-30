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
const domainCache_1 = require("../../src/cache/domainCache");
const redrApi = __importStar(require("../../src/api/redr/redrApi"));
// Mock the redrApi module
jest.mock('../../src/api/redr/redrApi');
const mockedListDomains = redrApi.listDomains;
// Suppress console.log in tests
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
});
afterAll(() => {
    jest.restoreAllMocks();
});
describe('DomainCache', () => {
    const mockClient = {};
    const domainsUrl = 'https://rdr.im/api/domains';
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('constructor', () => {
        it('should create cache with empty domains', () => {
            const cache = new domainCache_1.DomainCache(mockClient, domainsUrl);
            expect(cache.getDomains()).toEqual([]);
        });
    });
    describe('load', () => {
        it('should fetch domains from API', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockDomains = [
                { id: '1', url: 'https://rdr.im' },
                { id: '2', url: 'https://rdr.ink' },
            ];
            mockedListDomains.mockResolvedValue(mockDomains);
            const cache = new domainCache_1.DomainCache(mockClient, domainsUrl);
            yield cache.load();
            expect(mockedListDomains).toHaveBeenCalledWith(mockClient, domainsUrl);
            expect(cache.getDomains()).toEqual(mockDomains);
        }));
        it('should handle empty response', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedListDomains.mockResolvedValue([]);
            const cache = new domainCache_1.DomainCache(mockClient, domainsUrl);
            yield cache.load();
            expect(cache.getDomains()).toEqual([]);
        }));
        it('should propagate API errors', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedListDomains.mockRejectedValue(new Error('API Error'));
            const cache = new domainCache_1.DomainCache(mockClient, domainsUrl);
            yield expect(cache.load()).rejects.toThrow('API Error');
        }));
        it('should overwrite previous domains on reload', () => __awaiter(void 0, void 0, void 0, function* () {
            const cache = new domainCache_1.DomainCache(mockClient, domainsUrl);
            mockedListDomains.mockResolvedValue([{ id: '1', url: 'https://old.com' }]);
            yield cache.load();
            expect(cache.getDomains()).toHaveLength(1);
            mockedListDomains.mockResolvedValue([
                { id: '2', url: 'https://new1.com' },
                { id: '3', url: 'https://new2.com' },
            ]);
            yield cache.load();
            expect(cache.getDomains()).toHaveLength(2);
            expect(cache.getDomains()[0].url).toBe('https://new1.com');
        }));
    });
    describe('getDomains', () => {
        it('should return domains array', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockDomains = [
                { id: '1', url: 'https://rdr.im' },
            ];
            mockedListDomains.mockResolvedValue(mockDomains);
            const cache = new domainCache_1.DomainCache(mockClient, domainsUrl);
            yield cache.load();
            const domains = cache.getDomains();
            expect(domains).toBeInstanceOf(Array);
            expect(domains).toHaveLength(1);
        }));
    });
});
