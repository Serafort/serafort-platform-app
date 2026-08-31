export { usePasskey, formatWebAuthnError } from './usePasskey'
export type { RegisterPasskeyOptions } from './usePasskey'
export { usePasskeyAutofill } from './usePasskeyAutofill'
export { useStepUpAuth } from './useStepUpAuth'
export type { StepUpActionMetadata, StepUpAuthState } from './useStepUpAuth'
export {
  MFA_QUERY_KEYS,
  useMfaMethodsQuery,
  useRecoveryCodesQuery,
  useTotpSetupMutation,
  useTotpConfirmMutation,
  useDisableMfaMutation,
  useRegenerateBackupCodesMutation,
  useSmsSendCodeMutation,
  useSmsConfirmMutation,
  useSmsDisableMutation,
  usePasskeysListQuery,
  useUpdatePasskeyMutation,
  useDeletePasskeyMutation,
} from './useMfaQuery'

import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser'
import type { FetchResponse } from '@cap/platform-core'
import {
  mfaService,
  type MfaLoginCompletionResponse,
  type StepUpVerificationResult,
} from '../services/mfa.service'

export const usePasskeyLogin = (
  options?: UseMutationOptions<
    FetchResponse<MfaLoginCompletionResponse>,
    Error,
    AuthenticationResponseJSON
  >,
) => {
  return useMutation({
    mutationFn: (data: AuthenticationResponseJSON) => mfaService.passkeys.verifyLogin(data),
    ...options,
  })
}

export const usePasskeyGetLoginOptions = (
  options?: UseMutationOptions<
    FetchResponse<PublicKeyCredentialRequestOptionsJSON>,
    Error,
    string | undefined
  >,
) => {
  return useMutation({
    mutationFn: (email?: string) => mfaService.passkeys.getLoginOptions(email),
    ...options,
  })
}

export const useMfaLoginVerify = (
  options?: UseMutationOptions<
    FetchResponse<MfaLoginCompletionResponse>,
    Error,
    { userId: number | string; code: string }
  >,
) => {
  return useMutation({
    mutationFn: (data: { userId: number | string; code: string }) =>
      mfaService.verifyMfaCode(data.userId, data.code),
    ...options,
  })
}

export const useStepUpBiometricVerify = (
  options?: UseMutationOptions<
    FetchResponse<StepUpVerificationResult>,
    Error,
    AuthenticationResponseJSON
  >,
) => {
  return useMutation({
    mutationFn: (assertionResponse: AuthenticationResponseJSON) =>
      mfaService.stepUp.verifyBiometric(assertionResponse),
    ...options,
  })
}

export const useStepUpTotpVerify = (
  options?: UseMutationOptions<FetchResponse<StepUpVerificationResult>, Error, string>,
) => {
  return useMutation({
    mutationFn: (code: string) => mfaService.stepUp.verifyTotp(code),
    ...options,
  })
}
