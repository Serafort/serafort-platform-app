// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSessionGuard } from '../middlewares/useSessionGuard'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRefreshAuth = vi.fn()
let mockIsAuthenticated = false
let mockUser: any = null
let mockHasHydrated = false
let mockRefreshAuthFunc: any = mockRefreshAuth

vi.mock('@cap/platform-core', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: mockIsAuthenticated,
    refreshAuth: mockRefreshAuthFunc,
  }),
  useHasHydrated: () => mockHasHydrated,
}))

// ── Helper ─────────────────────────────────────────────────────────────────────

async function waitForCallback(callback: () => void, timeout = 1000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      callback()
      return
    } catch {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
  callback() // Final attempt
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useSessionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsAuthenticated = false
    mockUser = null
    mockHasHydrated = false
    mockRefreshAuthFunc = mockRefreshAuth
  })

  // ── Pre-hydration ──────────────────────────────────────────────────────────

  describe('before hydration completes', () => {
    it('returns isLoading=true and empty auth state', () => {
      mockHasHydrated = false
      const { result } = renderHook(() => useSessionGuard())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.sessionError).toBeNull()
    })

    it('does not call refreshAuth while hydration is pending', () => {
      mockHasHydrated = false
      renderHook(() => useSessionGuard())
      expect(mockRefreshAuth).not.toHaveBeenCalled()
    })
  })

  // ── Already authenticated ──────────────────────────────────────────────────

  describe('when user is already authenticated from persisted state', () => {
    beforeEach(() => {
      mockHasHydrated = true
      mockIsAuthenticated = true
      mockUser = { id: '1', email: 'user@example.com' }
    })

    it('sets isLoading=false without calling refreshAuth', async () => {
      const { result } = renderHook(() => useSessionGuard())
      await waitForCallback(() => expect(result.current.isLoading).toBe(false))

      expect(mockRefreshAuth).not.toHaveBeenCalled()
    })

    it('forwards isAuthenticated and user from the store', async () => {
      const { result } = renderHook(() => useSessionGuard())
      await waitForCallback(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })

    it('has no session error', async () => {
      const { result } = renderHook(() => useSessionGuard())
      await waitForCallback(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.sessionError).toBeNull()
    })
  })

  // ── Not authenticated ──────────────────────────────────────────────────────

  describe('when user is not authenticated after hydration', () => {
    beforeEach(() => {
      mockHasHydrated = true
      mockIsAuthenticated = false
      mockUser = null
    })

    it('calls refreshAuth exactly once', async () => {
      mockRefreshAuth.mockResolvedValue(undefined)
      renderHook(() => useSessionGuard())
      await waitForCallback(() => expect(mockRefreshAuth).toHaveBeenCalledTimes(1))
    })

    it('sets isLoading=false after the refresh completes', async () => {
      mockRefreshAuth.mockResolvedValue(undefined)
      const { result } = renderHook(() => useSessionGuard())
      await waitForCallback(() => expect(result.current.isLoading).toBe(false))
    })

    it('sets a sessionError when refreshAuth throws', async () => {
      mockRefreshAuth.mockRejectedValue(new Error('Token expired'))
      const { result } = renderHook(() => useSessionGuard())
      await waitForCallback(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.sessionError).toBe('Your session has expired. Please log in again.')
    })

    it('still sets isLoading=false even when refreshAuth throws', async () => {
      mockRefreshAuth.mockRejectedValue(new Error('Server error'))
      const { result } = renderHook(() => useSessionGuard())
      await waitForCallback(() => expect(result.current.isLoading).toBe(false))
    })

    it('does not call refreshAuth when it is not a function', async () => {
      // Edge-case: refreshAuth may be undefined in some platform-core versions
      mockRefreshAuthFunc = undefined
      mockHasHydrated = true

      // Should not throw
      const { result } = renderHook(() => useSessionGuard())
      await waitForCallback(() => expect(result.current.isLoading).toBe(false))
    })
  })
})
