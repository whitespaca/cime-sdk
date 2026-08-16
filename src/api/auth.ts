import { AxiosInstance } from 'axios';
import {
    CimeAuthorizationUrlOptions,
    CimeTokenResponse,
    CimeTokenTypeHint,
} from '../types/auth';

const CIME_AUTHORIZATION_URL = 'https://ci.me/auth/openapi/account-interlock';

/**
 * ci.me OpenAPI의 OAuth 토큰 발급 및 갱신 요청을 담당합니다.
 */
export class AuthAPI {
    /**
     * 공유 HTTP 클라이언트를 사용하는 인증 API 래퍼를 생성합니다.
     *
     * @param http 공유 Axios 인스턴스
     * @param config OAuth 애플리케이션 인증 정보
     */
    constructor(
        private readonly http: AxiosInstance,
        private readonly config: { clientId?: string; clientSecret?: string }
    ) {}

    /**
     * 사용자를 보낼 OAuth 동의 페이지 URL을 생성합니다.
     *
     * 애플리케이션 Scope는 개발자 포탈에서 설정합니다. Scope 변경 사항을 기존 사용자에게
     * 적용하려면 이 URL로 다시 동의를 받은 뒤 새 Authorization Code를 교환해야 합니다.
     *
     * @param options Redirect URI와 CSRF 방지용 state
     */
    public getAuthorizationUrl(options: CimeAuthorizationUrlOptions): string {
        this.validateClientId();

        const url = new URL(CIME_AUTHORIZATION_URL);
        url.searchParams.set('clientId', this.config.clientId!);
        url.searchParams.set('redirectUri', options.redirectUri);
        url.searchParams.set('state', options.state);
        return url.toString();
    }

    /**
     * Authorization Code를 사용하여 Access Token과 Refresh Token을 발급받습니다.
     * @param code Redirect URI로 전달받은 인가 코드
     */
    public async get(code: string): Promise<CimeTokenResponse> {
        this.validateCredentials();

        const data = await this.http.post<any, CimeTokenResponse>('/auth/v1/token', {
            grantType: 'authorization_code',
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
            code: code
        });

        return data;
    }

    /**
     * Refresh Token을 사용하여 Access Token을 갱신합니다.
     * @param refreshToken 이전에 발급받은 리프레시 토큰
     */
    public async refresh(refreshToken: string): Promise<CimeTokenResponse> {
        this.validateCredentials();

        const data = await this.http.post<any, CimeTokenResponse>('/auth/v1/token', {
            grantType: 'refresh_token',
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
            refreshToken: refreshToken
        });

        return data;
    }

    /**
     * Access Token 또는 Refresh Token을 취소합니다.
     *
     * 토큰 하나를 취소하면 같은 인증에 연결된 Access/Refresh Token이 모두 취소됩니다.
     *
     * @param token 취소할 토큰
     * @param tokenTypeHint 취소할 토큰의 종류
     */
    public async revoke(token: string, tokenTypeHint: CimeTokenTypeHint): Promise<void> {
        this.validateCredentials();

        await this.http.post('/auth/v1/token/revoke', {
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
            token,
            tokenTypeHint,
        });
    }

    private validateClientId(): void {
        if (!this.config.clientId) {
            throw new Error('[Cime SDK] OAuth 인증 URL을 만들려면 초기화 시 clientId가 필요합니다.');
        }
    }

    /**
     * 내부 헬퍼: 토큰 발급 시 필요한 Client ID 및 Secret 유효성 검사 (Fail-fast)
     */
    private validateCredentials(): void {
        if (!this.config.clientId || !this.config.clientSecret) {
            throw new Error(
                '[Cime SDK] OAuth 토큰을 발급/갱신하려면 초기화 시 clientId와 clientSecret이 필요합니다.'
            );
        }
    }
}
