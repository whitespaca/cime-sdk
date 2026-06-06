import { AxiosInstance } from 'axios';
import { CimeClientOptions, CimeTokenResponse, CimeEventClientOptions } from './types';
import { createHttpClient } from './utils/httpClient';
import { AuthAPI } from './api/auth';
import { UsersAPI } from './api/users';
import { ChannelsAPI } from './api/channels';
import { LiveAPI } from './api/live';
import { ChatAPI } from './api/chat';
import { CategoriesAPI } from './api/categories';
import { RestrictAPI } from './api/restrict';
import { SessionsAPI } from './api/sessions';
import { DropsAPI } from './api/drops';
import { CimeEventClient } from './ws/CimeEventClient';

/**
 * ci.me OpenAPI를 사용하기 위한 메인 SDK 클라이언트입니다.
 */
export class CimeClient {
    private readonly httpClient: AxiosInstance;
    private options: CimeClientOptions;

    /** OAuth 토큰 발급, 갱신, 취소 API 래퍼입니다. */
    public readonly auth: AuthAPI;
    /** 현재 사용자 API 래퍼입니다. */
    public readonly users: UsersAPI;
    /** 채널 정보, 팔로워, 구독자, 관리자 API 래퍼입니다. */
    public readonly channels: ChannelsAPI;
    /** 라이브 목록, 라이브 설정, 스트림 키, 라이브 상태 API 래퍼입니다. */
    public readonly live: LiveAPI;
    /** 라이브 채팅 설정, 메시지 전송, 공지 등록 API 래퍼입니다. */
    public readonly chat: ChatAPI;
    /** 라이브 카테고리 검색 API 래퍼입니다. */
    public readonly categories: CategoriesAPI;
    /** 사용자 추방 및 추방 해제 API 래퍼입니다. */
    public readonly restrict: RestrictAPI;
    /** WebSocket 세션 및 이벤트 구독 API 래퍼입니다. */
    public readonly sessions: SessionsAPI;
    /** 드롭스 캠페인 및 보상 청구 API 래퍼입니다. */
    public readonly drops: DropsAPI;

    /**
     * ci.me SDK 클라이언트를 생성합니다.
     *
     * @param options 인증 정보와 HTTP 동작 옵션
     * @throws `accessToken` 또는 완전한 `clientId`/`clientSecret` 쌍이 없을 때 오류를 던집니다.
     */
    constructor(options: CimeClientOptions) {
        // accessToken 또는 완전한 client credential 쌍이 필요합니다.
        if (!options.accessToken && (!options.clientId || !options.clientSecret)) {
            throw new Error('[CimeClient] Authentication credentials (accessToken OR clientId/Secret) are required.');
        }

        this.options = { ...options };
        this.httpClient = createHttpClient(this.options);

        this.auth = new AuthAPI(this.httpClient, { clientId: this.options.clientId, clientSecret: this.options.clientSecret });
        this.users = new UsersAPI(this.httpClient, this.options);
        this.channels = new ChannelsAPI(this.httpClient, this.options);
        this.live = new LiveAPI(this.httpClient, this.options);
        this.chat = new ChatAPI(this.httpClient, this.options);
        this.categories = new CategoriesAPI(this.httpClient);
        this.restrict = new RestrictAPI(this.httpClient, this.options);
        this.sessions = new SessionsAPI(this.httpClient);
        this.drops = new DropsAPI(this.httpClient);
    }

    /**
     * 이후 HTTP 요청에 사용할 Access Token을 갱신합니다.
     *
     * @param token 새 OAuth Access Token
     */
    public setAccessToken(token: string): void {
        this.options.accessToken = token;
        // HTTP 클라이언트는 options 참조를 유지하므로 다음 요청부터 변경된 토큰을 사용합니다.
    }

    /**
     * 이 클라이언트에 저장된 Refresh Token을 갱신합니다.
     *
     * @param token 새 OAuth Refresh Token
     */
    public setRefreshToken(token: string): void {
        this.options.refreshToken = token;
    }

    /**
     * 현재 클라이언트가 알고 있는 OAuth Scope 목록을 교체합니다.
     *
     * SDK 모듈은 Scope가 필요한 API 요청을 보내기 전에 이 목록으로 권한을 사전 검증합니다.
     *
     * @param scopes 현재 Access Token에 부여된 OAuth Scope 목록
     */
    public setScopes(scopes: string[]): void {
        this.options.scopes = scopes;
    }

    /**
     * 채팅, 후원, 구독 실시간 이벤트를 수신하는 WebSocket 이벤트 클라이언트를 생성합니다.
     *
     * Refresh Token이 있고 `onTokenRefresh`가 없으면 SDK가 `auth.refresh()`를 호출하는
     * 기본 토큰 갱신 콜백을 자동으로 설정합니다.
     *
     * @param options 이벤트 클라이언트 옵션
     * @returns 실시간 이벤트 클라이언트 인스턴스
     */
    public createEventClient(options: CimeEventClientOptions): CimeEventClient {
        if ((options.refreshToken || this.options.refreshToken) && !options.onTokenRefresh) {
            options.onTokenRefresh = async () => {
                try {
                    const tokenInfo = await this.auth.refresh(options.refreshToken || this.options.refreshToken!);
                    this.setAccessToken(tokenInfo.accessToken);
                    this.setRefreshToken(tokenInfo.refreshToken);
                } catch (error) {
                    throw new Error('자동 토큰 갱신에 실패했습니다.');
                }
            };
        }
        return new CimeEventClient(this.sessions, options);
    }

    /**
     * OAuth Authorization Code로 토큰을 발급받고 클라이언트 상태에 반영합니다.
     *
     * @param code Redirect URI로 전달된 Authorization Code
     * @returns ci.me가 반환한 토큰 응답
     * @throws `clientId` 또는 `clientSecret`이 없을 때 오류를 던집니다.
     */
    public async authorize(code: string): Promise<CimeTokenResponse> {
        if (!this.options.clientId || !this.options.clientSecret) {
            throw new Error('[CimeClient] OAuth authentication requires clientId and clientSecret to be set in options.');
        }

        const tokenResponse = await this.auth.get(code);
        this.setAccessToken(tokenResponse.accessToken);
        this.setRefreshToken(tokenResponse.refreshToken);
        this.setScopes(tokenResponse.scope.split(' '));
        return tokenResponse;
    }
}
