import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePasskey } from "./usePasskey"


const { mockStartAuthentication, mockGetLoginOptions, mockVerifyLogin } = vi.hoisted(() => ({
  mockStartAuthentication: vi.fn(),
  mockGetLoginOptions: vi.fn(),
  mockVerifyLogin: vi.fn(),
}))

vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: mockStartAuthentication,
}))

vi.mock('../services/mfa.service', () => ({
  mfaService: {
    passkeys: {
      getLoginOptions: mockGetLoginOptions,
      verifyLogin: mockVerifyLogin,
    },
  },
}))


describe('usePasskey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initialises with isLoading=false and no error', () => {
    const { result } = renderHook(() => usePasskey())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.loginWithPasskey).toBe('function')
  })

  it('sets isLoading=true during the authentication flow', async () => {
    // Keep the promise pending long enough to read state
    let resolveOptions!: (v: any) => void
    mockGetLoginOptions.mockReturnValue(new Promise((r) => (resolveOptions = r)))

    const { result } = renderHook(() => usePasskey())
    let promise!: Promise<any>
    act(() => {
      promise = result.current.loginWithPasskey()
    })

    expect(result.current.isLoading).toBe(true)

    // Resolve to prevent dangling promises
    resolveOptions({ data: { challenge: 'abc' } })
    mockStartAuthentication.mockResolvedValue({ id: 'cred' })
    mockVerifyLogin.mockResolvedValue({ data: { token: 'tok' } })

    await act(async () => {
      await promise
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('returns the verify response on a successful login', async () => {
    const verifyResponse = { data: { token: 'tok123', user: { id: '1' } } }
    mockGetLoginOptions.mockResolvedValue({ data: { challenge: 'abc' } })
    mockStartAuthentication.mockResolvedValue({ id: 'cred' })
    mockVerifyLogin.mockResolvedValue(verifyResponse)

    const { result } = renderHook(() => usePasskey())
    let response: any
    await act(async () => {
      response = await result.current.loginWithPasskey('user@example.com')
    })

    expect(response).toEqual(verifyResponse)
    expect(mockGetLoginOptions).toHaveBeenCalledWith('user@example.com')
    expect(mockStartAuthentication).toHaveBeenCalledWith({ challenge: 'abc' })
    expect(mockVerifyLogin).toHaveBeenCalledWith({ id: 'cred' })
  })

  it('loginWithPasskey works without an email argument', async () => {
    mockGetLoginOptions.mockResolvedValue({ data: { challenge: 'xyz' } })
    mockStartAuthentication.mockResolvedValue({ id: 'cred2' })
    mockVerifyLogin.mockResolvedValue({ data: { token: 'tok2' } })

    const { result } = renderHook(() => usePasskey())
    await act(async () => {
      await result.current.loginWithPasskey()
    })

    expect(mockGetLoginOptions).toHaveBeenCalledWith(undefined)
  })

  it('sets error and re-throws when getLoginOptions rejects', async () => {
    const err = new Error('Network error')
    mockGetLoginOptions.mockRejectedValue(err)

    const { result } = renderHook(() => usePasskey())
    let thrownError: any
    await act(async () => {
      try {
        await result.current.loginWithPasskey()
      } catch (e) {
        thrownError = e
      }
    })

    expect(thrownError?.message).toBe('Network error')
    expect(result.current.error).toBe('Network error')
    expect(result.current.isLoading).toBe(false)
  })

  it('sets a descriptive error when getLoginOptions returns no data', async () => {
    mockGetLoginOptions.mockResolvedValue({ data: null })

    const { result } = renderHook(() => usePasskey())
    let thrownError: any
    await act(async () => {
      try {
        await result.current.loginWithPasskey()
      } catch (e) {
        thrownError = e
      }
    })

    expect(thrownError?.message).toBe('Failed to get passkey login options')
    expect(result.current.error).toBe('Failed to get passkey login options')
  })

  it('sets error and re-throws when startAuthentication rejects', async () => {
    mockGetLoginOptions.mockResolvedValue({ data: { challenge: 'abc' } })
    mockStartAuthentication.mockRejectedValue(new Error('User cancelled'))

    const { result } = renderHook(() => usePasskey())
    let thrownError: any
    await act(async () => {
      try {
        await result.current.loginWithPasskey()
      } catch (e) {
        thrownError = e
      }
    })

    expect(thrownError?.message).toBe('User cancelled')
    expect(result.current.error).toBe('User cancelled')
  })

  it('clears a previous error before the next attempt', async () => {
    // First call fails
    mockGetLoginOptions.mockRejectedValueOnce(new Error('first error'))
    const { result } = renderHook(() => usePasskey())
    await act(async () => {
      try {
        await result.current.loginWithPasskey()
      } catch {}
    })
    expect(result.current.error).toBe('first error')

    // Second call succeeds
    mockGetLoginOptions.mockResolvedValue({ data: { challenge: 'abc' } })
    mockStartAuthentication.mockResolvedValue({ id: 'cred' })
    mockVerifyLogin.mockResolvedValue({ data: { token: 'tok' } })
    await act(async () => {
      await result.current.loginWithPasskey()
    })

    expect(result.current.error).toBeNull()
  })
})


