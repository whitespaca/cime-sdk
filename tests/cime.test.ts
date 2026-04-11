import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CimeClient } from '../src/client';
import { renderChatEmojisToHTML } from '../src/utils/chatUtils';

// ---------------------------------------------------------------------------
// 1. Axios 및 네트워크 모듈 모킹 (Mocking)
// 실제 ci.me 서버로 요청을 보내지 않고, 내부 로직만 테스트하기 위함입니다.
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

// axios-retry 모킹
vi.mock('axios-retry', () => ({
    default: vi.fn(),
}));

// ---------------------------------------------------------------------------
// 2. 테스트 스위트 (Test Suites)
// ---------------------------------------------------------------------------
describe('Cime SDK - Unit Tests', () => {
    beforeEach(() => {
        // 매 테스트마다 모킹된 함수의 호출 기록을 초기화합니다.
        vi.clearAllMocks();
    });

    describe('CimeClient 초기화', () => {
        it('인증 정보(accessToken 또는 clientId)가 없으면 에러를 던져야 합니다.', () => {
            // @ts-ignore (강제로 빈 객체를 주입하여 런타임 에러 발생 유도)
            expect(() => new CimeClient({})).toThrowError(/Authentication credentials/);
        });

        it('accessToken으로 성공적으로 초기화되어야 합니다.', () => {
            const client = new CimeClient({ accessToken: 'test_token' });
            expect(client.users).toBeDefined();
            expect(client.chat).toBeDefined();
            });
    });

    describe('API 호출 로직 검증', () => {
        let client: CimeClient;

        beforeEach(() => {
            client = new CimeClient({ accessToken: 'test_token' });
        });

        it('UsersAPI.getMe()가 올바른 엔드포인트로 GET 요청을 보내야 합니다.', async () => {
            // 모의 응답 데이터 설정
            const mockResponse = { channelId: '123', channelName: '테스트유저' };
            mockGet.mockResolvedValueOnce(mockResponse);

            const result = await client.users.get();

            expect(mockGet).toHaveBeenCalledTimes(1);
            expect(mockGet).toHaveBeenCalledWith('/open/v1/users/me');
            expect(result).toEqual(mockResponse);
        });

        it('ChatAPI.registerNotice()가 파라미터 누락 시 서버 요청 전 에러를 던져야 합니다. (Fail-fast)', async () => {
            // 파라미터가 모두 비어있는 경우
            await expect(client.chat.registerNotice({})).rejects.toThrowError(
                /requires either "message" or "messageId"/
            );

            // 서버로 POST 요청이 아예 가지 않았는지 검증
            expect(mockPost).not.toHaveBeenCalled();
        });

        it('ChatAPI.registerNotice()가 정상적인 파라미터로 POST 요청을 보내야 합니다.', async () => {
            mockPost.mockResolvedValueOnce(undefined);

            await client.chat.registerNotice({ message: '안녕하세요 공지입니다.' });

            expect(mockPost).toHaveBeenCalledTimes(1);
            expect(mockPost).toHaveBeenCalledWith('/open/v1/chats/notice', {
                message: '안녕하세요 공지입니다.',
            });
        });
    });

    describe('유틸리티 함수 검증 (chatUtils)', () => {
        it('renderChatEmojisToHTML가 토큰이 없는 메시지를 그대로 반환해야 합니다.', () => {
            const chatData = {
                content: '일반 텍스트 메시지',
                emojis: {},
            };
            const result = renderChatEmojisToHTML(chatData);
            expect(result).toBe('일반 텍스트 메시지');
        });

        it('renderChatEmojisToHTML가 이모티콘 토큰을 정확히 img 태그로 치환해야 합니다.', () => {
            const chatData = {
                content: '안녕하세요 :smile-token: 반갑습니다!',
                emojis: {
                ':smile-token:': 'https://example.com/smile.webp',
                },
            };

            const result = renderChatEmojisToHTML(chatData, 'custom-emoji');
            
            expect(result).toBe(
                '안녕하세요 <img src="https://example.com/smile.webp" alt=":smile-token:" class="custom-emoji" /> 반갑습니다!'
            );
        });

        it('renderChatEmojisToHTML가 정규식 특수문자가 포함된 토큰도 안전하게 치환해야 합니다.', () => {
            const chatData = {
                content: '특수문자 [테스트] ^_^ :$$complex-token$$: 치환',
                emojis: {
                ':$$complex-token$$:': 'https://example.com/complex.webp',
                },
            };

            const result = renderChatEmojisToHTML(chatData);
            
            expect(result).toContain('<img src="https://example.com/complex.webp" alt=":$$complex-token$$:" class="cime-emoji" />');
        });
    });
});