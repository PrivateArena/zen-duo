import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow testing on tablets/phones via local network
    proxy: {
      '/api/tts': {
        target: 'http://localhost:5055',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts/, '')
      },
      '/api/translate': {
        target: 'http://localhost:8765',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/translate/, '/translate')
      },
      '/api/paint': {
        target: 'http://localhost:18765',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/paint/, '/paint')
      }
    }
  }
});
