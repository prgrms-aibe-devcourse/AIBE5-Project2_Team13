import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // SPA 라우팅 설정: /request/123 같은 URL로 직접 접속해도 index.html을 반환합니다.
      // 이 설정이 없으면 공유 URL로 접속 시 404가 발생합니다.
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/ws': {
          // 개발 환경 WebSocket도 Vite가 8080 백엔드로 프록시해야 브라우저에서 같은 origin처럼 붙을 수 있습니다.
          target: 'ws://localhost:8080',
          changeOrigin: true,
          ws: true,
        }
      }
    },
  };
});
