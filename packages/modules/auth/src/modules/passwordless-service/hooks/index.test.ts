// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { usePasswordlessSend, usePasswordlessVerify } from './index'
import authService from '../../authentication-core/services/auth.service'

vi.mock('../../authentication-core/services/auth.service', () => ({
  default: {
    passwordless: {
      send: vi.fn(),
      verify: vi.fn(),
    },
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('passwordless hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePasswordlessSend', () => {
    it('calls authService.passwordless.send with email string', async () => {
      vi.mocked(authService.passwordless.send).mockResolvedValueOnce({
        data: { success: true, message: 'Magic link sent' },
        status: 200,
        headers: {},
        ok: true,
      } as any)

      const { result } = renderHook(() => usePasswordlessSend(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('user@example.com')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(authService.passwordless.send).toHaveBeenCalledWith('user@example.com')
      expect(result.current.data?.data.success).toBe(true)
    })

    it('calls authService.passwordless.send with payload object containing redirectUrl', async () => {
      vi.mocked(authService.passwordless.send).mockResolvedValueOnce({
        data: { success: true, message: 'Magic link sent' },
        status: 200,
        headers: {},
        ok: true,
      } as any)

      const { result } = renderHook(() => usePasswordlessSend(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ email: 'user@example.com', redirectUrl: '/custom-dashboard' })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(authService.passwordless.send).toHaveBeenCalledWith({
        email: 'user@example.com',
        redirectUrl: '/custom-dashboard',
      })
    })
  })

  describe('usePasswordlessVerify', () => {
    it('does not trigger query if token is empty string', async () => {
      const { result } = renderHook(() => usePasswordlessVerify(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
      expect(authService.passwordless.verify).not.toHaveBeenCalled()
    })

    it('triggers query when token is provided', async () => {
      vi.mocked(authService.passwordless.verify).mockResolvedValueOnce({
        data: {
          success: true,
          token: 'jwt-access-token',
          user: { id: 1, email: 'user@example.com', role: 'admin' },
        },
        status: 200,
        headers: {},
        ok: true,
      } as any)

      const { result } = renderHook(() => usePasswordlessVerify('valid-magic-token'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(authService.passwordless.verify).toHaveBeenCalledWith('valid-magic-token')
      expect(result.current.data?.data.user.email).toBe('user@example.com')
    })
  })
})
