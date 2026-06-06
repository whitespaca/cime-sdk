import { AxiosInstance } from 'axios';
import { CimeDataList, CimeCategory, CimeSearchCategoriesParams } from '../types';

/**
 * 카테고리(Category) 관련 API를 담당하는 클래스입니다.
 */
export class CategoriesAPI {
    /**
     * 공유 HTTP 클라이언트를 사용하는 카테고리 API 래퍼를 생성합니다.
     *
     * @param httpClient ci.me 인증 설정이 적용된 Axios 인스턴스
     */
    constructor(private readonly httpClient: AxiosInstance) {}

    /**
     * 라이브 설정 등에 사용할 카테고리를 키워드로 검색합니다.
     *
     * @requires Auth: `Client ID / Secret` (공개 API)
     * @param params - 검색 키워드 및 페이지 크기 파라미터
     * @returns 검색된 카테고리 목록
     */
    public async searchCategories(params?: CimeSearchCategoriesParams): Promise<CimeDataList<CimeCategory>> {
        return this.httpClient.get<any, CimeDataList<CimeCategory>>('/open/v1/categories/search', {
        params,
        });
    }
}
