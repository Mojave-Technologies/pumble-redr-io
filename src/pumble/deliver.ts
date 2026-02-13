/**
 * Message delivery utility for Pumble.
 * Sends messages to channels or DMs based on context.
 */

import {
    SlashCommandContext,
    MessageShortcutContext,
    ViewActionContext,
} from 'pumble-sdk/lib/core/types/contexts';

type Ctx = SlashCommandContext | MessageShortcutContext | ViewActionContext;

/** Gets bot API client for sending messages */
async function resolveClient(ctx: Ctx, requestId?: string) {
    const userId = ctx.payload.userId;
    const client = await ctx.getBotClient();
    if (!client) {
        console.error('deliver: no bot client available', { requestId, userId });
        throw new Error('No bot client available');
    }

    return { client, userId };
}

/** Sends a message to channel (if provided) or DM to user */
export async function deliver(
    ctx: Ctx,
    text: string,
    channelId: string | undefined,
    requestId?: string
): Promise<void> {
    const { client, userId } = await resolveClient(ctx, requestId);

    if (channelId) {
        await client.v1.messages.postMessageToChannel(channelId, { text });
        return;
    }

    if (!userId) {
        console.error('deliver: missing userId for DM', { requestId, text });
        throw new Error('Missing userId for DM');
    }

    await client.v1.messages.dmUser(userId, { text });
}
