import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env variables (optional for dev)
  const env = loadEnv(mode, process.cwd(), '');

  // Fallback stub if GEMINI_API_KEY is missing
  const apiKey = env.GEMINI_API_KEY || 'dev-prototype-key';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0', // accessible on LAN
    },
    plugins: [react()],
    define: {
      // Expose a safe placeholder so app doesn't crash
      'import.meta.env.API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
