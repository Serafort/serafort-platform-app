import { SharedWorkerApiClientProxy } from './SharedWorkerApiClientProxy'

export * from './SharedWorkerApiClientProxy'
export * from './WorkerApiClientProxy'
export * from './api.shared-worker'
export * from './api.worker'

let sharedWorkerProxyInstance: SharedWorkerApiClientProxy | null = null

/**
 * Creates a smart API client with automatic 3-tier fallback:
 * 1. SharedWorker + Comlink RPC (cross-tab network deduplication & shared state across tabs)
 * 2. DedicatedWorker + Comlink RPC (off-thread network processing for single tab)
 * 3. Main-thread FetchClient (safe fallback if Workers are disabled/blocked)
 */
export function createSharedWorkerApiClient(workerScriptUrl?: string): SharedWorkerApiClientProxy | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (sharedWorkerProxyInstance) {
    return sharedWorkerProxyInstance
  }

  // Tier 1: SharedWorker (Cross-tab deduplication)
  if (typeof window.SharedWorker !== 'undefined') {
    try {
      const sharedWorker = workerScriptUrl
        ? new SharedWorker(workerScriptUrl, { type: 'module', name: 'cap-api-shared-worker' })
        : new SharedWorker(new URL('./api.shared-worker.ts', import.meta.url), {
            type: 'module',
            name: 'cap-api-shared-worker',
          })

      sharedWorkerProxyInstance = new SharedWorkerApiClientProxy(sharedWorker)
      if (import.meta.env.DEV) {
        console.log('⚡ [SharedWorker API] Connected to SharedWorker (Cross-Tab Network Deduplication Active)')
      }
      return sharedWorkerProxyInstance
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[SharedWorker API] SharedWorker creation failed, trying Dedicated Worker fallback:', err)
      }
    }
  }

  // Tier 2: Dedicated Worker (Single tab worker offloading)
  if (typeof window.Worker !== 'undefined') {
    try {
      const dedicatedWorker = workerScriptUrl
        ? new Worker(workerScriptUrl, { type: 'module' })
        : new Worker(new URL('./api.shared-worker.ts', import.meta.url), { type: 'module' })

      sharedWorkerProxyInstance = new SharedWorkerApiClientProxy(dedicatedWorker)
      if (import.meta.env.DEV) {
        console.log('⚡ [Worker API] Connected to Dedicated Worker (Off-thread execution active)')
      }
      return sharedWorkerProxyInstance
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[Worker API] Dedicated Worker creation failed, falling back to main-thread fetch:', err)
      }
    }
  }

  // Tier 3: Main thread fallback (handled by caller if return value is null)
  return null
}
