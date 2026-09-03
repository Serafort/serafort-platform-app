// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { usePermissions } from './usePermissions';
import { useAppStore } from '@cap/platform-store';

const { mockStore } = vi.hoisted(() => {
  let currentState = { user: null, isAuthenticated: false }
  const fn: any = vi.fn((selector: any) => {
    const state = fn.getState()
    return selector ? selector(state) : state
  })
  fn.getState = () => currentState
  fn.mockReturnValue = (val: any) => {
    currentState = val
  }
  return { mockStore: fn }
})

vi.mock('@cap/platform-store', () => ({
  useAppStore: mockStore,
}))

const mockedUseAppStore = vi.mocked(useAppStore)

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hasRole', () => {
    it('should return false when user is not authenticated', () => {
      mockedUseAppStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole('admin')).toBe(false)
    })

    it('should return false when user is null', () => {
      mockedUseAppStore.mockReturnValue({
        user: null,
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole('admin')).toBe(false)
    })

    it('should return true for admin users (bypass)', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'admin',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole('user')).toBe(true)
      expect(result.current.hasRole('super_admin')).toBe(true)
      expect(result.current.hasRole('any_role')).toBe(true)
    })

    it('should return true for super_admin users (bypass)', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'super_admin',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole('user')).toBe(true)
      expect(result.current.hasRole('provider_admin')).toBe(true)
    })

    it('should return true for provider_admin users (bypass)', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'provider_admin',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole('user')).toBe(true)
    })

    it('should match exact role with OR logic (default)', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'user',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole('user')).toBe(true)
      expect(result.current.hasRole('admin')).toBe(false)
    })

    it('should match any role with OR logic', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'moderator',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole(['user', 'moderator'])).toBe(true)
      expect(result.current.hasRole(['admin', 'super_admin'])).toBe(false)
    })

    it('should match all roles with AND logic', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'admin',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole(['admin'], 'AND')).toBe(true)
    })

    it('should handle role from roleName field', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: null,
          roleName: 'participant',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole('participant')).toBe(true)
    })

    it('should handle role from roleObject field', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: null,
          roleObject: { name: 'judge', slug: 'judge' },
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole('judge')).toBe(true)
    })
  })

  describe('hasPermission', () => {
    it('should return false when user is not authenticated', () => {
      mockedUseAppStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission('read:users')).toBe(false)
    })

    it('should return false when user is null', () => {
      mockedUseAppStore.mockReturnValue({
        user: null,
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission('read:users')).toBe(false)
    })

    it('should return true for admin users regardless of permissions array', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'admin',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission('any:permission')).toBe(true)
    })

    it('should return true for super_admin users regardless of permissions array', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'super_admin',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission('any:permission')).toBe(true)
    })

    it('should check single permission with AND logic (default)', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'user',
          permissions: ['read:users', 'write:users'],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission('read:users')).toBe(true)
      expect(result.current.hasPermission('delete:users')).toBe(false)
    })

    it('should require all permissions with AND logic', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'user',
          permissions: ['read:users', 'write:users'],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission(['read:users', 'write:users'], 'AND')).toBe(true)
      expect(result.current.hasPermission(['read:users', 'delete:users'], 'AND')).toBe(false)
    })

    it('should require at least one permission with OR logic', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'user',
          permissions: ['read:users'],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission(['read:users', 'delete:users'], 'OR')).toBe(true)
      expect(result.current.hasPermission(['write:users', 'delete:users'], 'OR')).toBe(false)
    })

    it('should handle empty permissions array', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'user',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission('any:permission')).toBe(false)
    })

    it('should handle non-array permissions field', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: 'user',
          permissions: 'invalid',
        } as unknown as { role: string; permissions: string[] },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission('any:permission')).toBe(false)
    })

    it('should handle nested user object', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          user: {
            role: 'user',
            permissions: ['read:users'],
          },
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission('read:users')).toBe(true)
    })

    it('should check admin bypass from roleName field', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: null,
          roleName: 'admin',
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission('any:permission')).toBe(true)
    })

    it('should check admin bypass from roleObject field', () => {
      mockedUseAppStore.mockReturnValue({
        user: {
          role: null,
          roleObject: { name: 'super_admin' },
          permissions: [],
        },
        isAuthenticated: true,
      } as ReturnType<typeof useAppStore>)

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasPermission('any:permission')).toBe(true)
    })
  })

  describe('multiple admin roles bypass', () => {
    const adminRoles = ['admin', 'super_admin', 'super_admin_employee', 'provider_admin'] as const

    adminRoles.forEach((role) => {
      it(`should bypass permission checks for ${role}`, () => {
        mockedUseAppStore.mockReturnValue({
          user: {
            role,
            permissions: [],
          },
          isAuthenticated: true,
        } as ReturnType<typeof useAppStore>)

        const { result } = renderHook(() => usePermissions())

        expect(result.current.hasPermission('any:permission')).toBe(true)
        expect(result.current.hasRole('any:role')).toBe(true)
      })
    })
  })
})
