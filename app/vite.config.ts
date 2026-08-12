import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// __dirname = <boilerplate>/app
// workspaceRoot = <boilerplate>          (packages/, node_modules/ live here)
const workspaceRoot = path.resolve(__dirname, '..')

let vitePWA: ((options?: any) => Plugin | Plugin[]) | null = null
try {
  const require = createRequire(import.meta.url)
  require.resolve('vite-plugin-pwa')
  const mod = await import('vite-plugin-pwa')
  vitePWA = mod.VitePWA
} catch {
  console.warn('[vite.config] vite-plugin-pwa not found — PWA features disabled for this session.')
}

// ── Smart Auth Module Detection ──────────────────────────────────────────────
const authModulePath = path.resolve(workspaceRoot, 'packages/modules/auth/src')
const authExists = fs.existsSync(authModulePath)
const authShimPath = path.resolve(workspaceRoot, 'packages/platform-core/src/stubs/auth-shim.tsx')

if (!authExists) {
  console.info(`[vite.config] @cap/module-auth not found at ${authModulePath}. Using shim fallback.`)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(vitePWA
      ? [
          (vitePWA as any)({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            devOptions: {
              enabled: true,
            },
            workbox: {
              maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MiB — covers largest vendor chunk
              runtimeCaching: [
                {
                  urlPattern: /\.(?:js|css|json)$/i,
                  handler: 'StaleWhileRevalidate',
                  options: {
                    cacheName: 'static-assets',
                  },
                },
              ],
              // CRITICAL: never cache API routes
              navigateFallbackDenylist: [/^\/api\//],
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: [
      // ── Auth Module Catch-all ──
      { find: '@cap/module-auth', replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src') : authShimPath },
      { find: /^@cap\/module-auth\/(.*)$/, replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src/$1') : authShimPath },
      // ── Internal Auth Aliases ──
      { find: /^@auth\/(authentication-core|authorization-engine|developer-console|identity-broker|mfa-orchestrator|passwordless-service|platform-cluster|session-manager|user-directory)(\/.*)?$/, replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src/modules/$1$2') : authShimPath },
      { find: /^@auth\/(.*)$/, replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src/$1') : authShimPath },
      { find: '@auth', replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src') : authShimPath },
      { find: /^@idaas\/(.*)$/, replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src/modules/$1') : authShimPath },
      { find: '@idaas', replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src/modules') : authShimPath },
      { find: /^@\/routes\/(.*)$/, replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src/routes/$1') : authShimPath },
      { find: '@\/routes', replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src/routes') : authShimPath },
      { find: /^@\/modules\/(.*)$/, replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src/modules/$1') : authShimPath },
      { find: '@\/modules', replacement: authExists ? path.resolve(workspaceRoot, 'packages/modules/auth/src/modules') : authShimPath },

      // ── Workspace source package aliases ─────────────────────────────────────
      { find: '@cap/layout',          replacement: path.resolve(workspaceRoot, 'packages/layout/src') },
      { find: '@cap/authorization',   replacement: path.resolve(workspaceRoot, 'packages/authorization/src') },
      { find: '@cap/theme',           replacement: path.resolve(workspaceRoot, 'packages/theme/src') },
      { find: '@cap/api-contracts',   replacement: path.resolve(workspaceRoot, 'packages/api-contracts/src') },
      { find: '@cap/auth-contracts',  replacement: path.resolve(workspaceRoot, 'packages/auth-contracts/src') },
      { find: '@cap/shared-types',    replacement: path.resolve(workspaceRoot, 'packages/shared-types/src') },
      { find: '@cap/platform-core',   replacement: path.resolve(workspaceRoot, 'packages/platform-core/src') },
      { find: '@cap/platform-store',  replacement: path.resolve(workspaceRoot, 'packages/platform-store/src') },
      
      // ── Feature Modules (Dynamic for existing modules) ──────────────────────
      { find: '@cap/module-landing',  replacement: path.resolve(workspaceRoot, 'packages/modules/landing/src') },
      { find: /^@cap\/module-([a-z0-9-]+)$/, replacement: path.resolve(workspaceRoot, 'packages/modules/$1/src') },

      // ── App-local catch-alls (LAST — least specific) ──────────────────────────
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: 'src', replacement: path.resolve(__dirname, './src') },
      { find: 'app', replacement: path.resolve(__dirname, './src') },
    ],
    dedupe: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-use',
      '@tanstack/react-query',
      '@tanstack/react-table',
      '@tanstack/react-virtual',
      '@tanstack/match-sorter-utils',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      'zustand',
      '@cap/platform-core',
      '@cap/platform-store',
    ],
  },
  optimizeDeps: {
    force: true, // Force Vite to clear its cache and re-bundle @mui/system
    include: [
      '@tanstack/react-query',
      'react-toastify',
    ],
    // Exclude workspace source packages — they are TypeScript source-linked
    exclude: [
      '@cap/layout',
      '@cap/authorization',
      '@cap/theme',
      '@cap/api-contracts',
      '@cap/auth-contracts',
      '@cap/shared-types',
      '@cap/platform-core',
      '@cap/platform-store',
      '@cap/module-auth',
      '@cap/module-admin',
      '@cap/module-landing',
      '@cap/module-user',
      '@cap/module-kyc',
      '@cap/module-digital-id',
      '@cap/module-civil-registry',
      '@cap/module-monitoring-alerts',
      '@cap/module-blockchain-idaas',
      '@cap/module-mfa',
    ],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3333',
        changeOrigin: true,
        configure: (proxy) => {
          // SECURITY NOTE (Finding 4.4): This dev proxy forwards client Host as x-tenant-host for local dev.
          // Production reverse proxies / edge ingress MUST NOT trust or forward client-supplied Host headers
          // as tenant identifiers without edge signature or session-token claims.
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers.host) {
              proxyReq.setHeader('x-tenant-host', req.headers.host)
            }
          })
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ── Vendor splits — keeps the main entry chunk under 2 MB ──────────────
          if (id.includes('@mui/icons-material')) return 'vendor-mui-icons'
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('@mui/material') || id.includes('@mui/system') || id.includes('@mui/base')) return 'vendor-mui'
          if (id.includes('@floating-ui')) return 'vendor-floating-ui'
          if (id.includes('react-router') || id.includes('react-router-dom')) return 'vendor-router'
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react'
          if (id.includes('@tanstack/')) return 'vendor-tanstack'
          if (id.includes('zustand')) return 'vendor-zustand'
          if (id.includes('comlink')) return 'vendor-comlink'
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
})
