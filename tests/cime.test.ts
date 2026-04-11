import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CimeClient } from '../src/client';
import { renderChatEmojisToHTML } from '../src/utils/chatUtils';

// ---------------------------------------------------------------------------
// 1. Axios 및 네트워크 모듈 모킹 (Mocking)
// ---------------------------------------------------------------------------
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockPatch = vi.fn();

vi.mock('axios', () => {
    return {
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
    };
});

vi.mock('axios-retry', () => ({ default: vi.fn() }));

// ---------------------------------------------------------------------------
// 2. 테스트 스위트 (Test Suites)
// ---------------------------------------------------------------------------
describe('Cime SDK - Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('1. CimeClient 초기화', () => {
        it('인증 정보(accessToken 또는 clientId/Secret)가 없으면 에러를 던져야 합니다.', () => {
            // @ts-ignore (런타임 에러 발생 유도)
            expect(() => new CimeClient({})).toThrowError(/Authentication credentials/);
        });

        it('accessToken으로 성공적으로 초기화되어야 합니다.', () => {
            const client = new CimeClient({ accessToken: 'test_token' });
            expect(client.users).toBeDefined();
            expect(client.live).toBeDefined();
            expect(client.restrict).toBeDefined();
        });

        it('clientId와 clientSecret만으로도 성공적으로 초기화되어야 합니다.', () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            expect(client.auth).toBeDefined();
        });
    });

    describe('2. 권한(Scope) 검증 로직', () => {
        it('필요한 Scope가 누락된 경우 서버로 요청을 보내기 전에 에러를 던져야 합니다.', async () => {
            // READ:USER 스코프가 없는 상태로 UsersAPI 호출
            const client = new CimeClient({ accessToken: 'test_token', scopes: [] });

            await expect(client.users.get()).rejects.toThrowError(
                /\[UsersAPI\] "READ:USER" 권한이 필요합니다/
            );
            
            // HTTP 요청이 발생하지 않았는지 검증 (Fail-fast)
            expect(mockGet).not.toHaveBeenCalled();
        });

        it('다른 모듈에서도 Scope 누락 시 동일하게 작동해야 합니다 (RestrictAPI).', async () => {
            const client = new CimeClient({ accessToken: 'test_token', scopes: ['READ:USER'] });

            // WRITE:USER_BLOCK 스코프가 없으므로 실패해야 함
            await expect(client.restrict.restrictUser({ targetChannelId: '123' })).rejects.toThrowError(
                /\[RestrictAPI\] "WRITE:USER_BLOCK" 권한이 필요합니다/
            );
        });

        it('적절한 Scope가 포함되어 있으면 정상적으로 API 요청을 수행해야 합니다.', async () => {
            const client = new CimeClient({ 
                accessToken: 'test_token', 
                scopes: ['READ:USER'] 
            });
            
            mockGet.mockResolvedValueOnce({ channelId: '12345', channelName: '테스트' });

            const result = await client.users.get();

            expect(mockGet).toHaveBeenCalledTimes(1);
            expect(mockGet).toHaveBeenCalledWith('/open/v1/users/me');
            expect(result).toEqual({ channelId: '12345', channelName: '테스트' });
        });
    });

    describe('3. 특수 API 파라미터 변환 검증', () => {
        it('ChannelsAPI.getChannels()가 배열을 전달받으면 쉼표로 구분된 문자열로 변환해야 합니다.', async () => {
            const client = new CimeClient({ clientId: 'id', clientSecret: 'secret' });
            mockGet.mockResolvedValueOnce({ data: [] });

            await client.channels.getChannels(['id1', 'id2', 'id3']);

            expect(mockGet).toHaveBeenCalledWith('/open/v1/channels', {
                params: { channelIds: 'id1,id2,id3' }
            });
        });

        it('ChatAPI.registerNotice()가 파라미터가 모두 누락된 경우 에러를 던져야 합니다.', async () => {
            const client = new CimeClient({ accessToken: 'test_token', scopes: ['WRITE:LIVE_CHAT_NOTICE'] });

            await expect(client.chat.registerNotice({})).rejects.toThrowError(
                /registerNotice requires either "message" or "messageId"/
            );
            expect(mockPost).not.toHaveBeenCalled();
        });
    });

    describe('4. OAuth 자동화 및 토큰 갱신', () => {
        it('authorize() 호출 시 Authorization Code로 토큰을 발급받아야 합니다.', async () => {
            const client = new CimeClient({ clientId: 'my_id', clientSecret: 'my_secret' });
            
            // 💡 [수정됨] AuthAPI가 `const { data }` 로 추출하므로 Mock 객체도 `data` 키로 한 번 감싸줍니다.
            mockPost.mockResolvedValueOnce({
                data: {
                    accessToken: 'new_access_token',
                    refreshToken: 'new_refresh_token',
                    expiresIn: 3600
                }
            });

            const result = await client.authorize('test_auth_code');

            // 정확한 파라미터로 POST 요청이 갔는지 확인
            expect(mockPost).toHaveBeenCalledWith('/auth/v1/token', {
                grantType: 'authorization_code',
                clientId: 'my_id',
                clientSecret: 'my_secret',
                code: 'test_auth_code'
            });

            // 결과값이 올바르게 반환되었는지 확인
            expect(result.accessToken).toBe('new_access_token');
        });
    });

    describe('5. 유틸리티 함수 검증 (chatUtils)', () => {
        it('renderChatEmojisToHTML가 토큰이 없는 메시지를 그대로 반환해야 합니다.', () => {
            const chatData = { content: '일반 텍스트 메시지', emojis: {} };
            const result = renderChatEmojisToHTML(chatData);
            expect(result).toBe('일반 텍스트 메시지');
        });

        it('renderChatEmojisToHTML가 이모티콘 토큰을 정확히 img 태그로 치환해야 합니다.', () => {
            const chatData = {
                content: '안녕하세요 :smile-token: 반갑습니다!',
                emojis: { ':smile-token:': 'https://example.com/smile.webp' },
            };

            const result = renderChatEmojisToHTML(chatData, 'custom-emoji');
            
            expect(result).toBe(
                '안녕하세요 <img src="https://example.com/smile.webp" alt=":smile-token:" class="custom-emoji" /> 반갑습니다!'
            );
        });

        it('renderChatEmojisToHTML가 정규식 특수문자가 포함된 토큰도 JavaScript 버그 없이 안전하게 치환해야 합니다.', () => {
            const chatData = {
                content: '특수문자 [테스트] ^_^ :$$complex-token$$: 치환',
                emojis: { ':$$complex-token$$:': 'https://example.com/complex.webp' },
            };

            const result = renderChatEmojisToHTML(chatData);
            
            expect(result).toContain('<img src="https://example.com/complex.webp" alt=":$$complex-token$$:" class="cime-emoji" />');
        });
    });
});