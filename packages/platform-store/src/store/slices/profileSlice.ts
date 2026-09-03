import { StateCreator } from 'zustand'
import type { AppStore } from '../../types'

export interface ResumeProfile {
  id: string
  name: string
  fileName: string
  uploadedAt: string
  isActive: boolean
  summary?: {
    skills: Array<string>
    experience: string
    education: string
    [key: string]: any
  }
  matchingPreferences?: {
    jobTypes: Array<string>
    locations: Array<string>
    salaryRange: {
      min: number
      max: number
    }
    [key: string]: any
  }
}

export interface ProfileSlice {
  // State
  profiles: ResumeProfile[]
  activeProfile: ResumeProfile | null

  // Actions
  addProfile: (profile: ResumeProfile) => void
  updateProfile: (id: string, updates: Partial<ResumeProfile>) => void
  deleteProfile: (id: string) => void
  setActiveProfile: (id: string) => void
  getProfile: (id: string) => ResumeProfile | undefined
}

export const createProfileSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  ProfileSlice
> = (set, get) => ({
  profiles: [],
  activeProfile: null,

  addProfile: (profile: ResumeProfile) => {
    set((state) => {
      if (state.profiles.length === 0) {
        profile.isActive = true
        state.activeProfile = profile
      }
      state.profiles.push(profile)
    })
  },

  updateProfile: (id: string, updates: Partial<ResumeProfile>) => {
    set((state) => {
      const index = state.profiles.findIndex((p) => p.id === id)
      if (index !== -1) {
        state.profiles[index] = { ...state.profiles[index], ...updates }

        if (state.activeProfile?.id === id) {
          state.activeProfile = { ...state.activeProfile, ...updates }
        }
      }
    })
  },

  deleteProfile: (id: string) => {
    set((state) => {
      const index = state.profiles.findIndex((p) => p.id === id)
      if (index !== -1) {
        const wasActive = state.profiles[index].isActive
        state.profiles.splice(index, 1)

        if (wasActive && state.profiles.length > 0) {
          state.profiles[0].isActive = true
          state.activeProfile = state.profiles[0]
        } else if (wasActive) {
          state.activeProfile = null
        }
      }
    })
  },

  setActiveProfile: (id: string) => {
    set((state) => {
      state.profiles.forEach((p) => {
        p.isActive = false
      })

      const profile = state.profiles.find((p) => p.id === id)
      if (profile) {
        profile.isActive = true
        state.activeProfile = profile
      }
    })
  },

  getProfile: (id: string) => {
    return get().profiles.find((p) => p.id === id)
  },
})
