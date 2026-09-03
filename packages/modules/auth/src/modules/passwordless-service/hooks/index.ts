import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { FetchResponse, HttpError } from '@cap/platform-core'
import authService from '../../authentication-core/services/auth.service'

export interface PasswordlessSendResponse {
  message: string
  success: boolean
}

/**
 * Send a magic link to the user's email address.
 */
export function usePasswordlessSend(
  options?: UseMutationOptions<
    FetchResponse<PasswordlessSendResponse>,
    HttpError,
    string,
    unknown
  >,
) {
  return useMutation({
    mutationFn: (email) => authService.passwordless.send(email),
    ...options,
  })
}

/**
 * Verify a magic link token returned from the backend.
 * Enabled once a token is available (e.g. from the URL query string).
 */
export function usePasswordlessVerify(
  token: string,
  options?: Omit<
    UseQueryOptions<FetchResponse<PasswordlessSendResponse>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ['auth', 'passwordless', 'verify', token],
    queryFn: () => authService.passwordless.verify(token),
    enabled: Boolean(token),
    retry: false,
    ...options,
  })
}
