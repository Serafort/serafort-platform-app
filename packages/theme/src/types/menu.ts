import { VerticalNavState } from '@cap/shared-types'
import { ReactNode, ReactElement, MutableRefObject } from 'react'
import { CSSObject } from '@mui/material/styles'

export type { VerticalNavState }

export type MenuSectionStyles = {
  root?: CSSObject
  label?: CSSObject
  prefix?: CSSObject
  suffix?: CSSObject
  icon?: CSSObject
}

export type OpenSubmenu = {
  level: number
  label: ReactNode
  active: boolean
  id: string
}

export interface MenuItemStylesParams {
  level: number
  disabled?: boolean
  active?: boolean
  isSubmenu?: boolean
  open?: boolean
}

export interface MenuItemStyles {
  root?: ((params: MenuItemStylesParams) => CSSObject) | CSSObject
  button?: ((params: MenuItemStylesParams) => CSSObject) | CSSObject
  icon?: ((params: MenuItemStylesParams) => CSSObject) | CSSObject
  label?: ((params: MenuItemStylesParams) => CSSObject) | CSSObject
  prefix?: CSSObject
  suffix?: CSSObject
  subMenuStyles?: CSSObject
  subMenuExpandIcon?: CSSObject
  subMenuContent?: ((params: MenuItemStylesParams) => CSSObject) | CSSObject
}

export interface RenderExpandIconParams {
  level: number
  active?: boolean
  open?: boolean
  disabled?: boolean
}

export type RenderExpandIcon = (params: RenderExpandIconParams) => ReactNode

export interface RenderExpandedMenuItemIcon {
  icon?:
    | ReactElement
    | ((params: { level?: number; active?: boolean; disabled?: boolean }) => ReactElement | null)
    | null
  level?: number
}

export type VerticalMenuContextProps = {
  browserScroll?: boolean
  triggerPopout?: 'hover' | 'click'
  transitionDuration?: number
  menuSectionStyles?: MenuSectionStyles
  menuItemStyles?: MenuItemStyles
  subMenuOpenBehavior?: 'accordion' | 'collapse'
  renderExpandIcon?: (params: RenderExpandIconParams) => ReactElement | ReactNode
  renderExpandedMenuItemIcon?: RenderExpandedMenuItemIcon
  collapsedMenuSectionLabel?: ReactNode
  popoutMenuOffset?: {
    mainAxis?: number | ((params: { level?: number }) => number)
    alignmentAxis?: number | ((params: { level?: number }) => number)
  }
  textTruncate?: boolean
  openSubmenu?: Array<OpenSubmenu>
  openSubmenusRef?: MutableRefObject<Array<OpenSubmenu>>
  toggleOpenSubmenu?: (
    ...submenus: {
      level: number
      label: ReactNode
      active?: boolean
      id: string
    }[]
  ) => void
}

export interface MenuProps extends VerticalMenuContextProps {
  children?: ReactNode
  className?: string
  rootStyles?: CSSObject
  popoutWhenCollapsed?: boolean
}
