/**
 * Service Worker Management Service
 */
export const workerService = {
  init: (onNeedRefresh?: () => void, onOfflineReady?: () => void) => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Listener setup for PWA updates
      navigator.serviceWorker.ready
        .then(() => {
          onNeedRefresh?.()
          onOfflineReady?.()
        })
        .catch((err) => {
          if (import.meta.env.DEV) {
            console.debug('[WorkerService] SW ready notice:', err)
          }
        })
    }
  },

  updateServiceWorker: async (reloadPage: boolean = true) => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
      if (reloadPage) {
        window.location.reload()
      }
    }
  },
}

export default workerService
