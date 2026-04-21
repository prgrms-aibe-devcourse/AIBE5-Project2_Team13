import axios from 'axios';
import {clearAccessToken, clearStoredUserContext, getAccessToken} from '@/src/lib/auth';

/**
 * 전역 axios 인스턴스
 *
 * 인터셉터(Interceptor)란?
 * - 모든 API 요청이 서버로 나가기 전에 가로채서 공통 처리를 합니다.
 * - 여기서는 로그인 후 저장된 JWT 토큰을 모든 요청 헤더에 자동으로 붙여줍니다.
 * - 덕분에 각 API 호출 코드마다 토큰을 수동으로 붙이지 않아도 됩니다.
 */
const apiClient = axios.create({
    baseURL: '/api',
});

// 요청 인터셉터 — 모든 API 호출 직전에 실행됩니다.
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();

    // 💡 아래 로그를 반드시 확인하세요!
    console.log("🔍 [인터셉터] 확인된 토큰:", token);

    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    } else {
        // 💡 토큰이 없는데도 요청을 보낸다면 여기서 경고가 뜰 거예요!
        console.warn("⚠️ [인터셉터] 주의: 토큰이 없습니다. 인증 없이 요청이 나갑니다.");
    }

    return config;
});

// 응답 인터셉터 — 모든 API 응답 직후에 실행됩니다.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.response?.data || "오류가 발생했습니다.";

        // 1. 401 Unauthorized 에러 처리 (로그아웃 방어)
        if (status === 401) {
            // 신청 관련 API라면 로그아웃 예외 처리
            const isClassOrderApi = error.config.url?.includes('/class-orders');

            if (isClassOrderApi) {
                console.warn("신청 API에서 401 발생 - 로그아웃 방지");
                return Promise.reject(error);
            }

            // 만약 토큰 만료 메시지라면 로그아웃 처리
            if (message && (typeof message === 'string') && (message.includes('expired') || message.includes('만료') || message.includes('인증'))) {
                clearAccessToken();
                clearStoredUserContext();
                if (!window.location.pathname.includes('/login')) {
                    alert(message || '세션이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }

        // 2. 400 Bad Request 처리 (추가됨!)
        // 이제 서버에서 "이미 신청한 클래스입니다" 같은 메시지를 400으로 보내면 여기서 잡아서 보여줍니다.
        if (status === 400) {
            alert(message); // "이미 신청한 클래스입니다."가 알림창으로 뜹니다!
            return Promise.reject(error);
        }

        // 3. 기타 에러
        console.error("API 에러:", error);
        return Promise.reject(error);
    }
);

export default apiClient;
