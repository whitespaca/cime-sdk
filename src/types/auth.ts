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
    expiresIn: number;
    tokenType: string;
    scope: string;
}

/**
 * 토큰 취소 요청 인터페이스
 */
export interface CimeRevokeTokenRequest {
    clientId: string;
    clientSecret: string;
    token: string;
    tokenTypeHint: 'access_token' | 'refresh_token';
}