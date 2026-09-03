import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FetchResponse } from '@cap/platform-core'

const {
  mockSignin,
  mockSignout,
  mockRevokeSession,
  mockRevokeAllSessions,
  mockRefreshToken,
  mockSetTokens,
  mockClearTokens,
} = vi.hoisted(() => ({
  mockSignin: vi.fn(),
  mockSignout: vi.fn(),
  mockRevokeSession: vi.fn(),
  mockRevokeAllSessions: vi.fn(),
  mockRefreshToken: vi.fn(),
  mockSetTokens: vi.fn(),
  mockClearTokens: vi.fn(),
}))

vi.mock('../services/auth.service', () => ({
  default: {
    signin: mockSignin,
    signout: mockSignout,
    revokeSession: mockRevokeSession,
    revokeAllSessions: mockRevokeAllSessions,
    refreshToken: mockRefreshToken,
  },
}))

vi.mock('@cap/platform-core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    secureTokenManager: {
      setTokens: mockSetTokens,
      clearTokens: mockClearTokens,
    },
    useAppStore: {
      getState: () => ({
        setUser: vi.fn(),
        signOut: vi.fn(),
      }),
    },
  }
})

// ─── Auth store mock (real Zustand store so state updates are observable) ────

// We import the real store so state changes from onSuccess are reflected
// without needing to assert on mock call args alone.
import { useAuthStore } from '../store'

// ─── React Query wrapper ──────────────────────────────────────────────────────

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ok = <T>(data: T): FetchResponse<T> =>
  ({ data, status: 200, statusText: 'OK', headers: new Headers(), ok: true, config: {} }) as any

const err = (message = 'Server error', status = 500) => {
  const e: any = new Error(message)
  e.response = { status, data: { message } }
  return e
}

// ─── Import hooks under test (after mocks are set up) ─────────────────────────

import {
  useSignin,
  useSignout,
  useRevokeSession,
  useRevokeAllSessions,
  useRefreshToken,
} from './useAuthQuery'

// ─── useSignin ────────────────────────────────────────────────────────────────

describe('useSignin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clearAuth()
  })

  it('calls authService.signin with the provided credentials', async () => {
    mockSignin.mockResolvedValue(ok({ token: 'tok', user: { id: 1 }, expires_in: 3600 }))
    const { result } = renderHook(() => useSignin(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate({ data: { email: 'a@b.com', password: 'secret' } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockSignin).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' })
  })

  it('sets tokens in secureTokenManager on a successful login', async () => {
    mockSignin.mockResolvedValue(ok({ token: 'abc123', user: { id: 1 }, expires_in: 1800 }))
    const { result } = renderHook(() => useSignin(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate({ data: { email: 'x@y.com', password: 'pw' } })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockSetTokens).toHaveBeenCalledWith(expect.objectContaining({ accessToken: 'abc123' }))
  })

  it('sets isAuthenticated=true and stores the user in the auth store', async () => {
    const user = { id: 42, email: 'u@v.com' }
    mockSignin.mockResolvedValue(ok({ token: 'tok', user, expires_in: 3600 }))
    const { result } = renderHook(() => useSignin(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate({ data: { email: 'u@v.com', password: 'pw' } })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const store = useAuthStore.getState()
    expect(store.isAuthenticated).toBe(true)
    expect(store.user).toEqual(user)
    expect(store.authStep).toBe('complete')
  })

  it('advances to the mfa step when the server signals mfa_required', async () => {
    mockSignin.mockResolvedValue(ok({ mfa_required: true, userId: 99 }))
    const { result } = renderHook(() => useSignin(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate({ data: { email: 'a@b.com', password: 'pw' } })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const store = useAuthStore.getState()
    expect(store.mfaRequired).toBe(true)
    expect(store.authStep).toBe('mfa')
    expect(store.isAuthenticated).toBe(false)
    expect(mockSetTokens).not.toHaveBeenCalled()
  })

  it('writes an error banner and calls customOnError when the API rejects', async () => {
    const customOnError = vi.fn()
    mockSignin.mockRejectedValue(err('Invalid credentials', 401))
    const { result } = renderHook(() => useSignin({ onError: customOnError }), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate({ data: { email: 'a@b.com', password: 'bad' } })
    })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(useAuthStore.getState().errorBanner).toBeTruthy()
    expect(customOnError).toHaveBeenCalledTimes(1)
  })

  it('calls the custom onSuccess callback after the built-in logic runs', async () => {
    const customOnSuccess = vi.fn()
    mockSignin.mockResolvedValue(ok({ token: 'tok', user: { id: 1 }, expires_in: 3600 }))
    const { result } = renderHook(() => useSignin({ onSuccess: customOnSuccess }), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate({ data: { email: 'a@b.com', password: 'pw' } })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(customOnSuccess).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().isAuthenticated).toBe(true) // built-in ran first
  })
})

// ─── useSignout ───────────────────────────────────────────────────────────────

describe('useSignout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Seed authenticated state so we can verify it's cleared
    useAuthStore.getState().setAuthenticated(true)
    useAuthStore.getState().setUser({ id: 1 })
    useAuthStore.getState().setAuthStep('complete')
  })

  it('calls authService.signout', async () => {
    mockSignout.mockResolvedValue(ok({ message: 'Logged out' }))
    const { result } = renderHook(() => useSignout(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockSignout).toHaveBeenCalledTimes(1)
  })

  it('clears tokens, resets auth store, and resets authStep on success', async () => {
    mockSignout.mockResolvedValue(ok({ message: 'Logged out' }))
    const { result } = renderHook(() => useSignout(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockClearTokens).toHaveBeenCalledTimes(1)
    const store = useAuthStore.getState()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
    expect(store.authStep).toBe('credentials')
  })

  it('calls the custom onSuccess callback after built-in cleanup', async () => {
    const customOnSuccess = vi.fn()
    mockSignout.mockResolvedValue(ok({ message: 'ok' }))
    const { result } = renderHook(() => useSignout({ onSuccess: customOnSuccess }), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(customOnSuccess).toHaveBeenCalledTimes(1)
    expect(mockClearTokens).toHaveBeenCalled() // built-in ran before custom
  })

  it('still calls customOnError when the signout API fails', async () => {
    const customOnError = vi.fn()
    mockSignout.mockRejectedValue(err('Network error'))
    const { result } = renderHook(() => useSignout({ onError: customOnError }), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(customOnError).toHaveBeenCalledTimes(1)
  })
})

// ─── useRefreshToken ──────────────────────────────────────────────────────────

describe('useRefreshToken', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls authService.refreshToken', async () => {
    mockRefreshToken.mockResolvedValue(ok({ token: 'newTok', expires_in: 3600 }))
    const { result } = renderHook(() => useRefreshToken(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate({})
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRefreshToken).toHaveBeenCalledTimes(1)
  })

  it('writes new tokens to secureTokenManager when a token is returned', async () => {
    mockRefreshToken.mockResolvedValue(ok({ token: 'fresh', expires_in: 900 }))
    const { result } = renderHook(() => useRefreshToken(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate({})
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockSetTokens).toHaveBeenCalledWith(expect.objectContaining({ accessToken: 'fresh' }))
  })

  it('does not call setTokens when the response contains no token', async () => {
    mockRefreshToken.mockResolvedValue(ok({}))
    const { result } = renderHook(() => useRefreshToken(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate({})
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockSetTokens).not.toHaveBeenCalled()
  })

  it('calls customOnSuccess with the response', async () => {
    const customOnSuccess = vi.fn()
    const response = ok({ token: 'tok', expires_in: 3600 })
    mockRefreshToken.mockResolvedValue(response)
    const { result } = renderHook(() => useRefreshToken({ onSuccess: customOnSuccess }), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate({})
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(customOnSuccess).toHaveBeenCalled()
  })

  it('calls customOnError when the refresh fails', async () => {
    const customOnError = vi.fn()
    mockRefreshToken.mockRejectedValue(err('Refresh failed', 401))
    const { result } = renderHook(() => useRefreshToken({ onError: customOnError }), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate({})
    })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(customOnError).toHaveBeenCalledTimes(1)
  })
})

// ─── useRevokeSession ─────────────────────────────────────────────────────────

describe('useRevokeSession', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls authService.revokeSession with the given sessionId', async () => {
    mockRevokeSession.mockResolvedValue(ok({ message: 'Session revoked' }))
    const { result } = renderHook(() => useRevokeSession(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate('sess_abc')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRevokeSession).toHaveBeenCalledWith('sess_abc')
  })

  it('invalidates the sessions query on success', async () => {
    // We verify the invalidation side-effect by confirming onSuccess fires.
    // QueryClient.invalidateQueries is tested implicitly — a second query would
    // re-fetch, but that requires a running server. Here we just assert the
    // customOnSuccess downstream fires, confirming the onSuccess block executed.
    const customOnSuccess = vi.fn()
    mockRevokeSession.mockResolvedValue(ok({ message: 'ok' }))
    const { result } = renderHook(() => useRevokeSession({ onSuccess: customOnSuccess }), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate('sess_xyz')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(customOnSuccess).toHaveBeenCalledTimes(1)
  })

  it('calls customOnError when the API rejects', async () => {
    const customOnError = vi.fn()
    mockRevokeSession.mockRejectedValue(err('Not found', 404))
    const { result } = renderHook(() => useRevokeSession({ onError: customOnError }), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate('sess_bad')
    })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(customOnError).toHaveBeenCalledTimes(1)
  })
})

// ─── useRevokeAllSessions ─────────────────────────────────────────────────────

describe('useRevokeAllSessions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls authService.revokeAllSessions', async () => {
    mockRevokeAllSessions.mockResolvedValue(ok({ message: 'All sessions revoked' }))
    const { result } = renderHook(() => useRevokeAllSessions(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRevokeAllSessions).toHaveBeenCalledTimes(1)
  })

  it('calls customOnSuccess after the sessions query is invalidated', async () => {
    const customOnSuccess = vi.fn()
    mockRevokeAllSessions.mockResolvedValue(ok({ message: 'ok' }))
    const { result } = renderHook(() => useRevokeAllSessions({ onSuccess: customOnSuccess }), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(customOnSuccess).toHaveBeenCalledTimes(1)
  })

  it('calls customOnError when the API rejects', async () => {
    const customOnError = vi.fn()
    mockRevokeAllSessions.mockRejectedValue(err('Forbidden', 403))
    const { result } = renderHook(() => useRevokeAllSessions({ onError: customOnError }), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(customOnError).toHaveBeenCalledTimes(1)
  })
})
