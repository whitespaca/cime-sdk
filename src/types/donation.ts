/**
 * 지원하는 후원 이벤트 타입입니다.
 */
export type CimeDonationType = 'CHAT' | 'VIDEO' | 'CHEERING';

/**
 * 후원자를 표시할 때 함께 제공되는 배지 정보입니다.
 */
export interface CimeDonationBadge {
    /** 배지 ID입니다. */
    id: string;
    /** 배지 표시 이름입니다. */
    name: string;
    /** 배지 이미지 URL입니다. */
    imageUrl: string;
}

/**
 * 응원 후원에서 선택된 아이템 정보입니다.
 */
export interface CimeCheeringItem {
    /** 해당 아이템을 선택한 수량입니다. */
    cnt: number;
    /** 아이템 타입 코드입니다. */
    type: string;
    /** 응원 후원 스킨 타입입니다. 예: `CONCERT` */
    skinType: string;
    /** 아이템 개당 빔 금액입니다. */
    amount: number;
    /** 아이템 이미지 URL입니다. */
    imageUrl: string;
    /** 채팅에 표시되는 오버레이 이미지 URL입니다. */
    overlayImageUrl: string;
}

/**
 * 실시간 DONATION 이벤트로 전달되는 페이로드입니다.
 */
export interface CimeDonationEventData {
    /** 후원 타입입니다. */
    donationType: CimeDonationType;
    /** 후원이 발생한 채널 ID입니다. */
    channelId: string;
    /** 후원자 채널 ID입니다. 익명 후원일 때는 `null`입니다. */
    donatorChannelId: string | null;
    /** 후원자 닉네임입니다. 익명 후원일 때는 `null`입니다. */
    donatorNickname: string | null;
    /** 후원자 배지 목록입니다. 배지가 없으면 빈 배열입니다. */
    donatorBadges: CimeDonationBadge[];
    /** 빔 단위 후원 금액입니다. 정밀도 손실을 피하기 위해 문자열로 유지합니다. */
    payAmount: string;
    /** 후원 메시지입니다. 응원 후원에서는 항상 빈 문자열입니다. */
    donationText: string;
    /** 이모티콘 토큰과 이미지 URL의 매핑입니다. */
    emojis: Record<string, string>;
    /** 응원 후원일 때만 제공되는 아이템 목록입니다. */
    cheeringItems?: CimeCheeringItem[];
}
