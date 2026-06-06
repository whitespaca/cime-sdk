export type CimeDonationType = 'CHAT' | 'VIDEO' | 'CHEERING';

export interface CimeDonationBadge {
    id: string;
    name: string;
    imageUrl: string;
}

export interface CimeCheeringItem {
    cnt: number;
    type: string;
    skinType: string;
    amount: number;
    imageUrl: string;
    overlayImageUrl: string;
}

export interface CimeDonationEventData {
    /** Donation type. */
    donationType: CimeDonationType;
    /** Channel ID where the donation occurred. */
    channelId: string;
    /** Donator channel ID. Null for anonymous donations. */
    donatorChannelId: string | null;
    /** Donator nickname. Null for anonymous donations. */
    donatorNickname: string | null;
    /** Donator badges. Empty array when there are no badges. */
    donatorBadges: CimeDonationBadge[];
    /** Donation amount in beam units, kept as a string to avoid precision loss. */
    payAmount: string;
    /** Donation message. Cheering donations always use an empty string. */
    donationText: string;
    /** Emoji token to image URL mapping. */
    emojis: Record<string, string>;
    /** Provided only for cheering donations. */
    cheeringItems?: CimeCheeringItem[];
}
