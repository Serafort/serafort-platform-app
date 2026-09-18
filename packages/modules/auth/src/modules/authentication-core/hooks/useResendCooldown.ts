import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseResendCooldownResult {
  /** Whole seconds left before another resend is allowed. `0` when idle. */
  secondsRemaining: number
  isCoolingDown: boolean
  /** Starts (or restarts) the cooldown. */
  start: (seconds?: number) => void
  reset: () => void
}

/**
 * Countdown shared by every "resend the code / link" affordance.
 *
 * Each screen previously kept its own `useState` + `setInterval` pair, and at
 * least one leaked the interval across unmount. Owning it here also means the
 * remaining seconds are exposed as a number so callers can hand it to i18n as
 * an interpolation value rather than baking it into a fallback string.
 */
export const useResendCooldown = (defaultSeconds = 60): UseResendCooldownResult => {
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => clear, [clear])

  const start = useCallback(
    (seconds = defaultSeconds) => {
      clear()
      setSecondsRemaining(seconds)
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clear()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    [clear, defaultSeconds],
  )

  const reset = useCallback(() => {
    clear()
    setSecondsRemaining(0)
  }, [clear])

  return { secondsRemaining, isCoolingDown: secondsRemaining > 0, start, reset }
}

export default useResendCooldown
