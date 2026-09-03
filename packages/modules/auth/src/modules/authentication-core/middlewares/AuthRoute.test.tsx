// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import AuthRoute from "./AuthRoute"

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid='navigate' data-to={to} />,
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/protected', state: null }),
  Suspense: ({ children }: any) => <>{children}</>,
}))

const mockUpdateLayoutOverride = vi.fn()
vi.mock('@cap/platform-core', () => ({
  // Numeric enum values matching source: USER=0, ADMIN=100, SUPERADMINEMPLOYEE=200, SUPERADMIN=300
  Roles: { USER: 0, ADMIN: 100, SUPERADMINEMPLOYEE: 200, SUPERADMIN: 300 },
  useAppStore: (selector: (s: any) => any) =>
    selector({ updateLayoutOverride: mockUpdateLayoutOverride }),
}))

const mockUseSessionGuard = vi.fn()
vi.mock('../../session-manager/middlewares/useSessionGuard', () => ({
  useSessionGuard: () => mockUseSessionGuard(),
}))

vi.mock('@cap/authorization', () => ({
  useCan: (action: string, subject: any) => {
    const session = mockUseSessionGuard()
    const userRole = session?.user?.role
    if (subject?.type === 'admin_route') {
      return userRole === 100 || userRole === 200 || userRole === 300
    }
    if (subject?.type === 'auth_route') {
      const allowedRoles = subject?.attributes?.allowedRoles
      if (!allowedRoles || allowedRoles.length === 0) return true
      return allowedRoles.includes(userRole)
    }
    return true
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeUser = (overrides: Record<string, any> = {}) => ({
  id: '1',
  email: 'user@example.com',
  role: 0,
  emailVerified: true,
  ...overrides,
})

const guard = (overrides: Record<string, any> = {}) =>
  mockUseSessionGuard.mockReturnValue({
    isLoading: false,
    sessionError: null,
    isAuthenticated: false,
    user: null,
    ...overrides,
  })

const renderRoute = (props: Partial<React.ComponentProps<typeof AuthRoute>> = {}) =>
  render(<AuthRoute element={<div>Protected Content</div>} {...(props as any)} />)

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  // ── Loading state ──────────────────────────────────────────────────────────

  it('shows a loading indicator while the session is resolving', () => {
    guard({ isLoading: true })
    renderRoute()
    expect(document.querySelector('.MuiCircularProgress-root')).not.toBeNull()
    expect(screen.queryByText('Protected Content')).toBeNull()
  })

  // ── Session error ──────────────────────────────────────────────────────────

  it('renders an error alert and a "Go to Login" button when a session error occurs', () => {
    guard({ sessionError: 'Your session has expired.' })
    renderRoute()
    expect(screen.getByText('Your session has expired.')).toBeTruthy()
    expect(screen.getByRole('button', { name: /go to login/i })).toBeTruthy()
  })

  // ── Unauthenticated ────────────────────────────────────────────────────────

  it('redirects to /auth/sign-in when the user is not authenticated', () => {
    guard({ isAuthenticated: false })
    renderRoute()
    const nav = screen.getByTestId('navigate')
    expect(nav.getAttribute('data-to')).toBe('/auth/sign-in')
    expect(screen.queryByText('Protected Content')).toBeNull()
  })

  // ── Authenticated, no role restriction ────────────────────────────────────

  it('renders the protected element when authenticated with no role restriction', () => {
    guard({ isAuthenticated: true, user: makeUser() })
    renderRoute()
    expect(screen.getByText('Protected Content')).toBeTruthy()
  })

  // ── Role-based access ──────────────────────────────────────────────────────

  it('shows a forbidden message when the user role is not in allowedRoles', () => {
    guard({ isAuthenticated: true, user: makeUser({ role: 0 }) })
    // allowedRoles requires ADMIN (100)
    renderRoute({ allowedRoles: [100] as any })
    expect(screen.getByText(/don.t have permission/i)).toBeTruthy()
    expect(screen.queryByText('Protected Content')).toBeNull()
  })

  it('renders the element when the user has an allowed role', () => {
    guard({ isAuthenticated: true, user: makeUser({ role: 100 }) })
    renderRoute({ allowedRoles: [100] as any })
    expect(screen.getByText('Protected Content')).toBeTruthy()
  })

  it('renders the element when the user has one of several allowed roles', () => {
    guard({ isAuthenticated: true, user: makeUser({ role: 200 }) })
    renderRoute({ allowedRoles: [100, 200] as any })
    expect(screen.getByText('Protected Content')).toBeTruthy()
  })

  // ── Email verification ─────────────────────────────────────────────────────

  it('shows a verification warning when requiresVerification and the user is unverified', () => {
    guard({
      isAuthenticated: true,
      user: makeUser({ role: 0, emailVerified: false }),
    })
    renderRoute({ requiresVerification: true })
    expect(screen.getByText(/verify your email/i)).toBeTruthy()
    expect(screen.queryByText('Protected Content')).toBeNull()
  })

  it('allows access when the user is verified via emailVerified flag', () => {
    guard({
      isAuthenticated: true,
      user: makeUser({ role: 0, emailVerified: true }),
    })
    renderRoute({ requiresVerification: true })
    expect(screen.getByText('Protected Content')).toBeTruthy()
  })

  it('bypasses the verification check for ADMIN users', () => {
    guard({
      isAuthenticated: true,
      user: makeUser({ role: 100, emailVerified: false }),
    })
    renderRoute({ requiresVerification: true })
    expect(screen.getByText('Protected Content')).toBeTruthy()
  })

  it('bypasses the verification check for SUPERADMIN users', () => {
    guard({
      isAuthenticated: true,
      user: makeUser({ role: 300, emailVerified: false }),
    })
    renderRoute({ requiresVerification: true })
    expect(screen.getByText('Protected Content')).toBeTruthy()
  })
})
