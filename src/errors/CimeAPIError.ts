import { CimeErrorResponse } from '../types';

/**
 * ci.me API 요청 중 발생하는 에러를 캡슐화한 커스텀 에러 클래스입니다.
 * HTTP 상태 코드와 API가 반환한 상세 메시지를 포함합니다.
 */
export class CimeAPIError extends Error {
    public readonly statusCode: number;

    /**
     * @param errorResponse - API 서버에서 반환한 에러 객체
     */
    constructor(errorResponse: CimeErrorResponse) {
        super(errorResponse.message);
        this.name = 'CimeAPIError';
        this.statusCode = errorResponse.statusCode;

        Object.setPrototypeOf(this, CimeAPIError.prototype);
    }
}