/**
 * Guest Session Slice
 *
 * Manages anonymous/guest user sessions with session-based storage.
 * Guest data is stored in sessionStorage and cleared when browser closes.
 *
 * Features:
 * - Temporary profile analysis results
 * - Limited job recommendations
 * - Session tracking
 */

import { StateCreator } from 'zustand'
import type { AppStore } from '../../types'

export interface GuestSessionData {
  sessionId: string
  createdAt: string
  profileAnalysis?: any
  jobRecommendations?: any[]
  searchHistory?: any[]
  resumeData?: any
  analysisCount?: number
}

export interface GuestSlice {
  // State
  guestSession: GuestSessionData | null
  isGuest: boolean

  // Actions
  createGuestSession: () => void
  clearGuestSession: () => void
  addGuestData: <K extends keyof GuestSessionData>(key: K, data: GuestSessionData[K]) => void
  getGuestData: <K extends keyof GuestSessionData>(key: K) => GuestSessionData[K] | undefined
  incrementAnalysisCount: () => void
  getAnalysisCount: () => number
}

const GUEST_STORAGE_KEY = (import.meta as any).env?.VITE_GUEST_STORAGE_KEY || 'cap-platform-guest-session'

const saveGuestToSession = (data: GuestSessionData | null) => {
  if (data) {
    sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data))
  } else {
    sessionStorage.removeItem(GUEST_STORAGE_KEY)
  }
}

const loadGuestFromSession = (): GuestSessionData | null => {
  try {
    const stored = sessionStorage.getItem(GUEST_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const generateSessionId = (): string => {
  return `guest_${crypto.randomUUID()}`
}

export const createGuestSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  GuestSlice
> = (set, get) => ({
  // Initial State - Load from sessionStorage
  guestSession: loadGuestFromSession(),
  isGuest: !!loadGuestFromSession(),

  // Create Guest Session
  createGuestSession: () => {
    const newSession: GuestSessionData = {
      sessionId: generateSessionId(),
      createdAt: new Date().toISOString(),
    }

    set((state) => {
      state.guestSession = newSession
      state.isGuest = true
    })

    saveGuestToSession(newSession)
  },

  // Clear Guest Session
  clearGuestSession: () => {
    set((state) => {
      state.guestSession = null
      state.isGuest = false
    })

    saveGuestToSession(null)
  },

  addGuestData: (key, data) => {
    set((state) => {
      if (!state.guestSession) {
        const newSession: GuestSessionData = {
          sessionId: generateSessionId(),
          createdAt: new Date().toISOString(),
          [key]: data,
        }
        state.guestSession = newSession
        state.isGuest = true
        saveGuestToSession(newSession)
      } else {
        state.guestSession = {
          ...state.guestSession,
          [key]: data,
        }
        saveGuestToSession(state.guestSession)
      }
    })
  },

  getGuestData: (key) => {
    const session = get().guestSession
    return session ? session[key] : undefined
  },

  // Increment Analysis Count
  incrementAnalysisCount: () => {
    set((state) => {
      if (state.guestSession) {
        const currentCount = state.guestSession.analysisCount || 0
        state.guestSession.analysisCount = currentCount + 1
        saveGuestToSession(state.guestSession)
      }
    })
  },

  // Get Analysis Count
  getAnalysisCount: () => {
    const session = get().guestSession
    return session?.analysisCount || 0
  },
})

export const isGuestSessionActive = (): boolean => {
  return !!loadGuestFromSession()
}

export const getGuestSessionData = (): GuestSessionData | null => {
  return loadGuestFromSession()
}
