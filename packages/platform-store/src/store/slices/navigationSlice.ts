import type { StateCreator } from 'zustand'
import type { AppStore } from '../../types'
import type { NavItemConfig } from '@cap/shared-types/module'

import { VerticalNavState, HorizontalNavState } from '@cap/shared-types'

export interface NavigationSlice {
  verticalNav: VerticalNavState
  updateVerticalNavState: (values: Partial<VerticalNavState>) => void
  collapseVerticalNav: (value?: boolean) => void
  hoverVerticalNav: (value?: boolean) => void
  toggleVerticalNav: (value?: boolean) => void

  horizontalNav: HorizontalNavState
  updateIsBreakpointReached: (isBreakpointReached: boolean) => void

  navItems: NavItemConfig[]
  registerModuleNavigation: (items: NavItemConfig[]) => void
  clearNavigation: () => void
}

export const createNavigationSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  NavigationSlice
> = (set) => ({
  verticalNav: {},

  updateVerticalNavState: (values: Partial<VerticalNavState>) => {
    set((state) => ({
      verticalNav: {
        ...state.verticalNav,
        ...values,
        collapsing: values.isCollapsed === true,
        expanding: values.isCollapsed === false,
      },
    }))
  },

  collapseVerticalNav: (value?: boolean) => {
    set((state) => ({
      verticalNav: {
        ...state.verticalNav,
        isHovered: value !== undefined && false,
        isCollapsed: value !== undefined ? Boolean(value) : !state.verticalNav.isCollapsed,
        collapsing: value === true,
        expanding: value !== true,
      },
    }))
  },

  hoverVerticalNav: (value?: boolean) => {
    set((state) => ({
      verticalNav: {
        ...state.verticalNav,
        isHovered: value !== undefined ? Boolean(value) : !state.verticalNav.isHovered,
      },
    }))
  },

  toggleVerticalNav: (value?: boolean) => {
    set((state) => ({
      verticalNav: {
        ...state.verticalNav,
        isToggled: value !== undefined ? Boolean(value) : !state.verticalNav.isToggled,
      },
    }))
  },

  horizontalNav: {
    isBreakpointReached: false,
  },

  updateIsBreakpointReached: (isBreakpointReached: boolean) => {
    set((state) => ({
      horizontalNav: {
        ...state.horizontalNav,
        isBreakpointReached,
      },
    }))
  },

  navItems: [],
  registerModuleNavigation: (items: NavItemConfig[]) => {
    set((state) => {
      items.forEach((item) => {
        const existingIndex = state.navItems.findIndex(
          (existing) => (item.id && existing.id === item.id) || (item.path && existing.path === item.path)
        )
        if (existingIndex >= 0) {
          state.navItems[existingIndex] = { ...state.navItems[existingIndex], ...item }
        } else {
          state.navItems.push(item)
        }
      })
    })
  },
  clearNavigation: () => {
    set((state) => {
      state.navItems = []
    })
  },
})
