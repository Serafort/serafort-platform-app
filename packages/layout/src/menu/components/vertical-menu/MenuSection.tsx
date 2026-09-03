import React from 'react'
import classnames from 'classnames'
import type { CSSObject } from '@emotion/styled'
import type { MenuSectionStyles } from './Menu'
import type { ChildrenType, RootStylesType } from '../../types'
import { useVerticalNav, useVerticalMenu } from '../../contexts/verticalNavContext'
import { menuClasses } from '../../utils/menuClasses'
import StyledMenuIcon from '../../styles/StyledMenuIcon'
import StyledMenuPrefix from '../../styles/StyledMenuPrefix'
import StyledMenuSuffix from '../../styles/StyledMenuSuffix'
import StyledMenuSectionLabel from '../../styles/StyledMenuSectionLabel'
import StyledVerticalMenuSection from '../../styles/vertical/StyledVerticalMenuSection'

import { menuTokens } from '@cap/theme'

export type MenuSectionProps = Partial<ChildrenType> &
  RootStylesType & {
    label: React.ReactNode
    icon?: React.ReactElement
    prefix?: React.ReactNode
    suffix?: React.ReactNode

    /**
     * @ignore
     */
    className?: string
  }

type MenuSectionElement = keyof MenuSectionStyles

const menuSectionWrapperStyles: React.CSSProperties = menuTokens.vertical.section.wrapperStyles
const menuSectionContentStyles: React.CSSProperties = menuTokens.vertical.section.contentStyles

const MenuSection: React.ForwardRefRenderFunction<HTMLLIElement, MenuSectionProps> = (
  props,
  ref,
) => {
  const { children, icon, className, prefix, suffix, label, rootStyles, ...rest } = props

  // Hooks
  const { isCollapsed, isHovered } = useVerticalNav()
  const { menuSectionStyles, collapsedMenuSectionLabel, textTruncate } = useVerticalMenu()

  const getMenuSectionStyles = (element: MenuSectionElement): CSSObject | undefined => {
    // If the menuSectionStyles prop is provided, get the styles for the element from the prop
    if (menuSectionStyles) {
      return menuSectionStyles[element] as any
    }
  }

  return (
    // Menu Section
    <StyledVerticalMenuSection
      ref={ref}
      rootStyles={rootStyles}
      menuSectionStyles={getMenuSectionStyles('root')}
      className={classnames(menuClasses.menuSectionRoot, className)}
    >
      {/* Menu Section Content Wrapper */}
      <ul className={menuClasses.menuSectionWrapper} {...rest} style={menuSectionWrapperStyles}>
        {/* Menu Section Content */}
        <li className={menuClasses.menuSectionContent} style={menuSectionContentStyles}>
          {icon && (
            <StyledMenuIcon className={menuClasses.icon} $rootStyles={getMenuSectionStyles('icon')}>
              {icon}
            </StyledMenuIcon>
          )}
          {prefix && (
            <StyledMenuPrefix
              $isCollapsed={isCollapsed}
              className={menuClasses.prefix}
              $rootStyles={getMenuSectionStyles('prefix')}
            >
              {prefix}
            </StyledMenuPrefix>
          )}
          {collapsedMenuSectionLabel && isCollapsed && !isHovered ? (
            <StyledMenuSectionLabel
              $isCollapsed={isCollapsed}
              $isHovered={isHovered}
              className={menuClasses.menuSectionLabel}
              $rootStyles={getMenuSectionStyles('label')}
              $textTruncate={textTruncate}
            >
              {collapsedMenuSectionLabel}
            </StyledMenuSectionLabel>
          ) : (
            label && (
              <StyledMenuSectionLabel
                $isCollapsed={isCollapsed}
                $isHovered={isHovered}
                className={menuClasses.menuSectionLabel}
                $rootStyles={getMenuSectionStyles('label')}
                $textTruncate={textTruncate}
              >
                {label}
              </StyledMenuSectionLabel>
            )
          )}
          {suffix && (
            <StyledMenuSuffix
              $isCollapsed={isCollapsed}
              className={menuClasses.suffix}
              $rootStyles={getMenuSectionStyles('suffix')}
            >
              {suffix}
            </StyledMenuSuffix>
          )}
        </li>
        {/* Render Child */}
        {children}
      </ul>
    </StyledVerticalMenuSection>
  )
}

export default React.forwardRef<HTMLLIElement, MenuSectionProps>(MenuSection)
