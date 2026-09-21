import { useTheme } from '@mui/material/styles'
import type { Dictionary } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'
import {
  layoutMenuTokens,
  getHorizontalMenuPopoutOffset,
  getHorizontalMenuButtonHoverBg,
  getLayoutMenuButtonActiveBg,
} from '@cap/theme'
import { HorizontalNav, Menu } from '../horizontal-menu'
import { useVerticalNav } from '../contexts/verticalNavContext'
import NavbarContent from './HorizontalNavbarContent'
import type { VerticalMenuContextProps } from '../components/vertical-menu/Menu'
import StyledHorizontalNavExpandIcon from '../styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '../styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '../../styles/core/horizontal/menuItemStyles'
import menuRootStyles from '../../styles/core/horizontal/menuRootStyles'
import verticalNavigationCustomStyles from '../../styles/core/vertical/navigationCustomStyles'
import verticalMenuItemStyles from '../../styles/core/vertical/menuItemStyles'
import verticalMenuSectionStyles from '../../styles/core/vertical/menuSectionStyles'
import ChevronRight from '@mui/icons-material/ChevronRight'
import ModuleMenuRenderer from './ModuleMenuRenderer'

type RenderExpandIconProps = {
  level?: number
}

type RenderVerticalExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ level }: RenderExpandIconProps) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <ChevronRight className={layoutMenuTokens.horizontalMenu.expandIconClass} />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }: RenderVerticalExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <ChevronRight className={layoutMenuTokens.verticalMenu.expandIconClass} />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = ({ dictionary }: { dictionary: Dictionary }) => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const { settings } = useSettings()

  // Vars
  const { skin } = settings
  const { transitionDuration } = verticalNavOptions

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={NavbarContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor:
          skin === 'bordered' ? theme.palette.background.paper : theme.palette.background.default,
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        // Sections open as dropdowns on click, not on hover-and-wait - a
        // deliberate tap/click is how a menu bar is expected to behave here.
        triggerPopout='click'
        renderExpandIcon={({ level }: { level?: number }) => <RenderExpandIcon level={level} />}
        menuItemStyles={{
          ...menuItemStyles(settings, theme),
          button: ({ active, level }: { active?: boolean; level?: number }) => ({
            // The active-indicator bar below is `position: absolute` - without
            // a positioned button, it escapes to the nearest positioned
            // ancestor up the tree and stretches across the whole menu row
            // instead of sitting under just this button.
            position: 'relative',
            transition: layoutMenuTokens.horizontalMenu.button.transition,
            borderRadius: layoutMenuTokens.horizontalMenu.button.borderRadius,
            margin: layoutMenuTokens.horizontalMenu.button.margin,
            paddingInline: layoutMenuTokens.horizontalMenu.button.paddingInline,
            '&:hover': {
              background: getHorizontalMenuButtonHoverBg(theme, active),
              '& .tabler-icon, & i': {
                transform: layoutMenuTokens.horizontalMenu.button.hoverIconTransform,
                color: `${theme.palette.primary.main} !important`,
                transition: layoutMenuTokens.horizontalMenu.button.hoverIconTransition,
              },
            },
            ...(active &&
              level === 0 && {
                background: getLayoutMenuButtonActiveBg(theme),
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: layoutMenuTokens.horizontalMenu.button.activeIndicatorBottom,
                  left: layoutMenuTokens.horizontalMenu.button.activeIndicatorInset,
                  right: layoutMenuTokens.horizontalMenu.button.activeIndicatorInset,
                  height: layoutMenuTokens.horizontalMenu.button.activeIndicatorHeight,
                  background: theme.palette.primary.main,
                  borderRadius: layoutMenuTokens.horizontalMenu.button.activeIndicatorRadius,
                  animation: layoutMenuTokens.horizontalMenu.button.activeIndicatorAnimation,
                },
              }),
          }),
        }}
        renderExpandedMenuItemIcon={{
          icon: <i className={layoutMenuTokens.horizontalMenu.expandedMenuItemIconClass} />,
        }}
        popoutMenuOffset={{
          mainAxis: ({ level }: { level?: number }) => getHorizontalMenuPopoutOffset(level),
          alignmentAxis: 0,
        }}
        verticalMenuProps={{
          transitionDuration,
          rootStyles: {},
          textTruncate: true,
          subMenuOpenBehavior: 'accordion',
          menuItemStyles: {
            ...verticalMenuItemStyles(verticalNavOptions, theme, settings),
            button: {
              borderRadius: layoutMenuTokens.horizontalMenu.verticalFallback.buttonBorderRadius,
              margin: layoutMenuTokens.horizontalMenu.verticalFallback.buttonMargin,
              transition: layoutMenuTokens.horizontalMenu.verticalFallback.buttonTransition,
              '&:hover': {
                background: theme.palette.action.hover,
              },
            },
          },
          renderExpandIcon: ({ open }: { open?: boolean }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: {
            icon: <i className={layoutMenuTokens.verticalMenu.expandedMenuItemIconClass} />,
          },
          menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme),
        }}
      >
        <ModuleMenuRenderer variant='horizontal' dictionary={dictionary} />
      </Menu>
    </HorizontalNav>
  )
}

export default HorizontalMenu
