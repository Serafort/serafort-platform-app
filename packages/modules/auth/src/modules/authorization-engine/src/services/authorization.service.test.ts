// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  PermissionCheckerService,
  RoleService,
  PermissionService,
  type UserPermissionsContext,
} from './authorization.service'
import { RbacSubscriber } from './rbac.subscriber'
import { eventBus } from '../../../../domain-kernel/src/events/event-bus'
import {
  AuthEventTypes,
  SessionEventTypes,
  TokenEventTypes,
} from '../../../../domain-kernel/src/events/auth-events'

describe('PermissionCheckerService - Multi-Tenant Security Boundaries', () => {
  it('fails closed when request is empty or invalid', async () => {
    const checker = new PermissionCheckerService(() => ({
      userId: 1,
      tenantId: 'tenant-1',
      isAuthenticated: true,
    }))

    const result1 = await checker.checkPermission(null as any)
    expect(result1.allowed).toBe(false)

    const result2 = await checker.checkPermission({} as any)
    expect(result2.allowed).toBe(false)
  })

  it('fails closed when user context is unauthenticated or missing', async () => {
    const checker = new PermissionCheckerService(() => null)
    const result = await checker.checkPermission({ permission: 'users.read' })
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('not authenticated')
  })

  it('enforces strict tenant boundary isolation and denies cross-tenant access for tenant admins', async () => {
    const tenantAdminContext: UserPermissionsContext = {
      userId: 10,
      tenantId: 'tenant-alpha',
      organizationId: 'tenant-alpha',
      role: 'tenant_admin',
      permissions: ['*'],
      isAuthenticated: true,
    }

    const checker = new PermissionCheckerService(() => tenantAdminContext)

    // Allowed within active tenant
    const sameTenantResult = await checker.checkPermission({
      permission: 'billing.view',
      targetTenantId: 'tenant-alpha',
    })
    expect(sameTenantResult.allowed).toBe(true)

    // Strictly denied for foreign tenant
    const crossTenantResult = await checker.checkPermission({
      permission: 'billing.view',
      targetTenantId: 'tenant-bravo',
    })
    expect(crossTenantResult.allowed).toBe(false)
    expect(crossTenantResult.reason).toBe('CROSS_TENANT_ACCESS_DENIED')
  })

  it('allows global cross-tenant access for platform super-admin', async () => {
    const superAdminContext: UserPermissionsContext = {
      userId: 1,
      tenantId: 'system',
      organizationId: 'system',
      role: 'super-admin',
      isAuthenticated: true,
    }

    const checker = new PermissionCheckerService(() => superAdminContext)
    const result = await checker.checkPermission({
      permission: 'system.settings',
      targetTenantId: 'any-foreign-tenant',
    })

    expect(result.allowed).toBe(true)
  })

  it('evaluates wildcard and resource:action permissions accurately within tenant scope', async () => {
    const userContext: UserPermissionsContext = {
      userId: 42,
      tenantId: 'tenant-100',
      organizationId: 'tenant-100',
      role: 'member',
      permissions: ['documents:read', 'reports:*'],
      isAuthenticated: true,
    }

    const checker = new PermissionCheckerService(() => userContext)

    // Direct match
    expect(
      (await checker.checkPermission({ permission: 'documents:read', tenantId: 'tenant-100' }))
        .allowed,
    ).toBe(true)

    // Resource + Action match with colon/dot
    expect(
      (
        await checker.checkPermission({
          resource: 'documents',
          action: 'read',
          tenantId: 'tenant-100',
        })
      ).allowed,
    ).toBe(true)

    // Wildcard match
    expect(
      (
        await checker.checkPermission({
          resource: 'reports',
          action: 'export',
          tenantId: 'tenant-100',
        })
      ).allowed,
    ).toBe(true)

    // Unauthorized action
    expect(
      (
        await checker.checkPermission({
          resource: 'documents',
          action: 'delete',
          tenantId: 'tenant-100',
        })
      ).allowed,
    ).toBe(false)
  })

  it('fails closed with CROSS_TENANT_ACCESS_DENIED when request specifies tenantId/targetTenantId/organizationId but context is unresolved', async () => {
    const unassignedUserContext: UserPermissionsContext = {
      userId: 77,
      tenantId: undefined,
      organizationId: undefined,
      role: 'member',
      permissions: ['documents:read'],
      isAuthenticated: true,
    }

    const checker = new PermissionCheckerService(() => unassignedUserContext)

    // targetTenantId specified but user context tenantId is unresolved
    const targetTenantResult = await checker.checkPermission({
      permission: 'documents:read',
      targetTenantId: 'tenant-xyz',
    })
    expect(targetTenantResult.allowed).toBe(false)
    expect(targetTenantResult.reason).toBe('CROSS_TENANT_ACCESS_DENIED')

    // tenantId specified but user context tenantId is unresolved
    const tenantResult = await checker.checkPermission({
      permission: 'documents:read',
      tenantId: 'tenant-xyz',
    })
    expect(tenantResult.allowed).toBe(false)
    expect(tenantResult.reason).toBe('CROSS_TENANT_ACCESS_DENIED')

    // organizationId specified but user context organizationId is unresolved
    const orgResult = await checker.checkPermission({
      permission: 'documents:read',
      organizationId: 'org-xyz',
    })
    expect(orgResult.allowed).toBe(false)
    expect(orgResult.reason).toBe('CROSS_TENANT_ACCESS_DENIED')
  })

  it('requires real permission records and does not synthesize resource:* for bare tenant admin role', async () => {
    const bareTenantAdminContext: UserPermissionsContext = {
      userId: 55,
      tenantId: 'tenant-alpha',
      organizationId: 'tenant-alpha',
      role: 'tenant_admin',
      permissions: [],
      isAuthenticated: true,
    }

    const checker = new PermissionCheckerService(() => bareTenantAdminContext)

    // Arbitrary resource action should NOT be automatically granted via synthesized resource:*
    const arbitraryResourceResult = await checker.checkPermission({
      resource: 'billing',
      action: 'delete',
      tenantId: 'tenant-alpha',
    })
    expect(arbitraryResourceResult.allowed).toBe(false)
    expect(arbitraryResourceResult.reason).toContain('denied for current role and scope')

    // Standard tenant management permissions are still granted
    expect(
      (await checker.checkPermission({ permission: 'tenant:manage', tenantId: 'tenant-alpha' }))
        .allowed,
    ).toBe(true)
    expect(
      (await checker.checkPermission({ permission: 'org:admin', tenantId: 'tenant-alpha' }))
        .allowed,
    ).toBe(true)

    // When real permission is explicitly granted, it passes
    const adminWithExplicitPermContext: UserPermissionsContext = {
      ...bareTenantAdminContext,
      permissions: ['billing:read'],
    }
    const explicitChecker = new PermissionCheckerService(() => adminWithExplicitPermContext)
    expect(
      (
        await explicitChecker.checkPermission({
          resource: 'billing',
          action: 'read',
          tenantId: 'tenant-alpha',
        })
      ).allowed,
    ).toBe(true)
    expect(
      (
        await explicitChecker.checkPermission({
          resource: 'billing',
          action: 'delete',
          tenantId: 'tenant-alpha',
        })
      ).allowed,
    ).toBe(false)
  })
})

describe('RbacSubscriber - Event Bus & Query Invalidation', () => {
  let mockQueryClient: any

  beforeEach(() => {
    mockQueryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    }
  })

  it('invalidates rbac, user, and me caches upon UserAuthenticated', async () => {
    const subscriber = new RbacSubscriber({ queryClient: mockQueryClient })

    await subscriber.handleUserAuthenticated({
      id: 'evt-1',
      type: AuthEventTypes.USER_AUTHENTICATED,
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload: {
        userId: 'u1',
        email: 'test@example.com',
        factors: ['password'],
        method: 'password',
        sessionId: 's1',
      },
    })

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'rbac'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'users'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['auth', 'me'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['user', 'permissions'],
    })
  })

  it('invalidates developer tokens upon TokenIssued', async () => {
    const subscriber = new RbacSubscriber({ queryClient: mockQueryClient })

    await subscriber.handleTokenIssued({
      id: 'evt-2',
      type: TokenEventTypes.TOKEN_ISSUED,
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload: {
        tokenId: 't1',
        userId: 'u1',
        tokenType: 'access',
        expiresAt: new Date().toISOString(),
      },
    })

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['admin', 'developer', 'apiKeys'],
    })
  })
})
