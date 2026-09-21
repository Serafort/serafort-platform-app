// src/Modules/Auth/hooks/useAuthQuery.ts - ENHANCED VERSION

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query'
import {
  FetchResponse,
  HttpError,
  sessionStorageManager,
  secureTokenManager,
  useAppStore,
} from '@cap/platform-core'

import {
  TokenResponse,
  MessageResponse,
  LoginMutationVars,
  RegisterMutationVars,
  ForgotPasswordMutationVars,
  ResetPasswordMutationVars,
  SessionsResponse,
  SsoDiscoveryResponse,
} from '../types/api.types'

import { QUERY_KEYS } from '../services/query'
import authService from '../services/auth.service'
import { normalizeAuthUser } from '../utils/normalizeAuthUser'
import { useAuthStore } from '../store'

// ============================================================================
// EXISTING MUTATION HOOKS (POST, PUT, DELETE operations)
// ============================================================================

/**
 * Signup/Register mutation
 */
export function useRegister(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    RegisterMutationVars,
    unknown
  >,
) {
  return useMutation({
    mutationFn: ({ data }) => authService.signup(data),
    ...options,
  })
}

/**
 * Signin mutation
 */
export function useSignin(
  options?: UseMutationOptions<FetchResponse<TokenResponse>, HttpError, LoginMutationVars, unknown>,
) {
  const queryClient = useQueryClient()

  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  const { setAuthenticated, setUser, setMfaRequired, setSessionId } = useAuthStore()
  const { setAuthStep, setErrorBanner } = useAuthStore()

  return useMutation({
    mutationFn: ({ data }) => authService.signin(data),
    onSuccess: (...args) => {
      const [response] = args

      // Login moved to /api/v1/auth/login, which names these fields differently
      // from the legacy route: accessToken over token, mfaRequired over
      // mfa_required. Both spellings are read so the hook does not depend on
      // which tree served the request — the same tolerance authSlice already
      // applies.
      const body: any = response.data
      const mfaRequired = body.mfaRequired ?? body.mfa_required
      const accessToken = body.accessToken ?? body.token

      if (mfaRequired) {
        setMfaRequired(true)
        setAuthStep('mfa')
      } else if (accessToken) {
        const expiresIn = body.expires_in || 3600
        const expiresAt = Date.now() + expiresIn * 1000

        secureTokenManager.setTokens({
          accessToken,
          expiresAt,
        })

        // Extract user data - backend might return user data directly or in a
        // 'user' field. Normalising also derives a single `role` from the
        // `roles` array that /api/v1/auth/login returns, which the layout's
        // role checks and the post-login redirect both read.
        const userData = normalizeAuthUser<any>(body.user || body)

        // Normalize user role if it's an object for compatibility with layout role checks
        if (userData && typeof userData.role === 'object' && userData.role !== null) {
          userData.roleObject = userData.role
          userData.roleName = (userData.role as any).name
          userData.role = (userData.role as any).id // Convert to number (Roles enum)
        }

        // Coerce numeric role strings to numbers
        if (userData && typeof userData.role === 'string' && !isNaN(Number(userData.role))) {
          userData.role = Number(userData.role)
        }

        setUser(userData)
        setAuthenticated(true)
        setAuthStep('complete')

        // Synchronize with global AppStore atomically
        useAppStore.getState().setUser(userData as any)

        // sessionId handled if present in response. v1 carries the id on the
        // user rather than alongside it, so both placements are checked.
        const userId = body.userId ?? body.user?.id
        if (userId) {
          setSessionId(String(userId))
        }

        try {
          sessionStorageManager.set('user', body.user)
        } catch (err) {
          // Session write failure is non-critical during login flow
          console.error('Failed to write session data:', err)
        }
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.session })
      customOnSuccess?.(...args)
    },
    onError: (error, ...rest) => {
      setErrorBanner(error.message || 'Login failed')
      customOnError?.(error, ...rest)
    },
    ...restOptions,
  })
}
/**
 * Logout mutation
 */
export function useSignout(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, void, unknown>,
) {
  const queryClient = useQueryClient()
  const { clearAuth } = useAuthStore()
  const { setAuthStep } = useAuthStore()

  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: () => authService.signout(),
    onSuccess: (...args) => {
      secureTokenManager.clearTokens()

      // Reset Zustand auth store
      clearAuth()
      setAuthStep('credentials')
      useAppStore.getState().signOut()

      queryClient.clear()

      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Forgot password mutation
 */
export function useForgotPassword(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    ForgotPasswordMutationVars,
    unknown
  >,
) {
  return useMutation({
    mutationFn: ({ data }) => authService.forgotPassword(data),
    ...options,
  })
}

/**
 * Reset password mutation
 */
export function useResetPassword(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    ResetPasswordMutationVars,
    unknown
  >,
) {
  return useMutation({
    mutationFn: ({ data }) => authService.resetPassword(data),
    ...options,
  })
}

export function useAppealBan(
  options?: UseMutationOptions<
    FetchResponse<unknown>,
    HttpError,
    { email: string; reason: string },
    unknown
  >,
) {
  return useMutation({
    mutationFn: ({ email, reason }) => authService.appealBan(email, reason),
    ...options,
  })
}

export function useSocialExchange(
  options?: UseMutationOptions<FetchResponse<unknown>, HttpError, { code: string }, unknown>,
) {
  return useMutation({
    mutationFn: ({ code }) => authService.social.exchange(code),
    ...options,
  })
}
export function useResendVerification(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { email: string },
    unknown
  >,
) {
  return useMutation({
    mutationFn: ({ email }) => authService.resendVerification(email),
    ...options,
  })
}

/**
 * Send magic link for passwordless login
 */
export function usePasswordlessSend(
  options?: UseMutationOptions<FetchResponse<unknown>, HttpError, string | { email: string }, unknown>,
) {
  return useMutation({
    mutationFn: (param) => {
      const email = typeof param === 'string' ? param : param.email
      return authService.passwordless.send(email)
    },
    ...options,
  })
}

/**
 * Verify magic link token for passwordless login
 */
export function usePasswordlessVerify(
  token: string,
  options?: Omit<UseQueryOptions<FetchResponse<unknown>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['auth', 'passwordless', 'verify', token],
    queryFn: () => authService.passwordless.verify(token),
    enabled: Boolean(token),
    retry: false,
    ...options,
  })
}

/**
 * Get All Sessions
 */
export function useSessions(
  options?: Omit<
    UseQueryOptions<FetchResponse<SessionsResponse>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: () => authService.getSessions(),
    staleTime: 1000 * 60 * 1, // 1 minute
    ...options,
  })
}

/**
 * Revoke All Sessions
 */
export function useRevokeAllSessions(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, void, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: () => authService.revokeAllSessions(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}

// ============================================================================
// NEW HOOKS - Login History
// ============================================================================

/**
 * Revoke Session
 */
export function useRevokeSession(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, string, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (sessionId) => authService.revokeSession(sessionId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * SSO Discovery Hook
 */
export function useSsoDiscovery(
  email: string,
  options?: Omit<
    UseQueryOptions<
      FetchResponse<SsoDiscoveryResponse>,
      HttpError,
      FetchResponse<SsoDiscoveryResponse>,
      [string, string]
    >,
    'queryKey'
  >,
) {
  return useQuery({
    queryKey: ['sso_discovery', email],
    queryFn: () => authService.discoverSso(email),
    enabled: Boolean(email) && email.length >= 2,
    retry: false, // Don't retry heavily on discovery failures
    ...options,
  })
}
