/**
 * Pumble app configuration and handlers.
 * Defines slash commands, shortcuts, modals, and event listeners.
 */

import 'dotenv/config';
import { App, JsonFileTokenStore } from 'pumble-sdk';
import {
    BlockInteractionContext,
    GlobalShortcutContext,
    MessageShortcutContext,
    OnMessageContext,
    SlashCommandContext,
    ViewActionContext,
} from 'pumble-sdk/lib/core/types/contexts';
import type { Request, Response } from 'express';
import { HttpClient } from './api/httpClient';
import { AppConfig } from './config/env';
import { FolderCache } from './cache/folderCache';
import { DomainCache } from './cache/domainCache';
import { extractFirstUrl, normalizeHttpUrl } from './utils/url';
import { runShortenFlow } from './redr/shortenFlow';
import { buildShortUrlModal } from './pumble/modal';
import { readCheckbox, readInput, readDatepicker, readStaticSelect, ModalViewState } from './pumble/stateReaders';
import { deliver } from './pumble/deliver';

type ModalFieldErrors = Record<string, string>;

/** Creates the Pumble app with all handlers configured */
export function createApp(config: AppConfig, folderCache: FolderCache, domainCache: DomainCache, client: HttpClient): App {
    const domains = domainCache.getDomains();
    const app: App = {
        tokenStore: new JsonFileTokenStore(config.pumbleTokenStorePath),
        welcomeMessage: 'Secure link shortening and sharing made simple. Sign up free at www.REDR.io.',
        offlineMessage: 'REDR URL Shortener is temporarily unavailable. Please try again later.',
        redirect: { enable: true },

        slashCommands: [
            {
                command: '/shorturl',
                description: 'Shorten a URL via REDR.io and post it to the channel',
                usageHint: '/shorturl <long_url>',
                handler: async (ctx: SlashCommandContext) => {
                    const text = String(ctx.payload.text || '').trim();
                    const channelId = ctx.payload.channelId;

                    if (!text) {
                        try {
                            await ctx.spawnModalView(buildShortUrlModal({ domains }));
                            await ctx.ack();
                        } catch {
                            await ctx.ack();
                            await ctx.say({ text: 'Failed to open modal. Try: /shorturl https://example.com' }, 'ephemeral');
                        }
                        return;
                    }

                    await ctx.ack();

                    const raw = extractFirstUrl(text) ?? text.split(/\s+/)[0];

                    let longUrl: string;
                    try {
                        longUrl = normalizeHttpUrl(raw);
                    } catch (error) {
                        await ctx.say({ text: `Invalid URL: ${getErrorMessage(error)}` }, 'ephemeral');
                        await ctx.spawnModalView(buildShortUrlModal({ initialUrl: raw, domains }));

                        return;
                    }

                    try {
                        await runShortenFlow({
                            config,
                            cache: folderCache,
                            client,
                            fields: { longUrl, masked: false },
                            onSuccess: (shortUrl, { requestId }) => deliver(ctx, shortUrl, channelId, requestId),
                        });
                    } catch (error) {
                        await ctx.say({ text: `REDR error: ${getErrorMessage(error)}` }, 'ephemeral');
                    }
                },
            },
        ],

        globalShortcuts: [
            {
                name: 'Shorten URL',
                description: 'Open URL shortener',
                handler: async (ctx: GlobalShortcutContext) => {
                    await ctx.spawnModalView(buildShortUrlModal({ domains }));
                    await ctx.ack();
                },
            },
        ],

        messageShortcuts: [
            {
                name: 'Shorten from message',
                description: 'Shorten URL found in a message',
                handler: async (ctx: MessageShortcutContext) => {
                    await ctx.ack();

                    const channelId = ctx.payload.channelId;

                    const message = await ctx.fetchMessage();
                    const messageText = message?.text;

                    if (!messageText) {
                        await ctx.say({ text: 'No URL found in the selected message.' }, 'ephemeral');
                        return;
                    }

                    const raw = extractFirstUrl(messageText);
                    if (!raw) {
                        await ctx.say({
                            text: 'No URL found. Select a message that contains a link, or use /shorturl <link>.',
                        }, 'ephemeral');
                        return;
                    }

                    let longUrl: string;
                    try {
                        longUrl = normalizeHttpUrl(raw);
                    } catch (error) {
                        await ctx.say({ text: `Invalid URL in message: ${getErrorMessage(error)}` }, 'ephemeral');
                        return;
                    }

                    try {
                        await runShortenFlow({
                            config,
                            cache: folderCache,
                            client,
                            fields: { longUrl, masked: false },
                            onSuccess: (shortUrl, { requestId }) => deliver(ctx, shortUrl, channelId, requestId),
                        });
                    } catch (error) {
                        await ctx.say({ text: `REDR error: ${getErrorMessage(error)}` }, 'ephemeral');
                    }
                },
            },
        ],
        blockInteraction: {
            interactions: [
                {
                    sourceType: 'VIEW',
                    handlers: {
                        a_shorten_submit: async (ctx: BlockInteractionContext<'VIEW'>) => {
                            const state = ctx.payload.view?.state;
                            const channelId = ctx.payload.channelId;
                            const viewId = ctx.viewId;
                            const initialUrl = readInput(state, 'b_long_url', 'a_long_url') || undefined;
                            const selectedDomainId = readStaticSelect(state, 'b_domain', 'a_domain') || domains[0]?.id;

                            const { fields, errors } = validateShortUrlModalState(state);

                            if (errors) {
                                const updatedView = buildShortUrlModal({ initialUrl, errors, domains, selectedDomainId });
                                updatedView.id = viewId;
                                await ctx.updateView(updatedView);
                                return;
                            }

                            try {
                                await runShortenFlow({
                                    config,
                                    cache: folderCache,
                                    client,
                                    fields: fields!,
                                    domainId: selectedDomainId,
                                    onSuccess: async (shortUrl) => {
                                        const botClient = await ctx.getBotClient();
                                        if (botClient && channelId) {
                                            await botClient.v1.messages.postMessageToChannel(channelId, {
                                                text: `${shortUrl}`,
                                            });
                                        }

                                        const successView = buildShortUrlModal({ shortUrl });
                                        successView.id = viewId;
                                        await ctx.updateView(successView);
                                    },
                                });
                            } catch (error) {
                                const botClient = await ctx.getBotClient();
                                if (botClient && channelId) {
                                    await botClient.v1.messages.postEphemeral(
                                        channelId,
                                        { text: `REDR error: ${getErrorMessage(error)}` },
                                        ctx.payload.userId
                                    );
                                }
                            }
                        },
                    },
                },
            ],
        },

        viewAction: {
            onSubmit: {
                shorturl_modal: async (ctx: ViewActionContext) => {
                    await ctx.ack();
                },
            },
            onClose: {
                shorturl_modal: async (ctx: ViewActionContext) => {
                    await ctx.ack();
                },
            },
        },

        events: [
            {
                name: 'NEW_MESSAGE' as const,
                options: {
                    match: /https?:\/\/[^\s]+/,
                    includeBotMessages: false,
                },
                handler: async (ctx: OnMessageContext) => {
                    const text = ctx.payload.body.tx;

                    const raw = extractFirstUrl(text);
                    if (!raw) return;

                    let longUrl: string;
                    try {
                        longUrl = normalizeHttpUrl(raw);
                    } catch {
                        return;
                    }

                    try {
                        await runShortenFlow({
                            config,
                            cache: folderCache,
                            client,
                            fields: { longUrl, masked: false },
                            onSuccess: async (shortUrl) => {
                                await ctx.say({ text: `${shortUrl}` }, 'in_channel', true);
                            },
                        });
                    } catch (error) {
                        console.error('Auto-shorten error:', error);
                    }
                },
            },
        ],
        eventsPath: '/hook',

        // Health check endpoint for ALB
        onServerConfiguring: (expressApp) => {
            expressApp.get('/health', (_req: Request, res: Response) => {
                res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
            });
        },
    };

    return app;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        // Make API errors more user-friendly
        if (error.name === 'ApiError' && error.message.includes('HTTP 500')) {
            return 'REDR service is temporarily unavailable. Please try again later.';
        }
        if (error.name === 'ApiError' && error.message.includes('HTTP 4')) {
            return 'Invalid request. Please check your URL and try again.';
        }
        if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
            return 'Could not connect to REDR service. Please try again later.';
        }
        return error.message;
    }
    if (typeof error === 'string') return error;
    return 'Unknown error occurred.';
}

function validateShortUrlModalState(state: ModalViewState): {
    fields?: { longUrl: string; masked: boolean; expiresAt?: string; password?: string };
    errors?: ModalFieldErrors;
} {
    const errors: ModalFieldErrors = {};
    const setError = (blockId: string, message: string) => {
        errors[blockId] = message;
    };

    const longUrlRaw = (readInput(state, 'b_long_url', 'a_long_url') || '').trim();
    if (!longUrlRaw) {
        setError('b_long_url', 'URL is required.');
    }

    let longUrl: string | undefined;
    if (longUrlRaw) {
        try {
            longUrl = normalizeHttpUrl(longUrlRaw);
        } catch (e) {
            setError('b_long_url', `Invalid URL: ${getErrorMessage(e)}`);
        }
    }

    const masked = readCheckbox(state, 'b_masked', 'a_masked');
    const expiresAt = readDatepicker(state, 'b_expires', 'a_expires');

    const passwordRaw = (readInput(state, 'b_password', 'a_password') || '').trim();
    const password = passwordRaw ? passwordRaw : undefined;

    if (password) {
        if (password.length < 3) setError('b_password', 'Password must be at least 3 characters.');
        if (password.length > 64) setError('b_password', 'Password must be at most 64 characters.');
        if (/\s/.test(password)) setError('b_password', 'Password cannot contain spaces.');
    }

    if (Object.keys(errors).length > 0) return { errors };

    return {
        fields: {
            longUrl: longUrl!,
            masked,
            expiresAt,
            password,
        },
    };
}
