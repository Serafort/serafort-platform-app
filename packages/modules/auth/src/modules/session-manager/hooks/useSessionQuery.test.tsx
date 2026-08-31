// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
  useActivityTimeline,
  useSecurityStatus,
  useChangePasswordMutation,
  useDeactivateAccountMutation,
} from './useSessionQuery'

const {
  mockGetSessions,
  mockRevokeSession,
  mockRevokeAllSessions,
  mockGetActivityTimeline,
  mockGetSecurityStatus,
  mockChangePassword,
  mockDeactivateAccount,
  mockClearTokens,
  mockSignOut,
} = vi.hoisted(() => ({
  mockGetSessions: vi.fn(),
  mockRevokeSession: vi.fn(),
  mockRevokeAllSessions: vi.fn(),
  mockGetActivityTimeline: vi.fn(),
  mockGetSecurityStatus: vi.fn(),
  mockChangePassword: vi.fn(),
  mockDeactivateAccount: vi.fn(),
  mockClearTokens: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('../services/session.service', () => ({
  default: {
    getSessions: mockGetSessions,
    revokeSession: mockRevokeSession,
    revokeAllSessions: mockRevokeAllSessions,
    getActivityTimeline: mockGetActivityTimeline,
    getSecurityStatus: mockGetSecurityStatus,
    changePassword: mockChangePassword,
    deactivateAccount: mockDeactivateAccount,
  },
  sessionService: {
    getSessions: mockGetSessions,
    revokeSession: mockRevokeSession,
    revokeAllSessions: mockRevokeAllSessions,
    getActivityTimeline: mockGetActivityTimeline,
    getSecurityStatus: mockGetSecurityStatus,
    changePassword: mockChangePassword,
    deactivateAccount: mockDeactivateAccount,
  },
}))

vi.mock('@cap/platform-core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    secureTokenManager: {
      clearTokens: mockClearTokens,
    },
    useAppStore: {
      getState: () => ({
        signOut: mockSignOut,
      }),
    },
  }
})

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useSessionQuery Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSessions', () => {
    it('fetches sessions data successfully', async () => {
      mockGetSessions.mockResolvedValueOnce({
        status: 200,
        data: {
          sessions: [
            { id: '1', current: true, browser: 'Chrome' },
            { id: '2', current: false, browser: 'Firefox' },
          ],
          current_session_id: '1',
        },
      })

      const { result } = renderHook(() => useSessions(), { wrapper: makeWrapper() })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data?.data.sessions).toHaveLength(2)
      expect(result.current.data?.data.current_session_id).toBe('1')
    })
  })

  describe('useRevokeSession', () => {
    it('calls revokeSession service and triggers callback', async () => {
      mockRevokeSession.mockResolvedValueOnce({
        status: 200,
        data: { message: 'Session revoked' },
      })
      const onSuccess = vi.fn()

      const { result } = renderHook(() => useRevokeSession({ onSuccess }), {
        wrapper: makeWrapper(),
      })

      await act(async () => {
        result.current.mutate('session-123')
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockRevokeSession).toHaveBeenCalledWith('session-123')
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  describe('useRevokeAllSessions', () => {
    it('calls revokeAllSessions service and succeeds', async () => {
      mockRevokeAllSessions.mockResolvedValueOnce({
        status: 200,
        data: { message: 'All other sessions revoked' },
      })
      const onSuccess = vi.fn()

      const { result } = renderHook(() => useRevokeAllSessions({ onSuccess }), {
        wrapper: makeWrapper(),
      })

      await act(async () => {
        result.current.mutate()
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockRevokeAllSessions).toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  describe('useActivityTimeline', () => {
    it('fetches audit timeline events', async () => {
      mockGetActivityTimeline.mockResolvedValueOnce({
        status: 200,
        data: [{ id: '1', action: 'user_signin', created_at: '2026-08-28T12:00:00Z' }],
      })

      const { result } = renderHook(() => useActivityTimeline(), { wrapper: makeWrapper() })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data?.data).toHaveLength(1)
    })
  })

  describe('useSecurityStatus', () => {
    it('fetches user security summary', async () => {
      mockGetSecurityStatus.mockResolvedValueOnce({
        status: 200,
        data: {
          mfaEnabled: true,
          emailVerified: true,
          activeSessions: 2,
          passkeys: 1,
          passwordLastChangedAt: '2026-08-20T00:00:00Z',
        },
      })

      const { result } = renderHook(() => useSecurityStatus(), { wrapper: makeWrapper() })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data?.data.mfaEnabled).toBe(true)
      expect(result.current.data?.data.activeSessions).toBe(2)
    })
  })

  describe('useChangePasswordMutation', () => {
    it('mutates password and triggers onSuccess', async () => {
      mockChangePassword.mockResolvedValueOnce({
        status: 200,
        data: { message: 'Password updated successfully' },
      })
      const onSuccess = vi.fn()

      const { result } = renderHook(() => useChangePasswordMutation({ onSuccess }), {
        wrapper: makeWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          currentPassword: 'CurrentPassword123!',
          password: 'NewPassword123!',
        })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockChangePassword).toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  describe('useDeactivateAccountMutation', () => {
    it('calls deactivateAccount service and clears auth session', async () => {
      mockDeactivateAccount.mockResolvedValueOnce({
        status: 200,
        data: { message: 'Account deactivated' },
      })
      const onSuccess = vi.fn()

      const { result } = renderHook(() => useDeactivateAccountMutation({ onSuccess }), {
        wrapper: makeWrapper(),
      })

      await act(async () => {
        result.current.mutate()
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDeactivateAccount).toHaveBeenCalled()
      expect(mockClearTokens).toHaveBeenCalled()
      expect(mockSignOut).toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})
