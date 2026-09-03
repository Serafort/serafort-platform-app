import { useMutation } from '@tanstack/react-query'
import authService from '@cap/module-auth/modules/authentication-core/services/auth.service'
import { FetchResponse, HttpError } from '@cap/platform-core'

export interface VerifyDeviceCodeResponse {
  success: boolean
  redirectUrl: string
}

export const useVerifyDeviceCode = () => {
  return useMutation<FetchResponse<VerifyDeviceCodeResponse>, HttpError, string>({
    mutationFn: (userCode: string) => authService.deviceCode.verify(userCode),
  })
}
