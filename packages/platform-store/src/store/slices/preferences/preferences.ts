import { StateCreator } from 'zustand'
import type { AppStore } from '../../types'
import { UserPreferences, defaultPreferences } from './User'

export interface PreferencesSlice {
  preferences: UserPreferences

  updatePreferences: (updates: Partial<UserPreferences>) => void
  resetPreferences: () => void
  updateNotificationPreferences: (updates: Partial<UserPreferences['notifications']>) => void
  updateJobPreferences: (updates: Partial<UserPreferences['jobPreferences']>) => void
}

export const createPreferencesSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  PreferencesSlice
> = (set) => ({
  preferences: defaultPreferences,

  updatePreferences: (updates: Partial<UserPreferences>) => {
    set((state) => {
      state.preferences = {
        ...state.preferences,
        ...updates,
      }
    })
  },

  resetPreferences: () => {
    set((state) => {
      state.preferences = defaultPreferences
    })
  },

  updateNotificationPreferences: (updates: Partial<UserPreferences['notifications']>) => {
    set((state) => {
      state.preferences.notifications = {
        ...state.preferences.notifications,
        ...updates,
      }
    })
  },

  updateJobPreferences: (updates: Partial<UserPreferences['jobPreferences']>) => {
    set((state) => {
      state.preferences.jobPreferences = {
        ...state.preferences.jobPreferences,
        ...updates,
      }
    })
  },
})
