import axios from 'axios';
import { clearAccessToken, clearStoredUserContext, getAccessToken } from '@/src/lib/auth';

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
    // 401 Unauthorized 에러 처리 (토큰 만료 등)
    if (error.response?.status === 401) {
      const message = error.response?.data?.message;

      // "인증이 필요합니다"라는 메시지라도,
      // 신청 관련 API(/api/class-orders)에서 온 거라면 로그아웃시키지 않도록 예외 처리
      const isClassOrderApi = error.config.url?.includes('/class-orders');

      if (isClassOrderApi) {
        console.warn("신청 API에서 401 발생 - 로그아웃 방지");
        return Promise.reject(error); // 로그아웃 로직 타지 않음
      }

      // 만약 토큰 만료 메시지라면 로그아웃 처리
      if (message && (message.includes('expired') || message.includes('만료') || message.includes('인증'))) {
        clearAccessToken();
        clearStoredUserContext();
        
        // 메인 페이지나 로그인 페이지로 이동시키고 싶을 때 사용
        // 단, 현재 페이지에서 바로 튕기게 하고 싶지 않다면 alert만 띄울 수도 있음
        if (!window.location.pathname.includes('/login')) {
          alert(message || '세션이 만료되었습니다. 다시 로그인해주세요.');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
