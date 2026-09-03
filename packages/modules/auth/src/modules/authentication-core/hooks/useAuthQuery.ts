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
  API_CONFIG,
  useAppStore,
} from '@cap/platform-core'

import {
  TokenResponse,
  MessageResponse,
  VerifyEmailResponse,
  SessionResponse,
  LoginMutationVars,
  RegisterMutationVars,
  ForgotPasswordMutationVars,
  ResetPasswordMutationVars,
  SessionsResponse,
  LoginHistoryResponse,
  SecurityLogParams,
  SsoDiscoveryResponse,
} from '../types/api.types'
import { useSSESubscription } from './useSSE'
import { ENDPOINTS } from '@cap/platform-core'

import { QUERY_KEYS } from '../services/query'
import authService from '../services/auth.service'
import { useAuthStore } from '../store'

// ============================================================================
// EXISTING MUTATION HOOKS (POST, PUT, DELETE operations)
// ============================================================================

/**
 * Signup/Register mutation
 */
export function useSignup(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    RegisterMutationVars,
    unknown
  >,
) {
  return useMutation({
    mutationFn: ({ data }) => authService.signup(data as any),
    ...options,
  })
}

export const useRegister = useSignup
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

      if (response.data.mfa_required) {
        setMfaRequired(true)
        setAuthStep('mfa')
        if (response.data.userId) {
          // Store userId or sessionId if needed for second factor
        }
      } else if (response.data.token) {
        const expiresIn = response.data.expires_in || 3600
        const expiresAt = Date.now() + expiresIn * 1000

        secureTokenManager.setTokens({
          accessToken: response.data.token,
          expiresAt,
        })

        // Extract user data - backend might return user data directly or in a 'user' field
        const userData = response.data.user || response.data

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

        // sessionId handled if present in response
        if (response.data.userId) {
          setSessionId(response.data.userId.toString())
        }

        try {
          sessionStorageManager.set('user', response.data.user)
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
 * Refresh token mutation
 */
export function useRefreshToken(
  options?: UseMutationOptions<
    FetchResponse<TokenResponse>,
    HttpError,
    { refreshToken?: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()

  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (...args) => {
      const [response] = args
      if (response.data.token) {
        const expiresIn = response.data.expires_in || 3600
        const expiresAt = Date.now() + expiresIn * 1000

        secureTokenManager.setTokens({
          accessToken: response.data.token,
          // refresh_token is handled via HttpOnly cookie
          expiresAt,
        })
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.session })

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

/**
 * Verify reset password token
 */
export function useVerifyResetPassword(
  email: string,
  signature: string,
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['auth', 'verify-reset-password', email, signature],
    queryFn: () => authService.verifyResetPassword(email, signature),
    enabled: !!email && !!signature,
    retry: false,
    ...options,
  })
}
/**
 * Verify email mutation
 */
export function useVerifyEmail(
  options?: UseMutationOptions<
    FetchResponse<VerifyEmailResponse>,
    HttpError,
    { email: string; signature: string },
    unknown
  >,
) {
  return useMutation({
    mutationFn: ({ email, signature }) => authService.verifyEmail(email, signature),
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

export function useVerifyEmailToken(
  email: string,
  signature: string,
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['auth', 'verify-email-token', email, signature],
    queryFn: () => authService.verifyEmail(email, signature),
    enabled: !!email && !!signature,
    retry: false,
    ...options,
  })
}

export function useValidateUser(
  email: string,
  token: string,
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['auth', 'validate-user', email, token],
    queryFn: () => authService.validateUser(email, token),
    enabled: !!email && !!token,
    retry: false,
    ...options,
  })
}

/**
 * Send magic link for passwordless login
 */
export function usePasswordlessSend(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | { email: string }, unknown>,
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
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
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
 * Get current session
 */
export function useSession(
  options?: Omit<
    UseQueryOptions<FetchResponse<SessionResponse>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  const { setUser, setAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: QUERY_KEYS.auth.session,
    queryFn: async () => {
      const response = await authService.getSession()
      const userData = response.data?.user || response.data

      if (userData && userData.id) {
        // Normalize user role if it's an object
        if (typeof userData.role === 'object' && userData.role !== null) {
          userData.roleObject = userData.role
          userData.roleName = (userData.role as any).name
          userData.role = (userData.role as any).id
        }

        // Coerce numeric role strings to numbers
        if (typeof userData.role === 'string' && !isNaN(Number(userData.role))) {
          userData.role = Number(userData.role)
        }

        setUser(userData)
        setAuthenticated(true)

        // Keep local store in sync with global store if needed
        useAppStore.getState().setUser(userData)
      } else {
        setUser(null)
        setAuthenticated(false)
        useAppStore.getState().setUser(null)
      }
      return response
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: false, // Don't retry if unauthorized
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
 * Get Login History
 */
export function useLoginHistory(
  limit: number = 50,
  options?: Omit<
    UseQueryOptions<FetchResponse<LoginHistoryResponse>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ['auth', 'login-history', limit],
    queryFn: () => authService.getLoginHistory(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

/**
 * Get Security Logs
 */
export function useSecurityLogs(
  params?: SecurityLogParams,
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['auth', 'security-logs', params],
    queryFn: () => authService.getSecurityLogs(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

// MFA and Passkey hooks are handled by plugins in packages/modules/auth/src/plugins/

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
 * Check if user is authenticated (Query-based)
 */
export function useIsAuthenticatedQuery(): boolean {
  const { data: session } = useSession({ retry: false })
  return !!session?.data?.user
}

/**
 * Get current user (Query-based)
 */
export function useCurrentUserQuery() {
  const { data: session, ...rest } = useSession()
  return {
    user: session?.data?.user,
    ...rest,
  }
}

/**
 * Check user role
 */
export function useHasRole(role: string | number): boolean {
  const { user } = useCurrentUserQuery()
  const userData = (user as any)?.user || user
  if (!userData?.role) return false
  return String(userData.role) === String(role)
}

/**
 * Check multiple roles
 */
export function useHasAnyRole(roles: (string | number)[]): boolean {
  const { user } = useCurrentUserQuery()
  const userData = (user as any)?.user || user
  if (!userData?.role) return false
  const userRoleStr = String(userData.role)
  return roles.some((r) => String(r) === userRoleStr)
}

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

/**
 * SSE Hooks for progress tracking
 */

export function useScrapingProgress(jobId: string | number) {
  const url = `${API_CONFIG.baseURL}${ENDPOINTS.sse.scrapingProgress(jobId)}`
  return useSSESubscription<{
    progress: number
    status: string
    message: string
    records_processed?: number
  }>(url)
}

export function useAnalysisProgress(analysisId: string | number) {
  const url = `${API_CONFIG.baseURL}${ENDPOINTS.sse.analysisProgress(analysisId)}`
  return useSSESubscription<{
    progress: number
    status: string
    message: string
  }>(url)
}

export function useNotificationsStream() {
  const url = `${API_CONFIG.baseURL}${ENDPOINTS.notifications.sse}`
  return useSSESubscription<{
    type: string
    user_id: number
  }>(url)
}
