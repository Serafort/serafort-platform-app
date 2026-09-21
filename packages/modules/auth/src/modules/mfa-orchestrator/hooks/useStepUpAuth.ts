import { useState, useCallback, useEffect, useRef } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'
import { mfaService, StepUpVerificationResult } from '../services/mfa.service'

export interface StepUpActionMetadata {
  actionName?: string
  actionDescription?: string
  icon?: 'shield' | 'lock' | 'delete' | 'security' | 'key'
}

export interface StepUpAuthState {
  isElevated: boolean
  elevatedUntil: number | null
  elevationToken: string | null
  remainingSeconds: number
  isPromptOpen: boolean
  isVerifying: boolean
  error: string | null
  actionMetadata: StepUpActionMetadata | null
}

const ELEVATION_STORAGE_KEY = 'cap_auth_elevation_state'

export function useStepUpAuth() {
  const [elevatedUntil, setElevatedUntil] = useState<number | null>(() => {
    try {
      const stored = sessionStorage.getItem(ELEVATION_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          return parsed.expiresAt
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return null
  })

  const [elevationToken, setElevationToken] = useState<string | null>(() => {
    try {
      const stored = sessionStorage.getItem(ELEVATION_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          return parsed.token
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return null
  })

  const [isPromptOpen, setIsPromptOpen] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionMetadata, setActionMetadata] = useState<StepUpActionMetadata | null>(null)

  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null)

  const isElevated = Boolean(elevatedUntil && elevatedUntil > Date.now())

  // Elevation countdown timer
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!elevatedUntil) return 0
    return Math.max(0, Math.floor((elevatedUntil - Date.now()) / 1000))
  })

  useEffect(() => {
    if (!elevatedUntil) {
      setRemainingSeconds(0)
      return
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((elevatedUntil - Date.now()) / 1000))
      setRemainingSeconds(remaining)
      if (remaining <= 0) {
        setElevatedUntil(null)
        setElevationToken(null)
        try {
          sessionStorage.removeItem(ELEVATION_STORAGE_KEY)
        } catch {
          // Ignore storage removal errors
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [elevatedUntil])

  const storeElevation = useCallback((result: StepUpVerificationResult) => {
    setElevatedUntil(result.expiresAt)
    setElevationToken(result.elevationToken)
    try {
      sessionStorage.setItem(
        ELEVATION_STORAGE_KEY,
        JSON.stringify({
          token: result.elevationToken,
          expiresAt: result.expiresAt,
        }),
      )
    } catch {
      // Ignore storage write errors
    }
  }, [])

  const handleVerificationSuccess = useCallback(
    async (result: StepUpVerificationResult) => {
      if (!result?.success || !result.elevationToken) {
        throw new Error('Step-up verification was not accepted.')
      }
      storeElevation(result)
      setIsVerifying(false)
      setIsPromptOpen(false)
      setError(null)

      if (pendingActionRef.current) {
        const action = pendingActionRef.current
        pendingActionRef.current = null
        try {
          await action()
        } catch (err: any) {
          console.error('Failed to execute pending elevated action:', err)
        }
      }
    },
    [storeElevation],
  )

  const verifyBiometric = useCallback(async () => {
    setIsVerifying(true)
    setError(null)

    try {
      const challengeRes = await mfaService.stepUp.getChallenge(actionMetadata?.actionName)
      if (!challengeRes.data) {
        throw new Error('Failed to obtain biometric authentication challenge.')
      }

      const assertionResult = await startAuthentication({
        optionsJSON: challengeRes.data as any,
      })

      const verifyRes = await mfaService.stepUp.verifyBiometric(assertionResult)
      await handleVerificationSuccess(verifyRes.data)
      return verifyRes.data
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        const cancelMsg = 'Biometric verification was cancelled or timed out.'
        setError(cancelMsg)
        setIsVerifying(false)
        throw new Error(cancelMsg)
      }
      const msg = err.response?.data?.message || err.message || 'Biometric authentication failed.'
      setError(msg)
      setIsVerifying(false)
      throw err
    }
  }, [actionMetadata?.actionName, handleVerificationSuccess])

  const verifyTotp = useCallback(
    async (code: string) => {
      if (!code || code.trim().length !== 6) {
        setError('Please enter a valid 6-digit authentication code.')
        return
      }

      setIsVerifying(true)
      setError(null)

      try {
        const verifyRes = await mfaService.stepUp.verifyTotp(code.trim())
        await handleVerificationSuccess(verifyRes.data)
        return verifyRes.data
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Invalid verification code.'
        setError(msg)
        setIsVerifying(false)
        throw err
      }
    },
    [handleVerificationSuccess],
  )

  const verifyRecoveryCode = useCallback(
    async (code: string) => {
      const trimmed = code?.trim()
      if (!trimmed) {
        setError('Please enter a recovery code.')
        return
      }

      setIsVerifying(true)
      setError(null)

      try {
        const verifyRes = await mfaService.stepUp.verifyRecovery(trimmed)
        await handleVerificationSuccess(verifyRes.data)
        return verifyRes.data
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Invalid recovery code.'
        setError(msg)
        setIsVerifying(false)
        throw err
      }
    },
    [handleVerificationSuccess],
  )

  const openPrompt = useCallback((metadata?: StepUpActionMetadata) => {
    setError(null)
    setIsVerifying(false)
    setActionMetadata(metadata || null)
    setIsPromptOpen(true)
  }, [])

  const closePrompt = useCallback(() => {
    setIsPromptOpen(false)
    setIsVerifying(false)
    setError(null)
    pendingActionRef.current = null
  }, [])

  const requireStepUp = useCallback(
    async (action: () => void | Promise<void>, metadata?: StepUpActionMetadata) => {
      if (isElevated) {
        await action()
        return
      }

      pendingActionRef.current = action
      openPrompt(metadata)
    },
    [isElevated, openPrompt],
  )

  const clearElevation = useCallback(() => {
    setElevatedUntil(null)
    setElevationToken(null)
    setRemainingSeconds(0)
    try {
      sessionStorage.removeItem(ELEVATION_STORAGE_KEY)
    } catch {
      // Ignore storage write error
    }
  }, [])

  return {
    isElevated,
    elevatedUntil,
    elevationToken,
    remainingSeconds,
    isPromptOpen,
    isVerifying,
    error,
    actionMetadata,
    requireStepUp,
    verifyBiometric,
    verifyTotp,
    verifyRecoveryCode,
    openPrompt,
    closePrompt,
    clearElevation,
  }
}

export default useStepUpAuth
