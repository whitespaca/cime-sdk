/**
 * ci.me API에서 사용되는 권한(Scope) 목록입니다.
 */
export type CimeScope =
    | 'READ:USER'
    | 'READ:CHANNEL'
    | 'READ:LIVE_CHAT'
    | 'WRITE:LIVE_CHAT'
    | 'READ:DONATION'
    | 'WRITE:USER_BLOCK'
    | 'READ:USER_BLOCK'
    | 'READ:LIVE_STREAM_KEY'
    | 'READ:SUBSCRIPTION'
    | 'READ:LIVE_STREAM_SETTINGS'
    | 'WRITE:LIVE_STREAM_SETTINGS'
    | 'READ:LIVE_CHAT_SETTINGS'
    | 'WRITE:LIVE_CHAT_SETTINGS'
    | 'WRITE:LIVE_CHAT_NOTICE';

/**
 * OAuth 사용자 동의 페이지 URL을 만들 때 사용하는 옵션입니다.
 */
export interface CimeAuthorizationUrlOptions {
    /** 개발자 포탈에 등록한 OAuth Redirect URI입니다. */
    redirectUri: string;
    /** OAuth 요청과 콜백을 연결하고 CSRF를 방지하기 위한 임의 문자열입니다. */
    state: string;
}

/**
 * 토큰 발급/갱신 요청 인터페이스
 */
export interface CimeTokenRequest {
    grantType: 'authorization_code' | 'refresh_token';
    clientId: string;
    clientSecret: string;
    /** grant_type이 'authorization_code'일 때 필수 */
    code?: string;
    /** grant_type이 'refresh_token'일 때 필수 */
    refreshToken?: string;
}

/**
 * 토큰 발급/갱신 응답 인터페이스
 */
export interface CimeTokenResponse {
    accessToken: string;
    refreshToken: string;
    /** 공식 API는 문자열로 반환하며, 기존 응답과의 호환을 위해 숫자도 허용합니다. */
    expiresIn: string | number;
    tokenType: string;
    scope: string;
}

/** OAuth 토큰 취소 시 지정하는 토큰 종류입니다. */
export type CimeTokenTypeHint = 'access_token' | 'refresh_token';

/**
 * 토큰 취소 요청 인터페이스
 */
export interface CimeRevokeTokenRequest {
    clientId: string;
    clientSecret: string;
    token: string;
    tokenTypeHint: CimeTokenTypeHint;
}
