import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode
  const env = loadEnv(mode, process.cwd(), '');

  let target = 'http://localhost:3000';
  if (env.VITE_BASE_URL) {
    try {
      const url = new URL(env.VITE_BASE_URL);
      target = url.origin;
    } catch {
      // Fallback if VITE_BASE_URL is not a full URL (e.g. '/api')
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
      },
    },
  };
})
