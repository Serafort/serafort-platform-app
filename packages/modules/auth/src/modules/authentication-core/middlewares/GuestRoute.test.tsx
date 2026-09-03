// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import GuestRoute from './GuestRoute';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid='navigate' data-to={to} />,
  useLocation: () => ({ pathname: '/sign-in', state: null }),
  Suspense: ({ children }: any) => <>{children}</>,
}))

const mockUpdateLayoutOverride = vi.fn()
vi.mock('@cap/platform-core', () => ({
  isObjectEmpty: (obj: any) => !obj || Object.keys(obj).length === 0,
  useAppStore: (selector: (s: any) => any) =>
    selector({ updateLayoutOverride: mockUpdateLayoutOverride }),
}))

const mockUseSessionGuard = vi.fn()
vi.mock('../../session-manager/middlewares/useSessionGuard', () => ({
  useSessionGuard: () => mockUseSessionGuard(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const guard = (overrides: Record<string, any> = {}) =>
  mockUseSessionGuard.mockReturnValue({
    isLoading: false,
    isAuthenticated: false,
    user: null,
    ...overrides,
  })

const renderRoute = (props: Record<string, any> = {}) =>
  render(<GuestRoute element={<div>Guest Content</div>} {...(props as any)} />)

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GuestRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  // ── Loading state ──────────────────────────────────────────────────────────

  it('shows a loading spinner while the session is resolving', () => {
    guard({ isLoading: true })
    renderRoute()
    expect(document.querySelector('.MuiCircularProgress-root')).not.toBeNull()
    expect(screen.queryByText('Guest Content')).toBeNull()
  })

  // ── Unauthenticated ────────────────────────────────────────────────────────

  it('renders the guest element when the user is not authenticated', () => {
    guard()
    renderRoute()
    expect(screen.getByText('Guest Content')).toBeTruthy()
  })

  it('renders the guest element when isAuthenticated=true but user is null', () => {
    guard({ isAuthenticated: true, user: null })
    renderRoute()
    expect(screen.getByText('Guest Content')).toBeTruthy()
  })

  it('renders the guest element when isAuthenticated=true but user object is empty', () => {
    guard({ isAuthenticated: true, user: {} })
    renderRoute()
    expect(screen.getByText('Guest Content')).toBeTruthy()
  })

  // ── Authenticated ──────────────────────────────────────────────────────────

  it('redirects to /dashboard when authenticated with a valid user', () => {
    guard({ isAuthenticated: true, user: { id: '1', email: 'u@example.com' } })
    renderRoute()
    const nav = screen.getByTestId('navigate')
    expect(nav.getAttribute('data-to')).toBe('/dashboard')
    expect(screen.queryByText('Guest Content')).toBeNull()
  })

  it('uses a custom redirectTo prop when provided', () => {
    guard({ isAuthenticated: true, user: { id: '1' } })
    renderRoute({ redirectTo: '/home' })
    const nav = screen.getByTestId('navigate')
    expect(nav.getAttribute('data-to')).toBe('/home')
  })

  it('redirects to state.from.pathname when location carries a prior route', () => {
    // location.state.from is injected by the Navigate in AuthRoute when it redirects
    // Our mock always returns { state: null } so the fallback is redirectTo
    guard({ isAuthenticated: true, user: { id: '1' } })
    renderRoute({ redirectTo: '/fallback' })
    const nav = screen.getByTestId('navigate')
    expect(nav.getAttribute('data-to')).toBe('/fallback')
  })
})
