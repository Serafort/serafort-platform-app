import React from 'react'
import {
  useHorizontalNavStore as useZustandHorizontalNav,
  useVerticalNavStore as useZustandVerticalNav,
} from '@cap/platform-store'
import { HorizontalMenuContext, type HorizontalMenuContextProps } from './horizontalMenuContext'
import { VerticalMenuContext, type VerticalMenuContextProps } from './verticalMenuContext'

export interface HorizontalNavState {
  isBreakpointReached?: boolean
}

export interface HorizontalNavContextProps extends HorizontalNavState {
  updateIsBreakpointReached: (isBreakpointReached: boolean) => void
}

export const HorizontalNavContext = React.createContext<HorizontalNavContextProps | null>(null)

export const useHorizontalNav = (): HorizontalNavContextProps => {
  return useZustandHorizontalNav()
}

export const useHorizontalMenu = (): HorizontalMenuContextProps => {
  const context = React.useContext(HorizontalMenuContext)

  if (!context) {
    throw new Error('useHorizontalMenu must be used within a HorizontalMenuContext.Provider')
  }

  return context
}

export interface VerticalNavState {
  width?: number
  collapsedWidth?: number
  isCollapsed?: boolean
  isHovered?: boolean
  isToggled?: boolean
  isScrollWithContent?: boolean
  isBreakpointReached?: boolean
  isPopoutWhenCollapsed?: boolean
  collapsing?: boolean
  expanding?: boolean
  transitionDuration?: number
}

export interface VerticalNavContextProps extends VerticalNavState {
  updateVerticalNavState: (values: Partial<VerticalNavState>) => void
  collapseVerticalNav: (value?: boolean) => void
  hoverVerticalNav: (value?: boolean) => void
  toggleVerticalNav: (value?: boolean) => void
}

export const VerticalNavContext = React.createContext<VerticalNavContextProps | null>(null)

export const useVerticalNav = (): VerticalNavContextProps => {
  return useZustandVerticalNav()
}

export const useVerticalMenu = (): VerticalMenuContextProps => {
  const context = React.useContext(VerticalMenuContext)

  if (!context) {
    throw new Error('useVerticalMenu must be used within a VerticalMenuContext.Provider')
  }

  return context
}
