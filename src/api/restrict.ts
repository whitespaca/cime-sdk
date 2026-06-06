import { AxiosInstance } from 'axios';
import {
    CimeCursorList,
    CimeRestrictUserParams,
    CimeGetRestrictedUsersParams,
    CimeRestrictedUser,
    CimeClientOptions,
} from '../types';

/**
 * 사용자 차단 및 추방(Restrict) 관련 API를 담당하는 클래스입니다.
 */
export class RestrictAPI {
    /**
     * 공유 HTTP 클라이언트를 사용하는 차단/추방 API 래퍼를 생성합니다.
     *
     * @param httpClient ci.me 인증 설정이 적용된 Axios 인스턴스
     * @param options Scope 검증에 사용하는 클라이언트 옵션
     */
    constructor(private readonly httpClient: AxiosInstance, private readonly options: CimeClientOptions) {}

    /**
     * 인증된 사용자의 채널에서 특정 사용자를 추방합니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `WRITE:USER_BLOCK`
     * @param params - 추방할 대상 채널 ID
     */
    public async restrictUser(params: CimeRestrictUserParams): Promise<void> {
        if (!this.options.scopes?.includes('WRITE:USER_BLOCK')) {
            throw new Error('[RestrictAPI] "WRITE:USER_BLOCK" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        await this.httpClient.post('/open/v1/restrict-channels', params);
    }

    /**
     * 인증된 사용자의 채널에서 추방된 사용자 목록을 조회합니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `READ:USER_BLOCK`
     * @param params - 커서 기반 페이징 파라미터 (size, next)
     * @returns 추방된 사용자 목록
     */
    public async getRestrictedUsers(
        params?: CimeGetRestrictedUsersParams
    ): Promise<CimeCursorList<CimeRestrictedUser>> {
        if (!this.options.scopes?.includes('READ:USER_BLOCK')) {
            throw new Error('[RestrictAPI] "READ:USER_BLOCK" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        return this.httpClient.get<any, CimeCursorList<CimeRestrictedUser>>('/open/v1/restrict-channels', {
        params,
        });
    }

    /**
     * 인증된 사용자의 채널에서 특정 사용자의 추방을 해제합니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `WRITE:USER_BLOCK`
     * @param params - 추방 해제할 대상 채널 ID
     */
    public async unrestrictUser(params: CimeRestrictUserParams): Promise<void> {
        if (!this.options.scopes?.includes('WRITE:USER_BLOCK')) {
            throw new Error('[RestrictAPI] "WRITE:USER_BLOCK" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        // Axios에서 DELETE 요청에 Request Body를 담으려면 두 번째 인자인 config의 data 필드에 넣어야 합니다.
        await this.httpClient.delete('/open/v1/restrict-channels', {
        data: params,
        });
    }
}
