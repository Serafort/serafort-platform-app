import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { FetchResponse, HttpError } from '@cap/platform-core'
import authService from "@idaas/authentication-core/services/auth.service"

/**
 * Hooks for OIDC compliance endpoints
 * These are used by OIDC clients or admins to interact with the OIDC provider features.
 */

export const oidcComplianceKeys = {
  all: ['oidc-compliance'] as const,
  userinfo: () => [...oidcComplianceKeys.all, 'userinfo'] as const,
  interaction: (uid: string) => [...oidcComplianceKeys.all, 'interaction', uid] as const,
}

/**
 * Get OIDC Interaction Details
 */
export function useOidcInteraction(
  uid: string | null | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: oidcComplianceKeys.interaction(uid || ''),
    queryFn: () => authService.oidcInteraction.get(uid || ''),
    enabled: !!uid,
    staleTime: 0, // Interactions are temporary and short-lived
    ...options,
  })
}

/**
 * Confirm OIDC Interaction (Grant Consent)
 */
export function useConfirmOidcInteraction(
  uid: string | null | undefined,
  options?: UseMutationOptions<FetchResponse<any>, HttpError, void, unknown>,
) {
  return useMutation({
    mutationFn: () => authService.oidcInteraction.confirm(uid || ''),
    ...options,
  })
}

/**
 * Abort OIDC Interaction (Deny Consent)
 */
export function useAbortOidcInteraction(
  uid: string | null | undefined,
  options?: UseMutationOptions<FetchResponse<any>, HttpError, void, unknown>,
) {
  return useMutation({
    mutationFn: () => authService.oidcInteraction.abort(uid || ''),
    ...options,
  })
}

/**
 * Get OIDC UserInfo
 */
export function useOidcUserInfo(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: oidcComplianceKeys.userinfo(),
    queryFn: () => authService.oidc.userinfo(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/**
 * Introspect OIDC Token
 */
export function useOidcInfoIntrospect(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string, unknown>,
) {
  return useMutation({
    mutationFn: (token: string) => authService.oidc.introspect(token),
    ...options,
  })
}

/**
 * Revoke OIDC Token
 */
export function useOidcTokenRevocation(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string, unknown>,
) {
  return useMutation({
    mutationFn: (token: string) => authService.oidc.revoke(token),
    ...options,
  })
}

/**
 * End OIDC Session (Logout)
 */
export function useOidcEndSession(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, void, unknown>,
) {
  return useMutation({
    mutationFn: () => authService.oidc.endSession(),
    ...options,
  })
}

/**
 * Initiate SAML SSO (Simplified initiation)
 */
export function useInitiateSamlSso(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, any, unknown>,
) {
  return useMutation({
    mutationFn: (data: any) => authService.saml.sso(data),
    ...options,
  })
}
