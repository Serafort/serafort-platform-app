// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import AdminRoute from './AdminRoute'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockNavigate, mockUpdateLayoutOverride, mockUseSessionGuard } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUpdateLayoutOverride: vi.fn(),
  mockUseSessionGuard: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid='navigate' data-to={to} />,
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/admin', state: null }),
  Suspense: ({ children }: any) => <>{children}</>,
}))

vi.mock('@cap/platform-core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    Roles: { USER: 0, ADMIN: 100, SUPERADMINEMPLOYEE: 200, SUPERADMIN: 300 },
    isObjectEmpty: (obj: any) => !obj || Object.keys(obj).length === 0,
    useHasHydrated: () => true,
    useAppStore: (selector: (s: any) => any) =>
      selector({ updateLayoutOverride: mockUpdateLayoutOverride }),
  }
})

vi.mock('@cap/authorization', () => ({
  useCan: (action: string, subject: any) => {
    const session = mockUseSessionGuard()
    const userRole = session?.user?.role
    const requiredRole =
      subject?.attributes?.minimumRole ?? subject?.attributes?.requiredRole ?? 100
    if (userRole === undefined || userRole === null) return false
    return userRole >= requiredRole
  },
}))

// Mock the 403 screen used inside AdminRoute
vi.mock('../screens', () => ({
  Page403Forbidden: () => <div data-testid='page-403'>403 Forbidden</div>,
}))

vi.mock('../../session-manager/middlewares/useSessionGuard', () => ({
  useSessionGuard: () => mockUseSessionGuard(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeUser = (role: number = 100, extras: Record<string, any> = {}) => ({
  id: '1',
  email: 'admin@example.com',
  role,
  emailVerified: true,
  ...extras,
})

const guard = (overrides: Record<string, any> = {}) =>
  mockUseSessionGuard.mockReturnValue({
    isLoading: false,
    sessionError: null,
    isAuthenticated: false,
    user: null,
    ...overrides,
  })

const renderRoute = (props: Partial<React.ComponentProps<typeof AdminRoute>> = {}) =>
  render(<AdminRoute element={<div>Admin Content</div>} {...(props as any)} />)

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AdminRoute', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  // ── 1. Loading state ────────────────────────────────────────────────────────
  it('shows a loading spinner while the session is resolving', () => {
    guard({ isLoading: true })
    renderRoute()

    // CircularProgress renders a role="progressbar" or similar MUI backdrop
    expect(screen.queryByText('Admin Content')).toBeNull()
  })

  // ── 2. Session error state ──────────────────────────────────────────────────
  it('renders a session error alert when sessionError is set', () => {
    guard({ sessionError: 'Session expired' })
    renderRoute()

    expect(screen.getByText('Session expired')).toBeTruthy()
    expect(screen.queryByText('Admin Content')).toBeNull()
  })

  // ── 3. Unauthenticated state ────────────────────────────────────────────────
  it('redirects to /auth/signin when the user is not authenticated', () => {
    guard({ isAuthenticated: false })
    renderRoute()

    const nav = screen.getByTestId('navigate')
    expect(nav.getAttribute('data-to')).toBe('/auth/sign-in')
    expect(screen.queryByText('Admin Content')).toBeNull()
  })

  it('redirects when user is an empty object', () => {
    guard({ isAuthenticated: true, user: {} })
    renderRoute()

    const nav = screen.getByTestId('navigate')
    expect(nav.getAttribute('data-to')).toBe('/auth/sign-in')
  })

  // ── 4. Role authorization — Insufficient role ────────────────────────────────
  it('renders the 403 page when a regular user tries to access an admin route', () => {
    guard({
      isAuthenticated: true,
      user: makeUser(0), // USER role (0)
    })
    renderRoute()

    expect(screen.getByText('Access Forbidden')).toBeTruthy()
    expect(screen.queryByText('Admin Content')).toBeNull()
  })

  // ── 5. Role authorization — Sufficient role (default requiredRole = 100) ────
  it('renders the admin element for an ADMIN role user (100)', () => {
    guard({
      isAuthenticated: true,
      user: makeUser(100),
    })
    renderRoute()

    expect(screen.getByText('Admin Content')).toBeTruthy()
    expect(screen.queryByText('Access Forbidden')).toBeNull()
  })

  it('renders the admin element for a SUPERADMINEMPLOYEE role user (200)', () => {
    guard({
      isAuthenticated: true,
      user: makeUser(200),
    })
    renderRoute()

    expect(screen.getByText('Admin Content')).toBeTruthy()
  })

  it('renders the admin element for a SUPERADMIN role user (300)', () => {
    guard({
      isAuthenticated: true,
      user: makeUser(300),
    })
    renderRoute()

    expect(screen.getByText('Admin Content')).toBeTruthy()
  })

  // ── 6. Role authorization — Explicit minimumRole prop ─────────────────────
  it('shows "Insufficient Permissions" when ADMIN (100) tries to access a SUPERADMIN (300) route', () => {
    guard({
      isAuthenticated: true,
      user: makeUser(100),
    })
    renderRoute({ minimumRole: 300 as any })

    expect(screen.getByText('Insufficient Permissions')).toBeTruthy()
    expect(screen.queryByText('Admin Content')).toBeNull()
  })

  it('renders the element when the user meets the exact minimum role', () => {
    guard({
      isAuthenticated: true,
      user: makeUser(200),
    })
    renderRoute({ minimumRole: 200 as any })

    expect(screen.getByText('Admin Content')).toBeTruthy()
  })

  it('renders the element when the user exceeds the minimum role', () => {
    guard({
      isAuthenticated: true,
      user: makeUser(300),
    })
    renderRoute({ minimumRole: 200 as any })

    expect(screen.getByText('Admin Content')).toBeTruthy()
  })
})
