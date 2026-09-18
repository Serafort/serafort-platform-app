// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useSCIMConfig,
  useUpdateSCIMConfig,
  useSCIMTokens,
  useCreateSCIMToken,
  useRevokeSCIMToken,
  useTestSCIMConnection,
  scimKeys,
} from './useSCIMQuery'

const {
  mockGetConfig,
  mockUpdateConfig,
  mockListTokens,
  mockCreateToken,
  mockRevokeToken,
  mockTestConnection,
} = vi.hoisted(() => ({
  mockGetConfig: vi.fn(),
  mockUpdateConfig: vi.fn(),
  mockListTokens: vi.fn(),
  mockCreateToken: vi.fn(),
  mockRevokeToken: vi.fn(),
  mockTestConnection: vi.fn(),
}))

vi.mock('../services/scim.service', () => ({
  default: {
    getConfig: mockGetConfig,
    updateConfig: mockUpdateConfig,
    listTokens: mockListTokens,
    createToken: mockCreateToken,
    revokeToken: mockRevokeToken,
    testConnection: mockTestConnection,
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

describe('useSCIMQuery hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('scimKeys generates correct query keys', () => {
    expect(scimKeys.all).toEqual(['admin', 'scim'])
    expect(scimKeys.config()).toEqual(['admin', 'scim', 'config'])
    expect(scimKeys.tokens()).toEqual(['admin', 'scim', 'tokens'])
  })

  it('useSCIMConfig fetches SCIM configuration', async () => {
    mockGetConfig.mockResolvedValue({ data: { enabled: true, endpoint: 'https://scim.test' } })
    const { result } = renderHook(() => useSCIMConfig(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.enabled).toBe(true)
    expect(mockGetConfig).toHaveBeenCalledTimes(1)
  })

  it('useUpdateSCIMConfig updates configuration', async () => {
    mockUpdateConfig.mockResolvedValue({ data: { message: 'Updated' } })
    const { result } = renderHook(() => useUpdateSCIMConfig(), { wrapper: makeWrapper() })
    result.current.mutate({ enabled: true })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockUpdateConfig).toHaveBeenCalledWith({ enabled: true })
  })

  it('useSCIMTokens lists SCIM tokens', async () => {
    mockListTokens.mockResolvedValue({ data: [{ id: 1, name: 'Okta SCIM' }] })
    const { result } = renderHook(() => useSCIMTokens(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
  })

  it('useCreateSCIMToken creates a token', async () => {
    mockCreateToken.mockResolvedValue({ data: { token: 'scim-tok-xyz' } })
    const { result } = renderHook(() => useCreateSCIMToken(), { wrapper: makeWrapper() })
    result.current.mutate({ name: 'New Token' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockCreateToken).toHaveBeenCalledWith({ name: 'New Token' })
  })

  it('useRevokeSCIMToken revokes a token', async () => {
    mockRevokeToken.mockResolvedValue({ data: { message: 'Revoked' } })
    const { result } = renderHook(() => useRevokeSCIMToken(), { wrapper: makeWrapper() })
    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRevokeToken).toHaveBeenCalledWith(1)
  })

  it('useTestSCIMConnection tests connection', async () => {
    mockTestConnection.mockResolvedValue({ data: { success: true } })
    const { result } = renderHook(() => useTestSCIMConnection(), { wrapper: makeWrapper() })
    result.current.mutate()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockTestConnection).toHaveBeenCalledTimes(1)
  })
})
