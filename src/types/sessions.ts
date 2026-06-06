/**
 * 세션 인증 방식입니다.
 *
 * `USER` 세션은 현재 Access Token을 사용하고, `CLIENT` 세션은 애플리케이션 Client Credential을 사용합니다.
 */
export type CimeSessionType = 'USER' | 'CLIENT';

/**
 * 세션 REST API에서 사용하는 이벤트 구독 이름입니다.
 */
export type CimeEventName = 'chat' | 'donation' | 'subscription';

/**
 * 세션 생성 응답
 */
export interface CimeSessionResponse {
    /** WebSocket 연결 URL */
    url: string;
}

/**
 * 수신되는 실시간 이벤트 데이터의 공통 구조
 */
export interface CimeEventPayload<T = any> {
    /** 실시간 이벤트 이름입니다. */
    event: 'CHAT' | 'DONATION' | 'SUBSCRIPTION';
    /** 이벤트별 페이로드입니다. */
    data: T;
}

/**
 * EventClient 옵션
 */
export interface CimeEventClientOptions {
    /** 세션 유형 (USER: 인증된 사용자 권한, CLIENT: 앱 공개 권한) */
    type: 'USER' | 'CLIENT';
    
    /**
     * [SDK 자동 처리]
     * 재연결 시 사용할 Refresh Token.
     * 이 값을 제공하면 재연결 시 자동으로 `auth.refresh()`를 호출하여 토큰을 갱신합니다.
     */
    refreshToken?: string;

    /**
     * [수동 처리]
     * DB 조회 등 커스텀 토큰 갱신 로직이 필요한 경우 직접 작성하는 콜백 함수.
     * `refreshToken` 필드를 사용했다면 이 함수는 생략해도 무방합니다.
     */
    onTokenRefresh?: () => Promise<void>;
    
    /** 핑(Ping) 전송 간격 (밀리초, 기본값 60000ms = 1분) */
    pingInterval?: number;
}
