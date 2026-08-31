import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mfaService, MfaMethodSummary, PasskeyItem } from '../services/mfa.service'

export const MFA_QUERY_KEYS = {
  methods: ['user', 'mfa-methods'] as const,
  passkeys: ['user', 'passkeys'] as const,
  recoveryCodes: ['user', 'mfa', 'recovery-codes'] as const,
  securityStatus: ['user', 'security-status'] as const,
}

export function useMfaMethodsQuery() {
  return useQuery({
    queryKey: MFA_QUERY_KEYS.methods,
    queryFn: async () => {
      const response = await mfaService.getMethods()
      return response.data || []
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useRecoveryCodesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: MFA_QUERY_KEYS.recoveryCodes,
    queryFn: async () => {
      const response = await mfaService.getRecoveryCodes()
      return response.data?.recoveryCodes || []
    },
    enabled: options?.enabled ?? true,
    staleTime: 0,
  })
}

export function useTotpSetupMutation() {
  return useMutation({
    mutationFn: async () => {
      const response = await mfaService.setupTotp()
      return response.data
    },
  })
}

export function useTotpConfirmMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await mfaService.confirmTotp(code)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.methods })
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.securityStatus })
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.recoveryCodes })
    },
  })
}

export function useDisableMfaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await mfaService.disableMfa()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.methods })
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.securityStatus })
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.recoveryCodes })
    },
  })
}

export function useRegenerateBackupCodesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await mfaService.regenerateBackupCodes()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.recoveryCodes })
    },
  })
}

export function useSmsSendCodeMutation() {
  return useMutation({
    mutationFn: async () => {
      const response = await mfaService.sms.sendCode()
      return response.data
    },
  })
}

export function useSmsConfirmMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await mfaService.sms.confirm(code)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.methods })
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.securityStatus })
    },
  })
}

export function useSmsDisableMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await mfaService.sms.disable()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.methods })
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.securityStatus })
    },
  })
}

export function usePasskeysListQuery() {
  return useQuery({
    queryKey: MFA_QUERY_KEYS.passkeys,
    queryFn: async () => {
      const response = await mfaService.passkeys.list()
      return response.data || []
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useUpdatePasskeyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string | number; name: string }) => {
      const response = await mfaService.passkeys.update(id, name)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.passkeys })
    },
  })
}

export function useDeletePasskeyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await mfaService.passkeys.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.passkeys })
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.methods })
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.securityStatus })
    },
  })
}
