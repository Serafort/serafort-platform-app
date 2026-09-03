/* cspell:ignore notif */
import { useEffect, useState } from 'react'
import { useAppStore, useHasHydrated } from './../store'
import { localStorageManager, sessionStorageManager, STORAGE_KEYS } from './storage'

export interface HydrationStatus {
  isHydrated: boolean
  isHydrating: boolean
  error: Error | null
}

/**
 * Hook to manage state hydration
 */
export const useStateHydration = (): HydrationStatus => {
  const [status, setStatus] = useState<HydrationStatus>({
    isHydrated: false,
    isHydrating: true,
    error: null,
  })

  const refreshAuth = useAppStore((state) => state.refreshAuth)
  const guestSession = useAppStore((state) => state.guestSession)
  const createGuestSession = useAppStore((state) => state.createGuestSession)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const hasZustandHydrated = useHasHydrated()

  useEffect(() => {
    if (!hasZustandHydrated) {
      return // Wait for Zustand to hydrate its persisted state before acting
    }

    const hydrateState = async () => {
      try {
        setStatus((prev) => ({ ...prev, isHydrating: true }))

        // 1. Check for authentication using the persisted Zustand state
        console.log('[useStateHydration] Checking auth state:', isAuthenticated)

        if (isAuthenticated) {
          // If Zustand thinks we are authenticated, attempt to refresh tokens
          console.log('[useStateHydration] Auth state found, refreshing auth...')
          await refreshAuth()
        } else {
          // Create guest session if no auth
          if (!guestSession) {
            createGuestSession()
          }
        }

        // 2. Restore other state from storage (if needed)
        // This is handled automatically by Zustand persist middleware

        setStatus({
          isHydrated: true,
          isHydrating: false,
          error: null,
        })
      } catch (error) {
        console.error('State hydration error:', error)
        setStatus({
          isHydrated: false,
          isHydrating: false,
          error: error as Error,
        })
      }
    }

    hydrateState()
  }, [refreshAuth, guestSession, createGuestSession, isAuthenticated, hasZustandHydrated])

  return status
}

/**
 * Preload critical data before rendering app
 */
export const preloadCriticalData = async () => {
  try {
    // Preload any critical data here
    // For example: user preferences, initial job data, etc.

    return true
  } catch (error) {
    console.error('Error preloading critical data:', error)
    return false
  }
}

/**
 * Clear stale data from storage
 */
export const clearStaleData = () => {
  const now = Date.now()
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

  // Clear old notifications
  const notifications = localStorageManager.get<any[]>(STORAGE_KEYS.NOTIFICATIONS)
  if (notifications && Array.isArray(notifications)) {
    const freshNotifications = notifications.filter((notif) => {
      const notifDate = new Date(notif.timestamp).getTime()
      return now - notifDate < maxAge
    })
    localStorageManager.set(STORAGE_KEYS.NOTIFICATIONS, freshNotifications)
  }

  // Clear old guest sessions from sessionStorage
  const guestSession = sessionStorageManager.get<any>(STORAGE_KEYS.GUEST_SESSION)
  if (guestSession) {
    const sessionDate = new Date(guestSession.createdAt).getTime()
    if (now - sessionDate > maxAge) {
      sessionStorageManager.remove(STORAGE_KEYS.GUEST_SESSION)
    }
  }
}

/**
 * Export state for backup/debugging
 */
export const exportState = () => {
  const state = {
    auth: localStorageManager.get(STORAGE_KEYS.USER_DATA),
    preferences: localStorageManager.get(STORAGE_KEYS.USER_PREFERENCES),
    savedJobs: localStorageManager.get(STORAGE_KEYS.SAVED_JOBS),
    profiles: localStorageManager.get(STORAGE_KEYS.RESUME_PROFILES),
    notifications: localStorageManager.get(STORAGE_KEYS.NOTIFICATIONS),
  }

  const dataStr = JSON.stringify(state, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `linkedin-scraper-state-${new Date().toISOString()}.json`
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * Import state from backup
 */
export const importState = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target?.result as string)

        // Restore state
        if (state.auth) localStorageManager.set(STORAGE_KEYS.USER_DATA, state.auth)
        if (state.preferences)
          localStorageManager.set(STORAGE_KEYS.USER_PREFERENCES, state.preferences)
        if (state.savedJobs) localStorageManager.set(STORAGE_KEYS.SAVED_JOBS, state.savedJobs)
        if (state.profiles) localStorageManager.set(STORAGE_KEYS.RESUME_PROFILES, state.profiles)
        if (state.notifications)
          localStorageManager.set(STORAGE_KEYS.NOTIFICATIONS, state.notifications)

        resolve()
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export default useStateHydration
