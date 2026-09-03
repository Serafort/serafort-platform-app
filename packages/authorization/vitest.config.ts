import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  define: {
    'import.meta.env.VITE_STORAGE_ENCRYPTION_KEY': JSON.stringify('test-storage-encryption-key-32-bytes!'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    fileParallelism: false,
    pool: 'threads',
  },
  resolve: {
    alias: [
      { find: /^@cap\/theme(\/.*)?$/, replacement: path.resolve(__dirname, '../theme/src$1') },
      { find: '@cap/shared-types', replacement: path.resolve(__dirname, '../shared-types/src') },
      { find: '@cap/platform-store', replacement: path.resolve(__dirname, '../platform-store/src') },
      { find: '@cap/authorization', replacement: path.resolve(__dirname, './src') },
    ],
  },
})
