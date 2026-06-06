export * from './auth';
export * from './users';
export * from './channels';
export * from './live';
export * from './chat';
export * from './categories';
export * from './restrict';
export * from './sessions';
export * from './donation';
export * from './subscription'; // 구독 이벤트 타입
export * from './drops';

/**
 * SDK 응답 인터셉터가 `content`를 풀기 전 ci.me OpenAPI가 반환하는 공통 응답 래퍼입니다.
 */
export interface CimeCommonResponse<T = unknown> {
    /** API 상태 코드입니다. */
    code: number;
    /** 선택 사항인 API 응답 메시지입니다. */
    message: string | null;
    /** 실제 응답 페이로드입니다. */
    content: T;
}

/**
 * ci.me OpenAPI가 반환하는 오류 페이로드입니다.
 */
export interface CimeErrorResponse {
    /** API가 반환한 HTTP 유사 상태 코드입니다. */
    statusCode: number;
    /** 사람이 읽을 수 있는 오류 메시지입니다. */
    message: string;
}

/**
 * {@link CimeClient} 인스턴스를 설정할 때 사용하는 옵션입니다.
 */
export interface CimeClientOptions {
    /** ci.me 개발자 센터에서 발급받은 애플리케이션 Client ID입니다. */
    clientId?: string;
    /** ci.me 개발자 센터에서 발급받은 애플리케이션 Client Secret입니다. */
    clientSecret?: string;
    /** 사용자 권한 API 호출에 사용할 OAuth Access Token입니다. */
    accessToken?: string;
    /** 토큰 갱신 헬퍼와 이벤트 재연결에서 사용할 OAuth Refresh Token입니다. */
    refreshToken?: string;
    /** `accessToken`에 부여된 OAuth Scope 목록입니다. SDK의 사전 권한 검증에 사용됩니다. */
    scopes?: string[];
    /** HTTP 요청 제한 시간(ms)입니다. */
    timeout?: number;
    /** 재시도 가능한 HTTP 실패에 대한 재시도 횟수입니다. */
    retries?: number;
}
