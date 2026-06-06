import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CimeClient } from '../src/client';
import type { CimeDonationEventData } from '../src/types';
import { renderChatEmojisToHTML } from '../src/utils/chatUtils';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockPatch = vi.fn();

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({
            get: mockGet,
            post: mockPost,
            put: mockPut,
            delete: mockDelete,
            patch: mockPatch,
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
            defaults: { headers: {} },
        })),
    },
}));

vi.mock('axios-retry', () => ({ default: vi.fn() }));

describe('Cime SDK', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('CimeClient', () => {
        it('requires either accessToken or clientId/clientSecret.', () => {
            // @ts-expect-error Runtime validation is the behavior under test.
            expect(() => new CimeClient({})).toThrowError(/Authentication credentials/);
        });

        it('initializes every API module with an access token.', () => {
            const client = new CimeClient({ accessToken: 'token' });

            expect(client.auth).toBeDefined();
            expect(client.users).toBeDefined();
            expect(client.channels).toBeDefined();
            expect(client.live).toBeDefined();
            expect(client.chat).toBeDefined();
            expect(client.categories).toBeDefined();
            expect(client.restrict).toBeDefined();
            expect(client.sessions).toBeDefined();
            expect(client.drops).toBeDefined();
        });

        it('initializes with client credentials only.', () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });

            expect(client.auth).toBeDefined();
            expect(client.channels).toBeDefined();
            expect(client.drops).toBeDefined();
        });

        it('authorize() exchanges code and updates SDK scopes.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });

            mockPost.mockResolvedValueOnce({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
                expiresIn: 3600,
                tokenType: 'Bearer',
                scope: 'WRITE:LIVE_CHAT READ:USER',
            });
            mockPost.mockResolvedValueOnce({ messageId: 'message-id' });

            const token = await client.authorize('auth-code');
            const message = await client.chat.sendMessage({ message: 'hello', senderType: 'APP' });

            expect(mockPost).toHaveBeenNthCalledWith(1, '/auth/v1/token', {
                grantType: 'authorization_code',
                clientId: 'id',
                clientSecret: 'secret',
                code: 'auth-code',
            });
            expect(mockPost).toHaveBeenNthCalledWith(2, '/open/v1/chats/send', {
                message: 'hello',
                senderType: 'APP',
            });
            expect(token.accessToken).toBe('new-access-token');
            expect(message).toEqual({ messageId: 'message-id' });
        });
    });

    describe('auth', () => {
        it('get() calls the token endpoint with authorization_code grant.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            mockPost.mockResolvedValueOnce({ accessToken: 'token' });

            const result = await client.auth.get('code');

            expect(mockPost).toHaveBeenCalledWith('/auth/v1/token', {
                grantType: 'authorization_code',
                clientId: 'id',
                clientSecret: 'secret',
                code: 'code',
            });
            expect(result).toEqual({ accessToken: 'token' });
        });

        it('refresh() calls the token endpoint with refresh_token grant.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            mockPost.mockResolvedValueOnce({ accessToken: 'next-token' });

            const result = await client.auth.refresh('refresh-token');

            expect(mockPost).toHaveBeenCalledWith('/auth/v1/token', {
                grantType: 'refresh_token',
                clientId: 'id',
                clientSecret: 'secret',
                refreshToken: 'refresh-token',
            });
            expect(result).toEqual({ accessToken: 'next-token' });
        });

        it('fails fast when OAuth client credentials are missing.', async () => {
            const client = new CimeClient({ accessToken: 'token' });

            await expect(client.auth.get('code')).rejects.toThrow(/clientId.*clientSecret/);
            expect(mockPost).not.toHaveBeenCalled();
        });
    });

    describe('users', () => {
        it('requires READ:USER before sending a request.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: [] });

            await expect(client.users.get()).rejects.toThrow(/\[UsersAPI\] "READ:USER"/);
            expect(mockGet).not.toHaveBeenCalled();
        });

        it('gets the current user.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: ['READ:USER'] });
            mockGet.mockResolvedValueOnce({ channelId: 'channel-id', channelName: 'name' });

            const user = await client.users.get();

            expect(mockGet).toHaveBeenCalledWith('/open/v1/users/me');
            expect(user).toEqual({ channelId: 'channel-id', channelName: 'name' });
        });
    });

    describe('channels', () => {
        it('converts channel ID arrays into comma-separated query params.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            mockGet.mockResolvedValueOnce({ data: [] });

            await client.channels.getChannels(['id1', 'id2', 'id3']);

            expect(mockGet).toHaveBeenCalledWith('/open/v1/channels', {
                params: { channelIds: 'id1,id2,id3' },
            });
        });

        it('gets followers with READ:CHANNEL.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: ['READ:CHANNEL'] });
            mockGet.mockResolvedValueOnce({ data: [] });

            await client.channels.getFollowers({ page: 1, size: 20 });

            expect(mockGet).toHaveBeenCalledWith('/open/v1/channels/followers', {
                params: { page: 1, size: 20 },
            });
        });

        it('gets subscribers with READ:SUBSCRIPTION.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: ['READ:SUBSCRIPTION'] });
            mockGet.mockResolvedValueOnce({ data: [] });

            await client.channels.getSubscribers({ page: 0, size: 30, sort: 'RECENT' });

            expect(mockGet).toHaveBeenCalledWith('/open/v1/channels/subscribers', {
                params: { page: 0, size: 30, sort: 'RECENT' },
            });
        });

        it('gets channel managers with READ:CHANNEL.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: ['READ:CHANNEL'] });
            mockGet.mockResolvedValueOnce({ data: [] });

            await client.channels.getManagers();

            expect(mockGet).toHaveBeenCalledWith('/open/v1/channels/streaming-roles');
        });
    });

    describe('live', () => {
        it('gets public live list.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            mockGet.mockResolvedValueOnce({ data: [], page: { next: null } });

            await client.live.getLives({ size: 10, next: 'cursor' });

            expect(mockGet).toHaveBeenCalledWith('/open/v1/lives', {
                params: { size: 10, next: 'cursor' },
            });
        });

        it('gets and updates live settings with the required scopes.', async () => {
            const client = new CimeClient({
                accessToken: 'token',
                scopes: ['READ:LIVE_STREAM_SETTINGS', 'WRITE:LIVE_STREAM_SETTINGS'],
            });
            mockGet.mockResolvedValueOnce({ defaultLiveTitle: 'title', category: null, tags: [] });
            mockPatch.mockResolvedValueOnce(undefined);

            await client.live.getSettings();
            await client.live.updateSettings({ defaultLiveTitle: 'next title', categoryId: null });

            expect(mockGet).toHaveBeenCalledWith('/open/v1/lives/setting');
            expect(mockPatch).toHaveBeenCalledWith('/open/v1/lives/setting', {
                defaultLiveTitle: 'next title',
                categoryId: null,
            });
        });

        it('gets stream key with READ:LIVE_STREAM_KEY.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: ['READ:LIVE_STREAM_KEY'] });
            mockGet.mockResolvedValueOnce({ streamKey: 'stream-key' });

            await client.live.getStreamKey();

            expect(mockGet).toHaveBeenCalledWith('/open/v1/streams/key');
        });

        it('gets public live status by channel ID.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            mockGet.mockResolvedValueOnce({ isLive: true });

            await client.live.getLiveStatus('channel-id');

            expect(mockGet).toHaveBeenCalledWith('/v1/channel-id/live-status');
        });
    });

    describe('chat', () => {
        it('gets and updates chat settings with the required scopes.', async () => {
            const client = new CimeClient({
                accessToken: 'token',
                scopes: ['READ:LIVE_CHAT_SETTINGS', 'WRITE:LIVE_CHAT_SETTINGS'],
            });
            mockGet.mockResolvedValueOnce({ chatAllowedGroup: 'ALL' });
            mockPut.mockResolvedValueOnce(undefined);

            await client.chat.getSettings();
            await client.chat.updateSettings({ chatAllowedGroup: 'FOLLOWER', chatSlowModeSec: 5 });

            expect(mockGet).toHaveBeenCalledWith('/open/v1/chats/settings');
            expect(mockPut).toHaveBeenCalledWith('/open/v1/chats/settings', {
                chatAllowedGroup: 'FOLLOWER',
                chatSlowModeSec: 5,
            });
        });

        it('sends messages with senderType.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: ['WRITE:LIVE_CHAT'] });
            mockPost.mockResolvedValueOnce({ messageId: 'message-id' });

            const result = await client.chat.sendMessage({ message: 'hello', senderType: 'USER' });

            expect(mockPost).toHaveBeenCalledWith('/open/v1/chats/send', {
                message: 'hello',
                senderType: 'USER',
            });
            expect(result).toEqual({ messageId: 'message-id' });
        });

        it('requires message or messageId when registering notices.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: ['WRITE:LIVE_CHAT_NOTICE'] });

            await expect(client.chat.registerNotice({})).rejects.toThrow(
                /registerNotice requires either "message" or "messageId"/,
            );
            expect(mockPost).not.toHaveBeenCalled();
        });

        it('registers chat notice with a message.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: ['WRITE:LIVE_CHAT_NOTICE'] });
            mockPost.mockResolvedValueOnce(undefined);

            await client.chat.registerNotice({ message: 'notice' });

            expect(mockPost).toHaveBeenCalledWith('/open/v1/chats/notice', { message: 'notice' });
        });
    });

    describe('categories', () => {
        it('searches categories.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            mockGet.mockResolvedValueOnce({ data: [] });

            await client.categories.searchCategories({ keyword: 'game', size: 20 });

            expect(mockGet).toHaveBeenCalledWith('/open/v1/categories/search', {
                params: { keyword: 'game', size: 20 },
            });
        });
    });

    describe('restrict', () => {
        it('restricts and unrestricts users with WRITE:USER_BLOCK.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: ['WRITE:USER_BLOCK'] });
            mockPost.mockResolvedValueOnce(undefined);
            mockDelete.mockResolvedValueOnce(undefined);

            await client.restrict.restrictUser({ targetChannelId: 'target-id' });
            await client.restrict.unrestrictUser({ targetChannelId: 'target-id' });

            expect(mockPost).toHaveBeenCalledWith('/open/v1/restrict-channels', {
                targetChannelId: 'target-id',
            });
            expect(mockDelete).toHaveBeenCalledWith('/open/v1/restrict-channels', {
                data: { targetChannelId: 'target-id' },
            });
        });

        it('gets restricted users with READ:USER_BLOCK.', async () => {
            const client = new CimeClient({ accessToken: 'token', scopes: ['READ:USER_BLOCK'] });
            mockGet.mockResolvedValueOnce({ data: [], page: { next: null } });

            await client.restrict.getRestrictedUsers({ size: 20, next: 'cursor' });

            expect(mockGet).toHaveBeenCalledWith('/open/v1/restrict-channels', {
                params: { size: 20, next: 'cursor' },
            });
        });
    });

    describe('sessions', () => {
        it('creates USER and CLIENT sessions.', async () => {
            const client = new CimeClient({ accessToken: 'token' });
            mockGet.mockResolvedValueOnce({ url: 'wss://example.com?sessionKey=user' });
            mockGet.mockResolvedValueOnce({ url: 'wss://example.com?sessionKey=client' });

            await client.sessions.createSession('USER');
            await client.sessions.createSession('CLIENT');

            expect(mockGet).toHaveBeenNthCalledWith(1, '/open/v1/sessions/auth');
            expect(mockGet).toHaveBeenNthCalledWith(2, '/open/v1/sessions/auth/client');
        });

        it('subscribes and unsubscribes events with sessionKey.', async () => {
            const client = new CimeClient({ accessToken: 'token' });
            mockPost.mockResolvedValue(undefined);

            await client.sessions.subscribeEvent('donation', 'session-key');
            await client.sessions.unsubscribeEvent('donation', 'session-key');

            expect(mockPost).toHaveBeenNthCalledWith(1, '/open/v1/sessions/events/subscribe/donation', null, {
                params: { sessionKey: 'session-key' },
            });
            expect(mockPost).toHaveBeenNthCalledWith(2, '/open/v1/sessions/events/unsubscribe/donation', null, {
                params: { sessionKey: 'session-key' },
            });
        });
    });

    describe('drops', () => {
        it('gets campaigns and converts state arrays into comma-separated query params.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            mockGet.mockResolvedValueOnce({ data: [] });

            await client.drops.getCampaigns({ page: 1, size: 50, state: ['ACTIVE', 'CLAIMABLE'] });

            expect(mockGet).toHaveBeenCalledWith('/open/v1/drops/campaigns', {
                params: { page: 1, size: 50, state: 'ACTIVE,CLAIMABLE' },
            });
        });

        it('gets reward claims and converts claimId arrays into comma-separated query params.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            mockGet.mockResolvedValueOnce({ data: [] });

            await client.drops.getRewardClaims({
                claimId: ['123', '124'],
                fulfillmentState: 'CLAIMED',
                campaignId: 'campaign-id',
            });

            expect(mockGet).toHaveBeenCalledWith('/open/v1/drops/reward-claims', {
                params: {
                    claimId: '123,124',
                    fulfillmentState: 'CLAIMED',
                    campaignId: 'campaign-id',
                },
            });
        });

        it('updates reward claim fulfillment state.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            mockPut.mockResolvedValueOnce({ data: [{ status: 'SUCCESS', ids: ['123'] }] });

            const result = await client.drops.updateRewardClaims({
                claimIds: ['123'],
                fulfillmentState: 'FULFILLED',
            });

            expect(mockPut).toHaveBeenCalledWith('/open/v1/drops/reward-claims', {
                claimIds: ['123'],
                fulfillmentState: 'FULFILLED',
            });
            expect(result).toEqual({ data: [{ status: 'SUCCESS', ids: ['123'] }] });
        });
    });

    describe('event payload types', () => {
        it('supports CHEERING donation fields.', () => {
            const donation: CimeDonationEventData = {
                donationType: 'CHEERING',
                channelId: 'channel-id',
                donatorChannelId: 'donator-id',
                donatorNickname: 'nickname',
                donatorBadges: [{ id: 'badge-id', name: 'badge', imageUrl: 'https://example.com/badge.webp' }],
                payAmount: '80',
                donationText: '',
                emojis: {},
                cheeringItems: [
                    {
                        cnt: 3,
                        type: 'CONCERT_1',
                        skinType: 'CONCERT',
                        amount: 10,
                        imageUrl: 'https://example.com/item.webp',
                        overlayImageUrl: 'https://example.com/item-overlay.webp',
                    },
                ],
            };

            expect(donation.cheeringItems?.[0].type).toBe('CONCERT_1');
        });
    });

    describe('chatUtils', () => {
        it('returns messages without emoji tokens unchanged.', () => {
            const result = renderChatEmojisToHTML({ content: 'plain message', emojis: {} });

            expect(result).toBe('plain message');
        });

        it('replaces emoji tokens with img tags.', () => {
            const result = renderChatEmojisToHTML(
                {
                    content: 'hello :smile-token:',
                    emojis: { ':smile-token:': 'https://example.com/smile.webp' },
                },
                'custom-emoji',
            );

            expect(result).toBe(
                'hello <img src="https://example.com/smile.webp" alt=":smile-token:" class="custom-emoji" />',
            );
        });

        it('handles regex special characters in emoji tokens.', () => {
            const result = renderChatEmojisToHTML({
                content: 'special :$$complex-token$$: token',
                emojis: { ':$$complex-token$$:': 'https://example.com/complex.webp' },
            });

            expect(result).toContain(
                '<img src="https://example.com/complex.webp" alt=":$$complex-token$$:" class="cime-emoji" />',
            );
        });
    });
});
