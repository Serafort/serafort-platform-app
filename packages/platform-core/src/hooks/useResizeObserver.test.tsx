import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRef } from 'react'
import { useResizeObserver } from './useResizeObserver'

describe('useResizeObserver', () => {
  let triggerResize: (entries: any[]) => void

  beforeEach(() => {
    vi.useFakeTimers()
    global.ResizeObserver = class MockResizeObserver {
      cb: (entries: any[]) => void
      constructor(cb: (entries: any[]) => void) {
        this.cb = cb
        triggerResize = cb
      }
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    } as any
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── Initial state ────────────────────────────────────────────────────────

  it('returns initial dimensions and "xs" containerSize when ref is unattached', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null)
      return useResizeObserver(ref, { initialSize: { width: 100, height: 50 } })
    })

    expect(result.current.width).toBe(100)
    expect(result.current.height).toBe(50)
    expect(result.current.containerSize).toBe('xs') // 100 < 480 → xs
    expect(result.current.entry).toBeNull()
  })

  it('derives containerSize "md" from initialSize width of 800', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null)
      return useResizeObserver(ref, { initialSize: { width: 800, height: 0 } })
    })
    expect(result.current.containerSize).toBe('md') // 800 >= 768 → md
  })

  // ─── Resize updates ───────────────────────────────────────────────────────

  it('updates width, height and containerSize when ResizeObserver emits', () => {
    const dummyElement = document.createElement('div')
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(dummyElement)
      return useResizeObserver(ref)
    })

    const fakeEntry = {
      target: dummyElement,
      contentRect: { width: 350, height: 200 },
    }

    act(() => {
      triggerResize([fakeEntry])
    })

    expect(result.current.width).toBe(350)
    expect(result.current.height).toBe(200)
    expect(result.current.containerSize).toBe('xs') // 350 < 480
    expect(result.current.entry).toBe(fakeEntry as any)
  })

  it('derives "lg" containerSize for width >= 1024', () => {
    const dummyElement = document.createElement('div')
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(dummyElement)
      return useResizeObserver(ref)
    })

    act(() => {
      triggerResize([{ target: dummyElement, contentRect: { width: 1100, height: 600 } }])
    })

    expect(result.current.containerSize).toBe('lg') // 1100 >= 1024
  })

  // ─── Debounce ─────────────────────────────────────────────────────────────

  it('supports debounced updates', () => {
    const dummyElement = document.createElement('div')
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(dummyElement)
      return useResizeObserver(ref, { debounce: 200 })
    })

    act(() => {
      triggerResize([{ target: dummyElement, contentRect: { width: 500, height: 400 } }])
    })

    // Before timer fires, dimensions unchanged
    expect(result.current.width).toBe(0)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.width).toBe(500)
    expect(result.current.height).toBe(400)
  })

  // ─── Disabled option ──────────────────────────────────────────────────────

  it('does not observe element when disabled option is true', () => {
    const dummyElement = document.createElement('div')
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(dummyElement)
      return useResizeObserver(ref, { disabled: true })
    })
    expect(result.current.width).toBe(0)
  })

  // ─── Imperative callback (onResize) ───────────────────────────────────────

  it('calls onResize callback without triggering state update', () => {
    const dummyElement = document.createElement('div')
    const onResize = vi.fn()

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(dummyElement)
      return useResizeObserver(ref, { onResize })
    })

    act(() => {
      triggerResize([{ target: dummyElement, contentRect: { width: 900, height: 500 } }])
    })

    // onResize callback was called
    expect(onResize).toHaveBeenCalledTimes(1)
    // State should NOT have updated (callback mode bypasses state)
    expect(result.current.width).toBe(0)
  })

  // ─── Custom breakpoints ───────────────────────────────────────────────────

  it('applies custom breakpoints to derive containerSize', () => {
    const dummyElement = document.createElement('div')
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(dummyElement)
      return useResizeObserver(ref, {
        breakpoints: { xs: 0, sm: 200, md: 400, lg: 600, xl: 800 },
      })
    })

    act(() => {
      triggerResize([{ target: dummyElement, contentRect: { width: 450, height: 0 } }])
    })

    // 450 >= 400 (custom md) → 'md'
    expect(result.current.containerSize).toBe('md')
  })
})

