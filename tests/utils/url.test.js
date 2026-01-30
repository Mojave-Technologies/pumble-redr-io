"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("../../src/utils/url");
describe('extractFirstUrl', () => {
    it('should extract URL from plain text', () => {
        expect((0, url_1.extractFirstUrl)('Check this https://example.com please')).toBe('https://example.com');
    });
    it('should extract URL at the beginning', () => {
        expect((0, url_1.extractFirstUrl)('https://google.com is a search engine')).toBe('https://google.com');
    });
    it('should extract URL at the end', () => {
        expect((0, url_1.extractFirstUrl)('Visit https://github.com')).toBe('https://github.com');
    });
    it('should extract URL with path', () => {
        expect((0, url_1.extractFirstUrl)('See https://example.com/path/to/page')).toBe('https://example.com/path/to/page');
    });
    it('should extract URL with query params', () => {
        expect((0, url_1.extractFirstUrl)('Link: https://example.com?foo=bar&baz=qux')).toBe('https://example.com?foo=bar&baz=qux');
    });
    it('should extract first URL when multiple present', () => {
        expect((0, url_1.extractFirstUrl)('First https://first.com then https://second.com')).toBe('https://first.com');
    });
    it('should return undefined for text without URL', () => {
        expect((0, url_1.extractFirstUrl)('No URL here')).toBeUndefined();
    });
    it('should return undefined for empty string', () => {
        expect((0, url_1.extractFirstUrl)('')).toBeUndefined();
    });
    it('should handle http URLs', () => {
        expect((0, url_1.extractFirstUrl)('Link: http://example.com')).toBe('http://example.com');
    });
    it('should strip trailing punctuation', () => {
        expect((0, url_1.extractFirstUrl)('Check https://example.com.')).toBe('https://example.com');
        expect((0, url_1.extractFirstUrl)('Check https://example.com,')).toBe('https://example.com');
        expect((0, url_1.extractFirstUrl)('Check https://example.com!')).toBe('https://example.com');
    });
});
describe('normalizeHttpUrl', () => {
    it('should normalize https URL (may add trailing slash)', () => {
        const result = (0, url_1.normalizeHttpUrl)('https://example.com');
        expect(result).toMatch(/^https:\/\/example\.com\/?$/);
    });
    it('should normalize http URL (may add trailing slash)', () => {
        const result = (0, url_1.normalizeHttpUrl)('http://example.com');
        expect(result).toMatch(/^http:\/\/example\.com\/?$/);
    });
    it('should add https:// to URL without protocol', () => {
        const result = (0, url_1.normalizeHttpUrl)('example.com');
        expect(result).toMatch(/^https:\/\/example\.com\/?$/);
    });
    it('should add https:// to URL with www', () => {
        const result = (0, url_1.normalizeHttpUrl)('www.example.com');
        expect(result).toMatch(/^https:\/\/www\.example\.com\/?$/);
    });
    it('should handle URL with path', () => {
        expect((0, url_1.normalizeHttpUrl)('example.com/path')).toBe('https://example.com/path');
    });
    it('should handle URL with port', () => {
        const result = (0, url_1.normalizeHttpUrl)('example.com:8080');
        expect(result).toMatch(/^https:\/\/example\.com:8080\/?$/);
    });
    it('should throw for empty string', () => {
        expect(() => (0, url_1.normalizeHttpUrl)('')).toThrow();
    });
    it('should throw for invalid hostname', () => {
        expect(() => (0, url_1.normalizeHttpUrl)('not a url')).toThrow();
    });
    it('should handle localhost', () => {
        const result = (0, url_1.normalizeHttpUrl)('localhost:3000');
        expect(result).toMatch(/^https:\/\/localhost:3000\/?$/);
    });
    it('should handle IP address', () => {
        const result = (0, url_1.normalizeHttpUrl)('192.168.1.1');
        expect(result).toMatch(/^https:\/\/192\.168\.1\.1\/?$/);
    });
});
