import type { AtomicPermission, CustomRoleDefinition } from './permissions'

export type PlatformRole =
  | 'platform_owner'
  | 'super_admin'
  | 'platform_support'
  | 'platform_billing'
  | 'super_admin_employee'

export type TenantRole =
  | 'tenant_owner'
  | 'tenant_admin'
  | 'security_admin'
  | 'developer'
  | 'member'
  | 'viewer'
  | 'participant'
  | 'judge'
  | 'moderator'
  | 'provider_employee'
  | 'provider_admin'

export type UserRole =
  | 'user'
  | 'admin'
  | 'super_admin'
  | PlatformRole
  | TenantRole

export type ApplicationRole =
  | 'participant'
  | 'judge'
  | 'provider_employee'
  | 'provider_admin'
  | 'super_admin_employee'
  | 'moderator'
  | 'security_admin'
  | 'developer'
  | 'platform_support'
  | 'platform_billing'
  | 'tenant_owner'
  | 'tenant_admin'
  | 'member'
  | 'viewer'

export type AnyRole = UserRole | ApplicationRole
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'
export type RolePlane = 'platform' | 'tenant'

export interface RoleDefinition {
  slug: string
  name: string
  plane: RolePlane
  rank: number
  description: string
  defaultPermissions: (AtomicPermission | string)[]
}

export interface TenantMembership {
  orgId: string | number
  orgName?: string
  orgSlug?: string
  role: TenantRole | Roles | string
  permissions?: string[]
  /** Tenant-defined custom role that composes one or more PermissionSets into atomic atoms. */
  customRole?: CustomRoleDefinition
  isOwner?: boolean
  status?: 'active' | 'suspended' | 'pending'
  joinedAt?: string
}

export interface ImpersonationSession {
  sessionId: string
  actorUserId: string | number
  actorEmail?: string
  actorRole: PlatformRole | string
  targetOrgId: string | number
  targetOrgName?: string
  targetUserId?: string | number
  startedAt: number
  expiresAt: number
  reason: string
  readOnly?: boolean
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  actorId: string | number
  actorRole: string
  plane: RolePlane
  action: string
  targetType: string
  targetId?: string | number
  orgId?: string | number
  impersonationSessionId?: string
  details?: Record<string, unknown>
  ip?: string
  userAgent?: string
}

export interface UserSessionDto {
  id: string
  userId: string
  device: string
  browser: string
  ip: string
  location: string
  lastActive: string
  current?: boolean
}

export interface UserDto {
  // Core Identity
  id: string | number
  email: string
  
  // Name fields
  name?: string
  fullName?: string
  firstName?: string
  lastName?: string
  
  // Auth & Security
  role?: AnyRole
  roles?: string[]
  status?: UserStatus
  permissions: string[]
  emailVerified?: boolean
  mfaEnabled?: boolean
  /** @deprecated Use lastLoginAt */
  lastLogin?: string
  lastLoginAt?: string | null
  lastActivity?: string
  sessions?: UserSessionDto[]
  roleObject?: IRole
  
  // Multi-Tenant & Planes
  plane?: RolePlane
  organizationId?: string | number | null
  orgId?: string | number | null
  activeTenantId?: string | number | null
  memberships?: TenantMembership[]
  impersonationSession?: ImpersonationSession | null
  tier?: string
  
  // Contact & Profile
  phone?: string | null
  /** @deprecated Use avatarUrl */
  avatar?: string
  avatarUrl?: string
  gender?: string | null
  /** @deprecated Use gender */
  sexe?: string
  
  // Auth Tokens
  token?: string
  refreshToken?: string
  rememberMe?: boolean
  
  // Timestamps
  createdAt?: string
  updatedAt?: string
  
  // Metadata
  metadata?: {
    preferences?: Record<string, unknown>
    settings?: Record<string, unknown>
    [key: string]: unknown
  }
  
  // Legacy fields
  roleId?: number
  roleName?: string
  
  // Admin-specific fields
  orgName?: string
  isActive?: boolean
  /** @deprecated Use isActive */
  isActif?: boolean
  apiAccessEnabled?: boolean
  maintenanceModeBypass?: boolean
}

export interface LoginResponseDto {
  user?: UserDto
  accessToken?: string
  refreshToken?: string
  expires_in?: number
  mfaRequired?: boolean
  mfaTicket?: string
  challenge?: unknown
}

export interface RefreshResponseDto {
  access_token: string
  expires_in: number
  token_type: string
}

export interface TokenInternalData {
  accessToken: string
  expiresAt: number
}

export interface IPermission {
  id: number
  name: string
  slug?: string | null
  description?: string
  category?: string
  createdAt?: string
  updatedAt?: string
}

export interface IRole {
  id: number
  slug?: string | null
  organizationId?: number | null
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
  permissions?: Array<IPermission>
  permissionNames?: string[]
  usersCount?: number
  permissionsCount?: number
}

export interface IAuth extends UserDto {
  user: UserDto | null
  tokens: {
    accessToken: string
    refreshToken: string
  } | null
  rememberMe?: boolean
  isAdmin?: boolean
}

export interface ILogin {
  email: string
  password: string
  rememberMe?: boolean
}

export interface ISignup {
  firstName: string
  lastName: string
  sexe?: string
  phone?: string | null
  email: string
  role: AnyRole | number
  roleName: string
  permissions?: string[]
  roleObject?: UserDto['roleObject']
}

export interface IForgetPassword {
  email: string
}

export interface IResetPassword {
  token: string
  email?: string
  password: string
  confirmPassword: string
}

export interface IUserResponseForgetPassword {
  message: string
  success: boolean
}

export interface IUserResponseEmailResetPassword {
  message: string
  success: boolean
  token?: string
  isSignatureValid?: boolean
}

export interface IProfileSettingsResponse {
  message: string
  success: boolean
  user?: UserDto
  sessions?: Array<UserSessionDto>
}

// -------------------------------------------------------------
// Role Definitions and Enums across System and Tenant Planes
// -------------------------------------------------------------

export const PlatformRoles = {
  PLATFORM_OWNER: 'platform_owner',
  SUPER_ADMIN: 'super_admin',
  PLATFORM_SUPPORT: 'platform_support',
  PLATFORM_BILLING: 'platform_billing',
  SUPER_ADMIN_EMPLOYEE: 'super_admin_employee',
} as const

export const TenantRoles = {
  TENANT_OWNER: 'tenant_owner',
  TENANT_ADMIN: 'tenant_admin',
  SECURITY_ADMIN: 'security_admin',
  DEVELOPER: 'developer',
  MEMBER: 'member',
  VIEWER: 'viewer',
  USER: 'user',
  ADMIN: 'admin',
  PARTICIPANT: 'participant',
  JUDGE: 'judge',
  MODERATOR: 'moderator',
  PROVIDER_EMPLOYEE: 'provider_employee',
  PROVIDER_ADMIN: 'provider_admin',
} as const

export const Roles = {
  ...TenantRoles,
  ...PlatformRoles,
  // Normalized legacy camelCase keys
  USER: 'user',
  PARTICIPANT: 'participant',
  JUDGE: 'judge',
  PROVIDEREMPLOYEE: 'provider_employee',
  PROVIDERADMIN: 'provider_admin',
  ADMIN: 'admin',
  SUPERADMINEMPLOYEE: 'super_admin_employee',
  SUPERADMIN: 'super_admin',
  MODERATOR: 'moderator',
} as const

export type Roles = UserRole | ApplicationRole

export const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  // System & Platform Plane
  platform_owner: {
    slug: 'platform_owner',
    name: 'Super Admin / Platform Owner',
    plane: 'platform',
    rank: 100,
    description: 'Full global access to platform infrastructure, all tenants, billing models, and marketplace extensions',
    defaultPermissions: ['*'], // expanded at runtime to every atom
  },
  super_admin: {
    slug: 'super_admin',
    name: 'Super Admin',
    plane: 'platform',
    rank: 100,
    description: 'Full global platform control across organizations',
    defaultPermissions: ['*'],
  },
  platform_support: {
    slug: 'platform_support',
    name: 'Platform Support / Operations',
    plane: 'platform',
    rank: 75,
    description: 'Cross-tenant diagnostics, telemetry, error streams, and secure time-bound impersonation with mandatory audit logs',
    defaultPermissions: [
      'platform:telemetry:read',
      'platform:logs:read',
      'platform:metrics:read',
      'platform:impersonate:execute',
      'platform:tenants:read',
      'security:audit_logs:read',
      'security:anomaly:read',
      'security:threats:read',
    ],
  },
  platform_billing: {
    slug: 'platform_billing',
    name: 'Platform Billing / Commercial Admin',
    plane: 'platform',
    rank: 70,
    description: 'Manage Stripe/billing gateways, commercial tiers, license keys, and financial analytics',
    defaultPermissions: [
      'platform:billing:read',
      'platform:billing:write',
      'platform:tiers:read',
      'platform:tiers:write',
      'platform:metrics:read',
      'billing:metrics:read',
      'billing:subscription:read',
      'billing:license:read',
      'billing:license:assign',
    ],
  },
  super_admin_employee: {
    slug: 'super_admin_employee',
    name: 'Platform Staff Employee',
    plane: 'platform',
    rank: 65,
    description: 'Internal platform operations and support',
    defaultPermissions: [
      'platform:tenants:read',
      'platform:metrics:read',
      'security:audit_logs:read',
    ],
  },

  // Tenant & Organization Plane
  tenant_owner: {
    slug: 'tenant_owner',
    name: 'Tenant Owner',
    plane: 'tenant',
    rank: 60,
    description: 'Primary contact with complete ownership of tenant workspace, billing, white-label domains, and danger zone actions',
    defaultPermissions: [
      // Org management — full
      'org:members:invite', 'org:members:read', 'org:members:update', 'org:members:remove',
      'org:roles:create', 'org:roles:read', 'org:roles:assign', 'org:roles:delete',
      'org:domain:verify', 'org:domain:read', 'org:domain:delete',
      'org:settings:read', 'org:settings:write',
      'org:branding:read', 'org:branding:write',
      // Danger zone
      'org:transfer:execute',
      'org:delete:execute',
      // Billing
      'billing:subscription:read', 'billing:subscription:update',
      'billing:invoice:read', 'billing:invoice:export',
      'billing:license:read', 'billing:license:assign',
      'billing:metrics:read',
      // Theme
      'theme:tokens:read', 'theme:tokens:write',
      'theme:branding:read', 'theme:branding:write',
      'theme:preset:read', 'theme:preset:write', 'theme:preset:delete',
      // Content
      'content:resource:create', 'content:resource:read', 'content:resource:update', 'content:resource:delete',
      'content:submission:read',
    ],
  },
  tenant_admin: {
    slug: 'tenant_admin',
    name: 'Tenant Admin',
    plane: 'tenant',
    rank: 50,
    description: 'Team invites, member lifecycle, role assignment, auto-join rules, and theme presets',
    defaultPermissions: [
      'org:members:invite', 'org:members:read', 'org:members:update', 'org:members:remove',
      'org:roles:read', 'org:roles:assign',
      'org:domain:verify', 'org:domain:read',
      'org:settings:read', 'org:settings:write',
      'theme:preset:read', 'theme:preset:write',
      'theme:tokens:read',
      'content:resource:create', 'content:resource:read', 'content:resource:update', 'content:resource:delete',
      'content:submission:read',
    ],
  },
  admin: {
    slug: 'admin',
    name: 'Administrator',
    plane: 'tenant',
    rank: 50,
    description: 'Organization administration and resource management',
    defaultPermissions: [
      'org:members:invite', 'org:members:read', 'org:members:update', 'org:members:remove',
      'org:roles:read', 'org:roles:assign',
      'org:settings:read', 'org:settings:write',
      'content:resource:create', 'content:resource:read', 'content:resource:update', 'content:resource:delete',
      'content:submission:read',
    ],
  },
  provider_admin: {
    slug: 'provider_admin',
    name: 'Provider Admin',
    plane: 'tenant',
    rank: 50,
    description: 'Provider organization administrative control',
    defaultPermissions: [
      'org:members:invite', 'org:members:read', 'org:members:update', 'org:members:remove',
      'org:settings:read', 'org:settings:write',
      'content:resource:create', 'content:resource:read', 'content:resource:update',
    ],
  },
  security_admin: {
    slug: 'security_admin',
    name: 'Security & Compliance Admin',
    plane: 'tenant',
    rank: 45,
    description: 'Configures SSO/SAML/OIDC, SCIM 2.0, Visual ABAC policy canvas, passkeys, adaptive MFA, and audit anomaly streams',
    defaultPermissions: [
      // SSO & Auth
      'auth:sso:configure', 'auth:sso:read', 'auth:sso:delete',
      'auth:scim:provision', 'auth:scim:read', 'auth:scim:delete',
      'auth:mfa:enforce', 'auth:mfa:configure', 'auth:mfa:read',
      'auth:passkey:enforce', 'auth:passkey:configure', 'auth:passkey:read',
      'auth:idp:create', 'auth:idp:read', 'auth:idp:update', 'auth:idp:delete',
      'auth:session:read', 'auth:session:revoke',
      // Security & ABAC
      'security:audit_logs:read', 'security:audit_logs:export',
      'security:anomaly:read', 'security:anomaly:configure',
      'security:abac:read', 'security:abac:write', 'security:abac:delete', 'security:abac:execute',
      'security:threats:read', 'security:threats:configure',
    ],
  },
  developer: {
    slug: 'developer',
    name: 'Developer / Integrator',
    plane: 'tenant',
    rank: 40,
    description: 'Manages tenant API keys, Webhooks, OIDC/SCIM sandbox testing, and Auth Plugin Marketplace integrations',
    defaultPermissions: [
      'dev:api_keys:create', 'dev:api_keys:read', 'dev:api_keys:revoke',
      'dev:webhooks:create', 'dev:webhooks:read', 'dev:webhooks:update', 'dev:webhooks:delete',
      'dev:sandbox:execute', 'dev:sandbox:read',
      'dev:plugins:install', 'dev:plugins:read', 'dev:plugins:uninstall',
    ],
  },
  provider_employee: {
    slug: 'provider_employee',
    name: 'Provider Employee',
    plane: 'tenant',
    rank: 35,
    description: 'Provider staff resource management',
    defaultPermissions: [
      'content:resource:read', 'content:resource:update',
      'content:submission:read',
    ],
  },
  moderator: {
    slug: 'moderator',
    name: 'Moderator',
    plane: 'tenant',
    rank: 30,
    description: 'Content moderation and review',
    defaultPermissions: [
      'content:moderation:read', 'content:moderation:execute',
      'content:resource:read',
    ],
  },
  judge: {
    slug: 'judge',
    name: 'Judge / Evaluator',
    plane: 'tenant',
    rank: 25,
    description: 'Evaluation and scoring',
    defaultPermissions: [
      'content:submission:grade', 'content:submission:read',
      'content:resource:read',
    ],
  },
  member: {
    slug: 'member',
    name: 'Standard Member',
    plane: 'tenant',
    rank: 20,
    description: 'Standard day-to-day access to create, edit, and collaborate on tenant resources',
    defaultPermissions: [
      'content:resource:create', 'content:resource:read', 'content:resource:update',
      'content:submission:create',
    ],
  },
  participant: {
    slug: 'participant',
    name: 'Participant',
    plane: 'tenant',
    rank: 15,
    description: 'Standard participant access',
    defaultPermissions: [
      'content:resource:read',
      'content:submission:create',
    ],
  },
  user: {
    slug: 'user',
    name: 'Standard User',
    plane: 'tenant',
    rank: 10,
    description: 'Standard authenticated user access',
    defaultPermissions: [
      'content:resource:read',
    ],
  },
  viewer: {
    slug: 'viewer',
    name: 'Viewer / Auditor',
    plane: 'tenant',
    rank: 5,
    description: 'Read-only access across tenant resources for auditors, observers, and guests',
    defaultPermissions: [
      'content:resource:read',
      'security:audit_logs:read',
    ],
  },
}

const ROLE_VALUES = new Set<string>(Object.values(Roles))

const ROLE_ALIASES: Record<string, string> = {
  // Platform Aliases
  platform_owner: PlatformRoles.PLATFORM_OWNER,
  'platform owner': PlatformRoles.PLATFORM_OWNER,
  super_admin: PlatformRoles.SUPER_ADMIN,
  superadmin: PlatformRoles.SUPER_ADMIN,
  'super admin': PlatformRoles.SUPER_ADMIN,
  platform_support: PlatformRoles.PLATFORM_SUPPORT,
  'platform support': PlatformRoles.PLATFORM_SUPPORT,
  support: PlatformRoles.PLATFORM_SUPPORT,
  operations: PlatformRoles.PLATFORM_SUPPORT,
  platform_billing: PlatformRoles.PLATFORM_BILLING,
  'platform billing': PlatformRoles.PLATFORM_BILLING,
  billing_admin: PlatformRoles.PLATFORM_BILLING,
  super_admin_employee: PlatformRoles.SUPER_ADMIN_EMPLOYEE,
  superadminemployee: PlatformRoles.SUPER_ADMIN_EMPLOYEE,
  'super admin employee': PlatformRoles.SUPER_ADMIN_EMPLOYEE,

  // Tenant Aliases
  tenant_owner: TenantRoles.TENANT_OWNER,
  'tenant owner': TenantRoles.TENANT_OWNER,
  owner: TenantRoles.TENANT_OWNER,
  tenant_admin: TenantRoles.TENANT_ADMIN,
  'tenant admin': TenantRoles.TENANT_ADMIN,
  admin: TenantRoles.ADMIN,
  administrator: TenantRoles.ADMIN,
  security_admin: TenantRoles.SECURITY_ADMIN,
  'security admin': TenantRoles.SECURITY_ADMIN,
  compliance_admin: TenantRoles.SECURITY_ADMIN,
  security: TenantRoles.SECURITY_ADMIN,
  developer: TenantRoles.DEVELOPER,
  integrator: TenantRoles.DEVELOPER,
  dev: TenantRoles.DEVELOPER,
  member: TenantRoles.MEMBER,
  contributor: TenantRoles.MEMBER,
  viewer: TenantRoles.VIEWER,
  auditor: TenantRoles.VIEWER,
  guest: TenantRoles.VIEWER,
  'read-only': TenantRoles.VIEWER,
  user: TenantRoles.USER,
  participant: TenantRoles.PARTICIPANT,
  judge: TenantRoles.JUDGE,
  moderator: TenantRoles.MODERATOR,
  provider_employee: TenantRoles.PROVIDER_EMPLOYEE,
  provideremployee: TenantRoles.PROVIDER_EMPLOYEE,
  'provider employee': TenantRoles.PROVIDER_EMPLOYEE,
  provider_admin: TenantRoles.PROVIDER_ADMIN,
  provideradmin: TenantRoles.PROVIDER_ADMIN,
  'provider admin': TenantRoles.PROVIDER_ADMIN,
}

export const normalizeRole = (role: unknown): string | undefined => {
  if (!role) return undefined

  if (typeof role === 'string') {
    const normalized = role.trim().toLowerCase().replace(/[\s-]+/g, '_')
    if (ROLE_VALUES.has(normalized)) return normalized
    return ROLE_ALIASES[role.trim().toLowerCase()] || ROLE_ALIASES[normalized]
  }

  if (typeof role === 'object') {
    const roleLike = role as Record<string, unknown>
    return (
      normalizeRole(roleLike.slug) ||
      normalizeRole(roleLike.name) ||
      normalizeRole(roleLike.role) ||
      normalizeRole(roleLike.roleName) ||
      normalizeRole(roleLike.value) ||
      normalizeRole(roleLike.code)
    )
  }

  return undefined
}

export const getRoleDefinition = (role: unknown): RoleDefinition | undefined => {
  const normalized = normalizeRole(role)
  if (!normalized) return undefined
  return ROLE_DEFINITIONS[normalized]
}

export const getRoleRank = (role: unknown): number => {
  const def = getRoleDefinition(role)
  return def?.rank ?? 0
}

export const getRolePlane = (role: unknown): RolePlane | undefined => {
  const def = getRoleDefinition(role)
  return def?.plane
}

export const isPlatformRole = (role: unknown): boolean => {
  return getRolePlane(role) === 'platform'
}

export const isTenantRole = (role: unknown): boolean => {
  return getRolePlane(role) === 'tenant'
}

export const PLATFORM_ROLES: string[] = [
  PlatformRoles.PLATFORM_OWNER,
  PlatformRoles.SUPER_ADMIN,
  PlatformRoles.PLATFORM_SUPPORT,
  PlatformRoles.PLATFORM_BILLING,
  PlatformRoles.SUPER_ADMIN_EMPLOYEE,
]

export const TENANT_ROLES: string[] = [
  TenantRoles.TENANT_OWNER,
  TenantRoles.TENANT_ADMIN,
  TenantRoles.ADMIN,
  TenantRoles.SECURITY_ADMIN,
  TenantRoles.DEVELOPER,
  TenantRoles.PROVIDER_ADMIN,
  TenantRoles.PROVIDER_EMPLOYEE,
  TenantRoles.MODERATOR,
  TenantRoles.JUDGE,
  TenantRoles.MEMBER,
  TenantRoles.PARTICIPANT,
  TenantRoles.USER,
  TenantRoles.VIEWER,
]

export const ADMIN_ROLES: string[] = [
  PlatformRoles.PLATFORM_OWNER,
  PlatformRoles.SUPER_ADMIN,
  PlatformRoles.SUPER_ADMIN_EMPLOYEE,
  TenantRoles.TENANT_OWNER,
  TenantRoles.TENANT_ADMIN,
  TenantRoles.ADMIN,
  TenantRoles.PROVIDER_ADMIN,
  TenantRoles.SECURITY_ADMIN,
]

export const hasAdminRole = (role: unknown): boolean => {
  const normalized = normalizeRole(role)
  return normalized ? ADMIN_ROLES.includes(normalized) : false
}

export const hasPlatformAccess = (role: unknown): boolean => {
  const normalized = normalizeRole(role)
  return normalized ? PLATFORM_ROLES.includes(normalized) : false
}
