export interface OIDCClient {
  id: string | number;
  name: string;
  client_name?: string;
  type?: string;
  description?: string;
  client_id: string;
  client_secret?: string;
  redirect_uris: string[];
  post_logout_redirect_uris?: string[];
  grant_types: string[];
  response_types: string[];
  scope: string;
  status?: string;
  is_fapi_compliant?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SAMLConfig {
  enabled: boolean;
  entityId: string;
  acsUrl: string;
  sloUrl: string;
  ssoUrl: string;
  nameIdFormat: string;
  wantAssertionsSigned: boolean;
  wantResponseSigned: boolean;
  certificate: string;
  attributeMapping: Record<string, string>;
}

export interface SAMLMetadata {
  entityId: string;
  xml: string;
  name?: string;
  isRemote?: boolean;
}

export interface JWKSKey {
  kid: string;
  kty?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  status?: "active" | "standby" | "revoked";
  created?: string;
  expires?: string;
  health?: number;
}

export interface JWKSKeyDetail extends JWKSKey {
  updated: string;
  publicJwk?: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
}

export interface CreateJWKSKeyRequest {
  kid: string;
  privateKey?: string;
  publicKey?: string;
  algorithm?: string;
  use?: string;
  status?: "active" | "standby" | "revoked";
  expiresAt?: string;
}

export interface CreateOIDCClientRequest {
  name: string;
  redirectUris: string[];
  grantTypes?: string[];
  responseTypes?: string[];
  branding?: unknown;
}

export interface UpdateOIDCClientRequest {
  name?: string;
  description?: string;
  redirectUris?: string[];
  grantTypes?: string[];
  responseTypes?: string[];
  is_active?: boolean;
  is_fapi_compliant?: boolean;
  branding?: unknown;
}

export interface AuthScope {
  id: number;
  name: string;
  description?: string;
  isDefault?: boolean;
}

export interface SCIMConfig {
  id: number;
  endpoint: string;
  token: string;
  isActive: boolean;
}

export interface ProvisioningConnector {
  id: number;
  name: string;
  type: string;
  status: string;
  lastSync?: string;
}

export interface ProvisioningConnectorLog {
  id: number;
  connectorId: number;
  status: string;
  message: string;
  timestamp: string;
}

export interface OrganizationInvitation {
  id: number;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired" | "revoked" | string;
  expiresAt: string;
}

export interface ProvisioningConnectorConfig {
  baseUrl?: string;
  token?: string;
  syncInterval?: number;
  attributeMapping?: Record<string, string>;
}

export interface CreateProvisioningConnectorRequest {
  name: string;
  type: string;
  config?: ProvisioningConnectorConfig;
}

export interface UpdateProvisioningConnectorRequest {
  name?: string;
  status?: string;
  config?: Partial<ProvisioningConnectorConfig>;
}

export interface SSFConfig {
  id?: number;
  iss?: string;
  aud?: string;
  deliveryMethods?: string[];
  streamStatus?: "active" | "inactive" | "error";
  lastEventAt?: string;
  enabled?: boolean;
  issuer?: string;
  audience?: string;
  delivery_method?: string;
  events_supported?: string[];
  events_delivered?: string[];
  events_meta?: Array<{ id: string; name: string; desc: string }>;
}

export interface BroadcastSSFEventRequest {
  eventType: string;
  subject: string;
  reason?: string;
  payload?: Record<string, unknown>;
}

export interface BroadcastSSFEventResponse {
  message: string;
  event: unknown;
  recipients: unknown[];
  deliveredAt?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name?: string;
  description?: string;
  isSystem?: boolean;
  userCount?: number;
  users_count?: number;
  permissions?: Permission[];
  parents?: Role[];
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  guard_name?: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name?: string;
  resource?: string;
  action?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePermissionRequest {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

// ============================================================================
// Governance & Conditional Access Types
// ============================================================================

export type PermissionAction = "read" | "write" | "delete" | "manage" | "*";

export interface GovernancePermission {
  id: string;
  resource: string; // e.g., 'user', 'org', 'role'
  action: PermissionAction;
  description?: string;
  effect: "allow" | "deny";
}

export interface GovernanceRole {
  id: string;
  name: string;
  description: string;
  permissions: GovernancePermission[];
  inheritedRoleIds?: string[];
  memberCount: number;
  scope: "system" | "organization";
  orgId?: string; // Null for system-wide roles
  createdAt: string;
  updatedAt: string;
}

export type AccessPolicyRuleType =
  | "network_cidr"
  | "mfa_required"
  | "device_compliance"
  | "geo_location"
  | string;

export interface AccessPolicy {
  id: string | number;
  name: string;
  description?: string;
  type: "conditional_access" | "login_policy";
  status: "active" | "inactive" | "disabled";
  priority: number;
  rules: AccessPolicyRule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AccessPolicyRule {
  id: string;
  type: AccessPolicyRuleType;
  config: Record<string, any>;
  effect: "allow" | "deny";
  resource?: string;
  action?: string;
  conditions?: Record<string, unknown>;
}

export interface ImpersonationRecord {
  id: string | number;
  startedAt: string;
  actorAvatar?: string;
  actorName: string;
  actorEmail: string;
  targetAvatar?: string;
  targetName: string;
  targetEmail: string;
  reason?: string;
  status: "active" | "completed" | "revoked";
}

export interface CreateAccessPolicyRequest {
  name: string;
  description?: string;
  rules: AccessPolicyRule[];
}

export interface RolePermissionsResponse {
  role: string;
  permissions: string[];
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface Webhook {
  id: number;
  url: string;
  events: string[];
  status: "active" | "disabled" | "failing";
  secret?: string;
  success_rate?: number;
  last_triggered_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
  secret?: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  status?: "active" | "disabled";
}

// ============================================================================
// Email Template Types
// ============================================================================

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

export interface EmailPreviewResponse {
  html: string;
  text: string;
}

// ============================================================================
// Domain Verification Types
// ============================================================================

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

// ============================================================================
// System Health Types
// ============================================================================

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

// ============================================================================
// Security Health Types
// ============================================================================

export interface SecurityHealthRecommendation {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
}

export interface SecurityHealthStats {
  totalUsers: number;
  mfaEnabled: number;
  inactiveUsers: number;
  oldTokens: number;
}

export interface SecurityHealthResponse {
  score: number;
  stats: SecurityHealthStats;
  recommendations: SecurityHealthRecommendation[];
}

// ============================================================================
// Statistics Types
// ============================================================================

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

// ============================================================================
// Common Types
// ============================================================================

export interface MessageResponse {
  message: string;
}

// ============================================================================
// Sandbox Types
// ============================================================================

export interface SandboxResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
}

// ============================================================================
// Developer API Key Types
// ============================================================================

export interface DeveloperApiKey {
  id: number;
  name: string;
  prefix: string;
  organization_id: number;
  user_id: number;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  key?: string;
}

export interface CreateDeveloperApiKeyRequest {
  name: string;
  expires_at?: string | null;
  organization_id?: number;
}
