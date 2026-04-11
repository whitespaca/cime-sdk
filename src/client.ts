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
    public readonly sessions: SessionsAPI;

    constructor(options: CimeClientOptions) {
        // [버그 수정됨] accessToken이 없고, (clientId 또는 clientSecret이 없을 때) 에러를 발생시킵니다.
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
    }

    public setAccessToken(token: string): void {
        this.options.accessToken = token;
        // httpClient 내부의 options 참조는 객체 참조이므로 속성만 바꿔주면 다음 요청부터 자동으로 반영됩니다.
    }

    public setRefreshToken(token: string): void {
        this.options.refreshToken = token;
    }

    public setScopes(scopes: string[]): void {
        this.options.scopes = scopes;
    }

    /**
     * 실시간 이벤트를 수신하기 위한 WebSocket 클라이언트를 생성합니다.
     * 치지직의 chatClient와 같은 역할을 하는 메서드입니다.
     */
    public createEventClient(options: CimeEventClientOptions): CimeEventClient {
        if (options.refreshToken && !options.onTokenRefresh) {
            options.onTokenRefresh = async () => {
                try {
                    const tokenInfo = await this.auth.refresh(options.refreshToken!);
                    this.setAccessToken(tokenInfo.accessToken);
                    options.refreshToken = tokenInfo.refreshToken;
                } catch (error) {
                    throw new Error('자동 토큰 갱신에 실패했습니다.');
                }
            };
        }
        return new CimeEventClient(this.sessions, options);
    }

    /** * OAuth 인증 플로우를 통해 Access Token을 발급받고 클라이언트에 설정합니다.
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
        this.setScopes(tokenResponse.scope.split(' '));
        return tokenResponse;
    }
}