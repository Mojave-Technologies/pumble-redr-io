/**
 * Modal view builder for URL shortening.
 * Creates input form or success view based on state.
 */

import { V1 } from 'pumble-sdk';
import { DomainInfo } from '../api/redr/redrApi';

type ModalErrors = Record<string, string>;

interface ShortUrlModalParams {
    initialUrl?: string;      // Pre-fill URL input
    errors?: ModalErrors;     // Field validation errors
    shortUrl?: string;        // When set, shows success view
    loading?: boolean;        // Show loading state on button
    domains?: DomainInfo[];   // Available domains for dropdown
    selectedDomainId?: string;
}

/**
 * Builds the URL shortening modal.
 * Returns success view if shortUrl is provided, otherwise returns input form.
 */
export function buildShortUrlModal({ initialUrl, errors, shortUrl, loading, domains, selectedDomainId }: ShortUrlModalParams): V1.View<'MODAL'> {
    if (shortUrl) {
        return {
            type: 'MODAL',
            callbackId: 'shorturl_modal',
            title: { type: 'plain_text', text: 'Done!' },
            submit: { type: 'plain_text', text: 'Close' },
            notifyOnClose: false,
            blocks: [
                {
                    type: 'section',
                    text: { type: 'plain_text', text: `Your shortened URL:\n\n${shortUrl}` },
                },
            ],
        };
    }

    const domainOptions = (domains || []).map(d => ({
        text: { type: 'plain_text' as const, text: d.url.replace('https://', '') },
        value: d.id,
    }));

    const defaultDomainId = selectedDomainId || domains?.[0]?.id;

    return {
        type: 'MODAL',
        callbackId: 'shorturl_modal',
        title: { type: 'plain_text', text: 'Shorten URL' },
        close: { type: 'plain_text', text: 'Close' },
        notifyOnClose: false,
        blocks: [
            {
                type: 'input',
                blockId: 'b_long_url',
                label: { type: 'plain_text', text: 'URL' },
                validationError: errors?.b_long_url,
                element: {
                    type: 'plain_text_input',
                    onAction: 'a_long_url',
                    initial_value: initialUrl || '',
                    placeholder: { type: 'plain_text', text: 'https://example.com' },
                },
            },
            ...(domainOptions.length > 0 ? [{
                type: 'input' as const,
                blockId: 'b_domain',
                label: { type: 'plain_text' as const, text: 'Domain' },
                element: {
                    type: 'static_select_menu' as const,
                    onAction: 'a_domain',
                    placeholder: { type: 'plain_text' as const, text: 'Select domain' },
                    options: domainOptions,
                    ...(defaultDomainId ? { initial_option: domainOptions.find(o => o.value === defaultDomainId) } : {}),
                },
            }] : []),
            {
                type: 'input',
                blockId: 'b_masked',
                optional: true,
                label: { type: 'plain_text', text: 'Enable link masking' },
                element: {
                    type: 'checkboxes',
                    onAction: 'a_masked',
                    options: [
                        {
                            text: { type: 'plain_text', text: 'Hide link destination from visitors' },
                            value: 'true',
                        },
                    ],
                },
            },
            {
                type: 'input',
                blockId: 'b_expires',
                optional: true,
                label: { type: 'plain_text', text: 'Expiration (optional)' },
                element: {
                    type: 'date_picker',
                    onAction: 'a_expires',
                    placeholder: { type: 'plain_text', text: 'Select expiration date' },
                },
            },
            {
                type: 'input',
                blockId: 'b_password',
                optional: true,
                label: { type: 'plain_text', text: 'Password (optional)' },
                validationError: errors?.b_password,
                element: {
                    type: 'plain_text_input',
                    onAction: 'a_password',
                    placeholder: { type: 'plain_text', text: 'password' },
                },
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        onAction: loading ? 'a_loading_noop' : 'a_shorten_submit',
                        text: { type: 'plain_text', text: loading ? 'Shortening...' : 'Shorten' },
                        style: 'primary',
                    },
                ],
            },
        ],
    };
}
