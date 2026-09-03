import React from 'react'
import { useLocation } from 'react-router-dom'
import classnames from 'classnames'
import { useUpdateEffect } from 'react-use'
import type { CSSObject } from '@emotion/styled'
import type { ChildrenType, MenuItemElementKey, RootStylesType } from '../../types'
import MenuButton from './MenuButton'
import { useVerticalNav, useVerticalMenu } from '../../contexts/verticalNavContext'
import { renderMenuIcon } from '../../utils/menuUtils'
import { menuClasses } from '../../utils/menuClasses'
import StyledMenuLabel from '../../styles/StyledMenuLabel'
import StyledMenuPrefix from '../../styles/StyledMenuPrefix'
import StyledMenuSuffix from '../../styles/StyledMenuSuffix'
import StyledVerticalMenuItem from '../../styles/vertical/StyledVerticalMenuItem'
import Tooltip from '@mui/material/Tooltip'

export type MenuItemProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'prefix'> &
  RootStylesType &
  Partial<ChildrenType> & {
    icon?: React.ReactElement
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    disabled?: boolean
    target?: string
    rel?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component?: string | React.ReactElement | React.ComponentType<any>
    onActiveChange?: (active: boolean) => void

    /**
     * @ignore
     */
    level?: number

    // Allow arbitrary props to be passed through to custom components
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }

const MenuItem: React.ForwardRefRenderFunction<HTMLLIElement, MenuItemProps> = (props, ref) => {
  // Props
  const {
    children,
    icon,
    className,
    prefix,
    suffix,
    level = 0,
    disabled = false,
    component,
    onActiveChange,
    rootStyles,
    ...rest
  } = props
  const location = useLocation()
  const pathname = location.pathname

  // States
  const [active, setActive] = React.useState<boolean>(false)
  const { menuItemStyles, renderExpandedMenuItemIcon, textTruncate } = useVerticalMenu()

  const {
    isCollapsed,
    isHovered,
    isPopoutWhenCollapsed,
    toggleVerticalNav,
    isToggled,
    isBreakpointReached,
  } = useVerticalNav()

  // Get the styles for the specified element.
  const getMenuItemStyles = (element: MenuItemElementKey): CSSObject | undefined => {
    // If the menuItemStyles prop is provided, get the styles for the specified element.
    if (menuItemStyles) {
      // Define the parameters that are passed to the style functions.
      const params = { level, disabled, active, isSubmenu: false }

      // Get the style function for the specified element.
      const styleFunction = menuItemStyles[element]

      if (styleFunction) {
        // If the style function is a function, call it and return the result.
        // Otherwise, return the style function itself.
        return (typeof styleFunction === 'function' ? styleFunction(params) : styleFunction) as any
      }
    }
  }

  // Handle the click event.
  const handleClick = () => {
    if (isToggled) {
      toggleVerticalNav()
    }
  }

  const restAny = rest as any
  const targetHref =
    rest.href ||
    restAny.to ||
    (component && typeof component !== 'string' && (component as any).props?.href) ||
    (component && typeof component !== 'string' && (component as any).props?.to)

  // Change active state when the url changes
  React.useEffect(() => {
    if (targetHref) {
      // Check if the current url matches any of the children urls
      if (pathname === targetHref) {
        setActive(true)
      } else {
        setActive(false)
      }
    }
  }, [pathname, targetHref])

  // Call the onActiveChange callback when the active state changes.
  useUpdateEffect(() => {
    onActiveChange?.(active)
  }, [active])

  return (
    <StyledVerticalMenuItem
      ref={ref}
      className={classnames(
        menuClasses.menuItemRoot,
        { [menuClasses.disabled]: disabled },
        { [menuClasses.active]: active },
        className,
      )}
      $level={level}
      $isCollapsed={isCollapsed}
      $isPopoutWhenCollapsed={isPopoutWhenCollapsed}
      $disabled={disabled}
      $buttonStyles={getMenuItemStyles('button')}
      $menuItemStyles={getMenuItemStyles('root')}
      $rootStyles={rootStyles}
    >
      {isCollapsed && !isHovered && level === 0 && children ? (
        <Tooltip
          title={children as React.ReactElement}
          placement='right'
          arrow
          enterDelay={150}
          disableInteractive
        >
          <MenuButton
            className={classnames(menuClasses.button, {
              [menuClasses.active]: active,
            })}
            component={component}
            tabIndex={disabled ? -1 : 0}
            {...rest}
            onClick={(e) => {
              handleClick()
              if (rest.onClick) rest.onClick(e)
            }}
          >
            {/* Menu Item Icon */}
            {renderMenuIcon({
              icon,
              level,
              active,
              disabled,
              renderExpandedMenuItemIcon,
              styles: getMenuItemStyles('icon'),
              isBreakpointReached,
            })}

            {/* Menu Item Prefix */}
            {prefix && (
              <StyledMenuPrefix
                $isHovered={isHovered}
                $isCollapsed={isCollapsed}
                $firstLevel={level === 0}
                className={menuClasses.prefix}
                $rootStyles={getMenuItemStyles('prefix')}
              >
                {prefix}
              </StyledMenuPrefix>
            )}

            {/* Menu Item Label */}
            <StyledMenuLabel
              className={menuClasses.label}
              $rootStyles={getMenuItemStyles('label')}
              $textTruncate={textTruncate}
            >
              {children}
            </StyledMenuLabel>

            {/* Menu Item Suffix */}
            {suffix && (
              <StyledMenuSuffix
                $isHovered={isHovered}
                $isCollapsed={isCollapsed}
                $firstLevel={level === 0}
                className={menuClasses.suffix}
                $rootStyles={getMenuItemStyles('suffix')}
              >
                {suffix}
              </StyledMenuSuffix>
            )}
          </MenuButton>
        </Tooltip>
      ) : (
        <MenuButton
          className={classnames(menuClasses.button, {
            [menuClasses.active]: active,
          })}
          component={component}
          tabIndex={disabled ? -1 : 0}
          {...rest}
          onClick={(e) => {
            handleClick()
            if (rest.onClick) rest.onClick(e)
          }}
        >
          {/* Menu Item Icon */}
          {renderMenuIcon({
            icon,
            level,
            active,
            disabled,
            renderExpandedMenuItemIcon,
            styles: getMenuItemStyles('icon'),
            isBreakpointReached,
          })}

          {/* Menu Item Prefix */}
          {prefix && (
            <StyledMenuPrefix
              $isHovered={isHovered}
              $isCollapsed={isCollapsed}
              $firstLevel={level === 0}
              className={menuClasses.prefix}
              $rootStyles={getMenuItemStyles('prefix')}
            >
              {prefix}
            </StyledMenuPrefix>
          )}

          {/* Menu Item Label */}
          <StyledMenuLabel
            className={menuClasses.label}
            $rootStyles={getMenuItemStyles('label')}
            $textTruncate={textTruncate}
          >
            {children}
          </StyledMenuLabel>

          {/* Menu Item Suffix */}
          {suffix && (
            <StyledMenuSuffix
              $isHovered={isHovered}
              $isCollapsed={isCollapsed}
              $firstLevel={level === 0}
              className={menuClasses.suffix}
              $rootStyles={getMenuItemStyles('suffix')}
            >
              {suffix}
            </StyledMenuSuffix>
          )}
        </MenuButton>
      )}
    </StyledVerticalMenuItem>
  )
}

export default React.forwardRef(MenuItem)
