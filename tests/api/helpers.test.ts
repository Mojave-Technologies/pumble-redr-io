import { ApiError, NetworkError, TimeoutError, ValidationError, assertOkResponse, normalizeLowerTrim } from '../../src/api/helpers';

describe('Error classes', () => {
    describe('NetworkError', () => {
        it('should create error with message and code', () => {
            const error = new NetworkError('Connection failed', 'ECONNREFUSED');
            expect(error.message).toBe('Connection failed');
            expect(error.code).toBe('ECONNREFUSED');
            expect(error.name).toBe('NetworkError');
        });

        it('should create error without code', () => {
            const error = new NetworkError('Connection failed');
            expect(error.message).toBe('Connection failed');
            expect(error.code).toBeUndefined();
        });
    });

    describe('TimeoutError', () => {
        it('should extend NetworkError', () => {
            const error = new TimeoutError('Request timed out', 'ETIMEDOUT');
            expect(error).toBeInstanceOf(NetworkError);
            expect(error.name).toBe('TimeoutError');
        });
    });

    describe('ApiError', () => {
        it('should create error with status and context', () => {
            const error = new ApiError(500, 'HTTP', '{"message":"Server Error"}');
            expect(error.status).toBe(500);
            expect(error.contextLabel).toBe('HTTP');
            expect(error.bodySnippet).toBe('{"message":"Server Error"}');
            expect(error.message).toBe('REDR HTTP HTTP 500');
        });

        it('should handle different status codes', () => {
            const error404 = new ApiError(404, 'folders', 'Not found');
            expect(error404.status).toBe(404);
            expect(error404.message).toBe('REDR folders HTTP 404');
        });
    });

    describe('ValidationError', () => {
        it('should create error with reason only', () => {
            const error = new ValidationError('Missing field');
            expect(error.message).toBe('Missing field');
            expect(error.reason).toBe('Missing field');
            expect(error.details).toBeUndefined();
        });

        it('should create error with reason and details', () => {
            const error = new ValidationError('Invalid response', 'id field missing');
            expect(error.message).toBe('Invalid response: id field missing');
            expect(error.reason).toBe('Invalid response');
            expect(error.details).toBe('id field missing');
        });
    });
});

describe('assertOkResponse', () => {
    it('should not throw for 200 status', () => {
        const response = { status: 200, data: {} } as any;
        expect(() => assertOkResponse(response, 'test')).not.toThrow();
    });

    it('should not throw for 201 status', () => {
        const response = { status: 201, data: {} } as any;
        expect(() => assertOkResponse(response, 'test')).not.toThrow();
    });

    it('should throw ApiError for 400 status', () => {
        const response = { status: 400, data: { error: 'Bad request' } } as any;
        expect(() => assertOkResponse(response, 'test')).toThrow(ApiError);
    });

    it('should throw ApiError for 500 status', () => {
        const response = { status: 500, data: { message: 'Server Error' } } as any;
        expect(() => assertOkResponse(response, 'test')).toThrow(ApiError);
    });

    it('should throw ApiError for 302 redirect', () => {
        const response = { status: 302, data: '<html>Redirect</html>' } as any;
        expect(() => assertOkResponse(response, 'test')).toThrow(ApiError);
    });

    it('should include context label in error', () => {
        const response = { status: 404, data: {} } as any;
        try {
            assertOkResponse(response, 'folders');
            fail('Should have thrown');
        } catch (e) {
            expect((e as ApiError).contextLabel).toBe('folders');
        }
    });
});

describe('normalizeLowerTrim', () => {
    it('should lowercase and trim string', () => {
        expect(normalizeLowerTrim('  Hello World  ')).toBe('hello world');
    });

    it('should handle empty string', () => {
        expect(normalizeLowerTrim('')).toBe('');
    });

    it('should handle null', () => {
        expect(normalizeLowerTrim(null)).toBe('');
    });

    it('should handle undefined', () => {
        expect(normalizeLowerTrim(undefined)).toBe('');
    });

    it('should handle already lowercase string', () => {
        expect(normalizeLowerTrim('hello')).toBe('hello');
    });
});
