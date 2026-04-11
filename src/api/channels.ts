import { AxiosInstance } from 'axios';
import {
    CimeDataList,
    CimeChannelInfo,
    CimeFollower,
    CimeChannelFollowersParams,
    CimeSubscriber,
    CimeChannelSubscribersParams,
    CimeManager,
    CimeClientOptions,
} from '../types';

/**
 * 채널(Channel) 관련 API를 담당하는 클래스입니다.
 * 채널 정보, 팔로워, 구독자, 관리자 목록 조회 기능을 제공합니다.
 */
export class ChannelsAPI {
    constructor(private readonly httpClient: AxiosInstance, private readonly options: CimeClientOptions) {}

    /**
     * 채널 ID 목록으로 채널의 기본 정보를 조회합니다. (최대 20개)
     *
     * @requires Auth: `Client ID / Secret` (공개 API)
     * @param channelIds - 조회할 채널 ID 문자열 또는 ID 문자열의 배열
     * @returns 채널 정보 목록
     * * @example
     * ```typescript
     * const { data } = await client.channels.getChannels(['12345', '67890']);
     * ```
     */
    public async getChannels(channelIds: string | string[]): Promise<CimeDataList<CimeChannelInfo>> {
        // 배열이 들어올 경우 쉼표로 구분된 문자열로 자동 변환하여 편의성을 높입니다.
        const parsedIds = Array.isArray(channelIds) ? channelIds.join(',') : channelIds;
        
        return this.httpClient.get<any, CimeDataList<CimeChannelInfo>>('/open/v1/channels', {
        params: { channelIds: parsedIds },
        });
    }

    /**
     * 인증된 사용자 채널의 팔로워 목록을 조회합니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `READ:CHANNEL`
     * @param params - 페이징 파라미터 (page, size)
     * @returns 팔로워 목록
     */
    public async getFollowers(params?: CimeChannelFollowersParams): Promise<CimeDataList<CimeFollower>> {
        if (!this.options.scopes?.includes('READ:CHANNEL')) {
            throw new Error('[ChannelsAPI] "READ:CHANNEL" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        return this.httpClient.get<any, CimeDataList<CimeFollower>>('/open/v1/channels/followers', {
        params,
        });
    }

    /**
     * 인증된 사용자 채널의 구독자 목록을 조회합니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `READ:SUBSCRIPTION`
     * @param params - 페이징 및 정렬 파라미터 (page, size, sort)
     * @returns 구독자 목록
     */
    public async getSubscribers(params?: CimeChannelSubscribersParams): Promise<CimeDataList<CimeSubscriber>> {
        if (!this.options.scopes?.includes('READ:SUBSCRIPTION')) {
            throw new Error('[ChannelsAPI] "READ:SUBSCRIPTION" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        return this.httpClient.get<any, CimeDataList<CimeSubscriber>>('/open/v1/channels/subscribers', {
        params,
        });
    }

    /**
     * 인증된 사용자 채널의 관리자 목록을 조회합니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `READ:CHANNEL`
     * @returns 관리자 목록
     */
    public async getManagers(): Promise<CimeDataList<CimeManager>> {
        if (!this.options.scopes?.includes('READ:CHANNEL')) {
            throw new Error('[ChannelsAPI] "READ:CHANNEL" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        return this.httpClient.get<any, CimeDataList<CimeManager>>('/open/v1/channels/streaming-roles');
    }
}