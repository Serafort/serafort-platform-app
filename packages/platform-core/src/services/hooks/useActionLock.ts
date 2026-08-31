import { useCallback, useRef, useState, useEffect } from 'react'

export interface UseActionLockOptions {
  lockDurationMs?: number
}

export interface UseActionLockLegacyReturn {
  isLocked: boolean
  executeWithLock: <R>(action: () => Promise<R> | R) => Promise<R | undefined>
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Hook providing a short hardware/software debounce lock on async actions
 * to prevent duplicate API requests and UI state thrashing.
 */
export function useActionLock<T extends (...args: any[]) => Promise<any> | any>(
  action: T,
  options?: UseActionLockOptions,
): [T, boolean]
export function useActionLock(
  lockDurationMs?: number,
): UseActionLockLegacyReturn
export function useActionLock(
  actionOrDuration?: ((...args: any[]) => any) | number,
  options?: UseActionLockOptions,
): [any, boolean] | UseActionLockLegacyReturn {
  const [isLocked, setIsLocked] = useState(false)
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isExecutingRef = useRef(false)

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current)
      }
    }
  }, [])

  // If called with a duration number or no arguments, return legacy object format
  if (typeof actionOrDuration === 'number' || actionOrDuration === undefined) {
    const duration = typeof actionOrDuration === 'number' ? actionOrDuration : 100

    const executeWithLock = useCallback(
      async <R,>(action: () => Promise<R> | R): Promise<R | undefined> => {
        if (isExecutingRef.current || isLocked) {
          return undefined
        }
        isExecutingRef.current = true
        setIsLocked(true)
        try {
          return await action()
        } finally {
          isExecutingRef.current = false
          if (lockTimerRef.current) {
            clearTimeout(lockTimerRef.current)
          }
          lockTimerRef.current = setTimeout(() => {
            setIsLocked(false)
          }, duration)
        }
      },
      [isLocked, duration],
    )

    return { isLocked, executeWithLock, setIsLocked }
  }

  // Tuple signature: [execute, isLocked] = useActionLock(action, options)
  const action = actionOrDuration
  const lockDuration = options?.lockDurationMs ?? 100

  const execute = useCallback(
    async (...args: any[]): Promise<any> => {
      if (isExecutingRef.current || isLocked) {
        return undefined
      }

      isExecutingRef.current = true
      setIsLocked(true)

      try {
        const result = await action(...args)
        return result
      } finally {
        isExecutingRef.current = false
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current)
        }
        lockTimerRef.current = setTimeout(() => {
          setIsLocked(false)
        }, lockDuration)
      }
    },
    [action, isLocked, lockDuration],
  )

  return [execute, isLocked]
}

export default useActionLock
