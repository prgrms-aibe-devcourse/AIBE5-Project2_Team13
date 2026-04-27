import axios from 'axios';
import { clearAccessToken, clearStoredUserContext, getAccessToken } from '@/src/lib/auth';

declare module 'axios' {
    interface AxiosRequestConfig<D = any> {
        suppressAuthExpiredAlert?: boolean;
    }

    interface InternalAxiosRequestConfig<D = any> {
        suppressAuthExpiredAlert?: boolean;
    }
}

const apiClient = axios.create({
    baseURL: '/api',
});

let isHandlingAuthExpiry = false;

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message =
            error.response?.data?.message ||
            error.response?.data ||
            '오류가 발생했습니다.';

        if (status === 401) {
            const isClassOrderApi = error.config?.url?.includes('/class-orders');

            if (isClassOrderApi) {
                return Promise.reject(error);
            }

            const shouldForceLogout =
                typeof message === 'string' &&
                (
                    message.includes('expired') ||
                    message.includes('만료') ||
                    message.includes('ExpiredJwtException') ||
                    message.includes('JWT 인증 실패')
                );

            if (shouldForceLogout) {
                if (isHandlingAuthExpiry) {
                    return Promise.reject(error);
                }

                isHandlingAuthExpiry = true;
                clearAccessToken();
                clearStoredUserContext();

                if (!window.location.pathname.includes('/login')) {
                    if (!error.config?.suppressAuthExpiredAlert) {
                        alert(message || '세션이 만료되었습니다. 다시 로그인해주세요.');
                    }

                    window.location.href = '/login';
                }

                window.setTimeout(() => {
                    isHandlingAuthExpiry = false;
                }, 1000);
            }

            return Promise.reject(error);
        }

        if (status === 400) {
            alert(message);
            return Promise.reject(error);
        }

        console.error('API error:', error);
        return Promise.reject(error);
    }
);

export default apiClient;
