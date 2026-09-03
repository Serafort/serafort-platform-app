/**
 * Typed endpoint contract registry.
 *
 * `API_CONTRACTS` is the single typed index of every platform endpoint. Each
 * entry is built with `defineEndpoint` and binds together:
 *   - a stable id (`'auth.login'`, `'admin.users.byId'`, ...),
 *   - the HTTP method,
 *   - the path, delegated to the matching `API_ENDPOINTS` entry through the
 *     `resolve` builder (URLs stay in exactly one place),
 *   - the request / response payload shapes.
 *
 * Service layers and the platform API client consume these contracts, so both
 * the URL and the payload types flow from one definition.
 */

import {
  ApiResponse,
  PaginatedResponse,
  UserDto,
  LoginResponseDto,
  RefreshResponseDto,
  OIDCClient,
  CreateOIDCClientRequest,
  UpdateOIDCClientRequest,
  SAMLConfig,
  JWKSKey,
  JWKSKeyDetail,
  CreateJWKSKeyRequest,
  AuthScope,
  SCIMConfig,
  Role,
  Permission,
  AccessPolicy,
  Webhook,
  EmailTemplate,
  SSFConfig,
  BroadcastSSFEventRequest,
  BroadcastSSFEventResponse,
  DomainVerification,
  DetailedHealthReport,
  BasicMetrics,
  SecurityHealthResponse,
  MFAStats,
  UserStats,
  MessageResponse,
  UserSessionDto,
} from "@cap/shared-types";
import { defineEndpoint, contractType } from "./types/endpoint-contract";
import { ENDPOINTS } from "./endpoints";

// ---------------------------------------------------------------------------
// Admin entity shapes (defined here so `@cap/api-contracts` stays a leaf).
// These mirror the payloads the admin endpoints return. If a shape already
// lives in `@cap/shared-types`, prefer referencing it instead of redeclaring.
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: number;
  phone: string | null;
  sexe: string | null;
  avatarUrl: string | null;
  isActif: boolean;
  emailVerified: boolean | string | null;
  isTermsSign: boolean;
  mfaEnabled: boolean;
  status: "ACTIVE" | "INACTIVE" | "BANNED" | string;
  isAdmin: boolean;
  apiAccessEnabled: boolean;
  maintenanceModeBypass: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface Organization {
  id: number;
  name: string;
  slug: string;
  status?: string;
  domain: string | null;
  support_email?: string | null;
  logo_url: string | null;
  members_count: number;
  created_at: string;
  updated_at: string;
  brandingConfig?: Record<string, unknown>;
  securityPolicies?: Record<string, unknown>;
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

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  domain?: string;
}

export interface OrganizationInvitation {
  id: number;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired";
  expires_at: string;
  created_at: string;
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
  status: "success" | "error" | "warning" | string;
  details: string;
  records_processed: number;
  created_at: string;
}

export interface SCIMToken {
  id: number;
  name: string;
  description: string | null;
  last_used_at: string | null;
  created_at: string;
  token?: string;
}

export interface MemberOverride {
  id: number;
  memberId: number;
  permissionId: number;
  grant: boolean;
}

export interface OrganizationMembership {
  id: number;
  user_id: number;
  organization_id: number;
  role_id: number;
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

export interface RolePermissionSyncRequest {
  permissionIds: number[];
}

export interface RoleStats {
  totalRoles: number;
  totalPermissions: number;
  totalMemberships: number;
}

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  failedLogins: number;
  activeSessions: number;
  mfaAdoption: string;
  totalBanned: number;
  newBans: number;
  pendingAppeals: number;
  systemHealth: string;
}

export interface DataExportRecord {
  id: number;
  type: string;
  status: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: number;
  user_id: number;
  action: string;
  resource: string;
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface ImpersonationToken {
  token: string;
  user: unknown;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const API_CONTRACTS = {
  health: {
    basic: defineEndpoint({
      id: "health.basic",
      method: "GET",
      resolve: () => ENDPOINTS.health.basic,
      response: contractType<{ status: string }>(),
    }),
    detailed: defineEndpoint({
      id: "health.detailed",
      method: "GET",
      resolve: () => ENDPOINTS.health.detailed,
      response: contractType<DetailedHealthReport>(),
    }),
  },
  metrics: {
    basic: defineEndpoint({
      id: "metrics.basic",
      method: "GET",
      resolve: () => ENDPOINTS.metrics.basic,
      response: contractType<BasicMetrics>(),
    }),
  },

  auth: {
    register: defineEndpoint({
      id: "auth.register",
      method: "POST",
      resolve: () => ENDPOINTS.auth.register,
      request: contractType<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phone?: string | null;
      }>(),
      response: contractType<ApiResponse<UserDto>>(),
    }),
    login: defineEndpoint({
      id: "auth.login",
      method: "POST",
      resolve: () => ENDPOINTS.auth.login,
      request: contractType<{
        email: string;
        password: string;
        rememberMe?: boolean;
      }>(),
      response: contractType<LoginResponseDto>(),
    }),
    logout: defineEndpoint({
      id: "auth.logout",
      method: "POST",
      resolve: () => ENDPOINTS.auth.logout,
      response: contractType<MessageResponse>(),
    }),
    refresh: defineEndpoint({
      id: "auth.refresh",
      method: "POST",
      resolve: () => ENDPOINTS.auth.refresh,
      response: contractType<RefreshResponseDto>(),
    }),
    session: defineEndpoint({
      id: "auth.session",
      method: "GET",
      resolve: () => ENDPOINTS.auth.session,
      response: contractType<ApiResponse<UserDto>>(),
    }),
    forgotPassword: defineEndpoint({
      id: "auth.forgotPassword",
      method: "POST",
      resolve: () => ENDPOINTS.auth.forgotPassword,
      request: contractType<{ email: string }>(),
      response:
        contractType<ApiResponse<{ message: string; success: boolean }>>(),
    }),
    resetPassword: defineEndpoint({
      id: "auth.resetPassword",
      method: "POST",
      resolve: () => ENDPOINTS.auth.resetPassword,
      request: contractType<{
        token: string;
        email?: string;
        password: string;
        confirmPassword: string;
      }>(),
      response:
        contractType<ApiResponse<{ message: string; success: boolean }>>(),
    }),
    verifyEmail: defineEndpoint({
      id: "auth.verifyEmail",
      method: "POST",
      resolve: (search?: string) => ENDPOINTS.auth.verifyEmail(search),
      response: contractType<
        ApiResponse<{
          message: string;
          success: boolean;
          alreadyVerified?: boolean;
        }>
      >(),
    }),
    resendVerification: defineEndpoint({
      id: "auth.resendVerification",
      method: "POST",
      resolve: () => ENDPOINTS.auth.resendVerification,
      request: contractType<{ email: string }>(),
      response:
        contractType<ApiResponse<{ message: string; success: boolean }>>(),
    }),
    validateUser: defineEndpoint({
      id: "auth.validateUser",
      method: "POST",
      resolve: () => ENDPOINTS.auth.validateUser,
      request: contractType<{ id: string | number; token: string }>(),
      response: contractType<ApiResponse<{ valid: boolean }>>(),
    }),
    sessions: defineEndpoint({
      id: "auth.sessions",
      method: "GET",
      resolve: () => ENDPOINTS.auth.sessions,
      response: contractType<ApiResponse<UserSessionDto[]>>(),
    }),
    revokeSession: defineEndpoint({
      id: "auth.revokeSession",
      method: "DELETE",
      resolve: (sessionId: string) => ENDPOINTS.auth.revokeSession(sessionId),
      response: contractType<MessageResponse>(),
    }),
    revokeAllSessions: defineEndpoint({
      id: "auth.revokeAllSessions",
      method: "POST",
      resolve: () => ENDPOINTS.auth.revokeAllSessions,
      response: contractType<MessageResponse>(),
    }),
    loginHistory: defineEndpoint({
      id: "auth.loginHistory",
      method: "GET",
      resolve: () => ENDPOINTS.auth.loginHistory,
      response: contractType<ApiResponse<unknown[]>>(),
    }),
    securityLogs: defineEndpoint({
      id: "auth.securityLogs",
      method: "GET",
      resolve: () => ENDPOINTS.auth.securityLogs,
      response: contractType<ApiResponse<unknown[]>>(),
    }),
    mfa: {
      setup: defineEndpoint({
        id: "auth.mfa.setup",
        method: "POST",
        resolve: () => ENDPOINTS.auth.mfa.setup,
        response:
          contractType<ApiResponse<{ secret: string; qrCode: string }>>(),
      }),
      verify: defineEndpoint({
        id: "auth.mfa.verify",
        method: "POST",
        resolve: () => ENDPOINTS.auth.mfa.verify,
        request: contractType<{ code: string }>(),
        response: contractType<ApiResponse<{ verified: boolean }>>(),
      }),
      disable: defineEndpoint({
        id: "auth.mfa.disable",
        method: "POST",
        resolve: () => ENDPOINTS.auth.mfa.disable,
        request: contractType<{ code: string }>(),
        response: contractType<MessageResponse>(),
      }),
      recoveryCodes: defineEndpoint({
        id: "auth.mfa.recoveryCodes",
        method: "GET",
        resolve: () => ENDPOINTS.auth.mfa.recoveryCodes,
        response: contractType<ApiResponse<{ codes: string[] }>>(),
      }),
      verifyLogin: defineEndpoint({
        id: "auth.mfa.verifyLogin",
        method: "POST",
        resolve: () => ENDPOINTS.auth.mfa.verifyLogin,
        request: contractType<{ code: string }>(),
        response: contractType<ApiResponse<{ valid: boolean }>>(),
      }),
    },
    appealBan: defineEndpoint({
      id: "auth.appealBan",
      method: "POST",
      resolve: () => ENDPOINTS.auth.appealBan,
      request: contractType<{ email: string; reason: string }>(),
      response: contractType<MessageResponse>(),
    }),
    device: defineEndpoint({
      id: "auth.device",
      method: "GET",
      resolve: () => ENDPOINTS.auth.device,
      response: contractType<unknown>(),
    }),
    verifyResetToken: defineEndpoint({
      id: "auth.verifyResetToken",
      method: "POST",
      resolve: () => ENDPOINTS.auth.verifyResetToken,
      request: contractType<{ email: string; token: string }>(),
      response:
        contractType<ApiResponse<{ valid: boolean; email: string }>>(),
    }),
    oidcInteraction: {
      get: defineEndpoint({
        id: "auth.oidcInteraction.get",
        method: "GET",
        resolve: (uid: string) => ENDPOINTS.auth.oidcInteraction.get(uid),
        response: contractType<ApiResponse<unknown>>(),
      }),
      login: defineEndpoint({
        id: "auth.oidcInteraction.login",
        method: "POST",
        resolve: (uid: string) => ENDPOINTS.auth.oidcInteraction.login(uid),
        request: contractType<{ email: string; password?: string }>(),
        response: contractType<ApiResponse<unknown>>(),
      }),
      mfa: defineEndpoint({
        id: "auth.oidcInteraction.mfa",
        method: "POST",
        resolve: (uid: string) => ENDPOINTS.auth.oidcInteraction.mfa(uid),
        request: contractType<{ code: string }>(),
        response: contractType<ApiResponse<unknown>>(),
      }),
      consent: defineEndpoint({
        id: "auth.oidcInteraction.consent",
        method: "GET",
        resolve: (uid: string) => ENDPOINTS.auth.oidcInteraction.consent(uid),
        response: contractType<ApiResponse<unknown>>(),
      }),
      confirm: defineEndpoint({
        id: "auth.oidcInteraction.confirm",
        method: "POST",
        resolve: (uid: string) => ENDPOINTS.auth.oidcInteraction.confirm(uid),
        request: contractType<unknown>(),
        response: contractType<ApiResponse<unknown>>(),
      }),
      abort: defineEndpoint({
        id: "auth.oidcInteraction.abort",
        method: "GET",
        resolve: (uid: string) => ENDPOINTS.auth.oidcInteraction.abort(uid),
        response: contractType<ApiResponse<unknown>>(),
      }),
    },
    social: {
      redirect: defineEndpoint({
        id: "auth.social.redirect",
        method: "GET",
        resolve: (provider: string) =>
          ENDPOINTS.auth.social.redirect(provider),
        response: contractType<unknown>(),
      }),
      callback: defineEndpoint({
        id: "auth.social.callback",
        method: "GET",
        resolve: (provider: string) =>
          ENDPOINTS.auth.social.callback(provider),
        response: contractType<unknown>(),
      }),
      exchange: defineEndpoint({
        id: "auth.social.exchange",
        method: "POST",
        resolve: () => ENDPOINTS.auth.social.exchange,
        request: contractType<{ code: string }>(),
        response: contractType<
          ApiResponse<{
            message: string;
            token: string;
            refresh_token: string;
            user: unknown;
          }>
        >(),
      }),
    },
    passkey: {
      registerStart: defineEndpoint({
        id: "auth.passkey.registerStart",
        method: "POST",
        resolve: () => ENDPOINTS.auth.passkey.registerStart,
        response: contractType<ApiResponse<{ options: unknown }>>(),
      }),
      registerFinish: defineEndpoint({
        id: "auth.passkey.registerFinish",
        method: "POST",
        resolve: () => ENDPOINTS.auth.passkey.registerFinish,
        request: contractType<Record<string, unknown>>(),
        response: contractType<ApiResponse<{ success: boolean }>>(),
      }),
      loginStart: defineEndpoint({
        id: "auth.passkey.loginStart",
        method: "POST",
        resolve: () => ENDPOINTS.auth.passkey.loginStart,
        response: contractType<ApiResponse<{ options: unknown }>>(),
      }),
      loginFinish: defineEndpoint({
        id: "auth.passkey.loginFinish",
        method: "POST",
        resolve: () => ENDPOINTS.auth.passkey.loginFinish,
        request: contractType<Record<string, unknown>>(),
        response: contractType<LoginResponseDto>(),
      }),
    },
  },

  user: {
    me: defineEndpoint({
      id: "user.me",
      method: "GET",
      resolve: () => ENDPOINTS.user.me,
      response: contractType<ApiResponse<UserDto>>(),
    }),
    update: defineEndpoint({
      id: "user.update",
      method: "PUT",
      resolve: () => ENDPOINTS.user.update,
      request: contractType<Partial<UserDto>>(),
      response: contractType<ApiResponse<UserDto>>(),
    }),
    changeEmail: defineEndpoint({
      id: "user.changeEmail",
      method: "POST",
      resolve: () => ENDPOINTS.user.changeEmail,
      request: contractType<{ email: string }>(),
      response:
        contractType<ApiResponse<{ message: string; success: boolean }>>(),
    }),
    changePassword: defineEndpoint({
      id: "user.changePassword",
      method: "POST",
      resolve: () => ENDPOINTS.user.changePassword,
      request: contractType<{ currentPassword: string; newPassword: string }>(),
      response: contractType<MessageResponse>(),
    }),
    destroy: defineEndpoint({
      id: "user.destroy",
      method: "DELETE",
      resolve: () => ENDPOINTS.user.destroy,
      response: contractType<MessageResponse>(),
    }),
    deactivateSelf: defineEndpoint({
      id: "user.deactivateSelf",
      method: "POST",
      resolve: () => ENDPOINTS.user.deactivateSelf,
      response: contractType<MessageResponse>(),
    }),
    deactivate: defineEndpoint({
      id: "user.deactivate",
      method: "PATCH",
      resolve: (id: string | number) => ENDPOINTS.user.deactivate(id),
      response: contractType<MessageResponse>(),
    }),
    linkedAccounts: defineEndpoint({
      id: "user.linkedAccounts",
      method: "GET",
      resolve: () => ENDPOINTS.user.linkedAccounts,
      response: contractType<ApiResponse<unknown[]>>(),
    }),
    unlinkAccount: defineEndpoint({
      id: "user.unlinkAccount",
      method: "DELETE",
      resolve: (id: string | number) => ENDPOINTS.user.unlinkAccount(id),
      response: contractType<MessageResponse>(),
    }),
    emailPreferences: defineEndpoint({
      id: "user.emailPreferences",
      method: "GET",
      resolve: () => ENDPOINTS.user.emailPreferences,
      response: contractType<ApiResponse<unknown>>(),
    }),
    tokens: {
      index: defineEndpoint({
        id: "user.tokens.index",
        method: "GET",
        resolve: () => ENDPOINTS.user.tokens.index,
        response: contractType<ApiResponse<unknown[]>>(),
      }),
      destroy: defineEndpoint({
        id: "user.tokens.destroy",
        method: "DELETE",
        resolve: (id: string | number) => ENDPOINTS.user.tokens.destroy(id),
        response: contractType<MessageResponse>(),
      }),
    },
    passkeys: {
      index: defineEndpoint({
        id: "user.passkeys.index",
        method: "GET",
        resolve: () => ENDPOINTS.user.passkeys.index,
        response: contractType<ApiResponse<unknown[]>>(),
      }),
      destroy: defineEndpoint({
        id: "user.passkeys.destroy",
        method: "DELETE",
        resolve: (id: string | number) => ENDPOINTS.user.passkeys.destroy(id),
        response: contractType<MessageResponse>(),
      }),
    },
    mfa: {
      methods: defineEndpoint({
        id: "user.mfa.methods",
        method: "GET",
        resolve: () => ENDPOINTS.user.mfa.methods,
        response: contractType<ApiResponse<unknown[]>>(),
      }),
    },
  },

  profiles: {
    list: defineEndpoint({
      id: "profiles.list",
      method: "GET",
      resolve: () => ENDPOINTS.profiles.list,
      response: contractType<ApiResponse<unknown[]>>(),
    }),
    upload: defineEndpoint({
      id: "profiles.upload",
      method: "POST",
      resolve: () => ENDPOINTS.profiles.upload,
      response: contractType<ApiResponse<{ url: string }>>(),
    }),
    byId: defineEndpoint({
      id: "profiles.byId",
      method: "GET",
      resolve: (id: number) => ENDPOINTS.profiles.byId(id),
      response: contractType<ApiResponse<unknown>>(),
    }),
    update: defineEndpoint({
      id: "profiles.update",
      method: "PUT",
      resolve: (id: number) => ENDPOINTS.profiles.update(id),
      request: contractType<Record<string, unknown>>(),
      response: contractType<ApiResponse<unknown>>(),
    }),
    delete: defineEndpoint({
      id: "profiles.delete",
      method: "DELETE",
      resolve: (id: number) => ENDPOINTS.profiles.delete(id),
      response: contractType<MessageResponse>(),
    }),
    setActive: defineEndpoint({
      id: "profiles.setActive",
      method: "POST",
      resolve: (id: number) => ENDPOINTS.profiles.setActive(id),
      response: contractType<ApiResponse<unknown>>(),
    }),
  },

  guest: {
    analyzeAnonymous: defineEndpoint({
      id: "guest.analyzeAnonymous",
      method: "POST",
      resolve: () => ENDPOINTS.guest.analyzeAnonymous,
      request: contractType<Record<string, unknown>>(),
      response: contractType<ApiResponse<unknown>>(),
    }),
    matchAnonymous: defineEndpoint({
      id: "guest.matchAnonymous",
      method: "POST",
      resolve: () => ENDPOINTS.guest.matchAnonymous,
      request: contractType<Record<string, unknown>>(),
      response: contractType<ApiResponse<unknown>>(),
    }),
    getSession: defineEndpoint({
      id: "guest.getSession",
      method: "GET",
      resolve: (sessionId: string) => ENDPOINTS.guest.getSession(sessionId),
      response: contractType<ApiResponse<unknown>>(),
    }),
    deleteSession: defineEndpoint({
      id: "guest.deleteSession",
      method: "DELETE",
      resolve: (sessionId: string) => ENDPOINTS.guest.deleteSession(sessionId),
      response: contractType<MessageResponse>(),
    }),
    tenantConfig: defineEndpoint({
      id: "guest.tenantConfig",
      method: "GET",
      resolve: () => ENDPOINTS.guest.tenantConfig,
      response: contractType<ApiResponse<unknown>>(),
    }),
  },

  admin: {
    dashboard: defineEndpoint({
      id: "admin.dashboard",
      method: "GET",
      resolve: () => ENDPOINTS.admin.dashboard,
      response: contractType<DashboardSummary>(),
    }),
    users: {
      index: defineEndpoint({
        id: "admin.users.index",
        method: "GET",
        resolve: () => ENDPOINTS.admin.users.index,
        response: contractType<PaginatedResponse<AdminUser>>(),
      }),
      store: defineEndpoint({
        id: "admin.users.store",
        method: "POST",
        resolve: () => ENDPOINTS.admin.users.store,
        request: contractType<CreateUserRequest>(),
        response: contractType<AdminUser>(),
      }),
      byId: defineEndpoint({
        id: "admin.users.byId",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.admin.users.byId(id),
        response: contractType<AdminUser>(),
      }),
      activate: defineEndpoint({
        id: "admin.users.activate",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.users.activate(id),
        response: contractType<MessageResponse>(),
      }),
      deactivate: defineEndpoint({
        id: "admin.users.deactivate",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.users.deactivate(id),
        response: contractType<MessageResponse>(),
      }),
      ban: defineEndpoint({
        id: "admin.users.ban",
        method: "PATCH",
        resolve: (id: number) => ENDPOINTS.admin.users.ban(id),
        request: contractType<{ reason?: string }>(),
        response: contractType<MessageResponse>(),
      }),
      unban: defineEndpoint({
        id: "admin.users.unban",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.users.unban(id),
        response: contractType<MessageResponse>(),
      }),
      resetPassword: defineEndpoint({
        id: "admin.users.resetPassword",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.users.resetPassword(id),
        request: contractType<{ password?: string }>(),
        response: contractType<MessageResponse>(),
      }),
      resetMfa: defineEndpoint({
        id: "admin.users.resetMfa",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.users.resetMfa(id),
        response: contractType<MessageResponse>(),
      }),
      impersonate: defineEndpoint({
        id: "admin.users.impersonate",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.users.impersonate(id),
        response: contractType<{ token: string }>(),
      }),
      unlock: defineEndpoint({
        id: "admin.users.unlock",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.users.unlock(id),
        response: contractType<MessageResponse>(),
      }),
      assignRole: defineEndpoint({
        id: "admin.users.assignRole",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.users.assignRole(id),
        request: contractType<{ role_id: number }>(),
        response: contractType<MessageResponse>(),
      }),
      bulkAction: defineEndpoint({
        id: "admin.users.bulkAction",
        method: "POST",
        resolve: () => ENDPOINTS.admin.users.bulkAction,
        request: contractType<BulkActionRequest>(),
        response: contractType<BulkActionResult>(),
      }),
      sessions: defineEndpoint({
        id: "admin.users.sessions",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.admin.users.sessions(id),
        response: contractType<unknown[]>(),
      }),
      dataExports: defineEndpoint({
        id: "admin.users.dataExports",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.admin.users.dataExports(id),
        response: contractType<DataExportRecord[]>(),
      }),
      requestDataExport: defineEndpoint({
        id: "admin.users.requestDataExport",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.users.requestDataExport(id),
        response: contractType<MessageResponse>(),
      }),
    },
    appeals: {
      index: defineEndpoint({
        id: "admin.appeals.index",
        method: "GET",
        resolve: () => ENDPOINTS.admin.appeals.index,
        response: contractType<PaginatedResponse<unknown>>(),
      }),
      resolve: defineEndpoint({
        id: "admin.appeals.resolve",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.appeals.resolve(id),
        request: contractType<{
          status: "APPROVED" | "DENIED";
          reviewNotes?: string;
        }>(),
        response: contractType<MessageResponse>(),
      }),
    },
    scim: {
      config: defineEndpoint({
        id: "admin.scim.config",
        method: "GET",
        resolve: () => ENDPOINTS.admin.scim.config,
        response: contractType<SCIMConfig>(),
      }),
      tokens: {
        index: defineEndpoint({
          id: "admin.scim.tokens.index",
          method: "GET",
          resolve: () => ENDPOINTS.admin.scim.tokens.index,
          response: contractType<SCIMToken[]>(),
        }),
        store: defineEndpoint({
          id: "admin.scim.tokens.store",
          method: "POST",
          resolve: () => ENDPOINTS.admin.scim.tokens.store,
          request: contractType<{ label: string; expiresAt?: string }>(),
          response: contractType<SCIMToken>(),
        }),
        destroy: defineEndpoint({
          id: "admin.scim.tokens.destroy",
          method: "DELETE",
          resolve: (id: string | number) =>
            ENDPOINTS.admin.scim.tokens.destroy(id),
          response: contractType<MessageResponse>(),
        }),
      },
      test: defineEndpoint({
        id: "admin.scim.test",
        method: "POST",
        resolve: () => ENDPOINTS.admin.scim.test,
        response: contractType<{
          status: string;
          message: string;
          diagnostics: unknown;
        }>(),
      }),
    },
    clients: {
      index: defineEndpoint({
        id: "admin.clients.index",
        method: "GET",
        resolve: () => ENDPOINTS.admin.clients.index,
        response: contractType<OIDCClient[]>(),
      }),
      store: defineEndpoint({
        id: "admin.clients.store",
        method: "POST",
        resolve: () => ENDPOINTS.admin.clients.store,
        request: contractType<CreateOIDCClientRequest>(),
        response: contractType<OIDCClient>(),
      }),
      byId: defineEndpoint({
        id: "admin.clients.byId",
        method: "GET",
        resolve: (id: string) => ENDPOINTS.admin.clients.byId(id),
        response: contractType<OIDCClient>(),
      }),
      update: defineEndpoint({
        id: "admin.clients.update",
        method: "PATCH",
        resolve: (id: string) => ENDPOINTS.admin.clients.update(id),
        request: contractType<UpdateOIDCClientRequest>(),
        response: contractType<OIDCClient>(),
      }),
      destroy: defineEndpoint({
        id: "admin.clients.destroy",
        method: "DELETE",
        resolve: (id: string) => ENDPOINTS.admin.clients.destroy(id),
        response: contractType<MessageResponse>(),
      }),
      rotateSecret: defineEndpoint({
        id: "admin.clients.rotateSecret",
        method: "POST",
        resolve: (id: string) => ENDPOINTS.admin.clients.rotateSecret(id),
        response: contractType<{ client_secret: string }>(),
      }),
      branding: defineEndpoint({
        id: "admin.clients.branding",
        method: "GET",
        resolve: (id: string) => ENDPOINTS.admin.clients.branding(id),
        response: contractType<unknown>(),
      }),
    },
    saml: {
      config: defineEndpoint({
        id: "admin.saml.config",
        method: "GET",
        resolve: () => ENDPOINTS.admin.saml.config,
        response: contractType<SAMLConfig>(),
      }),
      metadata: defineEndpoint({
        id: "admin.saml.metadata",
        method: "GET",
        resolve: () => ENDPOINTS.admin.saml.metadata,
        response: contractType<string>(),
      }),
      uploadMetadata: defineEndpoint({
        id: "admin.saml.uploadMetadata",
        method: "POST",
        resolve: () => ENDPOINTS.admin.saml.uploadMetadata,
        response: contractType<MessageResponse>(),
      }),
      recentEntities: defineEndpoint({
        id: "admin.saml.recentEntities",
        method: "GET",
        resolve: () => ENDPOINTS.admin.saml.recentEntities,
        response: contractType<unknown[]>(),
      }),
    },
    ssf: {
      config: defineEndpoint({
        id: "admin.ssf.config",
        method: "GET",
        resolve: () => ENDPOINTS.admin.ssf.config,
        response: contractType<SSFConfig>(),
      }),
      updateConfig: defineEndpoint({
        id: "admin.ssf.updateConfig",
        method: "PUT",
        resolve: () => ENDPOINTS.admin.ssf.updateConfig,
        request: contractType<SSFConfig>(),
        response: contractType<{ message: string; config: SSFConfig }>(),
      }),
      test: defineEndpoint({
        id: "admin.ssf.test",
        method: "POST",
        resolve: () => ENDPOINTS.admin.ssf.test,
        response: contractType<{
          success: boolean;
          message: string;
          timestamp: string;
        }>(),
      }),
      broadcast: defineEndpoint({
        id: "admin.ssf.broadcast",
        method: "POST",
        resolve: () => ENDPOINTS.admin.ssf.broadcast,
        request: contractType<BroadcastSSFEventRequest>(),
        response: contractType<BroadcastSSFEventResponse>(),
      }),
      history: defineEndpoint({
        id: "admin.ssf.history",
        method: "GET",
        resolve: () => ENDPOINTS.admin.ssf.history,
        response: contractType<unknown[]>(),
      }),
    },
    jwks: {
      index: defineEndpoint({
        id: "admin.jwks.index",
        method: "GET",
        resolve: () => ENDPOINTS.admin.jwks.index,
        response: contractType<JWKSKey[]>(),
      }),
      show: defineEndpoint({
        id: "admin.jwks.show",
        method: "GET",
        resolve: (kid: string) => ENDPOINTS.admin.jwks.show(kid),
        response: contractType<JWKSKeyDetail>(),
      }),
      store: defineEndpoint({
        id: "admin.jwks.store",
        method: "POST",
        resolve: () => ENDPOINTS.admin.jwks.store,
        request: contractType<CreateJWKSKeyRequest>(),
        response: contractType<JWKSKey>(),
      }),
      rotate: defineEndpoint({
        id: "admin.jwks.rotate",
        method: "POST",
        resolve: () => ENDPOINTS.admin.jwks.rotate,
        response: contractType<JWKSKey>(),
      }),
      destroy: defineEndpoint({
        id: "admin.jwks.destroy",
        method: "DELETE",
        resolve: (kid: string) => ENDPOINTS.admin.jwks.destroy(kid),
        response: contractType<MessageResponse>(),
      }),
    },
    scopes: {
      list: defineEndpoint({
        id: "admin.scopes.list",
        method: "GET",
        resolve: () => ENDPOINTS.admin.scopes.list,
        response: contractType<AuthScope[]>(),
      }),
      store: defineEndpoint({
        id: "admin.scopes.store",
        method: "POST",
        resolve: () => ENDPOINTS.admin.scopes.store,
        request: contractType<CreateScopeRequest>(),
        response: contractType<AuthScope>(),
      }),
      byId: defineEndpoint({
        id: "admin.scopes.byId",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.admin.scopes.byId(id),
        response: contractType<AuthScope>(),
      }),
      update: defineEndpoint({
        id: "admin.scopes.update",
        method: "PATCH",
        resolve: (id: number) => ENDPOINTS.admin.scopes.update(id),
        request: contractType<UpdateScopeRequest>(),
        response: contractType<AuthScope>(),
      }),
      destroy: defineEndpoint({
        id: "admin.scopes.destroy",
        method: "DELETE",
        resolve: (id: number) => ENDPOINTS.admin.scopes.destroy(id),
        response: contractType<MessageResponse>(),
      }),
    },
    webhooks: {
      index: defineEndpoint({
        id: "admin.webhooks.index",
        method: "GET",
        resolve: () => ENDPOINTS.admin.webhooks.index,
        response: contractType<Webhook[]>(),
      }),
      store: defineEndpoint({
        id: "admin.webhooks.store",
        method: "POST",
        resolve: () => ENDPOINTS.admin.webhooks.store,
        request: contractType<{
          url: string;
          events: string[];
          secret?: string;
        }>(),
        response: contractType<Webhook>(),
      }),
      byId: defineEndpoint({
        id: "admin.webhooks.byId",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.admin.webhooks.byId(id),
        response: contractType<Webhook>(),
      }),
      update: defineEndpoint({
        id: "admin.webhooks.update",
        method: "PATCH",
        resolve: (id: number) => ENDPOINTS.admin.webhooks.update(id),
        request: contractType<{
          url?: string;
          events?: string[];
          status?: "active" | "disabled";
        }>(),
        response: contractType<Webhook>(),
      }),
      destroy: defineEndpoint({
        id: "admin.webhooks.destroy",
        method: "DELETE",
        resolve: (id: number) => ENDPOINTS.admin.webhooks.destroy(id),
        response: contractType<MessageResponse>(),
      }),
      test: defineEndpoint({
        id: "admin.webhooks.test",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.webhooks.test(id),
        response: contractType<MessageResponse>(),
      }),
    },
    organizations: {
      index: defineEndpoint({
        id: "admin.organizations.index",
        method: "GET",
        resolve: () => ENDPOINTS.admin.organizations.index,
        response: contractType<PaginatedResponse<Organization>>(),
      }),
      store: defineEndpoint({
        id: "admin.organizations.store",
        method: "POST",
        resolve: () => ENDPOINTS.admin.organizations.store,
        request: contractType<CreateOrganizationRequest>(),
        response: contractType<Organization>(),
      }),
      byId: defineEndpoint({
        id: "admin.organizations.byId",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.admin.organizations.byId(id),
        response: contractType<Organization>(),
      }),
      destroy: defineEndpoint({
        id: "admin.organizations.destroy",
        method: "DELETE",
        resolve: (id: number) => ENDPOINTS.admin.organizations.destroy(id),
        response: contractType<MessageResponse>(),
      }),
      addMember: defineEndpoint({
        id: "admin.organizations.addMember",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.organizations.addMember(id),
        request: contractType<{ user_id: number; role: string }>(),
        response: contractType<OrganizationMember>(),
      }),
      removeMember: defineEndpoint({
        id: "admin.organizations.removeMember",
        method: "DELETE",
        resolve: (id: number, userId: number) =>
          ENDPOINTS.admin.organizations.removeMember(id, userId),
        response: contractType<MessageResponse>(),
      }),
      logo: defineEndpoint({
        id: "admin.organizations.logo",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.organizations.logo(id),
        response: contractType<{ logo_url: string }>(),
      }),
      invite: defineEndpoint({
        id: "admin.organizations.invite",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.organizations.invite(id),
        request: contractType<InviteToOrganizationRequest>(),
        response: contractType<OrganizationInvitation>(),
      }),
      invitations: defineEndpoint({
        id: "admin.organizations.invitations",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.admin.organizations.invitations(id),
        response: contractType<OrganizationInvitation[]>(),
      }),
      revokeInvitation: defineEndpoint({
        id: "admin.organizations.revokeInvitation",
        method: "POST",
        resolve: (orgId: number, invitationId: number | string) =>
          ENDPOINTS.admin.organizations.revokeInvitation(orgId, invitationId),
        response: contractType<unknown>(),
      }),
      policies: defineEndpoint({
        id: "admin.organizations.policies",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.admin.organizations.policies(id),
        response: contractType<unknown>(),
      }),
      impersonate: defineEndpoint({
        id: "admin.organizations.impersonate",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.organizations.impersonate(id),
        response: contractType<ImpersonationToken>(),
      }),
      domains: defineEndpoint({
        id: "admin.organizations.domains",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.organizations.domains(id),
        request: contractType<{ domain: string }>(),
        response: contractType<DomainVerification>(),
      }),
      domainsCheck: defineEndpoint({
        id: "admin.organizations.domainsCheck",
        method: "GET",
        resolve: (id: number, domainId: number) =>
          ENDPOINTS.admin.organizations.domainsCheck(id, domainId),
        response: contractType<DomainVerification>(),
      }),
    },
    provisioning: {
      connectors: defineEndpoint({
        id: "admin.provisioning.connectors",
        method: "GET",
        resolve: () => ENDPOINTS.admin.provisioning.connectors,
        response: contractType<Connector[]>(),
      }),
      store: defineEndpoint({
        id: "admin.provisioning.store",
        method: "POST",
        resolve: () => ENDPOINTS.admin.provisioning.store,
        request: contractType<{
          name: string;
          type: Connector["type"];
          config: Record<string, unknown>;
        }>(),
        response: contractType<Connector>(),
      }),
      byId: defineEndpoint({
        id: "admin.provisioning.byId",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.admin.provisioning.byId(id),
        response: contractType<Connector>(),
      }),
      update: defineEndpoint({
        id: "admin.provisioning.update",
        method: "PATCH",
        resolve: (id: number) => ENDPOINTS.admin.provisioning.update(id),
        request: contractType<Partial<Connector>>(),
        response: contractType<Connector>(),
      }),
      destroy: defineEndpoint({
        id: "admin.provisioning.destroy",
        method: "DELETE",
        resolve: (id: number) => ENDPOINTS.admin.provisioning.destroy(id),
        response: contractType<MessageResponse>(),
      }),
      syncConnector: defineEndpoint({
        id: "admin.provisioning.syncConnector",
        method: "POST",
        resolve: (id: number) => ENDPOINTS.admin.provisioning.syncConnector(id),
        response: contractType<MessageResponse>(),
      }),
      connectorLogs: defineEndpoint({
        id: "admin.provisioning.connectorLogs",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.admin.provisioning.connectorLogs(id),
        response: contractType<PaginatedResponse<ConnectorLog>>(),
      }),
    },
    auditLogs: {
      index: defineEndpoint({
        id: "admin.auditLogs.index",
        method: "GET",
        resolve: () => ENDPOINTS.admin.auditLogs.index,
        response: contractType<PaginatedResponse<AuditLogEntry>>(),
      }),
      export: defineEndpoint({
        id: "admin.auditLogs.export",
        method: "GET",
        resolve: () => ENDPOINTS.admin.auditLogs.export,
        response: contractType<Blob>(),
      }),
    },
    email: {
      templates: defineEndpoint({
        id: "admin.email.templates",
        method: "GET",
        resolve: () => ENDPOINTS.admin.email.templates,
        response: contractType<EmailTemplate[]>(),
      }),
      templateById: defineEndpoint({
        id: "admin.email.templateById",
        method: "GET",
        resolve: (id: string) => ENDPOINTS.admin.email.templateById(id),
        response: contractType<EmailTemplate>(),
      }),
      preview: defineEndpoint({
        id: "admin.email.preview",
        method: "POST",
        resolve: () => ENDPOINTS.admin.email.preview,
        request: contractType<{
          template_id: string;
          variables?: Record<string, string>;
        }>(),
        response: contractType<{ html: string; text: string }>(),
      }),
      test: defineEndpoint({
        id: "admin.email.test",
        method: "POST",
        resolve: () => ENDPOINTS.admin.email.test,
        request: contractType<{
          template_id: string;
          recipient: string;
          variables?: Record<string, string>;
        }>(),
        response: contractType<MessageResponse>(),
      }),
    },
    statistics: {
      summary: defineEndpoint({
        id: "admin.statistics.summary",
        method: "GET",
        resolve: () => ENDPOINTS.admin.statistics.overview,
        response: contractType<unknown>(),
      }),
      users: defineEndpoint({
        id: "admin.statistics.users",
        method: "GET",
        resolve: () => ENDPOINTS.admin.statistics.users,
        response: contractType<UserStats>(),
      }),
      mfa: defineEndpoint({
        id: "admin.statistics.mfa",
        method: "GET",
        resolve: () => ENDPOINTS.admin.statistics.mfa,
        response: contractType<MFAStats>(),
      }),
    },
    security: {
      health: defineEndpoint({
        id: "admin.security.health",
        method: "GET",
        resolve: () => ENDPOINTS.admin.security.health,
        response: contractType<SecurityHealthResponse>(),
      }),
    },
    domains: {
      verify: defineEndpoint({
        id: "admin.domains.verify",
        method: "POST",
        resolve: () => ENDPOINTS.admin.domains.verify,
        request: contractType<{ orgId: number; domain: string }>(),
        response: contractType<DomainVerification>(),
      }),
      check: defineEndpoint({
        id: "admin.domains.check",
        method: "GET",
        resolve: () => ENDPOINTS.admin.domains.check,
        response: contractType<DomainVerification>(),
      }),
    },
  },

  rbac: {
    roles: {
      list: defineEndpoint({
        id: "rbac.roles.list",
        method: "GET",
        resolve: () => ENDPOINTS.rbac.roles.list,
        response: contractType<PaginatedResponse<Role>>(),
      }),
      stats: defineEndpoint({
        id: "rbac.roles.stats",
        method: "GET",
        resolve: () => ENDPOINTS.rbac.roles.stats,
        response: contractType<RoleStats>(),
      }),
      store: defineEndpoint({
        id: "rbac.roles.store",
        method: "POST",
        resolve: () => ENDPOINTS.rbac.roles.store,
        request: contractType<{
          name: string;
          guard_name?: string;
          description?: string;
        }>(),
        response: contractType<Role>(),
      }),
      byId: defineEndpoint({
        id: "rbac.roles.byId",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.rbac.roles.byId(id),
        response: contractType<Role>(),
      }),
      update: defineEndpoint({
        id: "rbac.roles.update",
        method: "PATCH",
        resolve: (id: number) => ENDPOINTS.rbac.roles.update(id),
        request: contractType<{ name?: string; description?: string }>(),
        response: contractType<Role>(),
      }),
      destroy: defineEndpoint({
        id: "rbac.roles.destroy",
        method: "DELETE",
        resolve: (id: number) => ENDPOINTS.rbac.roles.destroy(id),
        response: contractType<MessageResponse>(),
      }),
      permissions: defineEndpoint({
        id: "rbac.roles.permissions",
        method: "GET",
        resolve: (role: string) => ENDPOINTS.rbac.roles.permissions(role),
        response: contractType<Permission[]>(),
      }),
      assignPermission: defineEndpoint({
        id: "rbac.roles.assignPermission",
        method: "POST",
        resolve: () => ENDPOINTS.rbac.roles.assignPermission,
        request: contractType<{ role_id: number; permission_id: number }>(),
        response: contractType<MessageResponse>(),
      }),
      syncPermissions: defineEndpoint({
        id: "rbac.roles.syncPermissions",
        method: "PUT",
        resolve: (id: number) => ENDPOINTS.rbac.roles.syncPermissions(id),
        request: contractType<RolePermissionSyncRequest>(),
        response: contractType<Role>(),
      }),
      syncParents: defineEndpoint({
        id: "rbac.roles.syncParents",
        method: "PUT",
        resolve: (id: number) => ENDPOINTS.rbac.roles.syncParents(id),
        request: contractType<{ parentIds: number[] }>(),
        response: contractType<Role>(),
      }),
    },
    permissions: {
      list: defineEndpoint({
        id: "rbac.permissions.list",
        method: "GET",
        resolve: () => ENDPOINTS.rbac.permissions.list,
        response: contractType<Permission[]>(),
      }),
      store: defineEndpoint({
        id: "rbac.permissions.store",
        method: "POST",
        resolve: () => ENDPOINTS.rbac.permissions.store,
        request: contractType<{
          name: string;
          resource?: string;
          action?: string;
          description?: string;
        }>(),
        response: contractType<Permission>(),
      }),
      byId: defineEndpoint({
        id: "rbac.permissions.byId",
        method: "GET",
        resolve: (id: number) => ENDPOINTS.rbac.permissions.byId(id),
        response: contractType<Permission>(),
      }),
      grant: defineEndpoint({
        id: "rbac.permissions.grant",
        method: "POST",
        resolve: () => ENDPOINTS.rbac.permissions.grant,
        request: contractType<{ user_id: number; permission_id: number }>(),
        response: contractType<MessageResponse>(),
      }),
      revoke: defineEndpoint({
        id: "rbac.permissions.revoke",
        method: "POST",
        resolve: () => ENDPOINTS.rbac.permissions.revoke,
        request: contractType<{ user_id: number; permission_id: number }>(),
        response: contractType<MessageResponse>(),
      }),
    },
    accessPolicies: defineEndpoint({
      id: "rbac.accessPolicies",
      method: "GET",
      resolve: () => ENDPOINTS.rbac.accessPolicies,
      response: contractType<AccessPolicy[]>(),
    }),
  },

  adminMembers: {
    overrides: defineEndpoint({
      id: "adminMembers.overrides",
      method: "GET",
      resolve: (id: number) => ENDPOINTS.adminMembers.overrides(id),
      response: contractType<MemberOverride[]>(),
    }),
    addOverride: defineEndpoint({
      id: "adminMembers.addOverride",
      method: "POST",
      resolve: (id: number) => ENDPOINTS.adminMembers.addOverride(id),
      request: contractType<{ permissionId: number; grant: boolean }>(),
      response: contractType<MessageResponse>(),
    }),
    removeOverride: defineEndpoint({
      id: "adminMembers.removeOverride",
      method: "DELETE",
      resolve: (id: number, pid: number) =>
        ENDPOINTS.adminMembers.removeOverride(id, pid),
      response: contractType<MessageResponse>(),
    }),
  },

  themes: {
    generate: defineEndpoint({
      id: "themes.generate",
      method: "POST",
      resolve: () => ENDPOINTS.themes.generate,
      request: contractType<Record<string, unknown>>(),
      response: contractType<Record<string, unknown>>(),
    }),
    tenant: defineEndpoint({
      id: "themes.tenant",
      method: "GET",
      resolve: () => ENDPOINTS.themes.tenant,
      response: contractType<Record<string, unknown>>(),
    }),
    saveTenant: defineEndpoint({
      id: "themes.saveTenant",
      method: "PUT",
      resolve: () => ENDPOINTS.themes.saveTenant,
      request: contractType<Record<string, unknown>>(),
      response: contractType<Record<string, unknown>>(),
    }),
    presets: defineEndpoint({
      id: "themes.presets",
      method: "GET",
      resolve: () => ENDPOINTS.themes.presets,
      response: contractType<{ presets: Record<string, unknown> }>(),
    }),
  },

  dashboards: {
    layouts: defineEndpoint({
      id: "dashboards.layouts",
      method: "GET",
      resolve: (pageId: string) => ENDPOINTS.dashboards.layouts(pageId),
      response: contractType<Record<string, unknown>>(),
    }),
    updateLayout: defineEndpoint({
      id: "dashboards.updateLayout",
      method: "PUT",
      resolve: (pageId: string) => ENDPOINTS.dashboards.updateLayout(pageId),
      request: contractType<Record<string, unknown>>(),
      response: contractType<Record<string, unknown>>(),
    }),
    resetLayout: defineEndpoint({
      id: "dashboards.resetLayout",
      method: "POST",
      resolve: (pageId: string) => ENDPOINTS.dashboards.resetLayout(pageId),
      response: contractType<Record<string, unknown>>(),
    }),
  },

  developer: {
    apiKeys: defineEndpoint({
      id: "developer.apiKeys",
      method: "GET",
      resolve: () => ENDPOINTS.developer.apiKeys,
      response: contractType<Record<string, unknown>[]>(),
    }),
    createApiKey: defineEndpoint({
      id: "developer.createApiKey",
      method: "POST",
      resolve: () => ENDPOINTS.developer.apiKeys,
      request: contractType<Record<string, unknown>>(),
      response: contractType<Record<string, unknown>>(),
    }),
    deleteApiKey: defineEndpoint({
      id: "developer.deleteApiKey",
      method: "DELETE",
      resolve: (id: string | number) => ENDPOINTS.developer.apiKeyById(id),
      response: contractType<MessageResponse>(),
    }),
    webhooks: defineEndpoint({
      id: "developer.webhooks",
      method: "GET",
      resolve: () => ENDPOINTS.developer.webhooks,
      response: contractType<Webhook[]>(),
    }),
    createWebhook: defineEndpoint({
      id: "developer.createWebhook",
      method: "POST",
      resolve: () => ENDPOINTS.developer.webhooks,
      request: contractType<Record<string, unknown>>(),
      response: contractType<Webhook>(),
    }),
    webhookById: defineEndpoint({
      id: "developer.webhookById",
      method: "GET",
      resolve: (id: string | number) => ENDPOINTS.developer.webhookById(id),
      response: contractType<Webhook>(),
    }),
    updateWebhook: defineEndpoint({
      id: "developer.updateWebhook",
      method: "PUT",
      resolve: (id: string | number) => ENDPOINTS.developer.webhookById(id),
      request: contractType<Record<string, unknown>>(),
      response: contractType<Webhook>(),
    }),
    deleteWebhook: defineEndpoint({
      id: "developer.deleteWebhook",
      method: "DELETE",
      resolve: (id: string | number) => ENDPOINTS.developer.webhookById(id),
      response: contractType<MessageResponse>(),
    }),
    testWebhook: defineEndpoint({
      id: "developer.testWebhook",
      method: "POST",
      resolve: (id: string | number) => ENDPOINTS.developer.testWebhook(id),
      request: contractType<Record<string, unknown>>(),
      response: contractType<Record<string, unknown>>(),
    }),
  },

  contact: {
    submit: defineEndpoint({
      id: "contact.submit",
      method: "POST",
      resolve: () => ENDPOINTS.contact.submit,
      request: contractType<Record<string, unknown>>(),
      response: contractType<Record<string, unknown>>(),
    }),
    messages: defineEndpoint({
      id: "contact.messages",
      method: "GET",
      resolve: () => ENDPOINTS.contact.messages,
      response: contractType<Record<string, unknown>[]>(),
    }),
    updateMessageStatus: defineEndpoint({
      id: "contact.updateMessageStatus",
      method: "PATCH",
      resolve: (id: string | number) =>
        ENDPOINTS.contact.updateMessageStatus(id),
      request: contractType<{ status: string }>(),
      response: contractType<Record<string, unknown>>(),
    }),
  },
} as const;

export type API_CONTRACTS = typeof API_CONTRACTS;
