import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // THÊM ĐOẠN PROXY NÀY
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // Trỏ thẳng về Java của Hoa
        changeOrigin: true,
        secure: false,
      }
    }
  }
});