/**
 * 카테고리 정보
 */
export interface CimeCategory {
    categoryId: string;
    categoryType: string;
    categoryValue: string;
    posterImageUrl: string | null;
}

/**
 * 카테고리 검색 파라미터
 */
export interface CimeSearchCategoriesParams {
    /** 검색 키워드. 미입력 시 전체 카테고리를 반환합니다. */
    keyword?: string;
    /** 검색 결과 수 (1~50, 기본값: 20) */
    size?: number;
}