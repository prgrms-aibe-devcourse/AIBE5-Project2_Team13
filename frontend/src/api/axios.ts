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
  // 로그인 방식에 따라 session/local storage 어디에 있든 읽습니다.
  const token = getAccessToken();

  if (token) {
    // "Authorization: Bearer [토큰값]" 형태로 헤더에 추가
    // → Spring Security의 JwtFilter가 이 헤더를 읽어서 인증 처리합니다.
    if (typeof config.headers?.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
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
