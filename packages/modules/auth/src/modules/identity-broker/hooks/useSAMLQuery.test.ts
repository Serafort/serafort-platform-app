// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useSAMLConfig,
  useUpdateSAMLConfig,
  useSAMLMetadata,
  useUploadSAMLMetadata,
  useFetchRemoteMetadata,
  useRecentSAMLEntities,
  useInitiateSamlSso,
  useSsoDiscovery,
  samlKeys,
} from './useSAMLQuery'

const {
  mockGetConfig,
  mockUpdateConfig,
  mockGetMetadata,
  mockUploadMetadata,
  mockFetchRemoteMetadata,
  mockListRecentEntities,
  mockInitiateSso,
  mockDiscoverSso,
} = vi.hoisted(() => ({
  mockGetConfig: vi.fn(),
  mockUpdateConfig: vi.fn(),
  mockGetMetadata: vi.fn(),
  mockUploadMetadata: vi.fn(),
  mockFetchRemoteMetadata: vi.fn(),
  mockListRecentEntities: vi.fn(),
  mockInitiateSso: vi.fn(),
  mockDiscoverSso: vi.fn(),
}))

vi.mock('../services/saml.service', () => ({
  default: {
    getConfig: mockGetConfig,
    updateConfig: mockUpdateConfig,
    getMetadata: mockGetMetadata,
    uploadMetadata: mockUploadMetadata,
    fetchRemoteMetadata: mockFetchRemoteMetadata,
    listRecentEntities: mockListRecentEntities,
    initiateSso: mockInitiateSso,
    discoverSso: mockDiscoverSso,
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

describe('useSAMLQuery hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('samlKeys generates correct query keys', () => {
    expect(samlKeys.all).toEqual(['admin', 'saml'])
    expect(samlKeys.config()).toEqual(['admin', 'saml', 'config'])
    expect(samlKeys.metadata()).toEqual(['admin', 'saml', 'metadata'])
    expect(samlKeys.recentEntities()).toEqual(['admin', 'saml', 'recent-entities'])
    expect(samlKeys.discovery('org-1')).toEqual(['auth', 'sso', 'discover', 'org-1'])
  })

  it('useSAMLConfig fetches SAML configuration', async () => {
    mockGetConfig.mockResolvedValue({ data: { enabled: true, entityId: 'https://idp.test' } })
    const { result } = renderHook(() => useSAMLConfig(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.entityId).toBe('https://idp.test')
    expect(mockGetConfig).toHaveBeenCalledTimes(1)
  })

  it('useUpdateSAMLConfig mutates configuration', async () => {
    mockUpdateConfig.mockResolvedValue({ data: { message: 'Saved' } })
    const { result } = renderHook(() => useUpdateSAMLConfig(), { wrapper: makeWrapper() })
    result.current.mutate({ enabled: true })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockUpdateConfig).toHaveBeenCalledWith({ enabled: true })
  })

  it('useSAMLMetadata fetches metadata', async () => {
    mockGetMetadata.mockResolvedValue({ data: { xml: '<EntityDescriptor />' } })
    const { result } = renderHook(() => useSAMLMetadata(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetMetadata).toHaveBeenCalledTimes(1)
  })

  it('useRecentSAMLEntities fetches recent entities', async () => {
    mockListRecentEntities.mockResolvedValue({ data: [{ id: 'ent-1', name: 'Okta' }] })
    const { result } = renderHook(() => useRecentSAMLEntities(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
  })

  it('useInitiateSamlSso initiates SSO', async () => {
    mockInitiateSso.mockResolvedValue({ data: { redirect_url: 'https://sso.test' } })
    const { result } = renderHook(() => useInitiateSamlSso(), { wrapper: makeWrapper() })
    result.current.mutate({ domain: 'test.com' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInitiateSso).toHaveBeenCalledWith({ domain: 'test.com' })
  })

  it('useSsoDiscovery discovers SSO identity provider when identifier provided', async () => {
    mockDiscoverSso.mockResolvedValue({ data: { type: 'saml', ssoUrl: 'https://idp.test/sso' } })
    const { result } = renderHook(() => useSsoDiscovery('test.com'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockDiscoverSso).toHaveBeenCalledWith('test.com')
  })
})
