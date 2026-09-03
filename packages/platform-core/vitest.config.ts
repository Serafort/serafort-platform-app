import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  define: {
    'import.meta.env.VITE_STORAGE_ENCRYPTION_KEY': JSON.stringify(
      'test-storage-encryption-key-32-bytes!',
    ),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test-setup.ts'],
    },
  },
  resolve: {
    alias: [
      { find: /^@cap\/platform-core(\/.*)?$/, replacement: resolve(__dirname, './src$1') },
      {
        find: /^@cap\/module-auth(\/.*)?$/,
        replacement: resolve(__dirname, '../modules/auth/src$1'),
      },
      {
        find: /^@cap\/module-landing(\/.*)?$/,
        replacement: resolve(__dirname, '../modules/landing/src$1'),
      },
      {
        find: /^@auth\/(authentication-core|authorization-engine|developer-console|identity-broker|mfa-orchestrator|passwordless-service|platform-cluster|session-manager|user-directory)(\/.*)?$/,
        replacement: resolve(__dirname, '../modules/auth/src/modules/$1$2'),
      },
      { find: /^@auth(\/.*)?$/, replacement: resolve(__dirname, '../modules/auth/src$1') },
      { find: /^@idaas(\/.*)?$/, replacement: resolve(__dirname, '../modules/auth/src/modules$1') },
      { find: '@cap/authorization', replacement: resolve(__dirname, '../authorization/src') },
      { find: '@cap/layout', replacement: resolve(__dirname, '../layout/src') },
      { find: '@cap/theme', replacement: resolve(__dirname, '../theme/src') },
      { find: '@cap/platform-store', replacement: resolve(__dirname, '../platform-store/src') },
      { find: '@cap/shared-types', replacement: resolve(__dirname, '../shared-types/src') },
      {
        find: 'virtual:pwa-register/react',
        replacement: resolve(__dirname, './src/stubs/pwa-stub.ts'),
      },
      { find: '@', replacement: resolve(__dirname, './src') },
    ],
  },
})
