import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 本番は /Animel/ 配下にデプロイされる（旧 CRA の homepage: "/Animel" 相当）
export default defineConfig({
  plugins: [react()],
  base: '/Animel/',
});
