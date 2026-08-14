import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
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
    alias: {
      '@': resolve(__dirname, './src'),
      '@auth': resolve(__dirname, './src'),
      '@cap/module-auth': resolve(__dirname, './src'),
      '@idaas': resolve(__dirname, './src/modules'),
      '@cap/platform-core': resolve(__dirname, '../../platform-core/src'),
      '@cap/platform-store': resolve(__dirname, '../../platform-store/src'),
      '@cap/shared-types': resolve(__dirname, '../../shared-types/src'),
      '@cap/layout': resolve(__dirname, '../../layout/src'),
      '@cap/theme': resolve(__dirname, '../../theme/src'),
      '@cap/authorization': resolve(__dirname, '../../authorization/src'),
    },
  },
})
