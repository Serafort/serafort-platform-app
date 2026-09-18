// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResendCooldown } from './useResendCooldown'

describe('useResendCooldown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts idle', () => {
    const { result } = renderHook(() => useResendCooldown(60))
    expect(result.current.secondsRemaining).toBe(0)
    expect(result.current.isCoolingDown).toBe(false)
  })

  it('counts down to zero and stops', () => {
    const { result } = renderHook(() => useResendCooldown(3))

    act(() => result.current.start())
    expect(result.current.secondsRemaining).toBe(3)
    expect(result.current.isCoolingDown).toBe(true)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.secondsRemaining).toBe(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.secondsRemaining).toBe(0)
    expect(result.current.isCoolingDown).toBe(false)

    // The interval must not keep firing past zero.
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.secondsRemaining).toBe(0)
  })

  it('accepts a per-call duration', () => {
    const { result } = renderHook(() => useResendCooldown(60))
    act(() => result.current.start(10))
    expect(result.current.secondsRemaining).toBe(10)
  })

  it('restarts cleanly instead of stacking intervals', () => {
    const { result } = renderHook(() => useResendCooldown(5))

    act(() => result.current.start())
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.secondsRemaining).toBe(3)

    act(() => result.current.start())
    expect(result.current.secondsRemaining).toBe(5)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    // A stacked interval would have decremented twice here.
    expect(result.current.secondsRemaining).toBe(4)
  })

  it('reset returns to idle immediately', () => {
    const { result } = renderHook(() => useResendCooldown(30))
    act(() => result.current.start())
    act(() => result.current.reset())
    expect(result.current.secondsRemaining).toBe(0)
  })

  it('clears its interval on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval')
    const { result, unmount } = renderHook(() => useResendCooldown(30))
    act(() => result.current.start())
    unmount()
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })
})
