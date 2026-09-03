import type { Theme } from '@mui/material/styles'
import {
  menuTokens,
  getVerticalNavBackdropColor,
  getVerticalNavContainerShadow,
} from '@cap/theme'
import type { VerticalNavState } from '../../../menu/contexts/verticalNavContext'
import { menuClasses, verticalNavClasses } from '../../../menu/utils/menuClasses'

const navigationCustomStyles = (verticalNavOptions: VerticalNavState, theme: Theme) => {
  const { collapsedWidth, isCollapsed, isHovered, transitionDuration } = verticalNavOptions

  const collapsedNotHovered = isCollapsed && !isHovered

  return {
    color: theme.palette.text.primary,
    zIndex: `${theme.zIndex.drawer} !important`,
    [`& .${verticalNavClasses.header}`]: {
      paddingBlock: theme.spacing(menuTokens.vertical.header.paddingBlockSpacing),
      paddingInline: theme.spacing(
        menuTokens.vertical.header.paddingInlineStartSpacing,
        menuTokens.vertical.header.paddingInlineEndSpacing
      ),

      ...(collapsedNotHovered && {
        paddingInline: theme.spacing(((collapsedWidth as number) - 35) / 8),
        '& a': {
          transform: `translateX(-${22 - ((collapsedWidth as number) - 29) / 2}px)`,
        },
      }),
      '& a': {
        transition: `transform ${transitionDuration}ms ease`,
      },
    },
    [`& .${verticalNavClasses.container}`]: {
      transition: theme.transitions.create(['inline-size', 'inset-inline-start', 'box-shadow'], {
        duration: transitionDuration,
        easing: 'ease-in-out',
      }),
      ...getVerticalNavContainerShadow(theme, (theme as any).settings?.skin),
      '[data-skin="bordered"] &': {
        boxShadow: 'none',
        borderColor: theme.palette.divider,
      },
    },
    [`& .${menuClasses.root}`]: {
      paddingBlock: theme.spacing(menuTokens.vertical.root.paddingBlockSpacing),
      paddingInline: theme.spacing(menuTokens.vertical.root.paddingInlineSpacing),
    },
    [`& .${verticalNavClasses.backdrop}`]: {
      backgroundColor: getVerticalNavBackdropColor(theme),
    },
  }
}

export default navigationCustomStyles
