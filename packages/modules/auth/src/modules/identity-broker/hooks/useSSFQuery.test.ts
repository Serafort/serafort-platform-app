// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useSSFConfig,
  useUpdateSSFConfig,
  useTestSSFStream,
  useBroadcastSSFEvent,
  useSSFHistory,
  ssfKeys,
} from './useSSFQuery'

const { mockGetConfig, mockUpdateConfig, mockTestStream, mockBroadcastEvent, mockGetHistory } =
  vi.hoisted(() => ({
    mockGetConfig: vi.fn(),
    mockUpdateConfig: vi.fn(),
    mockTestStream: vi.fn(),
    mockBroadcastEvent: vi.fn(),
    mockGetHistory: vi.fn(),
  }))

vi.mock('../services/ssf.service', () => ({
  default: {
    getConfig: mockGetConfig,
    updateConfig: mockUpdateConfig,
    testStream: mockTestStream,
    broadcastEvent: mockBroadcastEvent,
    getHistory: mockGetHistory,
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

describe('useSSFQuery hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ssfKeys generates correct query keys', () => {
    expect(ssfKeys.all).toEqual(['admin', 'ssf'])
    expect(ssfKeys.config()).toEqual(['admin', 'ssf', 'config'])
    expect(ssfKeys.history()).toEqual(['admin', 'ssf', 'history'])
  })

  it('useSSFConfig fetches SSF configuration', async () => {
    mockGetConfig.mockResolvedValue({ data: { enabled: true, issuer: 'https://ssf.test' } })
    const { result } = renderHook(() => useSSFConfig(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.issuer).toBe('https://ssf.test')
    expect(mockGetConfig).toHaveBeenCalledTimes(1)
  })

  it('useUpdateSSFConfig updates configuration', async () => {
    mockUpdateConfig.mockResolvedValue({ data: { message: 'Updated' } })
    const { result } = renderHook(() => useUpdateSSFConfig(), { wrapper: makeWrapper() })
    result.current.mutate({ enabled: true })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockUpdateConfig).toHaveBeenCalledWith({ enabled: true })
  })

  it('useTestSSFStream tests signal stream', async () => {
    mockTestStream.mockResolvedValue({ data: { success: true } })
    const { result } = renderHook(() => useTestSSFStream(), { wrapper: makeWrapper() })
    result.current.mutate()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockTestStream).toHaveBeenCalledTimes(1)
  })

  it('useBroadcastSSFEvent broadcasts a security signal', async () => {
    // camelCase, because `AdminSsfController.broadcast` reads
    // `request.only(['eventType', 'subject', 'reason'])`. The snake_cased
    // payload this test used to assert was never read by the handler, so every
    // broadcast came back 400 "eventType and subject are required" — the test
    // passed while the feature did not work.
    mockBroadcastEvent.mockResolvedValue({ data: { success: true } })
    const { result } = renderHook(() => useBroadcastSSFEvent(), { wrapper: makeWrapper() })
    result.current.mutate({
      eventType: 'session-revoked',
      subject: 'user-1',
      reason: 'credential compromise',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockBroadcastEvent).toHaveBeenCalledWith({
      eventType: 'session-revoked',
      subject: 'user-1',
      reason: 'credential compromise',
    })
  })

  it('useSSFHistory fetches SSF stream history', async () => {
    mockGetHistory.mockResolvedValue({
      data: [{ action: 'SSF_SIGNAL_BROADCAST', created_at: '2026-01-01' }],
    })
    const { result } = renderHook(() => useSSFHistory(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(mockGetHistory).toHaveBeenCalledTimes(1)
  })
})
