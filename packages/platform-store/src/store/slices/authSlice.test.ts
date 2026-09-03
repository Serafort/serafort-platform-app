import { describe, it, expect, beforeEach } from 'vitest'
import { createAuthSlice } from './authSlice'
import { getTenantId, getImpersonationContext } from '../../services/api/api.client'
import { TenantRoles, PlatformRoles } from '@cap/shared-types'

describe('authSlice Multi-Tenant and Impersonation', () => {
  let slice: any
  let state: any

  beforeEach(() => {
    state = {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,
      tokens: null,
      activeTenantId: null,
      memberships: [],
      impersonationSession: null,
    }

    const set = (fn: (s: any) => void) => {
      fn(state)
    }
    const get = () => state

    slice = createAuthSlice(set as any, get as any, {} as any)
  })

  it('sets active tenant and updates tenant context upon setUser', () => {
    slice.setUser({
      id: 101,
      email: 'admin@acme.corp',
      role: TenantRoles.TENANT_ADMIN,
      activeTenantId: 'org-acme-99',
      memberships: [
        { orgId: 'org-acme-99', role: TenantRoles.TENANT_ADMIN },
        { orgId: 'org-subsidiary-1', role: TenantRoles.VIEWER },
      ],
    })

    expect(state.isAuthenticated).toBe(true)
    expect(state.activeTenantId).toBe('org-acme-99')
    expect(state.memberships).toHaveLength(2)
    expect(getTenantId()).toBe('org-acme-99')
  })

  it('switches active tenant dynamically', () => {
    slice.setUser({
      id: 101,
      email: 'consultant@agency.com',
      role: TenantRoles.MEMBER,
      activeTenantId: 'org-1',
      memberships: [
        { orgId: 'org-1', role: TenantRoles.MEMBER },
        { orgId: 'org-2', role: TenantRoles.TENANT_OWNER },
      ],
    })

    slice.switchTenant('org-2')

    expect(state.activeTenantId).toBe('org-2')
    expect(state.user.activeTenantId).toBe('org-2')
    expect(getTenantId()).toBe('org-2')
  })

  it('manages support impersonation lifecycle with time-bound session', () => {
    slice.setUser({
      id: 'support-agent-42',
      email: 'ops@cap.saas',
      role: PlatformRoles.PLATFORM_SUPPORT,
      activeTenantId: null,
    })

    const session = {
      sessionId: 'sess-audit-12345',
      actorUserId: 'support-agent-42',
      actorRole: PlatformRoles.PLATFORM_SUPPORT,
      targetOrgId: 'org-client-77',
      targetOrgName: 'Client Enterprise Inc',
      startedAt: Date.now(),
      expiresAt: Date.now() + 1800000,
      reason: 'Diagnosing webhook delivery drops (Ticket #884)',
      readOnly: true,
    }

    slice.startImpersonation(session)

    expect(state.impersonationSession).toEqual(session)
    expect(state.activeTenantId).toBe('org-client-77')
    expect(getTenantId()).toBe('org-client-77')
    expect(getImpersonationContext()).toEqual(session)

    // Stop impersonation
    slice.stopImpersonation()

    expect(state.impersonationSession).toBeNull()
    expect(getImpersonationContext()).toBeNull()
  })
})
