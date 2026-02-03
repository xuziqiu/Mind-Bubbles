import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    // 生产环境部署到 /mind-bubbles 子路径
    // 开发环境仍然使用站点根路径，方便本地调试
    base: isProd ? '/mind-bubbles/' : '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      }
    }
  };
});