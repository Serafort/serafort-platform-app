import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useOidcUserInfo,
  useOidcInfoIntrospect,
  useOidcTokenRevocation,
  useOidcEndSession,
  oidcComplianceKeys,
} from '@cap/module-auth/modules/identity-broker/hooks/useOidcCompliance'

const { mockUserinfo, mockIntrospect, mockRevoke, mockEndSession } = vi.hoisted(() => ({
  mockUserinfo: vi.fn(),
  mockIntrospect: vi.fn(),
  mockRevoke: vi.fn(),
  mockEndSession: vi.fn(),
}))

// The hooks under test call the identity-broker service modules directly
// (`oidcService`), which in turn call `apiClient`. Mock those
// service modules so no real network/store code runs.
vi.mock('../services/oidc.service', () => ({
  default: {
    getUserInfo: mockUserinfo,
    introspectToken: mockIntrospect,
    revokeToken: mockRevoke,
    endSession: mockEndSession,
  },
}))

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children)
  return Wrapper
}

describe('oidcComplianceKeys', () => {
  it('all key is a stable tuple', () => {
    expect(oidcComplianceKeys.all).toEqual(['oidc'])
  })

  it('userinfo() key includes the parent key', () => {
    expect(oidcComplianceKeys.userinfo()).toEqual(['oidc', 'userinfo'])
  })

  it('userinfo() returns a new array on each call (not same reference)', () => {
    expect(oidcComplianceKeys.userinfo()).not.toBe(oidcComplianceKeys.userinfo())
  })
})

describe('useOidcUserInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches userinfo successfully', async () => {
    mockUserinfo.mockResolvedValue({ data: { sub: 'user-123', email: 'u@example.com' } })

    const { result } = renderHook(() => useOidcUserInfo(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({ data: { sub: 'user-123', email: 'u@example.com' } })
    expect(mockUserinfo).toHaveBeenCalledTimes(1)
  })

  it('transitions to isError when the service rejects', async () => {
    mockUserinfo.mockRejectedValue(new Error('Unauthorized'))

    const { result } = renderHook(() => useOidcUserInfo(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('is in loading state initially', () => {
    mockUserinfo.mockReturnValue(new Promise(() => {})) // never resolves
    const { result } = renderHook(() => useOidcUserInfo(), { wrapper: makeWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('respects passed options (e.g., enabled=false)', () => {
    const { result } = renderHook(() => useOidcUserInfo({ enabled: false }), {
      wrapper: makeWrapper(),
    })
    expect(result.current.isPending).toBe(true)
    expect(mockUserinfo).not.toHaveBeenCalled()
  })
})

describe('useOidcInfoIntrospect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls introspect with the provided token', async () => {
    mockIntrospect.mockResolvedValue({ data: { active: true } })

    const { result } = renderHook(() => useOidcInfoIntrospect(), { wrapper: makeWrapper() })
    result.current.mutate('my-token')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockIntrospect).toHaveBeenCalledWith('my-token')
    expect(result.current.data).toEqual({ data: { active: true } })
  })

  it('surfaces errors when introspection fails', async () => {
    mockIntrospect.mockRejectedValue(new Error('Bad token'))

    const { result } = renderHook(() => useOidcInfoIntrospect(), { wrapper: makeWrapper() })
    result.current.mutate('bad-token')
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('forwards onSuccess option to the mutation', async () => {
    mockIntrospect.mockResolvedValue({ data: { active: true } })
    const onSuccess = vi.fn()

    const { result } = renderHook(() => useOidcInfoIntrospect({ onSuccess }), {
      wrapper: makeWrapper(),
    })
    result.current.mutate('tok')
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
  })
})

describe('useOidcTokenRevocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls revoke with the provided token', async () => {
    mockRevoke.mockResolvedValue({ data: {} })

    const { result } = renderHook(() => useOidcTokenRevocation(), { wrapper: makeWrapper() })
    result.current.mutate('token-to-revoke')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRevoke).toHaveBeenCalledWith('token-to-revoke')
  })

  it('surfaces errors when revocation fails', async () => {
    mockRevoke.mockRejectedValue(new Error('Revoke failed'))

    const { result } = renderHook(() => useOidcTokenRevocation(), { wrapper: makeWrapper() })
    result.current.mutate('tok')
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useOidcEndSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls endSession with no arguments', async () => {
    mockEndSession.mockResolvedValue({ data: {} })

    const { result } = renderHook(() => useOidcEndSession(), { wrapper: makeWrapper() })
    result.current.mutate()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockEndSession).toHaveBeenCalledWith()
  })

  it('surfaces errors when end-session fails', async () => {
    mockEndSession.mockRejectedValue(new Error('End session error'))

    const { result } = renderHook(() => useOidcEndSession(), { wrapper: makeWrapper() })
    result.current.mutate()
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
