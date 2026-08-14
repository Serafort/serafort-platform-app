import React, { createContext, useContext } from 'react'
import type { ElementSize, ContainerSize } from '../hooks/useResizeObserver'

// ─── Context ──────────────────────────────────────────────────────────────────

const INITIAL_SIZE: ElementSize = {
  width: 0,
  height: 0,
  containerSize: 'md',
  entry: null,
}

/**
 * Context that carries the measured container size downward through the React tree.
 * Intended to be provided by WidgetWrapper (or any other measured container) so that
 * deeply nested widget sub-components can introspect their host container dimensions
 * without prop drilling.
 */
export const ContainerSizeContext = createContext<ElementSize>(INITIAL_SIZE)

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface ContainerSizeProviderProps {
  size: ElementSize
  children: React.ReactNode
}

/**
 * Wrap measured containers with this provider to make their dimensions available
 * to any child component via `useContainerSize()`.
 *
 * @example
 * const size = useResizeObserver(containerRef)
 * return (
 *   <ContainerSizeProvider size={size}>
 *     <WidgetComponent />
 *   </ContainerSizeProvider>
 * )
 */
export const ContainerSizeProvider: React.FC<ContainerSizeProviderProps> = ({ size, children }) => (
  <ContainerSizeContext.Provider value={size}>{children}</ContainerSizeContext.Provider>
)

// ─── Consumer Hook ────────────────────────────────────────────────────────────

/**
 * Read the nearest ancestor container's measured size.
 * Returns { width, height, containerSize, entry }.
 *
 * @example
 * const { containerSize, width } = useContainerSize()
 * return containerSize === 'xs' ? <CompactView /> : <FullView />
 */
export function useContainerSize(): ElementSize {
  return useContext(ContainerSizeContext)
}

/**
 * Read just the container size enum from the nearest ancestor container.
 * Useful for conditional rendering without depending on pixel values.
 *
 * @example
 * const containerSize = useContainerSizeClass()
 * // containerSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 */
export function useContainerSizeClass(): ContainerSize {
  return useContext(ContainerSizeContext).containerSize
}
