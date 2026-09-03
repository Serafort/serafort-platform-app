export { usePasskey } from './usePasskey'
export { usePasskeyAutofill } from './usePasskeyAutofill'
export { useStepUpAuth } from './useStepUpAuth'
export type { StepUpActionMetadata, StepUpAuthState } from './useStepUpAuth'

import { useMutation } from '@tanstack/react-query'
import { mfaService } from '../services/mfa.service'

export const usePasskeyLogin = (options?: any) => {
  return useMutation({
    mutationFn: (data: any) => mfaService.passkeys.verifyLogin(data),
    ...options,
  })
}

export const usePasskeyGetLoginOptions = (options?: any) => {
  return useMutation({
    mutationFn: (email?: string) => mfaService.passkeys.getLoginOptions(email),
    ...options,
  }) as any
}

export const useMfaLoginVerify = (options?: any) => {
  return useMutation({
    mutationFn: (data: { userId: number; code: string }) =>
      mfaService.verifyMfaCode(data.userId, data.code),
    ...options,
  })
}

export const useStepUpBiometricVerify = (options?: any) => {
  return useMutation({
    mutationFn: (assertionResponse: any) => mfaService.stepUp.verifyBiometric(assertionResponse),
    ...options,
  })
}

export const useStepUpTotpVerify = (options?: any) => {
  return useMutation({
    mutationFn: (code: string) => mfaService.stepUp.verifyTotp(code),
    ...options,
  })
}
