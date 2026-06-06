import { AxiosInstance } from 'axios';
import {
    CimeDropsCampaignsParams,
    CimeDropsCampaignList,
    CimeDropsRewardClaimsParams,
    CimeDropsRewardClaimList,
    CimeUpdateDropsRewardClaimsParams,
    CimeDropsRewardClaimUpdateResultList,
} from '../types';

/**
 * ci.me 드롭스 캠페인 및 보상 청구 API를 담당합니다.
 *
 * 게임 연동 서버에서 소유한 보상 캠페인을 조회하고, 미지급 보상 청구 내역을 폴링한 뒤,
 * 게임 서버가 인게임 보상을 지급한 청구를 지급 완료 상태로 변경할 때 사용합니다.
 */
export class DropsAPI {
    /**
     * 공유 HTTP 클라이언트를 사용하는 드롭스 API 래퍼를 생성합니다.
     *
     * @param httpClient ci.me 인증 설정이 적용된 Axios 인스턴스
     */
    constructor(private readonly httpClient: AxiosInstance) {}

    /**
     * 현재 애플리케이션이 소유한 드롭스 캠페인 목록을 조회합니다.
     *
     * `params.state`가 배열이면 SDK가 API에서 받는 쉼표 구분 쿼리 값으로 직렬화합니다.
     * 예: `ACTIVE,CLAIMABLE`
     *
     * @param params 선택 사항인 페이지 및 캠페인 상태 필터
     * @returns 드롭스 캠페인 목록
     */
    public async getCampaigns(params?: CimeDropsCampaignsParams): Promise<CimeDropsCampaignList> {
        return this.httpClient.get<any, CimeDropsCampaignList>('/open/v1/drops/campaigns', {
            params: this.stringifyListParams(params),
        });
    }

    /**
     * 현재 애플리케이션이 소유한 캠페인의 드롭스 보상 청구 내역을 조회합니다.
     *
     * 아직 인게임 보상 지급이 필요한 청구만 폴링하려면 `fulfillmentState: 'CLAIMED'`를 사용합니다.
     * `claimId`가 배열이면 SDK가 쉼표 구분 쿼리 값으로 직렬화합니다.
     *
     * @param params 선택 사항인 페이지 및 청구 필터
     * @returns 드롭스 보상 청구 목록
     */
    public async getRewardClaims(params?: CimeDropsRewardClaimsParams): Promise<CimeDropsRewardClaimList> {
        return this.httpClient.get<any, CimeDropsRewardClaimList>('/open/v1/drops/reward-claims', {
            params: this.stringifyListParams(params),
        });
    }

    /**
     * 하나 이상의 드롭스 보상 청구 지급 상태를 변경합니다.
     *
     * 일반적인 연동에서는 먼저 게임 서버에서 보상을 멱등하게 지급한 뒤,
     * 지급에 성공한 청구 ID만 모아 `FULFILLED` 상태로 이 메서드를 호출합니다.
     *
     * @param params 변경할 청구 ID 목록과 목표 지급 상태
     * @returns API가 반환한 상태별 처리 결과 그룹
     */
    public async updateRewardClaims(
        params: CimeUpdateDropsRewardClaimsParams,
    ): Promise<CimeDropsRewardClaimUpdateResultList> {
        return this.httpClient.put<any, CimeDropsRewardClaimUpdateResultList>('/open/v1/drops/reward-claims', params);
    }

    /**
     * 배열 형태의 쿼리 파라미터를 쉼표 구분 문자열로 변환합니다.
     *
     * @param params 쿼리 파라미터 객체
     * @returns 배열 값이 직렬화된 얕은 복사 쿼리 객체
     */
    private stringifyListParams(params?: object): Record<string, unknown> | undefined {
        if (!params) {
            return params;
        }

        return Object.fromEntries(
            Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value]),
        );
    }
}
