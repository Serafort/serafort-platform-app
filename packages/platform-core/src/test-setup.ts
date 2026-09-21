import '@testing-library/jest-dom'
import { vi } from 'vitest'

process.env.VITE_STORAGE_ENCRYPTION_KEY = 'test-storage-encryption-key-32-bytes!'

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, () => {}],
    updateServiceWorker: () => {},
  }),
}))

if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    callback: (entries: any[]) => void
    constructor(callback: (entries: any[]) => void) {
      this.callback = callback
    }
    observe(target: Element) {
      // Trigger callback with default bounding box for testing if needed
    }
    unobserve(target: Element) {}
    disconnect() {}
  } as any
}

// Node 26 exposes a native `localStorage` global that is unavailable without
// --localstorage-file, and jsdom does not install its own over it. Browsers
// always have one, so give tests an in-memory equivalent.
if (typeof window !== 'undefined' && !window.localStorage) {
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() {
      return store.size
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  }
  Object.defineProperty(window, 'localStorage', { value: memoryStorage, configurable: true })
}
