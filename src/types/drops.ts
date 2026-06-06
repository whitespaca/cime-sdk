import { CimeDataList } from './channels';

/**
 * 드롭스 캠페인의 생명주기 상태입니다.
 */
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

/**
 * 드롭스 캠페인 API가 반환하는 보상 종류입니다.
 */
export type CimeDropsRewardType = 'IN_GAME_REWARD';

/**
 * 보상 청구의 지급 처리 상태입니다.
 */
export type CimeDropsFulfillmentState = 'CLAIMED' | 'FULFILLED';

/**
 * 보상 청구 상태 변경 처리 결과를 그룹화하는 상태 값입니다.
 */
export type CimeDropsClaimUpdateStatus =
    | 'SUCCESS'
    | 'INVALID_ID'
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'UPDATE_FAILED';

/**
 * 드롭스 캠페인 목록 조회 쿼리 파라미터입니다.
 */
export interface CimeDropsCampaignsParams {
    /** 0부터 시작하는 페이지 번호입니다. */
    page?: number;
    /** 페이지 크기입니다. API 기본값은 20, 최댓값은 100입니다. */
    size?: number;
    /** 선택 사항인 캠페인 상태 필터입니다. 배열은 쉼표 구분 문자열로 직렬화됩니다. */
    state?: CimeDropsCampaignState | CimeDropsCampaignState[] | string;
}

/**
 * 드롭스 캠페인에 포함된 보상 정의입니다.
 */
export interface CimeDropsReward {
    /** 보상 고유 ID입니다. */
    rewardId: string;
    /** 보상 표시 제목입니다. */
    title: string;
    /** 보상 이미지 URL입니다. */
    imageUrl: string;
    /** 보상 타입입니다. 현재 `IN_GAME_REWARD`를 사용합니다. */
    type: CimeDropsRewardType | string;
    /** 보상 청구에 필요한 최소 시청 시간(초)입니다. */
    minWatchTime: number;
}

/**
 * 캠페인 목록 API가 반환하는 드롭스 캠페인 메타데이터입니다.
 */
export interface CimeDropsCampaign {
    /** 캠페인 고유 ID입니다. */
    campaignId: string;
    /** 현재 캠페인 생명주기 상태입니다. */
    state: CimeDropsCampaignState;
    /** 캠페인 제목입니다. */
    title: string;
    /** 캠페인 설명입니다. */
    description: string;
    /** 캠페인 이미지 URL입니다. */
    imageUrl: string;
    /** 캠페인에 설정된 선택 사항 외부 URL입니다. */
    externalUrl: string | null;
    /** RFC3339 형식의 캠페인 시작 시각입니다. */
    startAt: string;
    /** RFC3339 형식의 캠페인 종료 시각입니다. */
    endAt: string;
    /** RFC3339 형식의 보상 청구 가능 마감 시각입니다. */
    claimAvailableAt: string;
    /** 캠페인에 포함된 보상 목록입니다. */
    rewards: CimeDropsReward[];
}

/**
 * 드롭스 보상 청구 목록 조회 쿼리 파라미터입니다.
 */
export interface CimeDropsRewardClaimsParams {
    /** 0부터 시작하는 페이지 번호입니다. */
    page?: number;
    /** 페이지 크기입니다. API 기본값은 20, 최댓값은 1000입니다. */
    size?: number;
    /** 보상 청구 ID 필터입니다. 배열은 쉼표 구분 문자열로 직렬화됩니다. */
    claimId?: string | string[];
    /** 시청자 채널 ID 필터입니다. */
    channelId?: string;
    /** 캠페인 ID 필터입니다. */
    campaignId?: string;
    /** 카테고리 ID 필터입니다. */
    categoryId?: string;
    /** 지급 처리 상태 필터입니다. */
    fulfillmentState?: CimeDropsFulfillmentState;
}

/**
 * 시청자가 드롭스 캠페인 보상에 대해 제출한 보상 청구입니다.
 */
export interface CimeDropsRewardClaim {
    /** 보상 청구 고유 ID입니다. */
    claimId: string;
    /** 청구와 연결된 캠페인 ID입니다. */
    campaignId: string;
    /** 청구와 연결된 보상 ID입니다. */
    rewardId: string;
    /** 캠페인에 할당된 카테고리 ID입니다. */
    categoryId: string;
    /** 캠페인에 할당된 카테고리 표시 이름입니다. */
    categoryName: string;
    /** 청구를 제출한 시청자 채널 ID입니다. */
    channelId: string;
    /** 현재 지급 처리 상태입니다. */
    fulfillmentState: CimeDropsFulfillmentState;
    /** RFC3339 형식의 마지막 청구 요청 시각입니다. */
    claimedDate: string;
    /** RFC3339 형식의 마지막 지급 상태 변경 시각입니다. */
    updatedDate: string;
}

/**
 * 드롭스 보상 청구 지급 상태 변경 요청 본문입니다.
 */
export interface CimeUpdateDropsRewardClaimsParams {
    /** 변경할 청구 ID 목록입니다. API는 최대 100개 ID를 받습니다. */
    claimIds: string[];
    /** 목표 지급 처리 상태입니다. */
    fulfillmentState: CimeDropsFulfillmentState;
}

/**
 * 보상 청구 상태 변경 API가 반환하는 그룹화된 결과입니다.
 */
export interface CimeDropsRewardClaimUpdateResult {
    /** 이 ID 그룹의 처리 결과 상태입니다. */
    status: CimeDropsClaimUpdateStatus;
    /** 해당 상태가 발생한 청구 ID 목록입니다. */
    ids: string[];
}

/**
 * 페이지 단위 드롭스 캠페인 목록 content입니다.
 */
export type CimeDropsCampaignList = CimeDataList<CimeDropsCampaign>;
/**
 * 페이지 단위 드롭스 보상 청구 목록 content입니다.
 */
export type CimeDropsRewardClaimList = CimeDataList<CimeDropsRewardClaim>;
/**
 * 드롭스 보상 청구 상태 변경 결과 content입니다.
 */
export type CimeDropsRewardClaimUpdateResultList = CimeDataList<CimeDropsRewardClaimUpdateResult>;
