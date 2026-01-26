/**
 * URL extraction and validation utilities.
 */

import LinkifyIt from 'linkify-it';

const linkify = new LinkifyIt();

const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;
const NUMERIC_ONLY_PATTERN = /^\d+$/;

function isIpv4(hostname: string): boolean {
    return IPV4_PATTERN.test(hostname);
}

function isIpv6(hostname: string): boolean {
    return hostname.includes(':');
}

/** Extracts the first valid URL from text, stripping trailing punctuation */
export function extractFirstUrl(text: string): string | undefined {
    if (!text) return undefined;

    const matches = linkify.match(text);
    const url = matches?.[0]?.url;

    if (!url) return undefined;

    return url.replace(/[)\],.!?;:]+$/g, '');
}

/**
 * Normalizes and validates a URL string.
 * - Adds https:// if no scheme present
 * - Validates http/https protocol only
 * - Validates hostname (localhost, IP, or domain with dot)
 * - Throws descriptive errors for invalid URLs
 */
export function normalizeHttpUrl(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) {
        throw new Error('URL is required.');
    }

    const hasScheme = SCHEME_PATTERN.test(trimmed);
    const withScheme = hasScheme ? trimmed : `https://${trimmed}`;

    let url: URL;
    try {
        url = new URL(withScheme);
    } catch {
        throw new Error('Invalid URL.');
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Only http/https URLs are allowed.');
    }

    const hostname = url.hostname;
    if (!hostname) {
        throw new Error('Invalid URL hostname.');
    }

    const isLocalhost = hostname === 'localhost';
    const isIp4 = isIpv4(hostname);
    const isIp6 = isIpv6(hostname);
    const isDomain = hostname.includes('.');

    if (!(isLocalhost || isIp4 || isIp6 || isDomain)) {
        throw new Error('Enter a full domain like example.com (or an IP/localhost).');
    }

    if (NUMERIC_ONLY_PATTERN.test(hostname) && !isIp4) {
        throw new Error('Invalid URL host.');
    }

    return url.toString();
}
