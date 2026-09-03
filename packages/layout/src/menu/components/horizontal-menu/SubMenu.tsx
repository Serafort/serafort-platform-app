import React from 'react'
import { useLocation } from 'react-router-dom'
import styled from '@emotion/styled'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useRole,
  useInteractions,
  useClick,
  safePolygon,
  useDismiss,
  useFloatingNodeId,
  FloatingNode,
  FloatingPortal,
  useMergeRefs,
  useFloatingParentNodeId,
  useFloatingTree,
  useTransitionStyles,
} from '@floating-ui/react'
import classnames from 'classnames'
import type { CSSObject } from '@emotion/styled'
import type { ChildrenType, RootStylesType, SubMenuItemElement } from '../../types'
import type { MenuItemProps } from './MenuItem'
import SubMenuContent from './SubMenuContent'
import { useHorizontalMenu } from '../../contexts/horizontalNavContext'
import { menuClasses } from '../../utils/menuClasses'
import { confirmUrlInChildren, renderMenuIcon } from '../../utils/menuUtils'
import MenuButton from './MenuButton'
import { menuButtonStyles } from '../../styles/horizontal/menuButtonStyles'
import StyledMenuLabel from '../../styles/StyledMenuLabel'
import StyledMenuPrefix from '../../styles/StyledMenuPrefix'
import StyledMenuSuffix from '../../styles/StyledMenuSuffix'
import StyledHorizontalNavExpandIcon, {
  StyledHorizontalNavExpandIconWrapper,
} from '../../styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledSubMenuContentWrapper from '../../styles/horizontal/StyledHorizontalSubMenuContentWrapper'
import ChevronRight from '../../svg/ChevronRight'

import { menuTokens } from '@cap/theme'

export type SubMenuProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'prefix'> &
  RootStylesType &
  Partial<ChildrenType> & {
    label: React.ReactNode
    icon?: React.ReactElement
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    disabled?: boolean
    component?: string | React.ReactElement
    contentClassName?: string
    onOpenChange?: (open: boolean) => void

    /**
     * @ignore
     */
    level?: number
  }

type StyledSubMenuProps = Pick<SubMenuProps, 'rootStyles' | 'disabled'> & {
  level: number
  active?: boolean
  menuItemStyles?: CSSObject
  buttonStyles?: CSSObject
}

const StyledSubMenu = styled.li<StyledSubMenuProps>`
  ${({ level }) =>
    level === 0 && {
      borderRadius: `${menuTokens.horizontal.item.borderRadius}px`,
      overflow: 'hidden',
    }}

  &.${menuClasses.open} > .${menuClasses.button} {
    background-color: ${menuTokens.horizontal.button.openBg};
  }

  ${({ menuItemStyles }) => menuItemStyles};
  ${({ rootStyles }) => rootStyles};

  > .${menuClasses.button} {
    ${({ level, disabled, children }) =>
    menuButtonStyles({
      level,
      disabled,
      children,
    })};
    ${({ buttonStyles }) => buttonStyles};
  }
`

import { HorizontalSubMenuContext } from '../../contexts/horizontalSubMenuContext'

const SubMenu: React.ForwardRefRenderFunction<HTMLLIElement, SubMenuProps> = (props, ref) => {
  // Props
  const {
    children,
    className,
    contentClassName,
    label,
    icon,
    title,
    prefix,
    suffix,
    level = 0,
    disabled = false,
    rootStyles,
    component,
    onClick,
    onKeyUp,
    onOpenChange,
    ...rest
  } = props

  const location = useLocation()
  const pathname = location.pathname
  const [open, setOpen] = React.useState<boolean>(false)
  const [active, setActive] = React.useState<boolean>(false)
  const [direction, setDirection] = React.useState<'ltr' | 'rtl'>('ltr')
  const tree = useFloatingTree()
  const nodeId = useFloatingNodeId()
  const parentId = useFloatingParentNodeId()

  const {
    triggerPopout,
    renderExpandIcon,
    menuItemStyles,
    browserScroll,
    transitionDuration,
    renderExpandedMenuItemIcon,
    popoutMenuOffset,
    textTruncate,
  } = useHorizontalMenu()

  const childNodes = React.Children.toArray(children).filter(Boolean) as [
    React.ReactElement<SubMenuProps | MenuItemProps>,
  ]

  const mainAxisOffset =
    popoutMenuOffset &&
    popoutMenuOffset.mainAxis &&
    (typeof popoutMenuOffset.mainAxis === 'function'
      ? popoutMenuOffset.mainAxis({ level })
      : popoutMenuOffset.mainAxis)

  const alignmentAxisOffset =
    popoutMenuOffset &&
    popoutMenuOffset.alignmentAxis &&
    (typeof popoutMenuOffset.alignmentAxis === 'function'
      ? popoutMenuOffset.alignmentAxis({ level })
      : popoutMenuOffset.alignmentAxis)

  React.useEffect(() => {
    setDirection(
      window.getComputedStyle(document.documentElement).getPropertyValue('direction') as
      | 'ltr'
      | 'rtl',
    )
  }, [])

  const {
    y,
    refs: { setReference, setFloating },
    floatingStyles,
    context,
  } = useFloating({
    open,
    nodeId,
    onOpenChange: setOpen,
    placement: level > 0 ? (direction !== 'rtl' ? 'right-start' : 'left-start') : 'bottom-start',
    middleware: [
      offset({
        mainAxis: mainAxisOffset,
        alignmentAxis: alignmentAxisOffset,
      }),
      flip({ crossAxis: false }),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  })

  // Floating UI Transition Styles
  const { isMounted, styles } = useTransitionStyles(context, {
    // Configure both open and close durations:
    duration: transitionDuration,

    initial: {
      opacity: menuTokens.horizontal.popoutTransition.initialOpacity,
      transform: `translateY(${menuTokens.horizontal.popoutTransition.offsetY})`,
    },
    open: {
      opacity: menuTokens.horizontal.popoutTransition.openOpacity,
      transform: 'translateY(0px)',
    },
    close: {
      opacity: menuTokens.horizontal.popoutTransition.initialOpacity,
      transform: `translateY(${menuTokens.horizontal.popoutTransition.offsetY})`,
    },
  })

  const hover = useHover(context, {
    handleClose: safePolygon({
      blockPointerEvents: true,
    }), // safePolygon function allows us to reach to submenu
    restMs: 25, // Only opens submenu when cursor rests for 25ms on a menu
    enabled: triggerPopout === 'hover', // Only enable hover effect when triggerPopout option is set to 'hover',
    delay: { open: 75 }, // Delay opening submenu by 75ms
  })

  const click = useClick(context, {
    enabled: triggerPopout === 'click', // Only enable click effect when triggerPopout option is set to 'click'
    toggle: false,
  })

  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'menu' })

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    hover,
    click,
    dismiss,
    role,
  ])

  const handleOnClick = (event: React.MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
    onClick?.(event)
    if (triggerPopout === 'click') setOpen(!open)
  }

  const handleOnKeyUp = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    onKeyUp?.(event)

    if (event.key === 'Enter') {
      setOpen(!open)
    }
  }

  const getSubMenuItemStyles = (element: SubMenuItemElement): CSSObject | undefined => {
    // If the menuItemStyles prop is provided, get the styles for the specified element.
    if (menuItemStyles) {
      // Define the parameters that are passed to the style functions.
      const params = { level, disabled, active, isSubmenu: true, open: open }

      // Get the style function for the specified element.
      const styleFunction = menuItemStyles[element]

      if (styleFunction) {
        // If the style function is a function, call it and return the result.
        // Otherwise, return the style function itself.
        return (typeof styleFunction === 'function' ? styleFunction(params) : styleFunction) as any
      }
    }
  }

  // Event emitter allows you to communicate across tree components.
  // This effect closes all menus when an item gets clicked anywhere in the tree.
  React.useEffect(() => {
    const handleTreeClick = () => {
      setOpen(false)
    }

    const onSubMenuOpen = (event: { nodeId: string; parentId: string }) => {
      if (event.nodeId !== nodeId && event.parentId === parentId) {
        setOpen(false)
      }
    }

    tree?.events.on('click', handleTreeClick)
    tree?.events.on('menuopen', onSubMenuOpen)

    return () => {
      tree?.events.off('click', handleTreeClick)
      tree?.events.off('menuopen', onSubMenuOpen)
    }
  }, [tree, nodeId, parentId])

  React.useEffect(() => {
    if (open) {
      tree?.events.emit('menuopen', {
        parentId,
        nodeId,
      })
    }
  }, [tree, open, nodeId, parentId])

  // Change active state when the url changes
  React.useEffect(() => {
    // Check if the current url matches any of the children urls
    if (confirmUrlInChildren(children, pathname)) {
      setActive(true)
    } else {
      setActive(false)
    }
  }, [children, pathname])

  // User event handler for open state change
  React.useEffect(() => {
    onOpenChange?.(open)
  }, [onOpenChange, open])

  // Merge the reference ref with the ref passed to the component
  const referenceRef = useMergeRefs([setReference, ref])

  return (
    <FloatingNode id={nodeId}>
      {/* Sub Menu */}
      <StyledSubMenu
        {...(!disabled && { ref: referenceRef, ...getReferenceProps() })}
        className={classnames(
          { [menuClasses.subMenuRoot]: level === 0 },
          { [menuClasses.active]: active },
          { [menuClasses.disabled]: disabled },
          { [menuClasses.open]: open },
          className,
        )}
        menuItemStyles={getSubMenuItemStyles('root')}
        level={level}
        disabled={disabled}
        active={active}
        buttonStyles={getSubMenuItemStyles('button')}
        rootStyles={rootStyles}
      >
        {/* Sub Menu */}
        <MenuButton
          title={title}
          className={classnames(menuClasses.button, {
            [menuClasses.active]: active,
          })}
          component={component}
          onClick={handleOnClick}
          onKeyUp={handleOnKeyUp}
          {...rest}
        >
          {/* Sub Menu Icon */}
          {renderMenuIcon({
            icon,
            level,
            active,
            disabled,
            renderExpandedMenuItemIcon,
            styles: getSubMenuItemStyles('icon'),
          })}

          {/* Sub Menu Prefix */}
          {prefix && (
            <StyledMenuPrefix
              $firstLevel={level === 0}
              className={menuClasses.prefix}
              $rootStyles={getSubMenuItemStyles('prefix')}
            >
              {prefix}
            </StyledMenuPrefix>
          )}

          {/* Sub Menu Label */}
          <StyledMenuLabel
            className={menuClasses.label}
            $rootStyles={getSubMenuItemStyles('label')}
            $textTruncate={textTruncate}
          >
            {label}
          </StyledMenuLabel>

          {/* Sub Menu Suffix */}
          {suffix && (
            <StyledMenuSuffix
              $firstLevel={level === 0}
              className={menuClasses.suffix}
              $rootStyles={getSubMenuItemStyles('suffix')}
            >
              {suffix}
            </StyledMenuSuffix>
          )}

          {/* Sub Menu Toggle Icon Wrapper */}
          <StyledHorizontalNavExpandIconWrapper
            className={menuClasses.subMenuExpandIcon}
            $rootStyles={getSubMenuItemStyles('subMenuExpandIcon')}
          >
            {renderExpandIcon ? (
              renderExpandIcon({
                level,
                disabled,
                active,
                open: open,
              })
            ) : (
              /* Expanded Arrow Icon */
              <StyledHorizontalNavExpandIcon level={level}>
                <ChevronRight fontSize='1rem' />
              </StyledHorizontalNavExpandIcon>
            )}
          </StyledHorizontalNavExpandIconWrapper>
        </MenuButton>

        <HorizontalSubMenuContext.Provider value={{ getItemProps }}>
          <FloatingPortal>
            {isMounted && (
              <StyledSubMenuContentWrapper
                ref={setFloating}
                {...getFloatingProps()}
                style={floatingStyles}
                $rootStyles={getSubMenuItemStyles('subMenuStyles')}
              >
                <SubMenuContent
                  open={open}
                  top={y ? y - window.scrollY : 0}
                  firstLevel={level === 0}
                  browserScroll={browserScroll}
                  className={classnames(menuClasses.subMenuContent, contentClassName)}
                  $rootStyles={getSubMenuItemStyles('subMenuContent')}
                  style={{ ...styles }}
                >
                  {childNodes.map((node) =>
                    React.cloneElement(node, {
                      ...getItemProps(),
                      level: level + 1,
                    }),
                  )}
                </SubMenuContent>
              </StyledSubMenuContentWrapper>
            )}
          </FloatingPortal>
        </HorizontalSubMenuContext.Provider>
      </StyledSubMenu>
    </FloatingNode>
  )
}

export default React.forwardRef<HTMLLIElement, SubMenuProps>(SubMenu)
