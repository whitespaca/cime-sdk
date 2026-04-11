import { AxiosInstance } from 'axios';
import {
    CimeChatSettings,
    CimeUpdateChatSettingsParams,
    CimeSendChatMessageParams,
    CimeSendChatMessageResponse,
    CimeRegisterChatNoticeParams,
    CimeClientOptions,
} from '../types';

/**
 * 라이브 채팅(Chat) 설정 및 메시지 전송 관련 API를 담당하는 클래스입니다.
 */
export class ChatAPI {
    constructor(private readonly httpClient: AxiosInstance, private readonly options: CimeClientOptions) {}

    /**
     * 인증된 사용자 채널의 채팅 설정을 조회합니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `READ:LIVE_CHAT_SETTINGS`
     * @returns 채팅 설정 정보
     */
    public async getSettings(): Promise<CimeChatSettings> {
        if (!this.options.scopes?.includes('READ:LIVE_CHAT_SETTINGS')) {
            throw new Error('[ChatAPI] "READ:LIVE_CHAT_SETTINGS" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        return this.httpClient.get<any, CimeChatSettings>('/open/v1/chats/settings');
    }

    /**
     * 인증된 사용자 채널의 채팅 설정을 변경합니다. (전달된 필드만 업데이트)
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `WRITE:LIVE_CHAT_SETTINGS`
     * @param params - 변경할 채팅 설정 데이터
     */
    public async updateSettings(params: CimeUpdateChatSettingsParams): Promise<void> {
        if (!this.options.scopes?.includes('WRITE:LIVE_CHAT_SETTINGS')) {
            throw new Error('[ChatAPI] "WRITE:LIVE_CHAT_SETTINGS" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        await this.httpClient.put('/open/v1/chats/settings', params);
    }

    /**
     * 인증된 사용자의 채널 라이브 채팅에 메시지를 전송합니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `WRITE:LIVE_CHAT`
     * @param params - 전송할 메시지 정보 및 발신자 타입
     * @returns 전송된 메시지 ID
     */
    public async sendMessage(params: CimeSendChatMessageParams): Promise<CimeSendChatMessageResponse> {
        if (!this.options.scopes?.includes('WRITE:LIVE_CHAT')) {
            throw new Error('[ChatAPI] "WRITE:LIVE_CHAT" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        return this.httpClient.post<any, CimeSendChatMessageResponse>('/open/v1/chats/send', params);
    }

    /**
     * 인증된 사용자의 채널 라이브 채팅에 공지사항을 등록합니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `WRITE:LIVE_CHAT_NOTICE`
     * @param params - 등록할 공지 메시지 내용 또는 기존 메시지 ID
     * @throws {Error} 파라미터가 모두 누락된 경우 서버 요청 전 사전 차단합니다.
     */
    public async registerNotice(params: CimeRegisterChatNoticeParams): Promise<void> {
        if (!this.options.scopes?.includes('WRITE:LIVE_CHAT_NOTICE')) {
            throw new Error('[ChatAPI] "WRITE:LIVE_CHAT_NOTICE" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        // Fail-fast 로직: 서버로 보내기 전 SDK 단에서 미리 파라미터 유효성 검사
        if (!params.message && !params.messageId) {
        throw new Error('[CimeClient.ChatAPI] registerNotice requires either "message" or "messageId".');
        }

        await this.httpClient.post('/open/v1/chats/notice', params);
    }
}