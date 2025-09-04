import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000 // 30s for API/database operations
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../packages/shared/src')
    }
  }
});