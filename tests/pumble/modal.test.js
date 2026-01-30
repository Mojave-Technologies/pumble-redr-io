"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modal_1 = require("../../src/pumble/modal");
// Suppress console.log in tests
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
});
afterAll(() => {
    jest.restoreAllMocks();
});
// Helper to find block by blockId
const findBlock = (blocks, blockId) => blocks.find((b) => b.blockId === blockId);
const findBlockByType = (blocks, type) => blocks.find((b) => b.type === type);
describe('buildShortUrlModal', () => {
    const mockDomains = [
        { id: 'domain1', url: 'https://rdr.im' },
        { id: 'domain2', url: 'https://rdr.ink' },
    ];
    describe('success view', () => {
        it('should return success view when shortUrl is provided', () => {
            var _a;
            const result = (0, modal_1.buildShortUrlModal)({ shortUrl: 'https://rdr.im/abc123' });
            expect(result.type).toBe('MODAL');
            expect(result.title.text).toBe('Done!');
            expect((_a = result.submit) === null || _a === void 0 ? void 0 : _a.text).toBe('Close');
        });
        it('should display the short URL in success view', () => {
            var _a;
            const result = (0, modal_1.buildShortUrlModal)({ shortUrl: 'https://rdr.im/abc123' });
            const sectionBlock = findBlockByType(result.blocks, 'section');
            expect((_a = sectionBlock === null || sectionBlock === void 0 ? void 0 : sectionBlock.text) === null || _a === void 0 ? void 0 : _a.text).toContain('https://rdr.im/abc123');
        });
    });
    describe('input form view', () => {
        it('should return input form when no shortUrl', () => {
            var _a;
            const result = (0, modal_1.buildShortUrlModal)({});
            expect(result.type).toBe('MODAL');
            expect(result.title.text).toBe('Shorten URL');
            expect((_a = result.close) === null || _a === void 0 ? void 0 : _a.text).toBe('Close');
        });
        it('should include URL input field', () => {
            var _a;
            const result = (0, modal_1.buildShortUrlModal)({});
            const urlInput = findBlock(result.blocks, 'b_long_url');
            expect(urlInput).toBeDefined();
            expect(urlInput === null || urlInput === void 0 ? void 0 : urlInput.type).toBe('input');
            expect((_a = urlInput === null || urlInput === void 0 ? void 0 : urlInput.label) === null || _a === void 0 ? void 0 : _a.text).toBe('URL');
        });
        it('should pre-fill URL when initialUrl is provided', () => {
            var _a;
            const result = (0, modal_1.buildShortUrlModal)({ initialUrl: 'https://example.com' });
            const urlInput = findBlock(result.blocks, 'b_long_url');
            expect((_a = urlInput === null || urlInput === void 0 ? void 0 : urlInput.element) === null || _a === void 0 ? void 0 : _a.initial_value).toBe('https://example.com');
        });
        it('should show validation error on URL field', () => {
            const result = (0, modal_1.buildShortUrlModal)({
                errors: { b_long_url: 'Invalid URL format' }
            });
            const urlInput = findBlock(result.blocks, 'b_long_url');
            expect(urlInput === null || urlInput === void 0 ? void 0 : urlInput.validationError).toBe('Invalid URL format');
        });
        it('should include domain dropdown when domains provided', () => {
            var _a;
            const result = (0, modal_1.buildShortUrlModal)({ domains: mockDomains });
            const domainInput = findBlock(result.blocks, 'b_domain');
            expect(domainInput).toBeDefined();
            expect((_a = domainInput === null || domainInput === void 0 ? void 0 : domainInput.label) === null || _a === void 0 ? void 0 : _a.text).toBe('Domain');
        });
        it('should not include domain dropdown when no domains', () => {
            const result = (0, modal_1.buildShortUrlModal)({ domains: [] });
            const domainInput = findBlock(result.blocks, 'b_domain');
            expect(domainInput).toBeUndefined();
        });
        it('should format domain options correctly', () => {
            var _a;
            const result = (0, modal_1.buildShortUrlModal)({ domains: mockDomains });
            const domainInput = findBlock(result.blocks, 'b_domain');
            const options = (_a = domainInput === null || domainInput === void 0 ? void 0 : domainInput.element) === null || _a === void 0 ? void 0 : _a.options;
            expect(options).toHaveLength(2);
            expect(options[0].text.text).toBe('rdr.im'); // https:// stripped
            expect(options[0].value).toBe('domain1');
            expect(options[1].text.text).toBe('rdr.ink');
            expect(options[1].value).toBe('domain2');
        });
        it('should set first domain as initial option by default', () => {
            var _a, _b;
            const result = (0, modal_1.buildShortUrlModal)({ domains: mockDomains });
            const domainInput = findBlock(result.blocks, 'b_domain');
            expect((_b = (_a = domainInput === null || domainInput === void 0 ? void 0 : domainInput.element) === null || _a === void 0 ? void 0 : _a.initial_option) === null || _b === void 0 ? void 0 : _b.value).toBe('domain1');
        });
        it('should use selectedDomainId when provided', () => {
            var _a, _b;
            const result = (0, modal_1.buildShortUrlModal)({
                domains: mockDomains,
                selectedDomainId: 'domain2'
            });
            const domainInput = findBlock(result.blocks, 'b_domain');
            expect((_b = (_a = domainInput === null || domainInput === void 0 ? void 0 : domainInput.element) === null || _a === void 0 ? void 0 : _a.initial_option) === null || _b === void 0 ? void 0 : _b.value).toBe('domain2');
        });
        it('should include masking checkbox', () => {
            const result = (0, modal_1.buildShortUrlModal)({});
            const maskedInput = findBlock(result.blocks, 'b_masked');
            expect(maskedInput).toBeDefined();
            expect(maskedInput === null || maskedInput === void 0 ? void 0 : maskedInput.optional).toBe(true);
        });
        it('should include expiration date picker', () => {
            var _a;
            const result = (0, modal_1.buildShortUrlModal)({});
            const expiresInput = findBlock(result.blocks, 'b_expires');
            expect(expiresInput).toBeDefined();
            expect(expiresInput === null || expiresInput === void 0 ? void 0 : expiresInput.optional).toBe(true);
            expect((_a = expiresInput === null || expiresInput === void 0 ? void 0 : expiresInput.element) === null || _a === void 0 ? void 0 : _a.type).toBe('date_picker');
        });
        it('should include password field', () => {
            const result = (0, modal_1.buildShortUrlModal)({});
            const passwordInput = findBlock(result.blocks, 'b_password');
            expect(passwordInput).toBeDefined();
            expect(passwordInput === null || passwordInput === void 0 ? void 0 : passwordInput.optional).toBe(true);
        });
        it('should show validation error on password field', () => {
            const result = (0, modal_1.buildShortUrlModal)({
                errors: { b_password: 'Password too short' }
            });
            const passwordInput = findBlock(result.blocks, 'b_password');
            expect(passwordInput === null || passwordInput === void 0 ? void 0 : passwordInput.validationError).toBe('Password too short');
        });
        it('should include submit button', () => {
            var _a, _b;
            const result = (0, modal_1.buildShortUrlModal)({});
            const actionsBlock = findBlockByType(result.blocks, 'actions');
            const button = (_a = actionsBlock === null || actionsBlock === void 0 ? void 0 : actionsBlock.elements) === null || _a === void 0 ? void 0 : _a[0];
            expect(button === null || button === void 0 ? void 0 : button.type).toBe('button');
            expect((_b = button === null || button === void 0 ? void 0 : button.text) === null || _b === void 0 ? void 0 : _b.text).toBe('Shorten');
            expect(button === null || button === void 0 ? void 0 : button.style).toBe('primary');
        });
        it('should show loading state on button', () => {
            var _a, _b;
            const result = (0, modal_1.buildShortUrlModal)({ loading: true });
            const actionsBlock = findBlockByType(result.blocks, 'actions');
            const button = (_a = actionsBlock === null || actionsBlock === void 0 ? void 0 : actionsBlock.elements) === null || _a === void 0 ? void 0 : _a[0];
            expect((_b = button === null || button === void 0 ? void 0 : button.text) === null || _b === void 0 ? void 0 : _b.text).toBe('Shortening...');
            expect(button === null || button === void 0 ? void 0 : button.onAction).toBe('a_loading_noop');
        });
    });
});
