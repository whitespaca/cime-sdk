import { AxiosInstance } from 'axios';
import { CimeSessionResponse, CimeSessionType, CimeEventName } from '../types';

/**
 * 세션(Session) 및 이벤트 구독 제어를 담당하는 클래스입니다.
 */
export class SessionsAPI {
    constructor(private readonly httpClient: AxiosInstance) {}

    /**
     * WebSocket 연결을 위한 새로운 세션을 생성합니다.
     *
     * @param type - 세션 유형 ('USER' 또는 'CLIENT')
     * @returns WebSocket URL을 포함한 세션 정보
     */
    public async createSession(type: CimeSessionType): Promise<CimeSessionResponse> {
        const endpoint = type === 'USER' ? '/open/v1/sessions/auth' : '/open/v1/sessions/auth/client';
        return this.httpClient.get<any, CimeSessionResponse>(endpoint);
    }

    /**
     * 특정 세션에 이벤트를 구독합니다.
     *
     * @requires Auth: `Access Token`
     * @param event - 구독할 이벤트 이름 (chat, donation, subscription)
     * @param sessionKey - 세션 키
     */
    public async subscribeEvent(event: CimeEventName, sessionKey: string): Promise<void> {
        await this.httpClient.post(`/open/v1/sessions/events/subscribe/${event}`, null, {
        params: { sessionKey },
        });
    }

    /**
     * 특정 세션에서 이벤트 구독을 해제합니다.
     *
     * @requires Auth: `Access Token`
     * @param event - 구독 해제할 이벤트 이름
     * @param sessionKey - 세션 키
     */
    public async unsubscribeEvent(event: CimeEventName, sessionKey: string): Promise<void> {
        await this.httpClient.post(`/open/v1/sessions/events/unsubscribe/${event}`, null, {
        params: { sessionKey },
        });
    }
}