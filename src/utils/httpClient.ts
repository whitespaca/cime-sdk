import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { CimeAPIError } from '../errors/CimeAPIError';
import { CimeCommonResponse, CimeErrorResponse, CimeClientOptions } from '../types';
import { getVersion } from './version';

/**
 * 인증 정보와 기본 설정이 포함된 Axios 클라이언트 인스턴스를 생성합니다.
 */
export function createHttpClient(options: CimeClientOptions): AxiosInstance {
    const client = axios.create({
        baseURL: 'https://ci.me/api/openapi',
        timeout: options.timeout || 10000,
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': `CimeSDK/${getVersion()} (Node)`,
        },
    });

    client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        if (options.accessToken) {
            config.headers['Authorization'] = `Bearer ${options.accessToken}`;
        }
        if (options.clientId && options.clientSecret) {
            config.headers['Client-Id'] = options.clientId;
            config.headers['Client-Secret'] = options.clientSecret;
        }
        return config;
    });

    axiosRetry(client, {
        retries: options.retries ?? 3,
        retryDelay: axiosRetry.exponentialDelay,
        retryCondition: (error: AxiosError) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 500;
        },
    });

    client.interceptors.response.use(
        (response: AxiosResponse<CimeCommonResponse>) => {
        return response.data.content as any;
        },
        (error: AxiosError<CimeErrorResponse>) => {
        if (error.response && error.response.data) {
            throw new CimeAPIError(error.response.data);
        }
        throw error;
        }
    );

    return client;
}