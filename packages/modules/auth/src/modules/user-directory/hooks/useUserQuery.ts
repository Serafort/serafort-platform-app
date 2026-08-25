// src/Modules/Auth/hooks/useUserQuery.ts
// ============================================================================
// React Query Hooks for User Service
// ============================================================================

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { FetchResponse, HttpError } from '@cap/platform-core';

import { UpdateEmailRequest, UpdatePhotoRequest, ChangePasswordRequest, UpdatePreferencesRequest, UpdateMeRequest, SecurityStatusResponse, AuditLog } from '@idaas/authentication-core/types/api.types';

import userService from '../services/user.service';

// ============================================================================
// Query Keys
// ============================================================================

const USER_KEYS = {
  profile: ['user', 'profile'] as const,
  linkedAccounts: ['user', 'linked-accounts'] as const,
  emailPreferences: ['user', 'email-preferences'] as const,
  tokens: ['user', 'tokens'] as const,
  passkeys: ['user', 'passkeys'] as const,
  mfaMethods: ['user', 'mfa-methods'] as const,
  complianceExport: ['user', 'compliance-export'] as const,
  securityStatus: ['user', 'security-status'] as const,
  activityTimeline: ['user', 'activity-timeline'] as const,
  emailChanges: ['user', 'email-changes'] as const,
}

// ============================================================================
// Query Hooks (GET operations)
// ============================================================================

/**
 * Get security status
 */
export function useSecurityStatus(
  options?: Omit<UseQueryOptions<FetchResponse<SecurityStatusResponse>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: USER_KEYS.securityStatus,
    queryFn: () => userService.getSecurityStatus(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/**
 * Get activity timeline
 */
export function useActivityTimeline(
  options?: Omit<UseQueryOptions<FetchResponse<AuditLog[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: USER_KEYS.activityTimeline,
    queryFn: () => userService.getActivityTimeline(),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

/**
 * Update user profile
 */
export function useGetUser(options?: UseQueryOptions<FetchResponse<any>, HttpError>) {
  return useQuery({
    queryKey: USER_KEYS.profile,
    queryFn: () => userService.getProfile(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useUpdateMe(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, UpdateMeRequest, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data: UpdateMeRequest) => userService.updateMe(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useUpdateUser(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, UpdateMeRequest, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data: UpdateMeRequest) => userService.update(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Update user photo
 */
export function useUpdatePhoto(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, UpdatePhotoRequest, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data: UpdatePhotoRequest) => userService.updatePhoto(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Change email
 */
export function useChangeEmail(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, UpdateEmailRequest, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data: UpdateEmailRequest) => userService.changeEmail(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Change password
 */
export function useChangePassword(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, ChangePasswordRequest, unknown>,
) {
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userService.changePassword(data),
    onSuccess: (...args) => {
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Get user profile
 */
export function useUserProfile(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: USER_KEYS.profile,
    queryFn: () => userService.getProfile(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export const useCurrentUserQuery = useUserProfile

/**
 * Delete account
 */
export function useDeleteAccount(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, void, unknown>,
) {
  return useMutation({
    mutationFn: () => userService.delete(),
    ...options,
  })
}

export function useActivateAccount(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | number, unknown>,
) {
  return useMutation({
    mutationFn: (id: string | number) => userService.activate(id),
    ...options,
  })
}

export function useDeactivateAccount(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | number, unknown>,
) {
  return useMutation({
    mutationFn: (id: string | number) => userService.deactivate(id),
    ...options,
  })
}

export function useSuspendAccount(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | number, unknown>,
) {
  return useMutation({
    mutationFn: (id: string | number) => userService.suspend(id),
    ...options,
  })
}

export function useUnsuspendAccount(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | number, unknown>,
) {
  return useMutation({
    mutationFn: (id: string | number) => userService.unsuspend(id),
    ...options,
  })
}

/**
 * Get MFA methods
 */
export function useMfaMethods(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: USER_KEYS.mfaMethods,
    queryFn: () => userService.mfa.getMethods(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/**
 * Get user passkeys
 */
export function useUserPasskeys(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: USER_KEYS.passkeys,
    queryFn: () => userService.passkeys.list(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/**
 * Update passkey
 */
export function useUpdatePasskey(
  options?: UseMutationOptions<
    FetchResponse,
    HttpError,
    { id: string | number; name: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, name }) => userService.passkeys.update(id, { name }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.passkeys })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Delete passkey
 */
export function useDeletePasskey(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id: string | number) => userService.passkeys.delete(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.passkeys })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Link account
 */
export function useLinkAccount(
  options?: UseMutationOptions<
    FetchResponse,
    HttpError,
    { provider: string; providerId: string; email?: string; metadata?: any },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => userService.linkAccount(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.linkedAccounts })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Get linked accounts
 */
export function useLinkedAccounts(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: USER_KEYS.linkedAccounts,
    queryFn: () => userService.getLinkedAccounts(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/**
 * Unlink account
 */
export function useUnlinkAccount(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id: string | number) => userService.unlinkAccount(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.linkedAccounts })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useUserTokens(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: USER_KEYS.tokens,
    queryFn: () => userService.tokens.list(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/**
 * Create token
 */
export function useCreateToken(
  options?: UseMutationOptions<
    FetchResponse,
    HttpError,
    { name: string; expiresIn?: string; abilities?: string[]; ipRestrictions?: string[] },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => userService.tokens.create(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.tokens })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Revoke token
 */
export function useRevokeToken(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id: string | number) => userService.tokens.revoke(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.tokens })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useComplianceExport(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: USER_KEYS.complianceExport,
    queryFn: () => userService.compliance.export(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useExportMutation(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, void, unknown>,
) {
  return useMutation({
    mutationFn: () => userService.compliance.exportRequest(),
    ...options,
  })
}

export function useErasureMutation(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { password: string; hardDelete?: boolean }, unknown>,
) {
  return useMutation({
    mutationFn: (data) => userService.compliance.erasure(data),
    ...options,
  })
}

export function useUpdatePreferences(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, UpdatePreferencesRequest, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) => userService.updatePreferences(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useUserPreferences(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['user', 'preferences'],
    queryFn: () => userService.preferences(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/**
 * Get email change requests
 */
export function useEmailChanges(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: USER_KEYS.emailChanges,
    queryFn: () => userService.getEmailChanges(),
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  })
}



