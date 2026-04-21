// 리팩토링 위해 생성함
import axios from 'axios';

// 1. axios 인스턴스 생성 (기본 설정)
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. 요청 보내기 전에 항상 실행할 로직 (인터셉터)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken'); // 저장된 토큰 가져오기
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;