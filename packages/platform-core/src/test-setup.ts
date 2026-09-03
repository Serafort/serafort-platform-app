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
