import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const colyseusTarget = 'http://localhost:2500';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: '0.0.0.0',
    allowedHosts: ['blackjack.jayryuki.com'],
    proxy: {
      '/api': colyseusTarget,
      '/matchmake': colyseusTarget,
    },
  },
});
