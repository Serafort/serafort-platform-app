// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PasswordlessInitiation from './PasswordlessInitiation'
import PasswordlessVerification from './PasswordlessVerification'
import authService from '../../authentication-core/services/auth.service'
import { useAuthStore } from '../../authentication-core/store'
import { secureTokenManager, useAppStore } from '@cap/platform-core'

vi.mock('../../authentication-core/services/auth.service', () => ({
  default: {
    passwordless: {
      send: vi.fn(),
      verify: vi.fn(),
    },
  },
}))

vi.mock('@cap/platform-core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    secureTokenManager: {
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
      getAccessToken: vi.fn(),
    },
    useAppStore: {
      getState: vi.fn(() => ({
        setUser: vi.fn(),
      })),
    },
  }
})

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderWithProviders(ui: React.ReactElement, initialEntries = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Passwordless Screens', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clearAuth()
  })

  afterEach(() => {
    cleanup()
  })

  describe('PasswordlessInitiation', () => {
    it('renders the initiation screen with email input and submit button', () => {
      renderWithProviders(<PasswordlessInitiation />)

      expect(screen.getByText(/Sign in with Magic Link/i)).toBeTruthy()
      expect(screen.getByPlaceholderText('name@company.com')).toBeTruthy()
      expect(screen.getByRole('button', { name: /Send Magic Link/i })).toBeTruthy()
    })

    it('validates invalid email before sending', async () => {
      renderWithProviders(<PasswordlessInitiation />)

      const input = screen.getByPlaceholderText('name@company.com')
      fireEvent.change(input, { target: { value: 'invalid-email' } })

      const submitButton = screen.getByRole('button', { name: /Send Magic Link/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeTruthy()
      })
      expect(authService.passwordless.send).not.toHaveBeenCalled()
    })

    it('submits valid email and navigates to verification with email param', async () => {
      vi.mocked(authService.passwordless.send).mockResolvedValueOnce({
        data: { success: true, message: 'Magic link sent' },
        status: 200,
        headers: {},
        ok: true,
      } as any)

      renderWithProviders(<PasswordlessInitiation />)

      const input = screen.getByPlaceholderText('name@company.com')
      fireEvent.change(input, { target: { value: 'developer@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Send Magic Link/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(authService.passwordless.send).toHaveBeenCalledWith({
          email: 'developer@example.com',
        })
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/auth/passwordless/verify?email=developer%40example.com'),
        )
      })
    })

    it('displays error alert when sending fails', async () => {
      vi.mocked(authService.passwordless.send).mockRejectedValueOnce({
        response: { data: { message: 'Rate limit exceeded. Please try again later.' } },
      })

      renderWithProviders(<PasswordlessInitiation />)

      const input = screen.getByPlaceholderText('name@company.com')
      fireEvent.change(input, { target: { value: 'rate@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Send Magic Link/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Rate limit exceeded/i)).toBeTruthy()
      })
    })
  })

  describe('PasswordlessVerification', () => {
    it('renders awaiting state when no token is present in URL', () => {
      renderWithProviders(<PasswordlessVerification />, [
        '/auth/passwordless/verify?email=test%40example.com',
      ])

      expect(screen.getByText(/Check Your Email/i)).toBeTruthy()
      expect(screen.getByText('test@example.com')).toBeTruthy()
      expect(screen.getByRole('button', { name: /Resend Magic Link/i })).toBeTruthy()
    })

    it('renders verifying state while verification query is in-flight', async () => {
      let resolveQuery: any
      vi.mocked(authService.passwordless.verify).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveQuery = resolve
          }),
      )

      renderWithProviders(<PasswordlessVerification />, [
        '/auth/passwordless/verify?token=pending-token',
      ])

      expect(screen.getByText(/Verifying Connection.../i)).toBeTruthy()

      // Cleanup pending promise
      resolveQuery({
        data: { success: true, token: 'tok', user: { id: 1 } },
        status: 200,
        headers: {},
        ok: true,
      })
    })

    it('handles verification success: sets tokens, updates auth store, and navigates', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })

      vi.mocked(authService.passwordless.verify).mockResolvedValueOnce({
        data: {
          success: true,
          token: 'access-jwt-token',
          user: { id: 'usr-99', email: 'verified@example.com', role: 'admin' },
        },
        status: 200,
        headers: {},
        ok: true,
      } as any)

      renderWithProviders(<PasswordlessVerification />, [
        '/auth/passwordless/verify?token=valid-secret-token',
      ])

      await waitFor(() => {
        expect(screen.getByText(/Authenticated Successfully/i)).toBeTruthy()
      })

      expect(secureTokenManager.setTokens).toHaveBeenCalledWith('access-jwt-token')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user?.email).toBe('verified@example.com')

      // Fast-forward delay timer
      vi.advanceTimersByTime(1500)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), { replace: true })
      })

      vi.useRealTimers()
    })

    it('handles expired/invalid token by displaying error state and offering resend CTA', async () => {
      vi.mocked(authService.passwordless.verify).mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Invalid or expired magic link' } },
      })

      renderWithProviders(<PasswordlessVerification />, [
        '/auth/passwordless/verify?token=expired-token&email=expired%40example.com',
      ])

      await waitFor(() => {
        expect(screen.getByText(/Link Expired or Invalid/i)).toBeTruthy()
      })

      expect(screen.getByRole('button', { name: /Request New Magic Link/i })).toBeTruthy()

      // Test resend click from error card
      vi.mocked(authService.passwordless.send).mockResolvedValueOnce({
        data: { success: true, message: 'New link sent' },
        status: 200,
        headers: {},
        ok: true,
      } as any)

      const resendBtn = screen.getByRole('button', { name: /Request New Magic Link/i })
      fireEvent.click(resendBtn)

      await waitFor(() => {
        expect(authService.passwordless.send).toHaveBeenCalledWith({
          email: 'expired@example.com',
        })
      })
    })
  })
})
