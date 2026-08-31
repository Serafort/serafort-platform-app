// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useJWKSKeys,
  useGetJWKSKeyDetail,
  useCreateJWKSKey,
  useRotateJWKSKeys,
  useDeleteJWKSKey,
  jwksKeys,
} from './useJWKSQuery'

const {
  mockListKeys,
  mockGetKeyDetail,
  mockCreateKey,
  mockRotateKeys,
  mockDeleteKey,
} = vi.hoisted(() => ({
  mockListKeys: vi.fn(),
  mockGetKeyDetail: vi.fn(),
  mockCreateKey: vi.fn(),
  mockRotateKeys: vi.fn(),
  mockDeleteKey: vi.fn(),
}))

vi.mock('../services/jwks.service', () => ({
  default: {
    listKeys: mockListKeys,
    getKeyDetail: mockGetKeyDetail,
    createKey: mockCreateKey,
    rotateKeys: mockRotateKeys,
    deleteKey: mockDeleteKey,
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

describe('useJWKSQuery hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('jwksKeys generates correct query keys', () => {
    expect(jwksKeys.all).toEqual(['admin', 'jwks'])
    expect(jwksKeys.list()).toEqual(['admin', 'jwks', 'list'])
    expect(jwksKeys.detail('key-123')).toEqual(['admin', 'jwks', 'detail', 'key-123'])
  })

  it('useJWKSKeys fetches JWKS key list', async () => {
    mockListKeys.mockResolvedValue({ data: [{ kid: 'key-1', kty: 'RSA', alg: 'RS256' }] })
    const { result } = renderHook(() => useJWKSKeys(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(mockListKeys).toHaveBeenCalledTimes(1)
  })

  it('useGetJWKSKeyDetail fetches single key detail', async () => {
    mockGetKeyDetail.mockResolvedValue({ data: { kid: 'key-1', status: 'ACTIVE' } })
    const { result } = renderHook(() => useGetJWKSKeyDetail('key-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetKeyDetail).toHaveBeenCalledWith('key-1')
  })

  it('useCreateJWKSKey creates a new key', async () => {
    mockCreateKey.mockResolvedValue({ data: { kid: 'key-2' } })
    const { result } = renderHook(() => useCreateJWKSKey(), { wrapper: makeWrapper() })
    result.current.mutate({ algorithm: 'RS256', use: 'sig' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockCreateKey).toHaveBeenCalledWith({ algorithm: 'RS256', use: 'sig' })
  })

  it('useRotateJWKSKeys rotates active keys', async () => {
    mockRotateKeys.mockResolvedValue({ data: { new_key: { kid: 'key-3' } } })
    const { result } = renderHook(() => useRotateJWKSKeys(), { wrapper: makeWrapper() })
    result.current.mutate()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRotateKeys).toHaveBeenCalledTimes(1)
  })

  it('useDeleteJWKSKey deletes key', async () => {
    mockDeleteKey.mockResolvedValue({ data: { message: 'Deleted' } })
    const { result } = renderHook(() => useDeleteJWKSKey(), { wrapper: makeWrapper() })
    result.current.mutate('key-old')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockDeleteKey).toHaveBeenCalledWith('key-old')
  })
})
