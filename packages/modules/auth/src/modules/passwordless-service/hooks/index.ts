import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { FetchResponse, HttpError, QUERY_KEYS } from '@cap/platform-core'
import authService from '../../authentication-core/services/auth.service'

export interface PasswordlessSendPayload {
  email: string
  redirectUrl?: string
}

export type PasswordlessSendRequest = string | PasswordlessSendPayload

export interface PasswordlessSendResponse {
  message: string
  success: boolean
  cooldownSeconds?: number
  token?: string
  magicLink?: string
}

export interface PasswordlessVerifyParams {
  token: string
  email?: string
}

export type PasswordlessVerifyRequest = string | PasswordlessVerifyParams

export interface PasswordlessVerifyResponse {
  success: boolean
  message?: string
  token: string
  refreshToken?: string
  user: any
  expiresIn?: number
}

/**
 * Mutation hook to send a magic link to the user's email address.
 */
export function usePasswordlessSend(
  options?: UseMutationOptions<
    FetchResponse<PasswordlessSendResponse>,
    HttpError,
    PasswordlessSendRequest,
    unknown
  >,
) {
  return useMutation({
    mutationFn: (payload: PasswordlessSendRequest) => authService.passwordless.send(payload),
    ...options,
  })
}

/**
 * Query hook to verify a magic link token from URL parameters.
 * Automatically runs once a token is available with no retries.
 */
export function usePasswordlessVerify(
  tokenOrParams: PasswordlessVerifyRequest,
  options?: Omit<
    UseQueryOptions<FetchResponse<PasswordlessVerifyResponse>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  const token = typeof tokenOrParams === 'string' ? tokenOrParams : tokenOrParams?.token || ''

  return useQuery({
    queryKey: QUERY_KEYS?.auth?.passwordless?.verify
      ? QUERY_KEYS.auth.passwordless.verify(token)
      : ['auth', 'passwordless', 'verify', token],
    queryFn: () => authService.passwordless.verify(tokenOrParams),
    enabled: Boolean(token),
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    ...options,
  })
}

