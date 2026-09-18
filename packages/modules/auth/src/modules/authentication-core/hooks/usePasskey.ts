import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query'
import { FetchResponse, HttpError, apiClient } from '@cap/platform-core'
import { ENDPOINTS } from '@cap/platform-core'
import { QUERY_KEYS } from '../services/query'

export interface PasskeyCredential {
  id: string
  name: string
  createdAt: string
  lastUsed?: string
  credentialId?: string
  publicKey?: string
  counter?: number
}

export interface PasskeyRegistrationOptions {
  relyingPartyId?: string
  userId?: string
  username?: string
}

export interface PasskeyAuthenticationOptions {
  relyingPartyId?: string
}

export interface PasskeyLoginResult {
  token: string
  user: any
}

const passkeyService = {
  registerStart: async (options?: PasskeyRegistrationOptions): Promise<FetchResponse> => {
    return apiClient.post(ENDPOINTS.auth.passkey.registerStart, options || {})
  },

  registerFinish: async (attestation: any): Promise<FetchResponse> => {
    // PasskeysController.verifyRegistration passes `request.all()` straight
    // into @simplewebauthn/server's verifyRegistrationResponse({ response })
    // and reads `body.id`/`body.rawId` off the top level — it expects the
    // browser's RegistrationResponseJSON verbatim as the request body, not
    // wrapped in an envelope key (confirmed against the sibling
    // mfa-orchestrator module's passkeys.verifyRegistration, which posts the
    // same object unwrapped to this same endpoint).
    return apiClient.post(ENDPOINTS.auth.passkey.registerFinish, attestation)
  },

  loginStart: async (
    options?: PasskeyAuthenticationOptions,
  ): Promise<FetchResponse<PasskeyLoginResult>> => {
    return apiClient.post<PasskeyLoginResult>(ENDPOINTS.auth.passkey.loginStart, options || {})
  },

  loginFinish: async (assertion: any): Promise<FetchResponse<PasskeyLoginResult>> => {
    // Same shape requirement as registerFinish above: PasskeysController.
    // verifyAuthentication reads `body.id`/`body.rawId` and passes the whole
    // body into verifyAuthenticationResponse({ response }) — it must be the
    // raw AuthenticationResponseJSON, not `{ assertion }`.
    return apiClient.post(ENDPOINTS.auth.passkey.loginFinish, assertion)
  },
}

export function usePasskeyRegister(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, PasskeyRegistrationOptions, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => passkeyService.registerStart(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.passkeys })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function usePasskeyRegisterFinish(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { attestation: any }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ attestation }) => passkeyService.registerFinish(attestation),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.passkeys })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function usePasskeyLogin(
  options?: UseMutationOptions<
    FetchResponse<PasskeyLoginResult>,
    HttpError,
    PasskeyAuthenticationOptions,
    unknown
  >,
) {
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => passkeyService.loginStart(data),
    onSuccess: (...args) => {
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function usePasskeyLoginFinish(
  options?: UseMutationOptions<
    FetchResponse<PasskeyLoginResult>,
    HttpError,
    { assertion: any },
    unknown
  >,
) {
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ assertion }) => passkeyService.loginFinish(assertion),
    onSuccess: customOnSuccess,
    ...restOptions,
  })
}

export function usePasskeys(
  options?: Omit<
    UseQueryOptions<FetchResponse<PasskeyCredential[]>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: QUERY_KEYS.users.passkeys,
    queryFn: () => apiClient.get<PasskeyCredential[]>(ENDPOINTS.user.passkeys.index),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useDeletePasskey(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.delete(ENDPOINTS.user.passkeys.destroy(id)),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.passkeys })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useUpdatePasskey(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { id: string | number; name: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, name }) => apiClient.patch(ENDPOINTS.user.passkeys.update(id), { name }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.passkeys })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export const usePasskey = usePasskeyLogin
export const usePasskeyAutofill = usePasskeyLogin
