import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const certificatePath = resolve(__dirname, '.certs/dev-cert.pem');
const privateKeyPath = resolve(__dirname, '.certs/dev-key.pem');
const hasLocalCertificate = existsSync(certificatePath) && existsSync(privateKeyPath);

// https://vitejs.dev/config/
export default defineConfig({
  base: '/noteflow/',
  plugins: [react()],
  server: {
    https: hasLocalCertificate
      ? {
          cert: readFileSync(certificatePath),
          key: readFileSync(privateKeyPath),
        }
      : undefined,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
