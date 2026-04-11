/**
 * 채팅 허용 그룹 (모두, 팔로워 전용, 관리자 전용)
 */
export type CimeChatAllowedGroup = 'ALL' | 'FOLLOWER' | 'MANAGER';

/**
 * 채팅 설정 정보
 */
export interface CimeChatSettings {
    chatAllowedGroup: CimeChatAllowedGroup;
    /** 최소 팔로우 시간 (분). FOLLOWER 모드일 때 적용됩니다. */
    minFollowerMinute: number;
    /** 팔로워 모드에서 구독자 즉시 채팅 허용 여부 */
    followerSubscriberChatAllow: boolean | null;
}

/**
 * 채팅 설정 변경 파라미터
 * 모든 필드는 선택사항이며, 전달된 필드만 업데이트됩니다.
 */
export interface CimeUpdateChatSettingsParams {
    /** 이모지 전용 모드 여부 */
    chatEmojiMode?: boolean;
    /** 채팅 딜레이 (초) */
    chatSlowModeSec?: number;
    chatAllowedGroup?: CimeChatAllowedGroup;
    /** 최소 팔로우 시간 (분) */
    minFollowerMinute?: number;
    /** 팔로워 모드에서 구독자 즉시 채팅 허용 여부 */
    followerSubscriberChatAllow?: boolean;
}

/**
 * 채팅 메시지 전송 파라미터
 */
export interface CimeSendChatMessageParams {
    /** 전송할 메시지 (1~100자) */
    message: string;
    /** * 발신자 타입 (기본값: APP)
     * - APP: 애플리케이션 소유자 이름으로 표시
     * - USER: 인증된 사용자 본인 이름으로 표시
     */
    senderType?: 'APP' | 'USER';
}

/**
 * 채팅 메시지 전송 응답
 */
export interface CimeSendChatMessageResponse {
    messageId: string;
}

/**
 * 채팅 공지 등록 파라미터
 * 주의: message 또는 messageId 중 하나는 반드시 제공되어야 합니다.
 */
export interface CimeRegisterChatNoticeParams {
    /** 새 메시지로 공지 등록 시 사용 (1~100자) */
    message?: string;
    /** 기존 메시지를 공지로 등록 시 사용 */
    messageId?: string;
}

/**
 * 실시간 채팅 이벤트의 프로필 정보
 */
export interface CimeChatProfile {
    nickname: string;
}

/**
 * 실시간 CHAT 이벤트 수신 시 전달되는 데이터 페이로드
 */
export interface CimeChatEventData {
    /** 채팅이 발생한 채널의 ID */
    channelId: string;
    /** 메시지 작성자의 채널 ID */
    senderChannelId: string;
    /** 작성자 프로필 정보 */
    profile: CimeChatProfile;
    /** 채팅 메시지 원본 (이모티콘 토큰 포함 가능) */
    content: string;
    /** 메시지 전송 시간 (ISO 8601) */
    messageTime: string;
    /** 이모티콘 토큰 -> 이미지 URL 매핑 객체 */
    emojis: Record<string, string>;
}