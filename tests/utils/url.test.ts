import { extractFirstUrl, normalizeHttpUrl } from '../../src/utils/url';

describe('extractFirstUrl', () => {
    it('should extract URL from plain text', () => {
        expect(extractFirstUrl('Check this https://example.com please')).toBe('https://example.com');
    });

    it('should extract URL at the beginning', () => {
        expect(extractFirstUrl('https://google.com is a search engine')).toBe('https://google.com');
    });

    it('should extract URL at the end', () => {
        expect(extractFirstUrl('Visit https://github.com')).toBe('https://github.com');
    });

    it('should extract URL with path', () => {
        expect(extractFirstUrl('See https://example.com/path/to/page')).toBe('https://example.com/path/to/page');
    });

    it('should extract URL with query params', () => {
        expect(extractFirstUrl('Link: https://example.com?foo=bar&baz=qux')).toBe('https://example.com?foo=bar&baz=qux');
    });

    it('should extract first URL when multiple present', () => {
        expect(extractFirstUrl('First https://first.com then https://second.com')).toBe('https://first.com');
    });

    it('should return undefined for text without URL', () => {
        expect(extractFirstUrl('No URL here')).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
        expect(extractFirstUrl('')).toBeUndefined();
    });

    it('should handle http URLs', () => {
        expect(extractFirstUrl('Link: http://example.com')).toBe('http://example.com');
    });

    it('should strip trailing punctuation', () => {
        expect(extractFirstUrl('Check https://example.com.')).toBe('https://example.com');
        expect(extractFirstUrl('Check https://example.com,')).toBe('https://example.com');
        expect(extractFirstUrl('Check https://example.com!')).toBe('https://example.com');
    });
});

describe('normalizeHttpUrl', () => {
    it('should normalize https URL (may add trailing slash)', () => {
        const result = normalizeHttpUrl('https://example.com');
        expect(result).toMatch(/^https:\/\/example\.com\/?$/);
    });

    it('should normalize http URL (may add trailing slash)', () => {
        const result = normalizeHttpUrl('http://example.com');
        expect(result).toMatch(/^http:\/\/example\.com\/?$/);
    });

    it('should add https:// to URL without protocol', () => {
        const result = normalizeHttpUrl('example.com');
        expect(result).toMatch(/^https:\/\/example\.com\/?$/);
    });

    it('should add https:// to URL with www', () => {
        const result = normalizeHttpUrl('www.example.com');
        expect(result).toMatch(/^https:\/\/www\.example\.com\/?$/);
    });

    it('should handle URL with path', () => {
        expect(normalizeHttpUrl('example.com/path')).toBe('https://example.com/path');
    });

    it('should handle URL with port', () => {
        const result = normalizeHttpUrl('example.com:8080');
        expect(result).toMatch(/^https:\/\/example\.com:8080\/?$/);
    });

    it('should throw for empty string', () => {
        expect(() => normalizeHttpUrl('')).toThrow();
    });

    it('should throw for invalid hostname', () => {
        expect(() => normalizeHttpUrl('not a url')).toThrow();
    });

    it('should handle localhost', () => {
        const result = normalizeHttpUrl('localhost:3000');
        expect(result).toMatch(/^https:\/\/localhost:3000\/?$/);
    });

    it('should handle IP address', () => {
        const result = normalizeHttpUrl('192.168.1.1');
        expect(result).toMatch(/^https:\/\/192\.168\.1\.1\/?$/);
    });
});
