import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePasskey } from './usePasskey'

const {
  mockStartAuthentication,
  mockStartRegistration,
  mockGetLoginOptions,
  mockVerifyLogin,
  mockGetRegistrationOptions,
  mockVerifyRegistration,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockStartAuthentication: vi.fn(),
  mockStartRegistration: vi.fn(),
  mockGetLoginOptions: vi.fn(),
  mockVerifyLogin: vi.fn(),
  mockGetRegistrationOptions: vi.fn(),
  mockVerifyRegistration: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}))

vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: mockStartAuthentication,
  startRegistration: mockStartRegistration,
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}))

vi.mock('../services/mfa.service', () => ({
  mfaService: {
    passkeys: {
      getLoginOptions: mockGetLoginOptions,
      verifyLogin: mockVerifyLogin,
      getRegistrationOptions: mockGetRegistrationOptions,
      verifyRegistration: mockVerifyRegistration,
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
    expect(typeof result.current.registerPasskey).toBe('function')
  })

  it('sets isLoading=true during the authentication flow', async () => {
    let resolveOptions!: (v: any) => void
    mockGetLoginOptions.mockReturnValue(new Promise((r) => (resolveOptions = r)))

    const { result } = renderHook(() => usePasskey())
    let promise!: Promise<any>
    act(() => {
      promise = result.current.loginWithPasskey()
    })

    expect(result.current.isLoading).toBe(true)

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
    expect(mockStartAuthentication).toHaveBeenCalledWith({ optionsJSON: { challenge: 'abc' } })
    expect(mockVerifyLogin).toHaveBeenCalledWith({ id: 'cred' })
  })

  it('registers a passkey successfully and invalidates queries', async () => {
    const regResponse = { data: { verified: true } }
    mockGetRegistrationOptions.mockResolvedValue({ data: { challenge: 'reg-chal' } })
    mockStartRegistration.mockResolvedValue({ id: 'new-cred-id' })
    mockVerifyRegistration.mockResolvedValue(regResponse)

    const { result } = renderHook(() => usePasskey())
    let response: any
    await act(async () => {
      response = await result.current.registerPasskey({ friendlyName: 'My YubiKey' })
    })

    expect(response).toEqual(regResponse)
    expect(mockGetRegistrationOptions).toHaveBeenCalled()
    expect(mockStartRegistration).toHaveBeenCalledWith({ optionsJSON: { challenge: 'reg-chal' } })
    expect(mockVerifyRegistration).toHaveBeenCalledWith({
      id: 'new-cred-id',
      friendlyName: 'My YubiKey',
    })
    expect(mockInvalidateQueries).toHaveBeenCalled()
  })

  it('sets error and re-throws when startAuthentication rejects with NotAllowedError', async () => {
    mockGetLoginOptions.mockResolvedValue({ data: { challenge: 'abc' } })
    const notAllowedError = new Error('The operation either timed out or was not allowed')
    notAllowedError.name = 'NotAllowedError'
    mockStartAuthentication.mockRejectedValue(notAllowedError)

    const { result } = renderHook(() => usePasskey())
    let thrownError: any
    await act(async () => {
      try {
        await result.current.loginWithPasskey()
      } catch (e) {
        thrownError = e
      }
    })

    expect(thrownError).toBeDefined()
    expect(result.current.error).toBe('Passkey prompt was cancelled or timed out.')
  })
})
