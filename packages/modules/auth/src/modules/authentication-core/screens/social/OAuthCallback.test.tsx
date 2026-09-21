// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { StrictMode } from 'react'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
const mockSetSearchParams = vi.fn()
let searchParams = new URLSearchParams('code=abc123')

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [searchParams, mockSetSearchParams],
}))

vi.mock('react-i18next', () => ({
  // Render the English default so assertions read like the real screen.
  useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback ?? _key }),
}))

const mockSetUser = vi.fn()
// Partial mock: the shared auth layout this screen renders inside pulls
// `useSettings` from the same package, so replacing the module wholesale breaks
// the render before any assertion runs.
vi.mock('@cap/platform-store', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    useAppStore: (selector: (s: any) => any) => selector({ setUser: mockSetUser }),
  }
})

const mockExchange = vi.fn()
vi.mock('../../services/auth.service', () => ({
  default: { social: { exchange: (code: string) => mockExchange({ code }) } },
}))

import OAuthCallback from './OAuthCallback'

// ── Helpers ───────────────────────────────────────────────────────────────────

const resolveWith = (body: unknown) => mockExchange.mockResolvedValue({ data: body })

const rejectWith = (error: unknown) => mockExchange.mockRejectedValue(error)

// The single-flight cache is module scoped by design, so every test needs its
// own code or it would read a previous test's cached promise.
let codeSeq = 0
const nextCode = () => `code-${++codeSeq}`

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  searchParams = new URLSearchParams(`code=${nextCode()}`)
})

afterEach(() => {
  vi.useRealTimers()
  cleanup()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OAuthCallback', () => {
  it('exchanges the code exactly once under a StrictMode remount', async () => {
    // The backend consumes the code with GETDEL, so a second call always fails.
    // StrictMode unmounts and remounts on mount, which builds fresh refs -- a
    // ref guard inside the component does NOT cover this, and the browser
    // showed it issuing two requests. The guard has to live at module scope.
    resolveWith({ token: 't', user: { id: 1, role: 'participant' } })
    render(
      <StrictMode>
        <OAuthCallback />
      </StrictMode>,
    )

    await waitFor(() => expect(mockExchange).toHaveBeenCalled())
    expect(mockExchange).toHaveBeenCalledTimes(1)
    expect(mockExchange.mock.calls[0][0]).toEqual({ code: searchParams.get('code') })
  })

  it('still resolves to a signed-in state after a StrictMode remount', async () => {
    // The remount must not strand the screen on its loading state: the second
    // instance has to observe the result of the single in-flight request.
    resolveWith({ token: 't', user: { id: 1, role: 'admin' } })
    render(
      <StrictMode>
        <OAuthCallback />
      </StrictMode>,
    )

    expect(await screen.findByText(/you're signed in/i)).toBeTruthy()
  })

  it('strips the one-time code from the URL so a reload cannot replay it', () => {
    resolveWith({ token: 't', user: { id: 1 } })
    render(<OAuthCallback />)

    expect(mockSetSearchParams).toHaveBeenCalledWith({}, { replace: true })
  })

  it('establishes the session with the token attached to the user', async () => {
    resolveWith({ token: 'access-tok', user: { id: 7, role: 'participant' } })
    render(<OAuthCallback />)

    await waitFor(() =>
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, token: 'access-tok' }),
      ),
    )
  })

  it('sends an admin to the admin landing and a plain user to their account', async () => {
    resolveWith({ token: 't', user: { id: 1, role: 'admin' } })
    render(<OAuthCallback />)
    await vi.advanceTimersByTimeAsync(1000)
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users', { replace: true })

    cleanup()
    vi.clearAllMocks()
    searchParams = new URLSearchParams(`code=${nextCode()}`)
    resolveWith({ token: 't', user: { id: 2, role: 'participant' } })
    render(<OAuthCallback />)
    await vi.advanceTimersByTimeAsync(1000)
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())
    expect(mockNavigate).toHaveBeenCalledWith('/auth/account', { replace: true })
  })

  it('explains an expired or replayed code rather than a generic failure', async () => {
    rejectWith({ response: { data: { error: 'invalid_grant' } } })
    render(<OAuthCallback />)

    expect(await screen.findByText(/expired or was already used/i)).toBeTruthy()
    expect(mockSetUser).not.toHaveBeenCalled()
  })

  it('explains a disabled account distinctly', async () => {
    rejectWith({ response: { data: { error: 'account_inactive' } } })
    render(<OAuthCallback />)

    expect(await screen.findByText(/account is inactive/i)).toBeTruthy()
  })

  it('falls back to a generic message for an unrecognised failure', async () => {
    rejectWith({ response: { data: { error: 'server_error' } } })
    render(<OAuthCallback />)

    expect(await screen.findByText(/could not complete your sign-in/i)).toBeTruthy()
  })

  it('reports a missing code without calling the backend', async () => {
    searchParams = new URLSearchParams('')
    render(<OAuthCallback />)

    expect(await screen.findByText(/link is incomplete/i)).toBeTruthy()
    expect(mockExchange).not.toHaveBeenCalled()
  })

  it('treats a success with no user as a failure rather than a half-session', async () => {
    resolveWith({ token: 't' })
    render(<OAuthCallback />)

    expect(await screen.findByText(/no account came back/i)).toBeTruthy()
    expect(mockSetUser).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('retries with the original code after a failure', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    rejectWith({ response: { data: { error: 'server_error' } } })
    render(<OAuthCallback />)

    await user.click(await screen.findByRole('button', { name: /retry/i }))

    expect(mockExchange).toHaveBeenCalledTimes(2)
    expect(mockExchange.mock.calls[1][0]).toEqual(mockExchange.mock.calls[0][0])
  })
})
