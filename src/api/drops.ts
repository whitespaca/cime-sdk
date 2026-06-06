import { AxiosInstance } from 'axios';
import {
    CimeDropsCampaignsParams,
    CimeDropsCampaignList,
    CimeDropsRewardClaimsParams,
    CimeDropsRewardClaimList,
    CimeUpdateDropsRewardClaimsParams,
    CimeDropsRewardClaimUpdateResultList,
} from '../types';

export class DropsAPI {
    constructor(private readonly httpClient: AxiosInstance) {}

    public async getCampaigns(params?: CimeDropsCampaignsParams): Promise<CimeDropsCampaignList> {
        return this.httpClient.get<any, CimeDropsCampaignList>('/open/v1/drops/campaigns', {
            params: this.stringifyListParams(params),
        });
    }

    public async getRewardClaims(params?: CimeDropsRewardClaimsParams): Promise<CimeDropsRewardClaimList> {
        return this.httpClient.get<any, CimeDropsRewardClaimList>('/open/v1/drops/reward-claims', {
            params: this.stringifyListParams(params),
        });
    }

    public async updateRewardClaims(
        params: CimeUpdateDropsRewardClaimsParams,
    ): Promise<CimeDropsRewardClaimUpdateResultList> {
        return this.httpClient.put<any, CimeDropsRewardClaimUpdateResultList>('/open/v1/drops/reward-claims', params);
    }

    private stringifyListParams(params?: object): Record<string, unknown> | undefined {
        if (!params) {
            return params;
        }

        return Object.fromEntries(
            Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value]),
        );
    }
}
