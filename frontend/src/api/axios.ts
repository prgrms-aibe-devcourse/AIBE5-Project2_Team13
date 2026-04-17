import axios from 'axios';
import { getAccessToken } from '@/src/lib/auth';

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
  config.headers = {
    ...config.headers,
  };

  if (token) {
    // "Authorization: Bearer [토큰값]" 형태로 헤더에 추가
    // → Spring Security의 JwtFilter가 이 헤더를 읽어서 인증 처리합니다.
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
