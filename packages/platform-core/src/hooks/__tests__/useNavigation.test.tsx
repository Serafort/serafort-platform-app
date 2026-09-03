// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useNavigationMenu } from '../useNavigation'
import { useAppStore } from '@cap/platform-store'
import type { NavItemConfig } from '@cap/shared-types'

const testNavItems: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    variant: ['vertical', 'horizontal'],
    order: 10,
  },
  {
    id: 'admin-users',
    label: 'User Directory',
    path: '/admin/users',
    roles: ['admin'],
    variant: ['vertical', 'horizontal'],
    order: 20,
  },
  {
    id: 'guest-signin',
    label: 'Sign In',
    path: '/auth/signin',
    guestOnly: true,
    variant: ['vertical', 'horizontal'],
    order: 30,
  },
  {
    id: 'public-home',
    label: 'Home',
    path: '/',
    variant: ['public'],
    order: 5,
  },
]

const { mockStore } = vi.hoisted(() => {
  let currentState: any = {
    navItems: [],
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  }
  const fn: any = vi.fn((selector: any) => {
    const state = fn.getState()
    return selector ? selector(state) : state
  })
  fn.getState = () => currentState
  fn.setState = (val: any) => {
    currentState = { ...currentState, ...val }
  }
  return { mockStore: fn }
})

vi.mock('@cap/platform-store', () => ({
  useAppStore: mockStore,
}))

describe('useNavigationMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.setState({
      navItems: testNavItems,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    })
  })

  it('admin variant resolves items marked with vertical variant for admin users', () => {
    mockStore.setState({
      user: { id: '1', role: 'admin', roles: ['admin'] },
      isAuthenticated: true,
      isAdmin: true,
    })

    const { result } = renderHook(() => useNavigationMenu('admin'))
    const ids = result.current.map((item) => item.id)

    expect(ids).toContain('dashboard')
    expect(ids).toContain('admin-users')
    expect(ids).not.toContain('guest-signin') // guestOnly should be filtered out
    expect(ids).not.toContain('public-home') // public variant only
  })

  it('vertical variant hides admin-only items when user is not admin', () => {
    mockStore.setState({
      user: { id: '2', role: 'user', roles: ['user'] },
      isAuthenticated: true,
      isAdmin: false,
    })

    const { result } = renderHook(() => useNavigationMenu('vertical'))
    const ids = result.current.map((item) => item.id)

    expect(ids).toContain('dashboard')
    expect(ids).not.toContain('admin-users')
    expect(ids).not.toContain('guest-signin')
  })

  it('guest-only items appear for unauthenticated visitors in vertical variant', () => {
    mockStore.setState({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    })

    const { result } = renderHook(() => useNavigationMenu('vertical'))
    const ids = result.current.map((item) => item.id)

    expect(ids).toContain('dashboard')
    expect(ids).toContain('guest-signin')
    expect(ids).not.toContain('admin-users')
  })
})
