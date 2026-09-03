import { StateCreator } from 'zustand'
import type { AppStore } from '../../types'

// Re-export queue types from shared-types for backward compatibility
export type { OfflineQueueEntry, OfflineQueueEntryInput, QueueHttpMethod } from '@cap/shared-types'
import type { OfflineQueueEntry } from '@cap/shared-types'

export interface OfflineQueueSlice {
  offlineQueue: OfflineQueueEntry[]
  addToOfflineQueue: (entry: Omit<OfflineQueueEntry, 'id' | 'timestamp' | 'retryCount'>) => void
  removeFromOfflineQueue: (id: string) => void
  incrementOfflineRetry: (id: string) => void
  clearOfflineQueue: () => void
}

export const createOfflineQueueSlice: StateCreator<
  AppStore,
  [['zustand/immer', never]],
  [],
  OfflineQueueSlice
> = (set) => ({
  offlineQueue: [],
  addToOfflineQueue: (entry) =>
    set((state: AppStore) => {
      state.offlineQueue.push({
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        retryCount: 0,
      })
    }),
  removeFromOfflineQueue: (id) =>
    set((state: AppStore) => {
      state.offlineQueue = state.offlineQueue.filter((e: OfflineQueueEntry) => e.id !== id)
    }),
  incrementOfflineRetry: (id) =>
    set((state: AppStore) => {
      const entry = state.offlineQueue.find((e: OfflineQueueEntry) => e.id === id)
      if (entry) {
        entry.retryCount += 1
      }
    }),
  clearOfflineQueue: () =>
    set((state: AppStore) => {
      state.offlineQueue = []
    }),
})
