/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'
import type { Dictionary } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'
import {
  layoutMenuTokens,
  getLayoutMenuButtonActiveBg,
  getVerticalMenuButtonActiveShadow,
  getAdminMenuButtonHoverBg,
  getAdminMenuSectionLabelColor,
} from '@cap/theme'
import { useVerticalNav } from '../../hooks/useVerticalNav'
import { Menu } from '../vertical-menu'
import type { VerticalMenuContextProps } from '../components/vertical-menu/Menu'
import StyledVerticalNavExpandIcon from '../styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '../../styles/core/vertical/menuItemStyles'
import menuSectionStyles from '../../styles/core/vertical/menuSectionStyles'
import ChevronRight from '@mui/icons-material/ChevronRight'
import ModuleMenuRenderer from './ModuleMenuRenderer'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Dictionary
  scrollMenu: (container: HTMLElement | null, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon: React.FC<RenderExpandIconProps> = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <ChevronRight />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav()

  // Vars
  const { transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: layoutMenuTokens.verticalMenu.scrollWrapperClassName,
            onScroll: (e: React.UIEvent<HTMLElement>) => scrollMenu(e.currentTarget, false),
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: (container: HTMLElement) => scrollMenu(container, true),
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: layoutMenuTokens.verticalMenu.popoutMainAxisOffset }}
        menuItemStyles={{
          ...menuItemStyles(verticalNavOptions, theme, settings),
          button: ({ active, level }: { active?: boolean; level?: number }) => ({
            transition: layoutMenuTokens.verticalMenu.button.transition,
            borderRadius: layoutMenuTokens.verticalMenu.button.borderRadius,
            margin: layoutMenuTokens.verticalMenu.button.margin,
            paddingInline: layoutMenuTokens.verticalMenu.button.paddingInline,
            '&:hover': {
              background: getAdminMenuButtonHoverBg(theme, active),
              transform: layoutMenuTokens.verticalMenu.button.hoverTranslateX,
              '& .tabler-icon, & i': {
                transform: layoutMenuTokens.verticalMenu.button.hoverIconScale,
                color: `${theme.palette.primary.main} !important`,
                transition: layoutMenuTokens.verticalMenu.button.hoverIconTransition,
              },
            },
            ...(active &&
              level === 0 && {
                background: getLayoutMenuButtonActiveBg(theme),
                boxShadow: getVerticalMenuButtonActiveShadow(theme),
              }),
          }),
          label: {
            fontWeight: layoutMenuTokens.verticalMenu.button.activeShadowAlpha > 0 ? 500 : 400,
            letterSpacing: '0.01rem',
          },
        }}
        renderExpandIcon={({ open }: { open?: boolean }) => (
          <RenderExpandIcon open={open} transitionDuration={transitionDuration} />
        )}
        renderExpandedMenuItemIcon={{ icon: <i className={layoutMenuTokens.verticalMenu.expandedMenuItemIconClass} /> }}
        menuSectionStyles={{
          ...menuSectionStyles(verticalNavOptions, theme),
          root: {
            marginBlockStart: layoutMenuTokens.verticalMenu.sectionLabel.rootMarginBlockStart,
            '& .ts-menu-section-label': {
              color: getAdminMenuSectionLabelColor(theme),
              fontSize: layoutMenuTokens.verticalMenu.sectionLabel.fontSize,
              fontWeight: layoutMenuTokens.verticalMenu.sectionLabel.fontWeight,
              textTransform: layoutMenuTokens.verticalMenu.sectionLabel.textTransform,
              letterSpacing: layoutMenuTokens.verticalMenu.sectionLabel.letterSpacing,
            },
          },
        }}
      >
        <ModuleMenuRenderer variant='vertical' dictionary={dictionary} />
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
