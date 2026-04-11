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
import { CimeEventClient } from './ws/CimeEventClient';

/**
 * ci.me API를 사용하기 위한 메인 클라이언트 클래스입니다.
 */
export class CimeClient {
    private readonly httpClient: AxiosInstance;
    private options: CimeClientOptions;

    public readonly auth: AuthAPI;
    public readonly users: UsersAPI;
    public readonly channels: ChannelsAPI;
    public readonly live: LiveAPI;
    public readonly chat: ChatAPI;
    public readonly categories: CategoriesAPI;
    public readonly restrict: RestrictAPI;
    
    /** 세션 REST API (이벤트 구독 등 수동 제어용) */
    public readonly sessions: SessionsAPI;

    constructor(options: CimeClientOptions) {
        if (options.clientId && options.clientSecret) {
            throw new Error('[CimeClient] Authentication credentials (accessToken OR clientId/Secret) are required.');
        }

        this.options = { ...options };
        this.httpClient = createHttpClient(this.options);

        this.auth = new AuthAPI(this.httpClient, { clientId: options.clientId, clientSecret: options.clientSecret });
        this.users = new UsersAPI(this.httpClient, this.options);
        this.channels = new ChannelsAPI(this.httpClient, this.options);
        this.live = new LiveAPI(this.httpClient, this.options);
        this.chat = new ChatAPI(this.httpClient, this.options);
        this.categories = new CategoriesAPI(this.httpClient);
        this.restrict = new RestrictAPI(this.httpClient, this.options);
        this.sessions = new SessionsAPI(this.httpClient);
    }

    public setAccessToken(newToken: string): void {
        this.options.accessToken = newToken;
    }

    public setRefreshToken(newToken: string): void {
        this.options.refreshToken = newToken;
    }

    /**
     * 실시간 이벤트를 수신할 수 있는 WebSocket 이벤트 클라이언트를 생성합니다.
     *
     * @param options - 세션 타입(USER/CLIENT) 및 콜백 설정
     * @returns CimeEventClient 인스턴스 (EventEmitter)
     * * @example
     * ```typescript
     * const eventClient = client.createEventClient({ type: 'USER' });
     * await eventClient.connect();
     * await eventClient.subscribe('chat');
     * * eventClient.on('CHAT', (data) => {
     * console.log('New Chat Message:', data);
     * });
     * ```
     */
    public createEventClient(options: CimeEventClientOptions): CimeEventClient {
        if (options.refreshToken && !options.onTokenRefresh) {
            options.onTokenRefresh = async () => {
                try {
                // 수정해주신 auth.ts의 refresh 메서드 호출
                const tokenInfo = await this.auth.refresh(options.refreshToken!);
                
                // 새롭게 발급받은 Access Token을 HTTP 클라이언트에 갱신 (이후 소켓 세션 발급 API에 적용됨)
                this.setAccessToken(tokenInfo.accessToken);
                
                // 다음번 만료를 대비해 Refresh Token도 최신화
                options.refreshToken = tokenInfo.refreshToken;
                } catch (error) {
                    throw new Error('자동 토큰 갱신에 실패했습니다.');
                }
            };
        }
        return new CimeEventClient(this.sessions, options);
    }

    /** OAuth 인증 플로우를 통해 Access Token을 발급받고 클라이언트에 설정합니다.
     * @param code Redirect URI로 전달받은 인가 코드
     * @throws 인증 정보(clientId/Secret)가 없으면 에러를 반환합니다.
     */
    public async authorize(code: string): Promise<CimeTokenResponse> {
        if (!this.options.clientId || !this.options.clientSecret) {
            throw new Error('[CimeClient] OAuth authentication requires clientId and clientSecret to be set in options.');
        }

        const tokenResponse = await this.auth.get(code);
        this.setAccessToken(tokenResponse.accessToken);
        this.setRefreshToken(tokenResponse.refreshToken);
        this.options.scopes = tokenResponse.scope.split(' ');

        return tokenResponse;
    }
}