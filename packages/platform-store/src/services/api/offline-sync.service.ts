import { secureTokenManager } from '../secureTokenManager'
import { apiClient } from './api.client'
import { useAppStore } from '../../store'

export async function replayOfflineQueue() {
  const store = useAppStore.getState()
  const { offlineQueue, removeFromOfflineQueue, incrementOfflineRetry } = store

  if (offlineQueue.length === 0) return

  console.log(`[OfflineSync] Replaying ${offlineQueue.length} queued mutations...`)

  try {
    // Guard — must have a valid session before replaying
    // This will trigger a refresh if needed, and if that fails, it will 401/403 and the queue will stay or be wiped based on TerminalError
    await secureTokenManager.ensureInitialized()

    // Check if we are actually online before starting
    if (!window.navigator.onLine) {
        console.warn('[OfflineSync] Offline, aborting replay')
        return
    }

    for (const entry of [...offlineQueue]) {
      try {
        console.log(`[OfflineSync] Replaying ${entry.method} ${entry.url}`)

        let response
        switch (entry.method) {
          case 'POST':
            response = await apiClient.post(entry.url, entry.body)
            break
          case 'PUT':
            response = await apiClient.put(entry.url, entry.body)
            break
          case 'PATCH':
            response = await apiClient.patch(entry.url, entry.body)
            break
          case 'DELETE':
            response = await apiClient.delete(entry.url)
            break
          default:
            console.error(`[OfflineSync] Unsupported method: ${entry.method}`)
            removeFromOfflineQueue(entry.id)
            continue
        }

        if (response.ok) {
          console.log(`[OfflineSync] Successfully replayed ${entry.id}`)
          removeFromOfflineQueue(entry.id)
        } else {
           // Handle specific errors like 409 Conflict
           if (response.status === 409) {
             console.warn(`[OfflineSync] Conflict (409) for ${entry.id}. Manual resolution required.`)
             // In a real app, we might notify the user. For now, we'll keep it in queue or remove it.
             // ADR says: "surfaceConflictToUser(entry)". We'll just log and keep for now.
             incrementOfflineRetry(entry.id)
           } else {
             incrementOfflineRetry(entry.id)
           }
        }
      } catch (err: any) {
        console.error(`[OfflineSync] Failed to replay ${entry.id}:`, err.message)

        // If it's a terminal auth error, it will be handled by the store reset
        // If it's a network error again, we stop replaying
        if (err.code === 'NETWORK_ERROR' || (err instanceof TypeError && err.message === 'Failed to fetch')) {
            console.warn('[OfflineSync] Network lost during replay, stopping.')
            break
        }

        incrementOfflineRetry(entry.id)

        // If we have too many retries, maybe remove it?
        if ((offlineQueue.find(e => e.id === entry.id)?.retryCount || 0) > 5) {
            console.error(`[OfflineSync] Entry ${entry.id} failed too many times. Removing.`)
            removeFromOfflineQueue(entry.id)
        }
      }
    }
  } catch (error) {
    console.error('[OfflineSync] Critical failure during replay:', error)
  }
}
