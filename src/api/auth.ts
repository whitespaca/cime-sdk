import { AxiosInstance } from 'axios';
import { CimeTokenResponse } from '../types/auth';

export class AuthAPI {
    constructor(
        private readonly http: AxiosInstance,
        private readonly config: { clientId?: string; clientSecret?: string }
    ) {}

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