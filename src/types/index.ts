export * from './auth';
export * from './users';
export * from './channels';
export * from './live';
export * from './chat';
export * from './categories';
export * from './restrict';
export * from './sessions';
export * from './donation';
export * from './subscription'; // 구독 타입 추가

export interface CimeCommonResponse<T = unknown> {
    code: number;
    message: string | null;
    content: T;
}

export interface CimeErrorResponse {
    statusCode: number;
    message: string;
}

export interface CimeClientOptions {
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    scopes?: string[];
    timeout?: number;
    retries?: number;
}