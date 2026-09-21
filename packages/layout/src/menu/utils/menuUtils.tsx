import { isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { CSSObject } from '@emotion/styled'
import type { ChildrenType, RenderExpandedMenuItemIcon } from '../types'
import { menuClasses } from './menuClasses'
import StyledMenuIcon from '../styles/StyledMenuIcon'

// NOTE: `mapHorizontalToVerticalMenu` was moved to ./mapHorizontalToVerticalMenu.
// It is the only helper here that needs the menu components, and keeping it in
// this file created a component <-> util require cycle (the components import the
// pure helpers below). Import it directly from ./mapHorizontalToVerticalMenu.

type RenderMenuIconParams = {
  level?: number
  active?: boolean
  disabled?: boolean
  styles?: CSSObject
  icon?: ReactElement
  renderExpandedMenuItemIcon?: RenderExpandedMenuItemIcon
  isBreakpointReached?: boolean
}

export const confirmUrlInChildren = (children: ChildrenType['children'], url: string): boolean => {
  if (!children) {
    return false
  }

  if (Array.isArray(children)) {
    return children.some((child: ReactNode) => confirmUrlInChildren(child, url))
  }

  if (isValidElement(children)) {
    // Type guard to safely access props
    const childProps = children.props as {
      component?: unknown
      href?: string
      to?: string
      children?: ReactNode
    }
    const { component, href, to, children: subChildren } = childProps

    if (component && typeof component !== 'string' && isValidElement(component)) {
      // `component` is typically a React Router `<Link to="...">` (see
      // MenuItem's own `component={item.path ? <Link to={item.path} /> : 'div'}`),
      // which carries `to`, not `href` - check both so active-route detection
      // (auto-opening a SubMenu, or a CollapsibleMenuSection, that contains
      // the current page) actually matches real nav items, not just ones
      // built from a bare `href` prop.
      const componentProps = component.props as { href?: string; to?: string }
      if (componentProps.href) {
        return componentProps.href === url
      }
      if (componentProps.to) {
        return componentProps.to === url
      }
    }

    if (href) {
      return href === url
    }

    if (to) {
      return to === url
    }

    if (subChildren) {
      return confirmUrlInChildren(subChildren, url)
    }
  }

  return false
}

/*
 * Render all the icons for Menu Item and SubMenu components for all the levels more than 0
 */
export const renderMenuIcon = (params: RenderMenuIconParams) => {
  const { icon, level, active, disabled, styles, renderExpandedMenuItemIcon, isBreakpointReached } =
    params

  if (icon && (level === 0 || (!isBreakpointReached && level && level > 0))) {
    return (
      <StyledMenuIcon className={menuClasses.icon} $rootStyles={styles}>
        {icon}
      </StyledMenuIcon>
    )
  }

  if (
    level &&
    level !== 0 &&
    renderExpandedMenuItemIcon &&
    renderExpandedMenuItemIcon.icon !== null &&
    (!renderExpandedMenuItemIcon.level || renderExpandedMenuItemIcon.level >= level)
  ) {
    const iconToRender =
      typeof renderExpandedMenuItemIcon.icon === 'function'
        ? renderExpandedMenuItemIcon.icon({ level, active, disabled })
        : renderExpandedMenuItemIcon.icon

    if (iconToRender) {
      return (
        <StyledMenuIcon className={menuClasses.icon} $rootStyles={styles}>
          {iconToRender}
        </StyledMenuIcon>
      )
    }
  }

  return null
}
