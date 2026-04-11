import { AxiosInstance } from 'axios';
import {
    CimeCursorList,
    CimeLive,
    CimeLivesParams,
    CimeLiveSetting,
    CimeUpdateLiveSettingParams,
    CimeStreamKey,
    CimeLiveStatus,
    CimeClientOptions,
} from '../types';

/**
 * 라이브(Live) 및 스트리밍 관련 API를 담당하는 클래스입니다.
 */
export class LiveAPI {
    constructor(private readonly httpClient: AxiosInstance, private readonly options: CimeClientOptions) {}

    /**
     * 현재 진행 중인 라이브 방송 목록을 조회합니다.
     *
     * @requires Auth: `Client ID / Secret` (공개 API)
     * @param params - 커서 기반 페이징 파라미터 (size, next)
     * @returns 라이브 목록과 다음 페이지 커서 정보
     */
    public async getLives(params?: CimeLivesParams): Promise<CimeCursorList<CimeLive>> {
        return this.httpClient.get<any, CimeCursorList<CimeLive>>('/open/v1/lives', {
        params,
        });
    }

    /**
     * 인증된 사용자 채널의 라이브 설정을 조회합니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `READ:LIVE_STREAM_SETTINGS`
     * @returns 라이브 설정 정보
     */
    public async getSettings(): Promise<CimeLiveSetting> {
        if (!this.options.scopes?.includes('READ:LIVE_STREAM_SETTINGS')) {
            throw new Error('[LiveAPI] "READ:LIVE_STREAM_SETTINGS" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        return this.httpClient.get<any, CimeLiveSetting>('/open/v1/lives/setting');
    }

    /**
     * 인증된 사용자 채널의 라이브 설정을 변경합니다. (전달된 필드만 업데이트)
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `WRITE:LIVE_STREAM_SETTINGS`
     * @param params - 변경할 라이브 설정 데이터
     */
    public async updateSettings(params: CimeUpdateLiveSettingParams): Promise<void> {
        if (!this.options.scopes?.includes('WRITE:LIVE_STREAM_SETTINGS')) {
            throw new Error('[LiveAPI] "WRITE:LIVE_STREAM_SETTINGS" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        await this.httpClient.patch('/open/v1/lives/setting', params);
    }

    /**
     * 인증된 사용자 채널의 스트림 키(Stream Key)를 조회합니다.
     * OBS 등 외부 방송 도구 연동 시 사용됩니다.
     *
     * @requires Auth: `Access Token`
     * @requires Scope: `READ:LIVE_STREAM_KEY`
     * @returns 스트림 키
     */
    public async getStreamKey(): Promise<CimeStreamKey> {
        if (!this.options.scopes?.includes('READ:LIVE_STREAM_KEY')) {
            throw new Error('[LiveAPI] "READ:LIVE_STREAM_KEY" 권한이 필요합니다. OAuth 인증 시 해당 권한을 포함시켜 주세요.');
        }
        return this.httpClient.get<any, CimeStreamKey>('/open/v1/streams/key');
    }

    /**
     * 특정 채널의 라이브 방송 여부와 상태를 확인합니다.
     * 이 API는 인증 없이 호출할 수 있는 완전 공개 API입니다.
     *
     * @requires Auth: 불필요
     * @param channelId - 상태를 조회할 채널의 ID
     * @returns 라이브 상태 정보
     */
    public async getLiveStatus(channelId: string): Promise<CimeLiveStatus> {
        // 주의: 이 엔드포인트는 /open/v1/ 접두사 없이 /v1/ 으로 시작합니다.
        return this.httpClient.get<any, CimeLiveStatus>(`/v1/${channelId}/live-status`);
    }
}