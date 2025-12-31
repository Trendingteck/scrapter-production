import { resolve } from 'node:path';
import { withPageConfig } from '@extension/vite-config';

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');

export default withPageConfig({
  resolve: {
    alias: {
      '@src': srcDir,
    },
    // CRITICAL FIX: Forces all packages to use the same React instance
    // This resolves the "Invalid hook call" error in the Side Panel
    dedupe: ['react', 'react-dom'],
  },
  publicDir: resolve(rootDir, 'public'),
  build: {
    // Keeps your original build output location
    outDir: resolve(rootDir, '..', '..', 'dist', 'side-panel'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
      },
    },
  },
});