import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Use different environments based on test location
    environmentMatchGlobs: [
      ['apps/web/**/*.test.*', 'jsdom'], // Web app tests need DOM
      ['apps/web/**/__tests__/**', 'jsdom'], // Web app tests need DOM  
      ['tests/**', 'node'], // API tests use node environment
    ],
    environment: 'node', // Default environment for API tests
    setupFiles: [
      './tests/setup.js', // API test setup
      './apps/web/tests/setup.ts' // Web test setup
    ],
    testTimeout: 30000, // 30s for database operations
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      // Skip database tests in CI environment
      ...(process.env.CI === 'true' ? [
        'tests/security-vulnerability.test.js',
        'tests/security-validation.test.js', 
        'tests/seed-data.test.js'
      ] : [])
    ]
  }
});