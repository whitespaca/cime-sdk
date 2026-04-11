/**
 * 실시간 SUBSCRIPTION 이벤트 수신 시 전달되는 데이터 페이로드
 */
export interface CimeSubscriptionEventData {
    /** 구독이 발생한 채널의 ID */
    channelId: string;
    /** 구독자의 채널 ID */
    subscriberChannelId: string;
    /** 구독자의 채널 이름 (닉네임) */
    subscriberChannelName: string;
    /** 연속 구독 개월 수 */
    month: number;
    /** 구독 티어 번호 */
    tierNo: number;
    /** 구독 메시지 (이모티콘 토큰 포함 가능) */
    subscriptionMessage: string;
    /** 이모티콘 토큰 -> 이미지 URL 매핑 객체 */
    emojis: Record<string, string>;
}