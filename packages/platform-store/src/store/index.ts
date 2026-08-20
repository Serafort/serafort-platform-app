import { create } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useEffect, useState } from 'react'
import encryption from '../services/encryption'

import { createAuthSlice, type AuthSlice } from './slices/authSlice'
import { onTerminalError, setGlobalNotificationHandler } from '../services/api/api.client'
import { createGuestSlice, type GuestSlice } from './slices/guestSlice'
import { createProfileSlice, type ProfileSlice } from './slices/profileSlice'
import { createNotificationSlice, type NotificationSlice } from './slices/notificationSlice'
import { createPreferencesSlice, type PreferencesSlice } from './slices/preferences/preferences'
import { createSettingsSlice, type SettingsSlice, LayoutOverride } from './slices/settingsSlice'
import { createNavigationSlice, type NavigationSlice } from './slices/navigationSlice'
import { createNetworkSlice, type NetworkSlice } from './slices/networkSlice'
import { createOfflineQueueSlice, type OfflineQueueSlice } from './slices/offlineQueueSlice'
import { createLayoutEngineSlice, type LayoutEngineSlice, DEFAULT_SLOT_SIZE } from './slices/layoutEngineSlice'
import { createWidgetStudioSlice, type WidgetStudioSlice } from './slices/widgetStudioSlice'
import type { AppStore } from '../types'
export type { LayoutOverride, AppStore, AuthSlice, GuestSlice, ProfileSlice, NotificationSlice, PreferencesSlice, SettingsSlice, NavigationSlice, NetworkSlice, OfflineQueueSlice, LayoutEngineSlice, WidgetStudioSlice }
export { DEFAULT_SLOT_SIZE }


// Hydration tracking
let hasHydrated = false
const hydrationListeners: Set<() => void> = new Set()

export const getHasHydrated = () => hasHydrated

export const onHydrationComplete = (callback: () => void) => {
  if (hasHydrated) {
    callback()
    return () => {}
  }
  hydrationListeners.add(callback)
  return () => hydrationListeners.delete(callback)
}

const setHydrated = () => {
  hasHydrated = true
  hydrationListeners.forEach((cb) => cb())
  hydrationListeners.clear()
}

/**
 * Hook to check if Zustand store has been hydrated from async storage
 * Use this to wait before checking auth state
 */
export const useHasHydrated = () => {
  const [isHydrated, setHasHydratedState] = useState(hasHydrated)

  useEffect(() => {
    if (hasHydrated) {
      setHasHydratedState(true)
      return
    }
    const unsubscribe = onHydrationComplete(() => setHasHydratedState(true))
    return unsubscribe
  }, [])

  return isHydrated
}

/**
 * Custom Secure Storage for Zustand
 */
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = localStorage.getItem(name)
    if (!value) return null

    const storageKey = (import.meta as any).env?.VITE_STORAGE_KEY || 'cap-platform-storage'
    if (name === storageKey) {
      try {
        const masterKey = (import.meta as any).env?.VITE_STORAGE_ENCRYPTION_KEY
        if (!masterKey) {
          throw new Error('VITE_STORAGE_ENCRYPTION_KEY is not defined')
        }
        return await encryption.decryptData(value, masterKey)
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[secureStorage] Decryption failed, falling back to raw value', e)
        }
        return value
      }
    }
    return value
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const storageKey = (import.meta as any).env?.VITE_STORAGE_KEY || 'cap-platform-storage'
    if (name === storageKey) {
      const masterKey = (import.meta as any).env?.VITE_STORAGE_ENCRYPTION_KEY || 'default-cap-storage-encryption-key-32-chars'
      const encrypted = await encryption.encryptData(value, masterKey)
      localStorage.setItem(name, encrypted)
    } else {
      localStorage.setItem(name, value)
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  },
}

/**
 * Main Application Store
 *
 * Uses Zustand with middleware for:
 * - Persistence (localStorage for auth, sessionStorage for guests)
 * - DevTools (Redux DevTools support)
 * - Immer (Immutable state updates)
 *
 * @see https://github.com/pmndrs/zustand
 */
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (immer as any)((...args: any[]) => ({
        ...createAuthSlice(...(args as [any, any, any])),
        ...createGuestSlice(...(args as [any, any, any])),
        ...createProfileSlice(...(args as [any, any, any])),
        ...createNotificationSlice(...(args as [any, any, any])),
        ...createPreferencesSlice(...(args as [any, any, any])),
        ...createSettingsSlice(...(args as [any, any, any])),
        ...createNavigationSlice(...(args as [any, any, any])),
        ...createNetworkSlice(...(args as [any, any, any])),
        ...createOfflineQueueSlice(...(args as [any, any, any])),
        ...createLayoutEngineSlice(...(args as [any, any, any])),
        ...createWidgetStudioSlice(...(args as [any, any, any])),
      })),
      {
        name: (import.meta as any).env?.VITE_STORAGE_KEY || 'cap-platform-storage',
        storage: createJSONStorage(() => secureStorage as any),
        onRehydrateStorage: (_state) => {
          if (import.meta.env.DEV) console.log('[useAppStore] hydration started')
          return (state, error) => {
            if (error) {
              console.error('[useAppStore] hydration failed:', error)
              // Mark hydration complete even on failure so app doesn't hang
              setHydrated()
            } else {
              if (import.meta.env.DEV) {
                console.log('[useAppStore] hydration finished')
                console.log('[useAppStore] Hydrated Auth State:', state?.isAuthenticated)
              }
              // Use queueMicrotask to ensure state is fully applied before marking hydration complete
              // This prevents race conditions where components check auth state before it's updated
              queueMicrotask(() => {
                if (import.meta.env.DEV)
                  console.log('[useAppStore] setHydrated called (after microtask)')
                setHydrated()
              })
            }
          }
        },
        merge: (persistedState: any, currentState) => {
          if (!persistedState) {
            return currentState
          }

          // Deep merge for nested objects if needed, or simple shallow merge if structure matches
          // Since partialize created a nested structure (auth, preferences, etc),
          // checking if we need to flatten it back implies that the store is flat but we persisted it nested.
          // However, based on createAuthSlice, the store IS flat (user, isAuthenticated are top level).
          // But partialize returns { auth: { user, isAuthenticated } }.
          // So we MUST flatten it back.

          const settings = {
            ...(currentState.settings || {}),
            ...(persistedState.settings || {}),
          };

          return {
            ...currentState,
            ...persistedState,
            ...(persistedState.auth || {}),
            preferences: {
              ...(currentState.preferences || {}),
              ...(persistedState.preferences || {}),
            },
            settings,
            mode: settings.mode || persistedState.theme?.mode || currentState.mode,
            offlineQueue: persistedState.offlineQueue || currentState.offlineQueue,
            layouts: persistedState.layouts || currentState.layouts,
          }
        },
        partialize: (state) => ({
          auth: {
            user: state.user,
            isAuthenticated: state.isAuthenticated,
            isAdmin: state.isAdmin,
          },
          preferences: state.preferences,
          settings: state.settings,
          offlineQueue: state.offlineQueue,
          layouts: state.layouts,
          widgetDrafts: state.widgetDrafts,
        }),
      },
    ),
    {
      name: (import.meta as any).env?.VITE_APP_NAME || 'cap-platform-store',
      enabled: import.meta.env.DEV,
      anonymousActionType: 'zustand/action',
      serialize: { options: true },
    },
  ),
) as unknown as {
  <T>(selector: (state: AppStore) => T): T
  getState(): AppStore
  setState(state: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)): void
  subscribe(listener: (state: AppStore, prevState: AppStore) => void): () => void
}

// --- Subscribe to Terminal Auth Errors ---
// When a terminal authentication failure occurs (e.g. 400 on refresh),
// we MUST clear the in-memory state to match the cleared storage
// to prevent infinite refresh loops in React components.
onTerminalError(() => {
  const state = useAppStore.getState()
  if (state.isAuthenticated) {
    console.warn('[AppStore] Received terminal auth error, forcing state reset')
    // Resetting state directly via store.setState to ensuring UI reactive updates
    useAppStore.setState(() => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      tokens: null,
    }))
  }
})

// Wire global notification handler from API client to store
setGlobalNotificationHandler((notification) => {
  useAppStore.getState().addNotification(notification)
})

import { useShallow } from 'zustand/shallow'

export const useAuthStore = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isAdmin: state.isAdmin,
      isLoading: state.isLoading,
      error: state.error,
      tokens: state.tokens,
      signIn: state.signIn,
      signOut: state.signOut,
      refreshAuth: state.refreshAuth,
      refreshToken: state.refreshToken,
      updateUser: state.updateUser,
      setUser: state.setUser,
      setTokens: state.setTokens,
      clearError: state.clearError,
    }))
  )

export const useGuest = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      guestSession: state.guestSession,
      isGuest: state.isGuest,
      createGuestSession: state.createGuestSession,
      clearGuestSession: state.clearGuestSession,
      addGuestData: state.addGuestData,
      getGuestData: state.getGuestData,
      incrementAnalysisCount: state.incrementAnalysisCount,
      analysisCounts: state.getAnalysisCount(),
    }))
  )


export const useProfile = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      profiles: state.profiles,
      activeProfile: state.activeProfile,
      addProfile: state.addProfile,
      updateProfile: state.updateProfile,
      deleteProfile: state.deleteProfile,
      setActiveProfile: state.setActiveProfile,
    }))
  )

export const useNotifications = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      notifications: state.notifications,
      unreadCount: state.unreadCount,
      addNotification: state.addNotification,
      markAsRead: state.markAsRead,
      markAllAsRead: state.markAllAsRead,
      deleteNotification: state.deleteNotification,
      clearNotifications: state.clearNotifications,
    }))
  )

export const usePreferences = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      preferences: state.preferences,
      updatePreferences: state.updatePreferences,
      resetPreferences: state.resetPreferences,
    }))
  )

export const useSettings = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      settings: state.settings,
      isSettingsChanged: state.isSettingsChanged,
      updateSettings: state.updateSettings,
      resetSettings: state.resetSettings,
      updatePageSettings: state.updatePageSettings,
    }))
  )

/** @deprecated Use useVerticalNav from @cap/layout */
export const useVerticalNavStore = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      ...state.verticalNav,
      updateVerticalNavState: state.updateVerticalNavState,
      collapseVerticalNav: state.collapseVerticalNav,
      hoverVerticalNav: state.hoverVerticalNav,
      toggleVerticalNav: state.toggleVerticalNav,
    }))
  )

/** @deprecated Use useHorizontalNav from @cap/layout */
export const useHorizontalNavStore = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      ...state.horizontalNav,
      updateIsBreakpointReached: state.updateIsBreakpointReached,
    }))
  )

export const useTheme = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      mode: state.settings.mode,
      toggleColorMode: state.toggleColorMode,
      setMode: state.setMode,
    }))
  )

export const useNetwork = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      isOnline: state.isOnline,
      setOnline: state.setOnline,
      setOffline: state.setOffline,
    }))
  )

export const useOfflineQueue = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      offlineQueue: state.offlineQueue,
      addToOfflineQueue: state.addToOfflineQueue,
      removeFromOfflineQueue: state.removeFromOfflineQueue,
      incrementOfflineRetry: state.incrementOfflineRetry,
      clearOfflineQueue: state.clearOfflineQueue,
    }))
  )

export const useWidgetStudio = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      // Panel
      widgetStudioPanelOpen: state.widgetStudioPanelOpen,
      openWidgetStudioPanel: state.openWidgetStudioPanel,
      closeWidgetStudioPanel: state.closeWidgetStudioPanel,
      toggleWidgetStudioPanel: state.toggleWidgetStudioPanel,
      // Drafts
      widgetDrafts: state.widgetDrafts,
      activeDraftId: state.activeDraftId,
      widgetStudioRunning: state.widgetStudioRunning,
      createWidgetDraft: state.createWidgetDraft,
      setActiveDraft: state.setActiveDraft,
      getActiveDraft: state.getActiveDraft,
      deleteWidgetDraft: state.deleteWidgetDraft,
      // Agent pipeline
      updateWidgetAgent: state.updateWidgetAgent,
      appendAgentStream: state.appendAgentStream,
      setWidgetStudioRunning: state.setWidgetStudioRunning,
      // DSL & Lifecycle
      setWidgetDsl: state.setWidgetDsl,
      setWidgetLifecycle: state.setWidgetLifecycle,
      appendAuditEntry: state.appendAuditEntry,
    }))
  )
