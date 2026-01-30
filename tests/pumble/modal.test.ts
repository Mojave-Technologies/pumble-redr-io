import { buildShortUrlModal } from '../../src/pumble/modal';
import { DomainInfo } from '../../src/api/redr/redrApi';

// Suppress console.log in tests
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

// Helper to find block by blockId
const findBlock = (blocks: any[], blockId: string) => blocks.find((b: any) => b.blockId === blockId);
const findBlockByType = (blocks: any[], type: string) => blocks.find((b: any) => b.type === type);

describe('buildShortUrlModal', () => {
    const mockDomains: DomainInfo[] = [
        { id: 'domain1', url: 'https://rdr.im' },
        { id: 'domain2', url: 'https://rdr.ink' },
    ];

    describe('success view', () => {
        it('should return success view when shortUrl is provided', () => {
            const result = buildShortUrlModal({ shortUrl: 'https://rdr.im/abc123' });

            expect(result.type).toBe('MODAL');
            expect(result.title.text).toBe('Done!');
            expect(result.submit?.text).toBe('Close');
        });

        it('should display the short URL in success view', () => {
            const result = buildShortUrlModal({ shortUrl: 'https://rdr.im/abc123' });

            const sectionBlock = findBlockByType(result.blocks as any[], 'section') as any;
            expect(sectionBlock?.text?.text).toContain('https://rdr.im/abc123');
        });
    });

    describe('input form view', () => {
        it('should return input form when no shortUrl', () => {
            const result = buildShortUrlModal({});

            expect(result.type).toBe('MODAL');
            expect(result.title.text).toBe('Shorten URL');
            expect(result.close?.text).toBe('Close');
        });

        it('should include URL input field', () => {
            const result = buildShortUrlModal({});

            const urlInput = findBlock(result.blocks as any[], 'b_long_url') as any;
            expect(urlInput).toBeDefined();
            expect(urlInput?.type).toBe('input');
            expect(urlInput?.label?.text).toBe('URL');
        });

        it('should pre-fill URL when initialUrl is provided', () => {
            const result = buildShortUrlModal({ initialUrl: 'https://example.com' });

            const urlInput = findBlock(result.blocks as any[], 'b_long_url') as any;
            expect(urlInput?.element?.initial_value).toBe('https://example.com');
        });

        it('should show validation error on URL field', () => {
            const result = buildShortUrlModal({ 
                errors: { b_long_url: 'Invalid URL format' }
            });

            const urlInput = findBlock(result.blocks as any[], 'b_long_url') as any;
            expect(urlInput?.validationError).toBe('Invalid URL format');
        });

        it('should include domain dropdown when domains provided', () => {
            const result = buildShortUrlModal({ domains: mockDomains });

            const domainInput = findBlock(result.blocks as any[], 'b_domain') as any;
            expect(domainInput).toBeDefined();
            expect(domainInput?.label?.text).toBe('Domain');
        });

        it('should not include domain dropdown when no domains', () => {
            const result = buildShortUrlModal({ domains: [] });

            const domainInput = findBlock(result.blocks as any[], 'b_domain');
            expect(domainInput).toBeUndefined();
        });

        it('should format domain options correctly', () => {
            const result = buildShortUrlModal({ domains: mockDomains });

            const domainInput = findBlock(result.blocks as any[], 'b_domain') as any;
            const options = domainInput?.element?.options;

            expect(options).toHaveLength(2);
            expect(options[0].text.text).toBe('rdr.im'); // https:// stripped
            expect(options[0].value).toBe('domain1');
            expect(options[1].text.text).toBe('rdr.ink');
            expect(options[1].value).toBe('domain2');
        });

        it('should set first domain as initial option by default', () => {
            const result = buildShortUrlModal({ domains: mockDomains });

            const domainInput = findBlock(result.blocks as any[], 'b_domain') as any;
            expect(domainInput?.element?.initial_option?.value).toBe('domain1');
        });

        it('should use selectedDomainId when provided', () => {
            const result = buildShortUrlModal({ 
                domains: mockDomains, 
                selectedDomainId: 'domain2' 
            });

            const domainInput = findBlock(result.blocks as any[], 'b_domain') as any;
            expect(domainInput?.element?.initial_option?.value).toBe('domain2');
        });

        it('should include masking checkbox', () => {
            const result = buildShortUrlModal({});

            const maskedInput = findBlock(result.blocks as any[], 'b_masked') as any;
            expect(maskedInput).toBeDefined();
            expect(maskedInput?.optional).toBe(true);
        });

        it('should include expiration date picker', () => {
            const result = buildShortUrlModal({});

            const expiresInput = findBlock(result.blocks as any[], 'b_expires') as any;
            expect(expiresInput).toBeDefined();
            expect(expiresInput?.optional).toBe(true);
            expect(expiresInput?.element?.type).toBe('date_picker');
        });

        it('should include password field', () => {
            const result = buildShortUrlModal({});

            const passwordInput = findBlock(result.blocks as any[], 'b_password') as any;
            expect(passwordInput).toBeDefined();
            expect(passwordInput?.optional).toBe(true);
        });

        it('should show validation error on password field', () => {
            const result = buildShortUrlModal({ 
                errors: { b_password: 'Password too short' }
            });

            const passwordInput = findBlock(result.blocks as any[], 'b_password') as any;
            expect(passwordInput?.validationError).toBe('Password too short');
        });

        it('should include submit button', () => {
            const result = buildShortUrlModal({});

            const actionsBlock = findBlockByType(result.blocks as any[], 'actions') as any;
            const button = actionsBlock?.elements?.[0];
            
            expect(button?.type).toBe('button');
            expect(button?.text?.text).toBe('Shorten');
            expect(button?.style).toBe('primary');
        });

        it('should show loading state on button', () => {
            const result = buildShortUrlModal({ loading: true });

            const actionsBlock = findBlockByType(result.blocks as any[], 'actions') as any;
            const button = actionsBlock?.elements?.[0];
            
            expect(button?.text?.text).toBe('Shortening...');
            expect(button?.onAction).toBe('a_loading_noop');
        });
    });
});
