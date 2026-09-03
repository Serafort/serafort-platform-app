import React from 'react'
import type {
  MenuSectionStyles,
  OpenSubmenu,
  VerticalMenuContextProps,
} from '@cap/theme'

export type { MenuSectionStyles, OpenSubmenu, VerticalMenuContextProps }

export const VerticalMenuContext = React.createContext({} as VerticalMenuContextProps)
