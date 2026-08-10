import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@cap/platform-store'
import {
  createFetchApiAuthEnforcer,
  AuthorizationBlockedError,
  type FetchAuthEnforcer,
} from '../enforcement/fetchApiAuthEnforcer'
import { policyEngine } from '../engine/engine'
import { PolicySet } from '../types/policy.types'

describe('createFetchApiAuthEnforcer', () => {
  let enforcer: FetchAuthEnforcer

  const rolePolicy: PolicySet = {
    version: '1.0.0',
    defaultEffect: 'deny',
    policies: [
      {
        id: 'role-admin-policy',
        rules: [
          {
            effect: 'allow',
            roles: ['admin'],
            actions: ['read', 'write', 'delete'],
            resources: ['role'],
          },
        ],
      },
    ],
  }

  beforeEach(() => {
    policyEngine.setPolicySet(rolePolicy)
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: 1, role: 'user', permissions: [] } as any,
    })
    enforcer = createFetchApiAuthEnforcer({
      optimisticDeny: true,
      getResource: (endpoint) => {
        if (endpoint.startsWith('/api/admin/rbac/roles')) return { type: 'role' }
        return undefined
      },
    })
  })

  it('does not throw when the subject is allowed', () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: 1, role: 'admin', permissions: [] } as any,
    })

    expect(() =>
      enforcer.beforeRequest('/api/admin/rbac/roles', { method: 'POST' }),
    ).not.toThrow()
  })

  it('throws AuthorizationBlockedError when denied', () => {
    let denied: { action: string; resource: { type: string } } | undefined
    enforcer = createFetchApiAuthEnforcer({
      optimisticDeny: true,
      getResource: (endpoint) => ({ type: 'role' }),
      onDenied: (info) => {
        denied = { action: info.action, resource: info.resource }
      },
    })

    try {
      enforcer.beforeRequest('/api/admin/rbac/roles', { method: 'POST' })
      expect.fail('Expected enforcer to block the request')
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationBlockedError)
      expect((error as AuthorizationBlockedError).isAuthBlocked).toBe(true)
      expect((error as Error).message).toContain("Action 'write'")
    }

    expect(denied?.action).toBe('write')
    expect(denied?.resource.type).toBe('role')
  })

  it('maps HTTP methods to policy actions', () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: 1, role: 'admin', permissions: [] } as any,
    })

    expect(() =>
      enforcer.beforeRequest('/api/admin/rbac/roles', { method: 'GET' }),
    ).not.toThrow()
    expect(() =>
      enforcer.beforeRequest('/api/admin/rbac/roles', { method: 'DELETE' }),
    ).not.toThrow()
  })

  it('passes through when no resource resolves', () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: 1, role: 'user', permissions: [] } as any,
    })

    expect(() =>
      enforcer.beforeRequest('/api/auth/signin', { method: 'POST' }),
    ).not.toThrow()
  })

  it('passes through when optimisticDeny is disabled', () => {
    enforcer = createFetchApiAuthEnforcer({
      optimisticDeny: false,
      getResource: () => ({ type: 'role' }),
    })

    expect(() =>
      enforcer.beforeRequest('/api/admin/rbac/roles', { method: 'POST' }),
    ).not.toThrow()
  })

  it('blocks unauthenticated subjects', () => {
    useAppStore.setState({ isAuthenticated: false, user: null })

    expect(() =>
      enforcer.beforeRequest('/api/admin/rbac/roles', { method: 'POST' }),
    ).toThrow(AuthorizationBlockedError)
  })
})
