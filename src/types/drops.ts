import { CimeDataList } from './channels';

export type CimeDropsCampaignState =
    | 'DRAFT'
    | 'PENDING'
    | 'APPROVED'
    | 'ACTIVE'
    | 'PAUSED'
    | 'CLAIMABLE'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'REJECTED';

export type CimeDropsRewardType = 'IN_GAME_REWARD';

export type CimeDropsFulfillmentState = 'CLAIMED' | 'FULFILLED';

export type CimeDropsClaimUpdateStatus =
    | 'SUCCESS'
    | 'INVALID_ID'
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'UPDATE_FAILED';

export interface CimeDropsCampaignsParams {
    page?: number;
    size?: number;
    state?: CimeDropsCampaignState | CimeDropsCampaignState[] | string;
}

export interface CimeDropsReward {
    rewardId: string;
    title: string;
    imageUrl: string;
    type: CimeDropsRewardType | string;
    minWatchTime: number;
}

export interface CimeDropsCampaign {
    campaignId: string;
    state: CimeDropsCampaignState;
    title: string;
    description: string;
    imageUrl: string;
    externalUrl: string | null;
    startAt: string;
    endAt: string;
    claimAvailableAt: string;
    rewards: CimeDropsReward[];
}

export interface CimeDropsRewardClaimsParams {
    page?: number;
    size?: number;
    claimId?: string | string[];
    channelId?: string;
    campaignId?: string;
    categoryId?: string;
    fulfillmentState?: CimeDropsFulfillmentState;
}

export interface CimeDropsRewardClaim {
    claimId: string;
    campaignId: string;
    rewardId: string;
    categoryId: string;
    categoryName: string;
    channelId: string;
    fulfillmentState: CimeDropsFulfillmentState;
    claimedDate: string;
    updatedDate: string;
}

export interface CimeUpdateDropsRewardClaimsParams {
    claimIds: string[];
    fulfillmentState: CimeDropsFulfillmentState;
}

export interface CimeDropsRewardClaimUpdateResult {
    status: CimeDropsClaimUpdateStatus;
    ids: string[];
}

export type CimeDropsCampaignList = CimeDataList<CimeDropsCampaign>;
export type CimeDropsRewardClaimList = CimeDataList<CimeDropsRewardClaim>;
export type CimeDropsRewardClaimUpdateResultList = CimeDataList<CimeDropsRewardClaimUpdateResult>;
