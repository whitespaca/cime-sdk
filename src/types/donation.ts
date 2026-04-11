/**
 * 후원 유형 (채팅 후원 또는 영상 후원)
 */
export type CimeDonationType = 'CHAT' | 'VIDEO';

/**
 * 실시간 DONATION 이벤트 수신 시 전달되는 데이터 페이로드
 */
export interface CimeDonationEventData {
    /** 후원 유형 */
    donationType: CimeDonationType;
    /** 후원이 발생한 채널의 ID */
    channelId: string;
    /** 후원자의 채널 ID (익명 후원 시 null) */
    donatorChannelId: string | null;
    /** 후원자 닉네임 (익명 후원 시 null) */
    donatorNickname: string | null;
    /** 후원 금액 (빔 단위, 정밀도 손실 방지를 위해 문자열 사용) */
    payAmount: string;
    /** 후원 메시지 */
    donationText: string;
    /** 이모티콘 토큰 -> 이미지 URL 매핑 객체 */
    emojis: Record<string, string>;
}