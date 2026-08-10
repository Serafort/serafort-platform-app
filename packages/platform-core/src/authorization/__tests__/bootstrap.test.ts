import { describe, it, expect, beforeEach } from 'vitest'
import {
  installAuthorization,
  defaultResourceMapper,
  _resetAuthorizationInstalledStateForTest,
} from '../bootstrap'
import { policyEngine, AuthorizationBlockedError } from '@cap/authorization'
import { apiClient, useAppStore } from '@cap/platform-store'

describe('installAuthorization bootstrap', () => {
  beforeEach(() => {
    _resetAuthorizationInstalledStateForTest()
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: 1, role: 'user', permissions: [] } as any,
    })
  })

  it('seeds the policy engine with the default policy set', () => {
    installAuthorization()

    const adminSubject = {
      id: 'admin-1',
      roles: ['admin'],
      permissions: [],
      attributes: {},
    }
    expect(policyEngine.can(adminSubject, 'delete', { type: 'role' })).toBe(true)

    const userSubject = {
      id: 'user-1',
      roles: ['user'],
      permissions: [],
      attributes: {},
    }
    expect(policyEngine.can(userSubject, 'delete', { type: 'role' })).toBe(false)
  })

  it('blocks denied admin API requests through the shared apiClient', async () => {
    installAuthorization()

    await expect(
      apiClient.request('/api/admin/rbac/roles', { method: 'POST' }),
    ).rejects.toBeInstanceOf(AuthorizationBlockedError)
  })

  it('does not block allowed admin API requests client-side', async () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: 1, role: 'admin', permissions: [] } as any,
    })
    installAuthorization()

    const error = await apiClient
      .request('/api/admin/rbac/roles', { method: 'POST' })
      .then(() => null)
      .catch((e: unknown) => e)

    expect(error).not.toBeInstanceOf(AuthorizationBlockedError)
  })

  it('passes non-admin endpoints through unguarded', async () => {
    installAuthorization()

    const error = await apiClient
      .request('/api/auth/signin', { method: 'POST' })
      .then(() => null)
      .catch((e: unknown) => e)

    expect(error).not.toBeInstanceOf(AuthorizationBlockedError)
  })

  it('defaultResourceMapper scopes to the RBAC admin surface', () => {
    expect(defaultResourceMapper('/api/admin/rbac/roles', {})?.type).toBe('role')
    expect(defaultResourceMapper('/api/admin/rbac/permissions', {})?.type).toBe('permission')
    expect(defaultResourceMapper('/api/admin/users', {})?.type).toBe('user')
    expect(defaultResourceMapper('/api/admin/clients', {})?.type).toBe('oidc-client')
    expect(defaultResourceMapper('/api/admin/organizations/1/styles', {})).toBeUndefined()
    expect(defaultResourceMapper('/api/auth/signin', {})).toBeUndefined()
  })

  it('is idempotent across repeated calls', () => {
    expect(() => {
      installAuthorization()
      installAuthorization()
    }).not.toThrow()
  })
})
