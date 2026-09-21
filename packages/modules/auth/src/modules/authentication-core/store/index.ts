import { StateCreator } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'
import type { NormalizedUser } from '../utils/normalizeAuthUser'

export interface AuthState {
  user: NormalizedUser | null
  isAuthenticated: boolean
  isLoading: boolean
  mfaRequired: boolean
  mfaMethod: 'totp' | 'backup_code' | 'passkey' | null
  sessionId: string | null
}

export interface AuthActions {
  setUser: (user: NormalizedUser | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setMfaRequired: (required: boolean, method?: AuthState['mfaMethod']) => void
  setLoading: (isLoading: boolean) => void
  setSessionId: (sessionId: string | null) => void
  clearUser: () => void
  clearAuth: () => void
}

export type AuthSlice = AuthState & AuthActions

export interface UiState {
  authStep: 'credentials' | 'mfa' | 'passkey' | 'complete'
  redirectAfterLogin: string | null
  errorBanner: string | null
}

export interface UiActions {
  setAuthStep: (step: UiState['authStep']) => void
  setRedirect: (path: string | null) => void
  setErrorBanner: (message: string | null) => void
  clearError: () => void
}

export type UiSlice = UiState & UiActions

export type StoreState = AuthState & AuthActions & UiState & UiActions

const createAuthSlice: StateCreator<StoreState, [['zustand/immer', never]], [], AuthSlice> = (
  set,
) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  mfaRequired: false,
  mfaMethod: null,
  sessionId: null,

  setUser: (user) =>
    set((state: StoreState) => {
      state.user = user
    }),
  setAuthenticated: (isAuthenticated) =>
    set((state: StoreState) => {
      state.isAuthenticated = isAuthenticated
    }),
  setMfaRequired: (required, method = null) =>
    set((state: StoreState) => {
      state.mfaRequired = required
      state.mfaMethod = method
    }),
  setLoading: (isLoading) =>
    set((state: StoreState) => {
      state.isLoading = isLoading
    }),
  setSessionId: (sessionId) =>
    set((state: StoreState) => {
      state.sessionId = sessionId
    }),
  clearUser: () =>
    set((state: StoreState) => {
      state.user = null
    }),
  clearAuth: () =>
    set((state: StoreState) => {
      state.user = null
      state.isAuthenticated = false
      state.mfaRequired = false
      state.mfaMethod = null
      state.sessionId = null
    }),
})

const createUiSlice: StateCreator<StoreState, [['zustand/immer', never]], [], UiSlice> = (set) => ({
  authStep: 'credentials',
  redirectAfterLogin: null,
  errorBanner: null,

  setAuthStep: (step) =>
    set((state: StoreState) => {
      state.authStep = step
    }),
  setRedirect: (path) =>
    set((state: StoreState) => {
      state.redirectAfterLogin = path
    }),
  setErrorBanner: (message) =>
    set((state: StoreState) => {
      state.errorBanner = message
    }),
  clearError: () =>
    set((state: StoreState) => {
      state.errorBanner = null
    }),
})

export const useAuthStore = create<StoreState>()(
  immer((...a) => ({
    ...createAuthSlice(...a),
    ...createUiSlice(...a),
  })),
)

export { createAuthSlice, createUiSlice }
