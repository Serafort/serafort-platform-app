import { describe, it, expect, beforeEach } from 'vitest'
import { PolicyEngine } from '../engine/engine'
import { DEFAULT_POLICY_SET } from '../policies/defaultPolicySet'
import { buildSubject } from '../subject/buildSubject'
import {
  PlatformRoles,
  TenantRoles,
  getRoleRank,
  isPlatformRole,
  isTenantRole,
  normalizeRole,
  hasAdminRole,
  hasPlatformAccess,
} from '@cap/shared-types'
import { PolicyEffectEnum } from '../types/policy.types'

describe('Multi-Plane RBAC + ABAC Architecture Matrix', () => {
  let engine: PolicyEngine

  beforeEach(() => {
    engine = new PolicyEngine(DEFAULT_POLICY_SET)
  })

  describe('1. Role Normalization and Rank Hierarchy', () => {
    it('correctly maps and normalizes Platform Plane roles', () => {
      expect(normalizeRole('platform_owner')).toBe(PlatformRoles.PLATFORM_OWNER)
      expect(normalizeRole('Platform Owner')).toBe(PlatformRoles.PLATFORM_OWNER)
      expect(normalizeRole('super_admin')).toBe(PlatformRoles.SUPER_ADMIN)
      expect(normalizeRole('platform_support')).toBe(PlatformRoles.PLATFORM_SUPPORT)
      expect(normalizeRole('operations')).toBe(PlatformRoles.PLATFORM_SUPPORT)
      expect(normalizeRole('platform_billing')).toBe(PlatformRoles.PLATFORM_BILLING)
    })

    it('correctly maps and normalizes Tenant Plane roles', () => {
      expect(normalizeRole('tenant_owner')).toBe(TenantRoles.TENANT_OWNER)
      expect(normalizeRole('Tenant Admin')).toBe(TenantRoles.TENANT_ADMIN)
      expect(normalizeRole('security_admin')).toBe(TenantRoles.SECURITY_ADMIN)
      expect(normalizeRole('developer')).toBe(TenantRoles.DEVELOPER)
      expect(normalizeRole('member')).toBe(TenantRoles.MEMBER)
      expect(normalizeRole('viewer')).toBe(TenantRoles.VIEWER)
    })

    it('correctly identifies role planes', () => {
      expect(isPlatformRole('platform_owner')).toBe(true)
      expect(isPlatformRole('platform_support')).toBe(true)
      expect(isPlatformRole('platform_billing')).toBe(true)
      expect(isPlatformRole('tenant_owner')).toBe(false)

      expect(isTenantRole('tenant_owner')).toBe(true)
      expect(isTenantRole('security_admin')).toBe(true)
      expect(isTenantRole('developer')).toBe(true)
      expect(isTenantRole('viewer')).toBe(true)
      expect(isTenantRole('platform_owner')).toBe(false)
    })

    it('maintains strict rank hierarchy across both planes', () => {
      expect(getRoleRank('platform_owner')).toBe(100)
      expect(getRoleRank('super_admin')).toBe(100)
      expect(getRoleRank('platform_support')).toBe(75)
      expect(getRoleRank('platform_billing')).toBe(70)
      expect(getRoleRank('tenant_owner')).toBe(60)
      expect(getRoleRank('tenant_admin')).toBe(50)
      expect(getRoleRank('security_admin')).toBe(45)
      expect(getRoleRank('developer')).toBe(40)
      expect(getRoleRank('member')).toBe(20)
      expect(getRoleRank('viewer')).toBe(5)
    })

    it('validates admin role predicates', () => {
      expect(hasAdminRole('platform_owner')).toBe(true)
      expect(hasAdminRole('tenant_owner')).toBe(true)
      expect(hasAdminRole('tenant_admin')).toBe(true)
      expect(hasAdminRole('security_admin')).toBe(true)
      expect(hasAdminRole('developer')).toBe(false)
      expect(hasAdminRole('member')).toBe(false)
      expect(hasAdminRole('viewer')).toBe(false)
    })

    it('validates platform access predicate', () => {
      expect(hasPlatformAccess('platform_owner')).toBe(true)
      expect(hasPlatformAccess('platform_support')).toBe(true)
      expect(hasPlatformAccess('platform_billing')).toBe(true)
      expect(hasPlatformAccess('tenant_owner')).toBe(false)
      expect(hasPlatformAccess('member')).toBe(false)
    })
  })

  describe('2. System & Platform Plane Authorization Evaluations', () => {
    it('Super Admin / Platform Owner has full access to any resource/action globally', () => {
      const subject = buildSubject({
        id: 'owner-1',
        role: PlatformRoles.PLATFORM_OWNER,
        email: 'founder@cap.saas',
      })!

      const decision1 = engine.evaluate({
        subject,
        resource: { type: 'infrastructure_config' },
        action: 'delete',
      })
      expect(decision1.effect).toBe(PolicyEffectEnum.ALLOW)

      const decision2 = engine.evaluate({
        subject,
        resource: { type: 'marketplace_extension' },
        action: 'publish',
      })
      expect(decision2.effect).toBe(PolicyEffectEnum.ALLOW)
    })

    it('Platform Support / Operations has telemetry & diagnostics access, but cannot delete tenant danger zone', () => {
      const subject = buildSubject({
        id: 'support-1',
        role: PlatformRoles.PLATFORM_SUPPORT,
        email: 'support@cap.saas',
      })!

      // Allowed to view telemetry & audit logs
      const logDecision = engine.evaluate({
        subject,
        resource: { type: 'telemetry' },
        action: 'read',
      })
      expect(logDecision.effect).toBe(PolicyEffectEnum.ALLOW)

      // Blocked from deleting tenant organizations or danger zone
      const deleteOrgDecision = engine.evaluate({
        subject,
        resource: { type: 'tenant_danger_zone' },
        action: 'delete',
      })
      expect(deleteOrgDecision.effect).toBe(PolicyEffectEnum.DENY)
    })

    it('Platform Billing Admin has access to billing, stripe, license keys, and commercial tiers', () => {
      const subject = buildSubject({
        id: 'billing-1',
        role: PlatformRoles.PLATFORM_BILLING,
        email: 'finance@cap.saas',
      })!

      const stripeDecision = engine.evaluate({
        subject,
        resource: { type: 'stripe' },
        action: 'manage',
      })
      expect(stripeDecision.effect).toBe(PolicyEffectEnum.ALLOW)

      const tiersDecision = engine.evaluate({
        subject,
        resource: { type: 'commercial_tiers' },
        action: 'update',
      })
      expect(tiersDecision.effect).toBe(PolicyEffectEnum.ALLOW)

      // Denied general danger zone
      const dangerDecision = engine.evaluate({
        subject,
        resource: { type: 'tenant_danger_zone' },
        action: 'delete',
      })
      expect(dangerDecision.effect).toBe(PolicyEffectEnum.DENY)
    })
  })

  describe('3. Tenant & Organization Plane Authorization Evaluations', () => {
    it('Tenant Owner has full control within tenant boundaries', () => {
      const subject = buildSubject({
        id: 'tenant-owner-1',
        role: TenantRoles.TENANT_OWNER,
        organizationId: 'org-acme',
      })!

      // Full access to tenant billing within sameOrg
      const billingDecision = engine.evaluate({
        subject,
        resource: { type: 'tenant_billing', attributes: { orgId: 'org-acme' } },
        action: 'update',
      })
      expect(billingDecision.effect).toBe(PolicyEffectEnum.ALLOW)

      // Denied access to another tenant's billing
      const otherOrgDecision = engine.evaluate({
        subject,
        resource: { type: 'tenant_billing', attributes: { orgId: 'org-other' } },
        action: 'update',
      })
      expect(otherOrgDecision.effect).toBe(PolicyEffectEnum.DENY)
    })

    it('Tenant Admin can manage team invites, member roles, and theme presets', () => {
      const subject = buildSubject({
        id: 'tenant-admin-1',
        role: TenantRoles.TENANT_ADMIN,
        organizationId: 'org-acme',
      })!

      const inviteDecision = engine.evaluate({
        subject,
        resource: { type: 'invitation', attributes: { orgId: 'org-acme' } },
        action: 'create',
      })
      expect(inviteDecision.effect).toBe(PolicyEffectEnum.ALLOW)

      const themeDecision = engine.evaluate({
        subject,
        resource: { type: 'theme_preset', attributes: { orgId: 'org-acme' } },
        action: 'update',
      })
      expect(themeDecision.effect).toBe(PolicyEffectEnum.ALLOW)
    })

    it('Security & Compliance Admin can manage SSO, SCIM, Visual ABAC Canvas, and Passkey policies', () => {
      const subject = buildSubject({
        id: 'sec-admin-1',
        role: TenantRoles.SECURITY_ADMIN,
        organizationId: 'org-acme',
      })!

      const ssoDecision = engine.evaluate({
        subject,
        resource: { type: 'sso_config', attributes: { orgId: 'org-acme' } },
        action: 'configure_sso',
      })
      expect(ssoDecision.effect).toBe(PolicyEffectEnum.ALLOW)

      const abacDecision = engine.evaluate({
        subject,
        resource: { type: 'visual_policy_canvas', attributes: { orgId: 'org-acme' } },
        action: 'write',
      })
      expect(abacDecision.effect).toBe(PolicyEffectEnum.ALLOW)
    })

    it('Developer / Integrator can manage API keys, webhooks, and OIDC sandbox', () => {
      const subject = buildSubject({
        id: 'dev-1',
        role: TenantRoles.DEVELOPER,
        organizationId: 'org-acme',
      })!

      const apiKeyDecision = engine.evaluate({
        subject,
        resource: { type: 'api_key', attributes: { orgId: 'org-acme' } },
        action: 'manage_api_keys',
      })
      expect(apiKeyDecision.effect).toBe(PolicyEffectEnum.ALLOW)

      const sandboxDecision = engine.evaluate({
        subject,
        resource: { type: 'oidc_sandbox', attributes: { orgId: 'org-acme' } },
        action: 'execute',
      })
      expect(sandboxDecision.effect).toBe(PolicyEffectEnum.ALLOW)
    })

    it('Standard Member has standard CRUD but cannot configure SSO or API keys', () => {
      const subject = buildSubject({
        id: 'member-1',
        role: TenantRoles.MEMBER,
        organizationId: 'org-acme',
      })!

      const docDecision = engine.evaluate({
        subject,
        resource: { type: 'document', attributes: { orgId: 'org-acme' } },
        action: 'create',
      })
      expect(docDecision.effect).toBe(PolicyEffectEnum.ALLOW)

      const ssoDecision = engine.evaluate({
        subject,
        resource: { type: 'sso_config', attributes: { orgId: 'org-acme' } },
        action: 'write',
      })
      expect(ssoDecision.effect).toBe(PolicyEffectEnum.DENY)
    })

    it('Viewer has strictly read-only access across tenant resources', () => {
      const subject = buildSubject({
        id: 'viewer-1',
        role: TenantRoles.VIEWER,
        organizationId: 'org-acme',
      })!

      const readDecision = engine.evaluate({
        subject,
        resource: { type: 'project', attributes: { orgId: 'org-acme' } },
        action: 'read',
      })
      expect(readDecision.effect).toBe(PolicyEffectEnum.ALLOW)

      const writeDecision = engine.evaluate({
        subject,
        resource: { type: 'project', attributes: { orgId: 'org-acme' } },
        action: 'update',
      })
      expect(writeDecision.effect).toBe(PolicyEffectEnum.DENY)
    })
  })

  describe('4. Platform Support Impersonation Context and Multi-Tenant Memberships', () => {
    it('dynamically switches subject role based on active tenant membership', () => {
      const multiTenantUser = {
        id: 'user-multi-1',
        email: 'consultant@agency.com',
        role: TenantRoles.MEMBER,
        activeTenantId: 'org-beta',
        memberships: [
          { orgId: 'org-alpha', role: TenantRoles.VIEWER },
          { orgId: 'org-beta', role: TenantRoles.TENANT_ADMIN },
        ],
      }

      const subject = buildSubject(multiTenantUser)!
      expect(subject.roles).toContain(TenantRoles.TENANT_ADMIN)
      expect(subject.attributes.orgId).toBe('org-beta')

      // Can manage theme in org-beta where user is Tenant Admin
      const decision = engine.evaluate({
        subject,
        resource: { type: 'theme_preset', attributes: { orgId: 'org-beta' } },
        action: 'update',
      })
      expect(decision.effect).toBe(PolicyEffectEnum.ALLOW)
    })

    it('activates support impersonation and enforces read-only / safety guards', () => {
      const supportUser = {
        id: 'agent-007',
        role: PlatformRoles.PLATFORM_SUPPORT,
        email: 'ops@cap.saas',
        activeTenantId: 'org-customer-123',
        impersonationSession: {
          sessionId: 'imp-sess-999',
          actorUserId: 'agent-007',
          targetOrgId: 'org-customer-123',
          startedAt: Date.now(),
          expiresAt: Date.now() + 30 * 60 * 1000, // 30 mins
          reason: 'Investigating SAML assertion error #4092',
          readOnly: true,
        },
      }

      const subject = buildSubject(supportUser)!
      expect(subject.attributes.isImpersonating).toBe(true)
      expect(subject.attributes.impersonationSessionId).toBe('imp-sess-999')
      expect(subject.attributes.orgId).toBe('org-customer-123')

      // Blocked from deleting tenant organization during impersonation
      const deleteDecision = engine.evaluate({
        subject,
        resource: { type: 'organization_deletion', attributes: { orgId: 'org-customer-123' } },
        action: 'delete',
      })
      expect(deleteDecision.effect).toBe(PolicyEffectEnum.DENY)
    })

    it('ignores expired impersonation sessions automatically', () => {
      const supportUser = {
        id: 'agent-007',
        role: PlatformRoles.PLATFORM_SUPPORT,
        email: 'ops@cap.saas',
        impersonationSession: {
          sessionId: 'imp-sess-expired',
          actorUserId: 'agent-007',
          targetOrgId: 'org-customer-123',
          startedAt: Date.now() - 60000,
          expiresAt: Date.now() - 1000, // Expired
          reason: 'Old session',
        },
      }

      const subject = buildSubject(supportUser)!
      expect(subject.attributes.isImpersonating).toBe(false)
      expect(subject.impersonationSession).toBeNull()
    })
  })
})
