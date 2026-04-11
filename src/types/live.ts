/**
 * 커서 기반 페이지네이션 응답의 페이지 정보
 */
export interface CimeCursorPage {
    next: string | null;
}

/**
 * 커서 기반 페이지네이션을 사용하는 API의 공통 content 인터페이스입니다.
 */
export interface CimeCursorList<T> {
    data: T[];
    page: CimeCursorPage;
}

/**
 * 라이브 방송 기본 정보
 */
export interface CimeLive {
    liveId: string;
    liveTitle: string;
    liveThumbnailImageUrl: string | null;
    concurrentUserCount: number;
    /** 라이브 시작 시간 (ISO 8601) */
    openedDate: string | null;
    /** 연령 제한 설정 여부 */
    adult: boolean;
    tags: string[];
    categoryType: string | null;
    liveCategory: string | null;
    liveCategoryValue: string | null;
    channelId: string;
    channelName: string;
    channelHandle: string;
    channelImageUrl: string | null;
}

/**
 * 라이브 목록 조회 파라미터
 */
export interface CimeLivesParams {
    /** 페이지 크기 (1~20, 기본값: 20) */
    size?: number;
    /** 다음 페이지 커서 값 */
    next?: string;
}

/**
 * 라이브 설정 정보
 */
export interface CimeLiveSetting {
    defaultLiveTitle: string;
    category: Record<string, any> | null;
    tags: string[];
}

/**
 * 라이브 설정 변경 파라미터
 * 모든 필드는 선택 사항이며, 전달된 필드만 업데이트됩니다.
 */
export interface CimeUpdateLiveSettingParams {
    /** 라이브 제목 (1~100자) */
    defaultLiveTitle?: string;
    /** 태그 목록 (최대 6개) */
    tags?: string[];
    /** 카테고리 ID. null로 설정 시 카테고리 제거 */
    categoryId?: string | null;
}

/**
 * 스트림 키 정보
 */
export interface CimeStreamKey {
    streamKey: string;
}

/**
 * 라이브 방송 상태 정보
 */
export interface CimeLiveStatus {
    isLive: boolean;
    title: string | null;
    openedAt: string | null;
}