import { Children, isValidElement } from 'react'
import type { ReactNode } from 'react'
import type { ChildrenType } from '../types'
import HorizontalSubMenu from '../components/horizontal-menu/SubMenu'
import HorizontalMenuItem from '../components/horizontal-menu/MenuItem'
import HorizontalMenu from '../components/horizontal-menu/Menu'
import VerticalSubMenu from '../components/vertical-menu/SubMenu'
import VerticalMenuItem from '../components/vertical-menu/MenuItem'
import VerticalMenu from '../components/vertical-menu/Menu'

/*
 * Reason behind mapping the children of the horizontal-menu component to the vertical-menu component:
 * The Horizontal menu components will not work inside of Vertical menu on small screens.
 * So, we have to map the children of the horizontal-menu components to the vertical-menu components.
 * We also kept the same names and almost similar props for menuitem and submenu components for easy mapping.
 *
 * This lives in its own module (not menuUtils.tsx) so the menu item / submenu components can import the
 * pure helpers from menuUtils without creating a component <-> util require cycle.
 */
export const mapHorizontalToVerticalMenu = (children: ChildrenType['children']) => {
  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      // Type guard to safely access props
      const childProps = child.props as {
        children?: ReactNode
        verticalMenuProps?: Record<string, unknown>
        [key: string]: unknown
      }
      const { children, verticalMenuProps, ...rest } = childProps

      switch (child.type) {
        case HorizontalMenuItem:
          return <VerticalMenuItem {...rest}>{children}</VerticalMenuItem>
        case HorizontalSubMenu:
          return (
            <VerticalSubMenu {...(rest as Record<string, unknown> & { label: ReactNode })}>
              {mapHorizontalToVerticalMenu(children)}
            </VerticalSubMenu>
          )
        case HorizontalMenu:
          return (
            <VerticalMenu {...(verticalMenuProps || {})}>
              {mapHorizontalToVerticalMenu(children)}
            </VerticalMenu>
          )
        default:
          return child
      }
    }

    return null
  })
}
