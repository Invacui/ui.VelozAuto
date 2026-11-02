import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/** Replace __GA_ID__ placeholder in index.html with the env var; strips the
 *  GA blocks entirely when no measurement id is configured. */
function gaPlugin() {
  return {
    name: 'ga-replace',
    transformIndexHtml(html: string) {
      const env = loadEnv(process.env.MODE ?? 'production', './environments', 'APP_');
      const id = env.APP_GA_MEASUREMENT_ID || '';
      if (!id) {
        return html.replace(
          /<!-- Google Analytics[\s\S]*?-->\s*<script[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/,
          '',
        );
      }
      return html.replaceAll('__GA_ID__', id);
    },
  };
}

export default defineConfig({
  plugins: [react(), gaPlugin()],
  envDir: './environments',
  envPrefix: 'APP_',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/node_modules[\\/](react-dom|react|scheduler)[\\/]/.test(id)) return 'react';
          if (/node_modules[\\/]react-router/.test(id)) return 'router';
          if (/node_modules[\\/](@reduxjs|react-redux|redux)[\\/]/.test(id)) return 'redux';
          if (/node_modules[\\/]@tanstack[\\/]/.test(id)) return 'query';
          if (/node_modules[\\/](socket.io-client|engine.io-client|socket.io-parser)[\\/]/.test(id)) return 'realtime';
          if (/node_modules[\\/](apexcharts|react-apexcharts)[\\/]/.test(id)) return 'charts';
          if (/node_modules[\\/]lucide-react[\\/]/.test(id)) return 'icons';
        },
      },
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      '/api': {
        target: process.env['APP_API_URL'] ?? 'http://localhost:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env['APP_API_URL'] ?? 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
