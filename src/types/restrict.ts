/**
 * 사용자 추방 및 추방 해제 파라미터
 */
export interface CimeRestrictUserParams {
    /** 추방(또는 해제)할 사용자의 채널 ID */
    targetChannelId: string;
}

/**
 * 추방 사용자 목록 조회 파라미터
 */
export interface CimeGetRestrictedUsersParams {
    /** 페이지 크기 (1~50, 기본값: 20) */
    size?: number;
    /** 다음 페이지 커서 값 */
    next?: string;
}

/**
 * 추방된 사용자 정보
 */
export interface CimeRestrictedUser {
    restrictedChannelId: string;
    restrictedChannelName: string;
    restrictedChannelHandle: string;
    /** 추방 일시 (ISO 8601) */
    createdDate: string;
    /** 추방 만료 일시. 영구 추방 시 null */
    releaseDate: string | null;
}