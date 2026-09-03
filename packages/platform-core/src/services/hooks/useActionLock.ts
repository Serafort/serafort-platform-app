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
export function useActionLock(lockDurationMs?: number): UseActionLockLegacyReturn
export function useActionLock(
  actionOrDuration?: ((...args: any[]) => any) | number,
  options?: UseActionLockOptions,
): [any, boolean] | UseActionLockLegacyReturn {
  const [isLocked, setIsLocked] = useState(false)
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isExecutingRef = useRef(false)

  const isLegacy = typeof actionOrDuration === 'number' || actionOrDuration === undefined
  const legacyDuration = typeof actionOrDuration === 'number' ? actionOrDuration : 100
  const action = typeof actionOrDuration === 'function' ? actionOrDuration : undefined
  const lockDuration = options?.lockDurationMs ?? 100

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current)
      }
    }
  }, [])

  const executeWithLock = useCallback(
    async <R>(fn: () => Promise<R> | R): Promise<R | undefined> => {
      if (isExecutingRef.current || isLocked) {
        return undefined
      }
      isExecutingRef.current = true
      setIsLocked(true)
      try {
        return await fn()
      } finally {
        isExecutingRef.current = false
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current)
        }
        lockTimerRef.current = setTimeout(() => {
          setIsLocked(false)
        }, legacyDuration)
      }
    },
    [isLocked, legacyDuration],
  )

  const execute = useCallback(
    async (...args: any[]): Promise<any> => {
      if (isExecutingRef.current || isLocked || !action) {
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

  if (isLegacy) {
    return { isLocked, executeWithLock, setIsLocked }
  }

  return [execute, isLocked]
}

export default useActionLock
