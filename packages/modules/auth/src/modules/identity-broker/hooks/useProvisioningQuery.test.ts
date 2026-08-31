// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useProvisioningConnectors,
  useProvisioningConnector,
  useCreateProvisioningConnector,
  useUpdateProvisioningConnector,
  useDeleteProvisioningConnector,
  useSyncProvisioningConnector,
  useProvisioningConnectorLogs,
  provisioningKeys,
} from './useProvisioningQuery'

const {
  mockListConnectors,
  mockGetConnector,
  mockCreateConnector,
  mockUpdateConnector,
  mockDeleteConnector,
  mockSyncConnector,
  mockGetConnectorLogs,
} = vi.hoisted(() => ({
  mockListConnectors: vi.fn(),
  mockGetConnector: vi.fn(),
  mockCreateConnector: vi.fn(),
  mockUpdateConnector: vi.fn(),
  mockDeleteConnector: vi.fn(),
  mockSyncConnector: vi.fn(),
  mockGetConnectorLogs: vi.fn(),
}))

vi.mock('../services/provisioning.service', () => ({
  default: {
    listConnectors: mockListConnectors,
    getConnector: mockGetConnector,
    createConnector: mockCreateConnector,
    updateConnector: mockUpdateConnector,
    deleteConnector: mockDeleteConnector,
    syncConnector: mockSyncConnector,
    getConnectorLogs: mockGetConnectorLogs,
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

describe('useProvisioningQuery hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provisioningKeys generates correct query keys', () => {
    expect(provisioningKeys.all).toEqual(['admin', 'provisioning'])
    expect(provisioningKeys.connectors()).toEqual(['admin', 'provisioning', 'connectors'])
    expect(provisioningKeys.connector('conn-1')).toEqual(['admin', 'provisioning', 'connectors', 'conn-1'])
    expect(provisioningKeys.logs('conn-1')).toEqual(['admin', 'provisioning', 'connectors', 'conn-1', 'logs'])
  })

  it('useProvisioningConnectors fetches connector list', async () => {
    mockListConnectors.mockResolvedValue({ data: [{ id: 'c-1', name: 'Azure AD' }] })
    const { result } = renderHook(() => useProvisioningConnectors(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(mockListConnectors).toHaveBeenCalledTimes(1)
  })

  it('useProvisioningConnector fetches single connector detail', async () => {
    mockGetConnector.mockResolvedValue({ data: { id: 'c-1', name: 'Azure AD' } })
    const { result } = renderHook(() => useProvisioningConnector('c-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetConnector).toHaveBeenCalledWith('c-1')
  })

  it('useCreateProvisioningConnector creates connector', async () => {
    mockCreateConnector.mockResolvedValue({ data: { id: 'c-2' } })
    const { result } = renderHook(() => useCreateProvisioningConnector(), { wrapper: makeWrapper() })
    result.current.mutate({ name: 'Google Workspace', type: 'scim', endpoint: 'https://g.test' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockCreateConnector).toHaveBeenCalledTimes(1)
  })

  it('useUpdateProvisioningConnector updates connector', async () => {
    mockUpdateConnector.mockResolvedValue({ data: { id: 'c-1', name: 'Updated' } })
    const { result } = renderHook(() => useUpdateProvisioningConnector('c-1'), { wrapper: makeWrapper() })
    result.current.mutate({ name: 'Updated' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockUpdateConnector).toHaveBeenCalledWith('c-1', { name: 'Updated' })
  })

  it('useDeleteProvisioningConnector deletes connector', async () => {
    mockDeleteConnector.mockResolvedValue({ data: { message: 'Deleted' } })
    const { result } = renderHook(() => useDeleteProvisioningConnector(), { wrapper: makeWrapper() })
    result.current.mutate('c-old')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockDeleteConnector).toHaveBeenCalledWith('c-old')
  })

  it('useSyncProvisioningConnector triggers sync', async () => {
    mockSyncConnector.mockResolvedValue({ data: { synced: 10 } })
    const { result } = renderHook(() => useSyncProvisioningConnector(), { wrapper: makeWrapper() })
    result.current.mutate('c-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockSyncConnector).toHaveBeenCalledWith('c-1')
  })

  it('useProvisioningConnectorLogs fetches connector logs', async () => {
    mockGetConnectorLogs.mockResolvedValue({ data: [{ id: 'l-1', status: 'SUCCESS' }] })
    const { result } = renderHook(() => useProvisioningConnectorLogs('c-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetConnectorLogs).toHaveBeenCalledWith('c-1')
  })
})
