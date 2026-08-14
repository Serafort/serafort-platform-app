import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStepUpAuth } from './useStepUpAuth'
import { mfaService } from '../services/mfa.service'

vi.mock('../services/mfa.service', () => ({
  mfaService: {
    stepUp: {
      getChallenge: vi.fn().mockResolvedValue({
        data: { challenge: 'mock-challenge-123', rpId: 'localhost', userVerification: 'required' },
      }),
      verifyBiometric: vi.fn().mockResolvedValue({
        data: {
          success: true,
          elevationToken: 'mock-elevation-jwt',
          expiresAt: Date.now() + 15 * 60 * 1000,
        },
      }),
      verifyTotp: vi.fn().mockResolvedValue({
        data: {
          success: true,
          elevationToken: 'mock-totp-jwt',
          expiresAt: Date.now() + 15 * 60 * 1000,
        },
      }),
    },
  },
}))

describe('useStepUpAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('initializes in an un-elevated state', () => {
    const { result } = renderHook(() => useStepUpAuth())
    expect(result.current.isElevated).toBe(false)
    expect(result.current.elevationToken).toBeNull()
    expect(result.current.isPromptOpen).toBe(false)
  })

  it('opens and closes the step-up prompt', () => {
    const { result } = renderHook(() => useStepUpAuth())

    act(() => {
      result.current.openPrompt({ actionName: 'Delete Database' })
    })

    expect(result.current.isPromptOpen).toBe(true)
    expect(result.current.actionMetadata?.actionName).toBe('Delete Database')

    act(() => {
      result.current.closePrompt()
    })

    expect(result.current.isPromptOpen).toBe(false)
  })

  it('successfully elevates session upon TOTP code verification', async () => {
    const { result } = renderHook(() => useStepUpAuth())

    await act(async () => {
      await result.current.verifyTotp('123456')
    })

    expect(mfaService.stepUp.verifyTotp).toHaveBeenCalledWith('123456')
    expect(result.current.isElevated).toBe(true)
    expect(result.current.elevationToken).toBe('mock-totp-jwt')
    expect(result.current.isPromptOpen).toBe(false)
  })

  it('executes protected callback automatically once elevated', async () => {
    const { result } = renderHook(() => useStepUpAuth())
    const mockProtectedAction = vi.fn()

    // 1. Require step up when un-elevated -> queues action and opens prompt
    act(() => {
      result.current.requireStepUp(mockProtectedAction, { actionName: 'Update Security' })
    })

    expect(mockProtectedAction).not.toHaveBeenCalled()
    expect(result.current.isPromptOpen).toBe(true)

    // 2. Perform verification -> action should be triggered
    await act(async () => {
      await result.current.verifyTotp('123456')
    })

    expect(mockProtectedAction).toHaveBeenCalledTimes(1)
    expect(result.current.isElevated).toBe(true)

    // 3. Next call while still elevated -> runs immediately without prompt
    act(() => {
      result.current.requireStepUp(mockProtectedAction)
    })

    expect(mockProtectedAction).toHaveBeenCalledTimes(2)
  })

  it('allows clearing elevated session', async () => {
    const { result } = renderHook(() => useStepUpAuth())

    await act(async () => {
      await result.current.verifyTotp('123456')
    })

    expect(result.current.isElevated).toBe(true)

    act(() => {
      result.current.clearElevation()
    })

    expect(result.current.isElevated).toBe(false)
    expect(result.current.elevationToken).toBeNull()
  })
})
