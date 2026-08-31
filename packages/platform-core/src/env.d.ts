/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_STORAGE_ENCRYPTION_KEY?: string
  readonly VITE_STORAGE_KEY?: string
  /** Local-dev sign-in form prefill only (never used in production builds). */
  readonly VITE_DEV_LOGIN_EMAIL?: string
  /** Local-dev sign-in form prefill only (never used in production builds). */
  readonly VITE_DEV_LOGIN_PASSWORD?: string
  // Any other VITE_* value (kept loose so build-time config reads stay type-safe).
  readonly [key: `VITE_${string}`]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:pwa-register' {
  export type RegisterSWOptions = {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}
