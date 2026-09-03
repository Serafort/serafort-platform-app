// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSignOut } from './useSignOut'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

const mockZustandSignOut = vi.fn()
vi.mock('@cap/platform-core', () => ({
  useAuth: () => ({ signOut: mockZustandSignOut }),
  StorageManager: { clearAllUserData: vi.fn() },
}))

const mockClearAuth = vi.fn()
const mockSetAuthStep = vi.fn()
vi.mock('../store', () => ({
  useAuthStore: () => ({
    clearAuth: mockClearAuth,
    setAuthStep: mockSetAuthStep,
  }),
}))

let capturedSignoutOptions: any
const mockLogoutMutate = vi.fn()
vi.mock('./useAuthQuery', () => ({
  useSignout: (options: any) => {
    capturedSignoutOptions = options
    return { mutate: mockLogoutMutate, isPending: false }
  },
}))

describe('useSignOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedSignoutOptions = undefined
  })

  it('returns a signOut function and isSigningOut=false by default', () => {
    const { result } = renderHook(() => useSignOut())
    expect(typeof result.current.signOut).toBe('function')
    expect(result.current.isSigningOut).toBe(false)
  })

  it('calls the logout mutate when signOut() is invoked', () => {
    const { result } = renderHook(() => useSignOut())
    act(() => {
      result.current.signOut()
    })
    expect(mockLogoutMutate).toHaveBeenCalledTimes(1)
  })

  describe('onSuccess callback', () => {
    it('clears platform-core store and navigates to the default path', () => {
      renderHook(() => useSignOut())
      act(() => {
        capturedSignoutOptions.onSuccess()
      })

      expect(mockZustandSignOut).toHaveBeenCalledTimes(1)
      expect(mockClearAuth).toHaveBeenCalledTimes(1)
      expect(mockSetAuthStep).toHaveBeenCalledWith('credentials')
      expect(mockNavigate).toHaveBeenCalledWith('/auth/sign-in', { replace: true })
    })

    it('uses a custom redirectTo when provided', () => {
      renderHook(() => useSignOut({ redirectTo: '/custom-login' }))
      act(() => {
        capturedSignoutOptions.onSuccess()
      })
      expect(mockNavigate).toHaveBeenCalledWith('/custom-login', { replace: true })
    })

    it('calls the custom onSuccess callback', () => {
      const onSuccess = vi.fn()
      renderHook(() => useSignOut({ onSuccess }))
      act(() => {
        capturedSignoutOptions.onSuccess()
      })
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('does not throw when no custom onSuccess is provided', () => {
      renderHook(() => useSignOut())
      expect(() => {
        act(() => {
          capturedSignoutOptions.onSuccess()
        })
      }).not.toThrow()
    })
  })

  describe('onError callback', () => {
    it('clears auth state even when the API call fails', () => {
      renderHook(() => useSignOut())
      act(() => {
        capturedSignoutOptions.onError(new Error('Network error'))
      })

      expect(mockZustandSignOut).toHaveBeenCalledTimes(1)
      expect(mockClearAuth).toHaveBeenCalledTimes(1)
      expect(mockSetAuthStep).toHaveBeenCalledWith('credentials')
    })

    it('still navigates to the login page on error', () => {
      renderHook(() => useSignOut())
      act(() => {
        capturedSignoutOptions.onError(new Error('fail'))
      })
      expect(mockNavigate).toHaveBeenCalledWith('/auth/sign-in', { replace: true })
    })

    it('passes the error to a custom onError callback', () => {
      const onError = vi.fn()
      const err = new Error('Network error')
      renderHook(() => useSignOut({ onError }))
      act(() => {
        capturedSignoutOptions.onError(err)
      })
      expect(onError).toHaveBeenCalledWith(err)
    })

    it('uses custom redirectTo on error as well', () => {
      renderHook(() => useSignOut({ redirectTo: '/bye' }))
      act(() => {
        capturedSignoutOptions.onError(new Error('fail'))
      })
      expect(mockNavigate).toHaveBeenCalledWith('/bye', { replace: true })
    })
  })
})
