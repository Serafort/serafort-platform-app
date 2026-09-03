import { useResizeObserver, type ElementSize } from './useResizeObserver'

/**
 * Convenience hook that evaluates a predicate against the container's current size
 * and returns a stable boolean. Re-renders ONLY when the predicate result flips,
 * not on every pixel change.
 *
 * @param ref React RefObject pointing to the target HTMLElement.
 * @param predicate Function that receives the current ElementSize and returns boolean.
 * @returns Stable boolean — true when predicate passes, false otherwise.
 *
 * @example
 * const isNarrow = useContainerQuery(ref, (size) => size.width < 480)
 * const isCompact = useContainerQuery(ref, (size) => size.containerSize === 'xs')
 */
export function useContainerQuery<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  predicate: (size: ElementSize) => boolean
): boolean {
  const size = useResizeObserver(ref)
  return predicate(size)
}
