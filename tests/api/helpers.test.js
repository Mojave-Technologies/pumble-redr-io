"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../src/api/helpers");
describe('Error classes', () => {
    describe('NetworkError', () => {
        it('should create error with message and code', () => {
            const error = new helpers_1.NetworkError('Connection failed', 'ECONNREFUSED');
            expect(error.message).toBe('Connection failed');
            expect(error.code).toBe('ECONNREFUSED');
            expect(error.name).toBe('NetworkError');
        });
        it('should create error without code', () => {
            const error = new helpers_1.NetworkError('Connection failed');
            expect(error.message).toBe('Connection failed');
            expect(error.code).toBeUndefined();
        });
    });
    describe('TimeoutError', () => {
        it('should extend NetworkError', () => {
            const error = new helpers_1.TimeoutError('Request timed out', 'ETIMEDOUT');
            expect(error).toBeInstanceOf(helpers_1.NetworkError);
            expect(error.name).toBe('TimeoutError');
        });
    });
    describe('ApiError', () => {
        it('should create error with status and context', () => {
            const error = new helpers_1.ApiError(500, 'HTTP', '{"message":"Server Error"}');
            expect(error.status).toBe(500);
            expect(error.contextLabel).toBe('HTTP');
            expect(error.bodySnippet).toBe('{"message":"Server Error"}');
            expect(error.message).toBe('REDR HTTP HTTP 500');
        });
        it('should handle different status codes', () => {
            const error404 = new helpers_1.ApiError(404, 'folders', 'Not found');
            expect(error404.status).toBe(404);
            expect(error404.message).toBe('REDR folders HTTP 404');
        });
    });
    describe('ValidationError', () => {
        it('should create error with reason only', () => {
            const error = new helpers_1.ValidationError('Missing field');
            expect(error.message).toBe('Missing field');
            expect(error.reason).toBe('Missing field');
            expect(error.details).toBeUndefined();
        });
        it('should create error with reason and details', () => {
            const error = new helpers_1.ValidationError('Invalid response', 'id field missing');
            expect(error.message).toBe('Invalid response: id field missing');
            expect(error.reason).toBe('Invalid response');
            expect(error.details).toBe('id field missing');
        });
    });
});
describe('assertOkResponse', () => {
    it('should not throw for 200 status', () => {
        const response = { status: 200, data: {} };
        expect(() => (0, helpers_1.assertOkResponse)(response, 'test')).not.toThrow();
    });
    it('should not throw for 201 status', () => {
        const response = { status: 201, data: {} };
        expect(() => (0, helpers_1.assertOkResponse)(response, 'test')).not.toThrow();
    });
    it('should throw ApiError for 400 status', () => {
        const response = { status: 400, data: { error: 'Bad request' } };
        expect(() => (0, helpers_1.assertOkResponse)(response, 'test')).toThrow(helpers_1.ApiError);
    });
    it('should throw ApiError for 500 status', () => {
        const response = { status: 500, data: { message: 'Server Error' } };
        expect(() => (0, helpers_1.assertOkResponse)(response, 'test')).toThrow(helpers_1.ApiError);
    });
    it('should throw ApiError for 302 redirect', () => {
        const response = { status: 302, data: '<html>Redirect</html>' };
        expect(() => (0, helpers_1.assertOkResponse)(response, 'test')).toThrow(helpers_1.ApiError);
    });
    it('should include context label in error', () => {
        const response = { status: 404, data: {} };
        try {
            (0, helpers_1.assertOkResponse)(response, 'folders');
            fail('Should have thrown');
        }
        catch (e) {
            expect(e.contextLabel).toBe('folders');
        }
    });
});
describe('normalizeLowerTrim', () => {
    it('should lowercase and trim string', () => {
        expect((0, helpers_1.normalizeLowerTrim)('  Hello World  ')).toBe('hello world');
    });
    it('should handle empty string', () => {
        expect((0, helpers_1.normalizeLowerTrim)('')).toBe('');
    });
    it('should handle null', () => {
        expect((0, helpers_1.normalizeLowerTrim)(null)).toBe('');
    });
    it('should handle undefined', () => {
        expect((0, helpers_1.normalizeLowerTrim)(undefined)).toBe('');
    });
    it('should handle already lowercase string', () => {
        expect((0, helpers_1.normalizeLowerTrim)('hello')).toBe('hello');
    });
});
