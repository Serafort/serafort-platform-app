import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
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
import { mfaService } from '../services/mfa.service'

vi.mock('../services/mfa.service', () => ({
  mfaService: {
    getMethods: vi.fn(),
    getRecoveryCodes: vi.fn(),
    setupTotp: vi.fn(),
    confirmTotp: vi.fn(),
    disableMfa: vi.fn(),
    regenerateBackupCodes: vi.fn(),
    sms: {
      sendCode: vi.fn(),
      confirm: vi.fn(),
      disable: vi.fn(),
    },
    passkeys: {
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useMfaQuery Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches MFA methods successfully', async () => {
    const mockMethods = [
      { type: 'totp', enabled: true },
      { type: 'sms', enabled: false },
      { type: 'passkey', enabled: true, count: 2 },
    ]
    vi.mocked(mfaService.getMethods).mockResolvedValue({ data: mockMethods } as any)

    const { result } = renderHook(() => useMfaMethodsQuery(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockMethods)
    expect(mfaService.getMethods).toHaveBeenCalledTimes(1)
  })

  it('fetches recovery codes successfully', async () => {
    const mockCodes = ['CODE1-AAAA', 'CODE2-BBBB']
    vi.mocked(mfaService.getRecoveryCodes).mockResolvedValue({
      data: { recoveryCodes: mockCodes },
    } as any)

    const { result } = renderHook(() => useRecoveryCodesQuery(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockCodes)
  })

  it('runs TOTP setup and confirm mutations', async () => {
    vi.mocked(mfaService.setupTotp).mockResolvedValue({
      data: { qrDataUrl: 'data:image/png;base64,...', manualEntry: 'JBSWY3DPEHPK3PXP' },
    } as any)
    vi.mocked(mfaService.confirmTotp).mockResolvedValue({
      data: { enrolled: true, recoveryCodes: ['RC1'], message: 'Enrolled' },
    } as any)

    const wrapper = createWrapper()
    const { result: setupResult } = renderHook(() => useTotpSetupMutation(), { wrapper })
    const { result: confirmResult } = renderHook(() => useTotpConfirmMutation(), { wrapper })

    let setupData: any
    await act(async () => {
      setupData = await setupResult.current.mutateAsync()
    })
    expect(setupData.manualEntry).toBe('JBSWY3DPEHPK3PXP')

    let confirmData: any
    await act(async () => {
      confirmData = await confirmResult.current.mutateAsync('123456')
    })
    expect(confirmData.enrolled).toBe(true)
    expect(mfaService.confirmTotp).toHaveBeenCalledWith('123456')
  })

  it('runs SMS send, confirm, and disable mutations', async () => {
    vi.mocked(mfaService.sms.sendCode).mockResolvedValue({ data: { message: 'SMS sent' } } as any)
    vi.mocked(mfaService.sms.confirm).mockResolvedValue({
      data: { message: 'SMS verified', mfaSmsEnabled: true },
    } as any)
    vi.mocked(mfaService.sms.disable).mockResolvedValue({
      data: { message: 'SMS disabled' },
    } as any)

    const wrapper = createWrapper()
    const { result: sendResult } = renderHook(() => useSmsSendCodeMutation(), { wrapper })
    const { result: confirmResult } = renderHook(() => useSmsConfirmMutation(), { wrapper })
    const { result: disableResult } = renderHook(() => useSmsDisableMutation(), { wrapper })

    await act(async () => {
      await sendResult.current.mutateAsync()
    })
    expect(mfaService.sms.sendCode).toHaveBeenCalled()

    await act(async () => {
      await confirmResult.current.mutateAsync('654321')
    })
    expect(mfaService.sms.confirm).toHaveBeenCalledWith('654321')

    await act(async () => {
      await disableResult.current.mutateAsync()
    })
    expect(mfaService.sms.disable).toHaveBeenCalled()
  })

  it('runs Passkey list, update, and delete operations', async () => {
    const mockPasskeys = [{ id: 'pk-1', name: 'Work Mac' }]
    vi.mocked(mfaService.passkeys.list).mockResolvedValue({ data: mockPasskeys } as any)
    vi.mocked(mfaService.passkeys.update).mockResolvedValue({ data: { message: 'Updated' } } as any)
    vi.mocked(mfaService.passkeys.delete).mockResolvedValue({ data: { message: 'Deleted' } } as any)

    const wrapper = createWrapper()
    const { result: listResult } = renderHook(() => usePasskeysListQuery(), { wrapper })
    const { result: updateResult } = renderHook(() => useUpdatePasskeyMutation(), { wrapper })
    const { result: deleteResult } = renderHook(() => useDeletePasskeyMutation(), { wrapper })

    await waitFor(() => expect(listResult.current.isSuccess).toBe(true))
    expect(listResult.current.data).toEqual(mockPasskeys)

    await act(async () => {
      await updateResult.current.mutateAsync({ id: 'pk-1', name: 'Personal Mac' })
    })
    expect(mfaService.passkeys.update).toHaveBeenCalledWith('pk-1', 'Personal Mac')

    await act(async () => {
      await deleteResult.current.mutateAsync('pk-1')
    })
    expect(mfaService.passkeys.delete).toHaveBeenCalledWith('pk-1')
  })
})
