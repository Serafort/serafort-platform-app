import React from 'react';
import { useLocation } from 'react-router-dom';
import classnames from 'classnames';
import { useUpdateEffect } from 'react-use';
import type { CSSObject } from '@emotion/styled';
import type { ChildrenType, RootStylesType } from '../../types';
import { HorizontalSubMenuContext } from '../../contexts/horizontalSubMenuContext';
import MenuButton from './MenuButton';
import { useHorizontalMenu } from '../../contexts/horizontalNavContext';
import { useVerticalNav } from '../../contexts/verticalNavContext';
import { renderMenuIcon } from '../../utils/menuUtils';
import { menuClasses } from '../../utils/menuClasses';
import StyledMenuLabel from '../../styles/StyledMenuLabel';
import StyledMenuPrefix from '../../styles/StyledMenuPrefix';
import StyledMenuSuffix from '../../styles/StyledMenuSuffix';
import StyledHorizontalMenuItem from '../../styles/horizontal/StyledHorizontalMenuItem';

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
  const [active, setActive] = React.useState<boolean>(false)

  // Hooks
  // const tree = useFloatingTree()
  const { toggleVerticalNav, isToggled } = useVerticalNav()
  const { getItemProps } = React.useContext(HorizontalSubMenuContext)
  const { menuItemStyles, renderExpandedMenuItemIcon, textTruncate } = useHorizontalMenu()

  const getMenuItemStyles = (
    element: 'root' | 'button' | 'icon' | 'label' | 'prefix' | 'suffix',
  ): CSSObject | undefined => {
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

  // Change active state when the url changes
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const restAny = rest as any
    const href =
      rest.href ||
      restAny.to ||
      (component &&
        typeof component !== 'string' &&
        React.isValidElement(component) &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((component.props as any).href || (component.props as any).to))

    if (href) {
      // Check if the current url matches any of the children urls
      if (pathname === href) {
        setActive(true)
      } else {
        setActive(false)
      }
    }
  }, [pathname, component, rest.href, rest])

  // Call the onActiveChange callback when the active state changes.
  useUpdateEffect(() => {
    onActiveChange?.(active)
  }, [active])

  return (
    <StyledHorizontalMenuItem
      ref={ref}
      className={classnames(
        { [menuClasses.menuItemRoot]: level === 0 },
        { [menuClasses.active]: active },
        { [menuClasses.disabled]: disabled },
        className,
      )}
      level={level}
      disabled={disabled}
      buttonStyles={getMenuItemStyles('button')}
      menuItemStyles={getMenuItemStyles('root')}
      rootStyles={rootStyles}
    >
      <MenuButton
        className={classnames(menuClasses.button, {
          [menuClasses.active]: active,
        })}
        component={component}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        {...getItemProps()}
        {...rest}
      >
        {/* Menu Item Icon */}
        {renderMenuIcon({
          icon,
          level,
          active,
          disabled,
          renderExpandedMenuItemIcon,
          styles: getMenuItemStyles('icon'),
        })}

        {/* Menu Item Prefix */}
        {prefix && (
          <StyledMenuPrefix
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
            $firstLevel={level === 0}
            className={menuClasses.suffix}
            $rootStyles={getMenuItemStyles('suffix')}
          >
            {suffix}
          </StyledMenuSuffix>
        )}
      </MenuButton>
    </StyledHorizontalMenuItem>
  )
}

export default React.forwardRef(MenuItem)
