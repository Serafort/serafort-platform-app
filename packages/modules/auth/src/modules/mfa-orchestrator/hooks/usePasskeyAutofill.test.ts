import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePasskeyAutofill } from './usePasskeyAutofill'

const {
  mockStartAuthentication,
  mockBrowserSupportsWebAuthnAutofill,
  mockGetLoginOptions,
  mockVerifyLogin,
  mockSetAuthenticated,
  mockSetUser,
  mockSetAuthStep,
  mockSetSessionId,
  mockSetTokens,
} = vi.hoisted(() => ({
  mockStartAuthentication: vi.fn(),
  mockBrowserSupportsWebAuthnAutofill: vi.fn(),
  mockGetLoginOptions: vi.fn(),
  mockVerifyLogin: vi.fn(),
  mockSetAuthenticated: vi.fn(),
  mockSetUser: vi.fn(),
  mockSetAuthStep: vi.fn(),
  mockSetSessionId: vi.fn(),
  mockSetTokens: vi.fn(),
}))

vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: mockStartAuthentication,
  browserSupportsWebAuthn: vi.fn(),
  browserSupportsWebAuthnAutofill: mockBrowserSupportsWebAuthnAutofill,
}))

vi.mock('../services/mfa.service', () => ({
  mfaService: {
    passkeys: {
      getLoginOptions: mockGetLoginOptions,
      verifyLogin: mockVerifyLogin,
    },
  },
}))

vi.mock('@cap/module-auth/modules/authentication-core/store', () => ({
  useAuthStore: () => ({
    setAuthenticated: mockSetAuthenticated,
    setUser: mockSetUser,
    setAuthStep: mockSetAuthStep,
    setSessionId: mockSetSessionId,
  }),
}))

vi.mock('@cap/platform-core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    secureTokenManager: { setTokens: mockSetTokens },
  }
})

describe('usePasskeyAutofill', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBrowserSupportsWebAuthnAutofill.mockResolvedValue(true)
  })

  it('checks autofill availability on mount and sets isAvailable=true', async () => {
    const { result } = renderHook(() => usePasskeyAutofill())

    await waitFor(() => {
      expect(result.current.isAvailable).toBe(true)
    })
    expect(mockBrowserSupportsWebAuthnAutofill).toHaveBeenCalled()
  })

  it('sets isAvailable=false when browser does not support autofill', async () => {
    mockBrowserSupportsWebAuthnAutofill.mockResolvedValue(false)

    const { result } = renderHook(() => usePasskeyAutofill())

    await waitFor(() => {
      expect(result.current.isAvailable).toBe(false)
    })
  })

  it('triggers conditional UI autofill on mount when available', async () => {
    const optionsPayload = { challenge: 'autofill-challenge' }
    mockGetLoginOptions.mockResolvedValue({ data: optionsPayload })
    mockStartAuthentication.mockResolvedValue({ id: 'autofill-cred' })
    mockVerifyLogin.mockResolvedValue({
      data: {
        token: 'autofill-jwt',
        user: { id: 'usr-1', email: 'autofill@example.com' },
        userId: 'usr-1',
      },
    })

    const onPasskeySuccess = vi.fn()
    renderHook(() => usePasskeyAutofill(onPasskeySuccess))

    await waitFor(() => {
      expect(mockGetLoginOptions).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockStartAuthentication).toHaveBeenCalledWith({
        optionsJSON: optionsPayload,
        useBrowserAutofill: true,
      })
    })

    await waitFor(() => {
      expect(mockVerifyLogin).toHaveBeenCalledWith({ id: 'autofill-cred' })
    })

    await waitFor(() => {
      expect(mockSetTokens).toHaveBeenCalled()
      expect(mockSetUser).toHaveBeenCalledWith({ id: 'usr-1', email: 'autofill@example.com' })
      expect(mockSetSessionId).toHaveBeenCalledWith('usr-1')
      expect(onPasskeySuccess).toHaveBeenCalled()
    })
  })
})
