// src/Modules/Auth/types/api.types.ts - ENHANCED VERSION

/**
 * API Types for Auth Module
 * Defines all request and response types for the Auth API
 */

// ============================================================================
// Core Entity Types
// ============================================================================

import { IRole } from '@cap/platform-core'
import type { SAMLConfig, JWKSKey } from '../../../domain-kernel/src/types'

export type { SAMLConfig, JWKSKey }

export interface AdminOrganization {
  id: number
  name: string
  slug: string
  status: string
  createdAt: string
  updatedAt: string
  ownerId: number
  domain?: string
  members?: any[]
  members_count?: number
  domainVerifications?: any[]
  brandingConfig?: Record<string, any>
  securityPolicies?: Record<string, any>
}

export interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  role?: number
  status?: string
  avatar?: string
  emailVerified?: boolean
  lastLogin?: string
  lastActivity?: string
  createdAt?: string
  updatedAt?: string
  mfaEnabled?: boolean
  orgName?: string
  permissions?: string[]
  roleName?: string
  roleObject?: IRole
  isActif?: boolean
  apiAccessEnabled?: boolean
  maintenanceModeBypass?: boolean
  phone?: string
  sexe?: string
}

export interface Scope {
  id: number
  name: string
  description?: string
  isDefault?: boolean
}

export interface SCIMConfig {
  id: number
  endpoint: string
  token: string
  isActive: boolean
}

// ============================================================================
// Core Entity Types
// ============================================================================

export interface SsoDiscoveryResponse {
  provider: 'oidc' | 'saml' | 'google' | 'github' | 'microsoft' | 'password'
  type?: string
  name?: string
  url?: string
  clientId?: string
  organizationId?: number
  loginUrl?: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  firstname: string
  lastname: string
  isTermsSign: boolean
  organization?: {
    name?: string
    domain?: string
    phone?: string
    website?: string
  }
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  email: string
  password: string
  confirmPassword: string
}

export interface TrackFailedLoginRequest {
  email: string
  ip: string
  location?: string
  user_agent?: string
}

export interface UpdateNamesRequest {
  firstname?: string
  lastname?: string
}

export interface UpdateEmailRequest {
  email: string
  password: string
}

export interface UpdatePhotoRequest {
  id: number
  photo: File
}

// ============================================================================
// Request Types - NEW
// ============================================================================

// Change Password
export interface ChangePasswordRequest {
  currentPassword: string
  password: string
  confirmPassword: string
}

// Account Deactivation
export interface DeactivateAccountRequest {
  password: string
  reason?: string
  feedback?: string
}

export interface ReactivateAccountRequest {
  email: string
  password: string
}

// OAuth
export interface OAuthLoginRequest {
  provider: 'google' | 'facebook'
  code: string
}

export interface LinkOAuthRequest {
  provider: 'google' | 'facebook'
  code: string
}

export interface UpdatePreferencesRequest {
  isEnabledProfile?: boolean
  isEnabledMiniPlayer?: boolean
  isEnabledAutoplayNext?: boolean
  isEnabledMentions?: boolean
  emailOnComment?: boolean
  emailOnCommentReply?: boolean
  emailOnAchievement?: boolean
  emailOnNewDeviceLogin?: boolean
  emailOnWatchlist?: boolean
  emailOnMention?: boolean
  language?: string
  timezone?: string
  dateFormat?: string
}

export interface UpdateMeRequest {
  firstname?: string
  lastname?: string
  phone?: string
  email?: string
  biography?: string
  location?: string
  website?: string
  company?: string
  language?: string
  timezone?: string
  dateFormat?: string
  emailOnComment?: boolean
  emailOnCommentReply?: boolean
  emailOnAchievement?: boolean
  emailOnNewDeviceLogin?: boolean
  emailOnWatchlist?: boolean
  emailOnMention?: boolean
}

// ============================================================================
// Response Types - EXISTING
// ============================================================================

export interface TokenResponse {
  token: string
  refresh_token: string
  user: User
  expires_in: number
  mfa_required?: boolean
  userId?: number
}

export interface MessageResponse {
  message: string
  success: boolean
}

export interface VerifyEmailResponse {
  message: string
  success: boolean
}

export interface SessionResponse {
  user: User
  session_expiry: string
}

export interface TrackFailedLoginResponse {
  attempts_remaining?: number
  locked: boolean
  lockout_duration?: number
  email_sent?: boolean
}

export interface ProfileSettingsResponse {
  user: User
  settings?: Record<string, any>
}

export interface UpdateResponse {
  message: string
  success: boolean
  user?: User
}

// Passkeys (WebAuthn)
export interface PasskeyRegistrationOptionsResponse {
  options: any // SimpleWebAuthn RegistrationOptions
}

export interface PasskeyLoginOptionsResponse {
  options: any // SimpleWebAuthn AuthenticationOptions
}

// ============================================================================
// Response Types - NEW
// ============================================================================

// Session Management
export interface UserSession {
  id: string
  device_name: string
  device_type: 'mobile' | 'tablet' | 'desktop'
  browser: string
  ip_address: string
  location?: string
  last_activity: string
  current: boolean
  created_at: string
}

export interface SessionsResponse {
  sessions: Array<UserSession>
  current_session_id: string
}

// Login History
export interface LoginAttempt {
  id: string
  timestamp: string
  status: 'success' | 'failed' | 'blocked'
  ip_address: string
  location?: string
  device: string
  browser: string
  reason?: string
}

export interface LoginHistoryResponse {
  attempts: Array<LoginAttempt>
  total: number
}

// OAuth
export interface LinkedAccountsResponse {
  accounts: Array<{
    provider: 'google' | 'facebook'
    linked_at: string
    email?: string
  }>
}

// Email Preferences
export interface EmailPreferencesResponse {
  preferences: Record<string, boolean>
}

// ============================================================================
// Mutation Variables Types (for React Query) - EXISTING
// ============================================================================

export interface LoginMutationVars {
  data: LoginRequest
}

export interface RegisterMutationVars {
  data: RegisterRequest
}

export interface ForgotPasswordMutationVars {
  data: ForgotPasswordRequest
}

export interface ResetPasswordMutationVars {
  data: ResetPasswordRequest
}

export interface UpdateNamesMutationVars {
  data: UpdateNamesRequest
}

export interface UpdateEmailMutationVars {
  data: UpdateEmailRequest
}

export interface UpdatePhotoMutationVars {
  data: UpdatePhotoRequest
}

export interface SecurityLogParams {
  page?: number
  limit?: number
  userId?: string
  action?: string
  from?: string // ISO date
  to?: string // ISO date
  [key: string]: string | number | boolean | undefined
}

// OIDC Client types
export interface OIDCClient {
  id: string | number
  name: string
  client_name?: string
  type?: string
  description?: string
  client_id: string
  client_secret?: string
  redirect_uris: string[]
  post_logout_redirect_uris?: string[]
  grant_types: string[]
  response_types: string[]
  scope: string
  status?: string
  is_fapi_compliant?: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateOIDCClientRequest {
  name: string
  redirectUris: string[]
  grantTypes?: string[]
  responseTypes?: string[]
  branding?: any
}

export interface UpdateOIDCClientRequest {
  name?: string
  description?: string
  redirectUris?: string[]
  grantTypes?: string[]
  responseTypes?: string[]
  is_active?: boolean
  is_fapi_compliant?: boolean
  branding?: any
}

// Security & Activity
export interface SecurityStatusResponse {
  mfaEnabled: boolean
  emailVerified: boolean
  passwordLastChangedAt: string
  activeSessions: number
  passkeys: number
}

export interface AuditLog {
  id: number
  actor_id: number
  user_id: number
  action: string
  resource_type: string
  resource_id: number
  metadata: any
  travel_logs?: any[]
  created_at: string
}

export interface ActivityTimelineResponse {
  logs: AuditLog[]
}
export interface EmailChangeRequest {
  id: number
  oldEmail: string
  newEmail: string
  status: 'pending_authorization' | 'completed' | 'expired'
  date: string
}

export type EmailChangesResponse = EmailChangeRequest[]

export interface ExportParams {
  format?: string
  type?: string
  startDate?: string
  endDate?: string
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  role?: string
}
