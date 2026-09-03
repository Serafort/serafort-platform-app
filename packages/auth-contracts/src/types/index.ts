import type { AccessPolicy } from "@cap/shared-types";

export type { SCIMConfig } from "@cap/shared-types";

export interface DependencyStatus {
  id: string;
  name: string;
  description: string;
  status: "healthy" | "degraded" | "outage";
  responseTime: string | number;
  version: string;
}

export interface DetailedHealthReport {
  status: "healthy" | "degraded" | "unhealthy";
  healthScore: number;
  lastCheck: string;
  timestamp: string;
  environment: string;
  appVersion: string;
  uptime: string;
  server: string;
  dependencies: DependencyStatus[];
}

export interface BasicMetrics {
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  timestamp: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  description: string | null;
  permissions: Permission[];
  parents?: Role[];
  users_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  resource?: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RolePermissionSyncRequest {
  permission_ids: number[];
}

export interface MemberOverride {
  id: number;
  memberId: number;
  permissionId: number;
  grant: boolean;
  permission?: {
    id: number;
    name: string;
    resource: string;
  };
}

export interface OrganizationMembership {
  id: number;
  user_id: number;
  organization_id: number;
  role_id: number;
  organization?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  status?: string;
  domain: string | null;
  support_email?: string | null;
  logo_url: string | null;
  members_count: number;
  domainVerifications?: {
    id: number;
    domain: string;
    status: string;
    verified_at: string;
    verification_token: string;
  }[];
  created_at: string;
  updated_at: string;
  brandingConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    logo_url?: string;
    [key: string]: unknown;
  };
  securityPolicies?: {
    enforceMfa?: boolean;
    ssoOnly?: boolean;
    allowPublicSignup?: boolean;
    [key: string]: unknown;
  };
  members?: OrganizationMember[];
}

export interface OrganizationMember {
  id: number;
  user_id: number;
  organization_id: number;
  role: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    avatar_url: string | null;
  };
  joined_at: string;
}

export interface OrganizationInvitation {
  id: number;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired";
  expires_at: string;
  created_at: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  domain?: string;
}

export interface InviteToOrganizationRequest {
  email: string;
  role: string;
  message?: string;
}

export interface Connector {
  id: number;
  name: string;
  type: "scim" | "ldap" | "azure_ad" | "okta" | "google" | string;
  status: "active" | "inactive" | "error" | string;
  last_sync_at: string | null;
  sync_count: number;
  error_message: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ConnectorLog {
  id: number;
  connector_id: number;
  action: string;
  event?: string;
  status: "success" | "error" | "warning" | string;
  details: string;
  records_processed: number;
  created_at: string;
  createdAt?: string;
}

export interface SCIMToken {
  id: number;
  name: string;
  description: string | null;
  last_used_at: string | null;
  created_at: string;
  token?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preview_text: string;
  category: string;
  last_modified: string;
}

export interface EmailTestRequest {
  template_id: string;
  recipient: string;
  variables?: Record<string, string>;
}

export interface MFAStats {
  total_enabled: number;
  totp_count: number;
  passkey_count: number;
  adoption_rate: number;
  daily_challenges: Array<{ date: string; count: number }>;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  banned: number;
  new_today: number;
  new_this_week: number;
}

export type BulkActionType =
  | "activate"
  | "deactivate"
  | "delete"
  | "assign_role"
  | "ban";

export interface BulkActionRequest {
  ids: number[];
  action: BulkActionType;
  payload?: { role_id?: number; reason?: string };
}

export interface BulkActionResult {
  succeeded: number[];
  failed: Array<{ id: number; reason: string }>;
}

export interface OIDCClient {
  id: string | number;
  client_id: string;
  client_name: string;
  client_secret?: string;
  type: string;
  description: string | null;
  status: string;
  scopes: string[];
  redirect_uris: string[];
  grant_types: string[];
  response_types: string[];
  token_endpoint_auth_method: string;
  is_fapi_compliant: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOIDCClientRequest {
  name: string;
  redirectUris: string[];
  grantTypes?: string[];
  responseTypes?: string[];
  scope?: string;
  token_endpoint_auth_method?: string;
  is_fapi_compliant?: boolean;
}

export interface UpdateOIDCClientRequest {
  name?: string;
  redirectUris?: string[];
  grantTypes?: string[];
  responseTypes?: string[];
  scope?: string;
  token_endpoint_auth_method?: string;
  is_fapi_compliant?: boolean;
  description?: string;
}

export interface AuthScope {
  id: number;
  name: string;
  displayName?: string;
  description?: string;
  isSystem?: boolean;
  permissionsMapping?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScopeRequest {
  name: string;
  displayName?: string;
  description?: string;
}

export interface UpdateScopeRequest {
  name?: string;
  displayName?: string;
  description?: string;
}

export interface MessageResponse {
  message: string;
}

export interface DomainVerification {
  id: number;
  organization_id: number;
  domain: string;
  status: "pending" | "verified" | "failed";
  verification_token: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeveloperApiKey {
  id: number;
  name: string;
  prefix: string;
  organization_id: number;
  user_id: number;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
  key?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  role_id?: number;
}

export interface UpdateUserRequest {
  email?: string;
  firstname?: string;
  lastname?: string;
  role_id?: number;
  is_active?: boolean;
  apiAccessEnabled?: boolean;
  maintenanceModeBypass?: boolean;
}

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: number;
  phone: string | null;
  gender?: string | null;
  /** @deprecated Use gender */
  sexe?: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  /** @deprecated Use isActive */
  isActif?: boolean;
  emailVerified: boolean | string | null;
  emailVerifiedAt: string | null;
  isTermsSign: boolean;
  mfaEnabled: boolean;
  mfaEnrolledAt: string | null;
  status: "ACTIVE" | "INACTIVE" | "BANNED" | string;
  suspendedReason?: string | null;
  isAdmin: boolean;
  apiAccessEnabled: boolean;
  maintenanceModeBypass: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityHealthResponse {
  score: number;
  stats: {
    totalUsers: number;
    mfaEnabled: number;
    inactiveUsers: number;
    oldTokens: number;
  };
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    severity: "critical" | "warning" | "info";
  }>;
}

export interface ImpersonationSession {
  id: number;
  admin_user_id: number;
  target_user_id: number;
  token: string;
  created_at: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
}

export type { AccessPolicy, AccessPolicyRule } from "@cap/shared-types";
