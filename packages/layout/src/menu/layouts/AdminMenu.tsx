import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'
import type { Dictionary } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'
import {
  adminMenuTokens,
  getAdminMenuButtonActiveShadow,
  getAdminMenuButtonActiveBg,
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

const AdminMenu = ({ dictionary, scrollMenu }: Props) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav()
  const { transitionDuration } = verticalNavOptions
  const isRail = verticalNavOptions.isCollapsed && !verticalNavOptions.isHovered

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: adminMenuTokens.scrollWrapperClassName,
            onScroll: (e: React.UIEvent<HTMLElement>) => scrollMenu(e.currentTarget, false),
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: (container: HTMLElement) => scrollMenu(container, true),
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: adminMenuTokens.popoutMenuMainAxisOffset }}
        menuItemStyles={{
          ...menuItemStyles(verticalNavOptions, theme, settings),
          button: ({ active, level }: { active?: boolean; level?: number }) => ({
            transition: adminMenuTokens.button.transition,
            borderRadius: adminMenuTokens.button.borderRadius,
            margin: adminMenuTokens.button.margin,
            paddingInline: adminMenuTokens.button.paddingInline,
            '&:hover': {
              background: getAdminMenuButtonHoverBg(theme, active),
              transform: adminMenuTokens.button.hoverTranslateX,
            },
            ...(active &&
              level === 0 && {
                background: getAdminMenuButtonActiveBg(theme),
                boxShadow: getAdminMenuButtonActiveShadow(theme),
              }),
            // The token margin/padding above are !important and sized for the
            // expanded drawer; in the icon-only rail they push each icon off
            // the logo's axis, so the rail overrides them and centres the icon.
            ...(isRail &&
              level === 0 && {
                marginInline: '0 !important',
                paddingInline: '0 !important',
                inlineSize: '100%',
                justifyContent: 'center',
              }),
          }),
          label: ({ level }: { level?: number }) => ({
            fontWeight: adminMenuTokens.label.fontWeight,
            letterSpacing: adminMenuTokens.label.letterSpacing,
            ...(isRail && level === 0 && { display: 'none' }),
          }),
        }}
        renderExpandIcon={({ open }: { open?: boolean }) => (
          <RenderExpandIcon open={open} transitionDuration={transitionDuration} />
        )}
        renderExpandedMenuItemIcon={{
          icon: <i className={adminMenuTokens.expandedMenuItemIconClass} />,
        }}
        menuSectionStyles={{
          ...menuSectionStyles(verticalNavOptions, theme),
          root: {
            marginBlockStart: adminMenuTokens.section.rootMarginBlockStart,
            '& .ts-menu-section-label': {
              color: getAdminMenuSectionLabelColor(theme),
              ...theme.typography.overline,
            },
          },
        }}
      >
        <ModuleMenuRenderer variant='admin' dictionary={dictionary} />
      </Menu>
    </ScrollWrapper>
  )
}

export default AdminMenu
