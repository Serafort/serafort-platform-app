import { StateCreator } from 'zustand'
import type { AppStore } from '../../types'

export interface NetworkSlice {
  isOnline: boolean
  setOnline: () => void
  setOffline: () => void
}

export const createNetworkSlice: StateCreator<
  AppStore,
  [['zustand/immer', never]],
  [],
  NetworkSlice
> = (set) => ({
  isOnline: typeof window !== 'undefined' ? window.navigator.onLine : true,
  setOnline: () =>
    set((state: AppStore) => {
      state.isOnline = true
    }),
  setOffline: () =>
    set((state: AppStore) => {
      state.isOnline = false
    }),
})
