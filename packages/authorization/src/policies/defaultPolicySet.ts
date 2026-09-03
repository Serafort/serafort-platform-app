import { Roles, PlatformRoles, TenantRoles } from '@cap/shared-types'
import { PolicySet, PolicyEffectEnum } from '../types/policy.types'

/**
 * Baseline policy set installed at the composition root via `installAuthorization`.
 * Employs a secure default-deny posture combined with a comprehensive two-plane
 * authorization matrix across the System/Platform Plane and Tenant/Organization Plane.
 */
export const DEFAULT_POLICY_SET: PolicySet = {
  version: '2.0.0',
  defaultEffect: PolicyEffectEnum.DENY,
  policies: [
    // -----------------------------------------------------------------
    // 1. Route & Navigation Guards
    // -----------------------------------------------------------------
    {
      id: 'platform-route-isolation-policy',
      description: 'Isolate Platform routes from non-platform tenant users',
      rules: [
        {
          effect: PolicyEffectEnum.DENY,
          resources: ['platform_route', 'platform_console'],
          actions: ['access'],
          condition: { id: 'lacksMinimumRole' },
          priority: 130,
        },
      ],
    },
    {
      id: 'admin-route-guard-policy',
      description: 'Enforce minimum role ranks and allowed roles on administrative routes',
      rules: [
        {
          effect: PolicyEffectEnum.DENY,
          resources: ['admin_route', 'security_route'],
          actions: ['access'],
          condition: { id: 'lacksMinimumRole' },
          priority: 120,
        },
        {
          effect: PolicyEffectEnum.DENY,
          resources: ['route', 'auth_route', 'tenant_route'],
          actions: ['access'],
          condition: { id: 'lacksAllowedRoles' },
          priority: 115,
        },
      ],
    },

    // -----------------------------------------------------------------
    // 2. System & Platform Plane (The Creator / SaaS Owner)
    // -----------------------------------------------------------------
    {
      id: 'platform-owner-bypass',
      description: 'Platform Owners and Super Admins have full access across infrastructure and all tenants',
      rules: [
        {
          effect: PolicyEffectEnum.ALLOW,
          roles: [
            PlatformRoles.PLATFORM_OWNER,
            PlatformRoles.SUPER_ADMIN,
            Roles.SUPERADMIN,
          ],
          actions: ['*'],
          resources: ['*'],
          priority: 100,
        },
      ],
    },
    {
      id: 'platform-support-policy',
      description: 'Platform Support has cross-tenant diagnostics, telemetry, logs, and audit-governed impersonation',
      rules: [
        // Protect destructive tenant operations during support sessions
        {
          effect: PolicyEffectEnum.DENY,
          roles: [PlatformRoles.PLATFORM_SUPPORT],
          resources: ['tenant_danger_zone', 'organization_deletion', 'ownership_transfer'],
          actions: ['delete', 'transfer', 'purge'],
          priority: 95,
        },
        {
          effect: PolicyEffectEnum.ALLOW,
          roles: [PlatformRoles.PLATFORM_SUPPORT, PlatformRoles.SUPER_ADMIN_EMPLOYEE],
          resources: [
            'telemetry',
            'logs',
            'error_stream',
            'security_anomaly',
            'tenant_diagnostics',
            'impersonation',
            'tenant',
            'organization',
            'user',
          ],
          actions: ['read', 'access', 'audit', 'impersonate', 'inspect'],
          priority: 90,
        },
      ],
    },
    {
      id: 'platform-billing-policy',
      description: 'Platform Billing Admins manage gateways, license keys, subscriptions, and MRR metrics',
      rules: [
        {
          effect: PolicyEffectEnum.ALLOW,
          roles: [PlatformRoles.PLATFORM_BILLING],
          resources: [
            'platform_billing',
            'stripe',
            'license_keys',
            'commercial_tiers',
            'mrr_metrics',
            'subscription',
            'contracts',
          ],
          actions: ['read', 'write', 'create', 'update', 'manage'],
          priority: 90,
        },
      ],
    },

    // -----------------------------------------------------------------
    // 3. Tenant & Organization Plane (The Customer & Their Team)
    // -----------------------------------------------------------------
    {
      id: 'tenant-owner-policy',
      description: 'Tenant Owners hold full ownership of their tenant workspace, white-labeling, and billing',
      rules: [
        // Prevent deleting organization if action is attempted during a read-only impersonation session
        {
          effect: PolicyEffectEnum.DENY,
          resources: ['tenant_danger_zone', 'organization_deletion'],
          actions: ['delete'],
          condition: { id: 'isImpersonating' },
          priority: 85,
        },
        {
          effect: PolicyEffectEnum.ALLOW,
          roles: [TenantRoles.TENANT_OWNER],
          resources: [
            'tenant',
            'organization',
            'tenant_billing',
            'ownership_transfer',
            'white_label_domain',
            'custom_branding',
            'member',
            'theme',
            'resource',
            'document',
            'project',
          ],
          actions: ['*'],
          condition: { id: 'sameOrg' },
          priority: 80,
        },
      ],
    },
    {
      id: 'tenant-admin-policy',
      description: 'Tenant Admins manage team members, invites, auto-join rules, and theme presets',
      rules: [
        {
          effect: PolicyEffectEnum.ALLOW,
          roles: [
            TenantRoles.TENANT_ADMIN,
            TenantRoles.ADMIN,
            Roles.ADMIN,
            TenantRoles.PROVIDER_ADMIN,
            Roles.PROVIDERADMIN,
            PlatformRoles.SUPER_ADMIN_EMPLOYEE,
            Roles.SUPERADMINEMPLOYEE,
          ],
          resources: [
            'member',
            'invitation',
            'domain_auto_join',
            'theme_preset',
            'organization_settings',
            'resource',
            'document',
            'project',
            'role',
            'user',
          ],
          actions: ['*'],
          condition: { id: 'sameOrg' },
          priority: 70,
        },
      ],
    },
    {
      id: 'security-compliance-admin-policy',
      description: 'Security Admins manage SSO/SCIM, Visual ABAC policy canvas, passkeys, and MFA enforcement',
      rules: [
        {
          effect: PolicyEffectEnum.ALLOW,
          roles: [TenantRoles.SECURITY_ADMIN],
          resources: [
            'sso_config',
            'saml_config',
            'oidc_config',
            'scim_sync',
            'abac_policy',
            'visual_policy_canvas',
            'passkey_policy',
            'adaptive_mfa',
            'security_audit_stream',
            'security_events',
          ],
          actions: ['read', 'write', 'create', 'update', 'delete', 'configure_sso', 'manage', 'audit'],
          condition: { id: 'sameOrg' },
          priority: 70,
        },
      ],
    },
    {
      id: 'developer-integrator-policy',
      description: 'Developers generate API keys, webhooks, inspect OIDC/SCIM sandbox tokens, and manage plugins',
      rules: [
        {
          effect: PolicyEffectEnum.ALLOW,
          roles: [TenantRoles.DEVELOPER],
          resources: [
            'api_key',
            'webhook',
            'oidc_sandbox',
            'scim_sandbox',
            'plugin_marketplace',
            'custom_auth_plugin',
            'token_inspector',
          ],
          actions: ['read', 'write', 'create', 'update', 'delete', 'manage_api_keys', 'execute', 'access'],
          condition: { id: 'sameOrg' },
          priority: 65,
        },
      ],
    },
    {
      id: 'standard-member-policy',
      description: 'Standard Members collaborate and manage resources inside their tenant boundary',
      rules: [
        {
          effect: PolicyEffectEnum.ALLOW,
          roles: [
            TenantRoles.MEMBER,
            TenantRoles.USER,
            TenantRoles.PARTICIPANT,
            TenantRoles.JUDGE,
            TenantRoles.MODERATOR,
            TenantRoles.PROVIDER_EMPLOYEE,
          ],
          resources: ['resource', 'document', 'project', 'submission', 'comment', 'report'],
          actions: ['read', 'create', 'update', 'access'],
          condition: { id: 'sameOrg' },
          priority: 50,
        },
        {
          effect: PolicyEffectEnum.ALLOW,
          resources: ['user_profile', 'personal_settings', 'session'],
          actions: ['read', 'update'],
          condition: { id: 'owns' },
          priority: 55,
        },
      ],
    },
    {
      id: 'viewer-auditor-policy',
      description: 'Viewers and Auditors have strictly read-only access across tenant resources',
      rules: [
        {
          effect: PolicyEffectEnum.ALLOW,
          roles: [TenantRoles.VIEWER],
          resources: [
            'resource',
            'document',
            'project',
            'audit_log',
            'report',
            'overview',
            'member_list',
          ],
          actions: ['read', 'access'],
          condition: { id: 'sameOrg' },
          priority: 40,
        },
      ],
    },
  ],
}
