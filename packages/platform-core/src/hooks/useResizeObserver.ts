import { useState, useLayoutEffect, useEffect, useRef } from 'react'
import { observeElement } from '../utils/resizeObserver'
import type { ResizeBoxSizing, ObserveOptions } from '../utils/resizeObserver'

// ─── Container Size Breakpoints ──────────────────────────────────────────────

/**
 * Named container size derived from container width — mirrors MUI breakpoint names.
 * Uses common dashboard breakpoints suitable for widget containers.
 */
export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ContainerBreakpoints {
  xs: number  // 0–default
  sm: number  // >= sm
  md: number  // >= md
  lg: number  // >= lg
  xl: number  // >= xl
}

const DEFAULT_BREAKPOINTS: ContainerBreakpoints = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
}

function deriveContainerSize(width: number, breakpoints: ContainerBreakpoints): ContainerSize {
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ElementSize {
  width: number
  height: number
  /** Named size derived from container width using configurable breakpoints. */
  containerSize: ContainerSize
  entry: ResizeObserverEntry | null
}

export interface UseResizeObserverOptions {
  /** Optional debounce delay in milliseconds before updating size state */
  debounce?: number
  /** Set to true to temporarily disable observation */
  disabled?: boolean
  /** Initial dimensions before first observer callback */
  initialSize?: { width: number; height: number }
  /** Custom container breakpoints (overrides defaults) */
  breakpoints?: Partial<ContainerBreakpoints>
  /** Which box model to observe. Defaults to 'content-box'. */
  box?: ResizeBoxSizing
  /** If true, inject CSS custom properties (--container-width, --container-height) onto the element. Defaults to true. */
  injectCssVars?: boolean
  /**
   * Imperative callback mode — fires on every resize without triggering React state updates.
   * Use for high-frequency cases (canvas drawing, animation) where re-renders are too expensive.
   */
  onResize?: (entry: ResizeObserverEntry) => void
}

// ─── Isomorphic Layout Effect ─────────────────────────────────────────────────

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Custom React hook to observe element dimensions responsive to container changes.
 * Uses a singleton ResizeObserver under the hood for maximum performance.
 *
 * Features:
 * - Returns { width, height, containerSize, entry } state
 * - ContainerSize breakpoints customizable per instance
 * - Optional debounce for smooth resizing
 * - Imperative `onResize` callback mode for zero-re-render scenarios
 * - Automatic CSS custom property injection (--container-width, --container-height)
 * - border-box / content-box / device-pixel-content-box support
 *
 * @param ref React RefObject pointing to target HTMLElement
 * @param options Configuration options
 * @returns ElementSize object containing width, height, containerSize, and raw ResizeObserverEntry
 */
export function useResizeObserver<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  options: UseResizeObserverOptions = {}
): ElementSize {
  const {
    debounce = 0,
    disabled = false,
    initialSize = { width: 0, height: 0 },
    breakpoints: customBreakpoints,
    box,
    injectCssVars,
    onResize,
  } = options

  const resolvedBreakpoints: ContainerBreakpoints = {
    ...DEFAULT_BREAKPOINTS,
    ...customBreakpoints,
  }

  const [size, setSize] = useState<ElementSize>({
    width: initialSize.width,
    height: initialSize.height,
    containerSize: deriveContainerSize(initialSize.width, resolvedBreakpoints),
    entry: null,
  })

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (!element || disabled) {
      return
    }

    const handleResize = (entry: ResizeObserverEntry) => {
      // Imperative callback mode — fires without state update
      if (onResizeRef.current) {
        onResizeRef.current(entry)
        return
      }

      const { width, height } = entry.contentRect
      const nextContainerSize = deriveContainerSize(width, resolvedBreakpoints)

      const updateState = () => {
        setSize((prev) => {
          if (
            prev.width === width &&
            prev.height === height &&
            prev.containerSize === nextContainerSize &&
            prev.entry === entry
          ) {
            return prev
          }
          return { width, height, containerSize: nextContainerSize, entry }
        })
      }

      if (debounce > 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(updateState, debounce)
      } else {
        updateState()
      }
    }

    const observeOptions: ObserveOptions = {}
    if (box !== undefined) observeOptions.box = box
    if (injectCssVars !== undefined) observeOptions.injectCssVars = injectCssVars

    const cleanup = observeElement(element, handleResize, observeOptions)

    return () => {
      cleanup()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, disabled, debounce, box, injectCssVars])

  return size
}
