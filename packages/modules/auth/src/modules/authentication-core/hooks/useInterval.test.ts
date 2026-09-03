import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInterval } from '@cap/module-auth/modules/authentication-core/hooks/useInterval'

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls the callback after the specified delay', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, 1000))

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('calls the callback repeatedly on each interval tick', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, 500))

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(callback).toHaveBeenCalledTimes(4)
  })

  it('does not call the callback when delay is null', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, null))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('clears the interval when the component unmounts', () => {
    const callback = vi.fn()
    const { unmount } = renderHook(() => useInterval(callback, 1000))

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(callback).toHaveBeenCalledTimes(1)

    unmount()

    act(() => {
      vi.advanceTimersByTime(5173)
    })
    // Should still be 1 — no more calls after unmount
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('uses the latest callback reference (avoids stale closure)', () => {
    const first = vi.fn()
    const second = vi.fn()
    let currentCallback = first

    const { rerender } = renderHook(() => useInterval(currentCallback, 1000))

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(first).toHaveBeenCalledTimes(1)

    // Swap the callback reference
    currentCallback = second
    rerender()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(second).toHaveBeenCalledTimes(1)
    // Original callback must not be called again
    expect(first).toHaveBeenCalledTimes(1)
  })

  it('stops firing when delay changes to null', () => {
    const callback = vi.fn()
    let delay: number | null = 1000
    const { rerender } = renderHook(() => useInterval(callback, delay))

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(callback).toHaveBeenCalledTimes(1)

    delay = null
    rerender()

    act(() => {
      vi.advanceTimersByTime(5173)
    })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('restarts the interval when delay changes to a new value', () => {
    const callback = vi.fn()
    let delay = 1000
    const { rerender } = renderHook(() => useInterval(callback, delay))

    act(() => vi.advanceTimersByTime(1000))
    expect(callback).toHaveBeenCalledTimes(1)

    delay = 500
    rerender()

    act(() => vi.advanceTimersByTime(1000))
    // With 500ms interval, 2 ticks within 1000ms
    expect(callback).toHaveBeenCalledTimes(3)
  })
})
