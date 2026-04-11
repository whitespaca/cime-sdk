/**
 * 배열 형태의 데이터를 반환하는 API의 공통 content 인터페이스입니다.
 * API 응답이 `{ content: { data: [...] } }` 형태일 때 사용합니다.
 */
export interface CimeDataList<T> {
    data: T[];
}

/**
 * 채널 기본 정보
 */
export interface CimeChannelInfo {
    channelId: string;
    channelName: string;
    channelHandle: string;
    channelImageUrl: string | null;
    channelDescription: string;
    followerCount: number;
}

/**
 * 팔로워 정보
 */
export interface CimeFollower {
    channelId: string;
    channelName: string;
    channelHandle: string;
    /** 팔로우 시작 시간 (ISO 8601) */
    createdDate: string;
}

/**
 * 팔로워 목록 조회 파라미터
 */
export interface CimeChannelFollowersParams {
    /** 페이지 번호 (0부터 시작, 기본값: 0) */
    page?: number;
    /** 페이지 크기 (기본값: 20) */
    size?: number;
}

/**
 * 구독자 정보
 */
export interface CimeSubscriber {
    channelId: string;
    channelName: string;
    channelHandle: string;
    /** 연속 구독 개월 수 */
    month: number;
    /** 구독 티어 번호 */
    tierNo: number;
    /** 구독 시작 시간 (ISO 8601) */
    createdDate: string;
}

/**
 * 구독자 목록 조회 파라미터
 */
export interface CimeChannelSubscribersParams {
    /** 페이지 번호 (0부터 시작, 기본값: 0) */
    page?: number;
    /** 페이지 크기 (1~50, 기본값: 30) */
    size?: number;
    /** 정렬 기준 (기본값: 'RECENT') */
    sort?: 'RECENT' | 'LONGER';
}

/**
 * 채널 관리자 역할 종류
 */
export type CimeStreamingRole =
    | 'STREAMING_CHANNEL_OWNER'
    | 'STREAMING_CHANNEL_MANAGER'
    | 'STREAMING_CHAT_MANAGER'
    | 'STREAMING_SETTLEMENT_MANAGER';

/**
 * 채널 관리자 정보
 */
export interface CimeManager {
    managerChannelId: string;
    managerChannelName: string;
    managerChannelHandle: string;
    userRole: CimeStreamingRole;
    /** 역할 부여 일시 (ISO 8601) */
    createdDate: string;
}