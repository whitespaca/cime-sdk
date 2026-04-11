import { AxiosInstance } from 'axios';
import { CimeUser, CimeClientOptions } from '../types';

/**
 * 사용자(User) 관련 API를 담당하는 클래스입니다.
 */
export class UsersAPI {
    constructor(private readonly httpClient: AxiosInstance, private readonly options: CimeClientOptions) {}

    /**
     * 현재 Access Token에 연결된 사용자의 채널 정보를 조회합니다.
     *
     * @requires Scope: `READ:USER`
     * @throws {CimeAPIError} Access Token이 없거나 만료되었을 때 (401), 또는 권한이 부족할 때 발생합니다.
     * @returns 사용자의 채널 상세 정보
     * * @example
     * ```typescript
     * const me = await client.users.get();
     * console.log(`안녕하세요, ${me.channelName}님!`);
     * ```
     */
    public async get(): Promise<CimeUser> {
        if (!this.options.scopes?.includes('READ:USER')) {
            throw new Error('[UsersAPI] "READ:USER" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        // 인터셉터에서 response.data.content를 바로 반환하므로 리턴 타입은 CimeUser가 됩니다.
        return this.httpClient.get<any, CimeUser>('/open/v1/users/me');
    }
}