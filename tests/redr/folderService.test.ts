import { getFoldersUrl, getDomainsUrl } from '../../src/redr/folderService';

describe('folderService', () => {
    describe('getFoldersUrl', () => {
        it('should convert API URL to folders endpoint', () => {
            expect(getFoldersUrl('https://rdr.im/api/urls')).toBe('https://rdr.im/api/folders');
        });

        it('should handle URL without path', () => {
            expect(getFoldersUrl('https://rdr.im')).toBe('https://rdr.im/api/folders');
        });

        it('should strip query parameters', () => {
            expect(getFoldersUrl('https://rdr.im/api/urls?foo=bar')).toBe('https://rdr.im/api/folders');
        });

        it('should handle different base URLs', () => {
            expect(getFoldersUrl('https://api.example.com/v1/urls')).toBe('https://api.example.com/api/folders');
        });

        it('should handle http URLs', () => {
            expect(getFoldersUrl('http://localhost:3000/api/urls')).toBe('http://localhost:3000/api/folders');
        });
    });

    describe('getDomainsUrl', () => {
        it('should convert API URL to domains endpoint', () => {
            expect(getDomainsUrl('https://rdr.im/api/urls')).toBe('https://rdr.im/api/domains');
        });

        it('should handle URL without path', () => {
            expect(getDomainsUrl('https://rdr.im')).toBe('https://rdr.im/api/domains');
        });

        it('should strip query parameters', () => {
            expect(getDomainsUrl('https://rdr.im/api/urls?foo=bar')).toBe('https://rdr.im/api/domains');
        });

        it('should handle different base URLs', () => {
            expect(getDomainsUrl('https://api.example.com/v1/urls')).toBe('https://api.example.com/api/domains');
        });

        it('should handle http URLs', () => {
            expect(getDomainsUrl('http://localhost:3000/api/urls')).toBe('http://localhost:3000/api/domains');
        });
    });
});
