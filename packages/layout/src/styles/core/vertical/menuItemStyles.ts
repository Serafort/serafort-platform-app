// MUI Imports
import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import {
  menuTokens,
  getVerticalMenuItemActiveGradient,
  getVerticalMenuItemActiveShadow,
} from '@cap/theme'

// Type Imports
import type { MenuItemStyles, MenuItemStylesParams } from '../../../menu/types'
import type { Settings } from '@cap/platform-core'
import type { VerticalNavState } from '../../../menu/contexts/verticalNavContext'

// Util Imports
import { menuClasses } from '../../../menu/utils/menuClasses'

const menuItemStyles = (
  verticalNavOptions: VerticalNavState,
  theme: Theme,
  settings: Settings,
): MenuItemStyles => {
  // Vars
  const { isCollapsed, isHovered, isPopoutWhenCollapsed, transitionDuration } = verticalNavOptions

  const popoutCollapsed = isPopoutWhenCollapsed && isCollapsed
  const popoutExpanded = isPopoutWhenCollapsed && !isCollapsed
  const collapsedNotHovered = isCollapsed && !isHovered

  return {
    root: ({ level }: MenuItemStylesParams) => ({
      ...(!isPopoutWhenCollapsed || popoutExpanded || (popoutCollapsed && level === 0)
        ? {
            marginBlockStart: theme.spacing(menuTokens.vertical.item.marginBlockStartSpacing),
          }
        : {
            marginBlockStart: 0,
          }),
      [`&.${menuClasses.subMenuRoot}.${menuClasses.open} > .${menuClasses.button}, &.${menuClasses.subMenuRoot} > .${menuClasses.button}.${menuClasses.active}`]:
        {
          backgroundColor: `${theme.palette.action.selected} !important`,
        },
      [`&.${menuClasses.disabled} > .${menuClasses.button}`]: {
        color: theme.palette.text.disabled,
      },
      [`&:not(.${menuClasses.subMenuRoot}) > .${menuClasses.button}.${menuClasses.active}`]: {
        ...(popoutCollapsed && level > 0
          ? {
              backgroundColor: alpha(theme.palette.primary.main, menuTokens.vertical.item.activeSubmenuAlpha),
              color: theme.palette.primary.main,
              [`& .${menuClasses.icon}`]: {
                color: theme.palette.primary.main,
              },
            }
          : {
              color: theme.palette.primary.contrastText,
              background: getVerticalMenuItemActiveGradient(theme),
              boxShadow: getVerticalMenuItemActiveShadow(theme),
              [`& .${menuClasses.icon}`]: {
                color: 'inherit',
              },
            }),
      },
    }),
    button: ({ level, active }: MenuItemStylesParams) => ({
      paddingBlock: menuTokens.vertical.item.paddingBlock,
      paddingInline: menuTokens.vertical.item.paddingInline,
      borderRadius: theme.shape.borderRadius,
      ...(!(isCollapsed && !isHovered) && {
        '&:has(.MuiChip-root)': {
          paddingBlock: theme.spacing(menuTokens.horizontal.item.paddingBlockChipSpacing),
        },
      }),

      ...((!isPopoutWhenCollapsed || popoutExpanded || (popoutCollapsed && level === 0)) && {
        borderRadius: theme.shape.borderRadius,
        transition: `padding-inline-start ${transitionDuration}ms ease-in-out`,
      }),
      ...(!active && {
        '&:hover, &:focus-visible': {
          backgroundColor: theme.palette.action.hover,
        },
        '&[aria-expanded="true"]': {
          backgroundColor: theme.palette.action.selected,
        },
      }),
    }),
    icon: ({ level }: MenuItemStylesParams) => ({
      transition: `margin-inline-end ${transitionDuration}ms ease-in-out`,
      ...(level === 0 && {
        fontSize: menuTokens.vertical.item.iconSizePrimary,
      }),
      ...(level > 0 && {
        fontSize: menuTokens.vertical.item.iconSizeSecondary,
        color: theme.palette.text.secondary,
      }),
      ...(level === 0 && {
        marginInlineEnd: theme.spacing(menuTokens.vertical.item.iconMarginLevel0),
      }),
      ...(level > 0 && {
        marginInlineEnd: theme.spacing(menuTokens.vertical.item.iconMarginLevel1),
      }),
      ...(level === 1 &&
        !popoutCollapsed && {
          marginInlineStart: theme.spacing(1.5),
        }),
      ...(level > 1 && {
        marginInlineStart: theme.spacing((popoutCollapsed ? 0 : 1.5) + 2.5 * (level - 1)),
      }),
      ...(collapsedNotHovered && {
        marginInlineEnd: 0,
      }),
      ...(popoutCollapsed &&
        level > 0 && {
          marginInlineEnd: theme.spacing(menuTokens.vertical.item.iconMarginPopout),
        }),
      '& > i, & > svg': {
        fontSize: 'inherit',
      },
    }),
    prefix: {
      marginInlineEnd: theme.spacing(menuTokens.vertical.item.prefixMarginEnd),
    },
    label: ({ level }: MenuItemStylesParams) => ({
      ...((!isPopoutWhenCollapsed || popoutExpanded || (popoutCollapsed && level === 0)) && {
        transition: `opacity ${transitionDuration}ms ease-in-out`,
        ...(collapsedNotHovered && {
          opacity: 0,
        }),
      }),
    }),
    suffix: {
      marginInlineStart: theme.spacing(menuTokens.vertical.item.suffixMarginStart),
    },
    subMenuExpandIcon: {
      fontSize: menuTokens.vertical.item.expandIconSize,
      marginInlineStart: theme.spacing(menuTokens.horizontal.item.expandIconMarginInlineStartSpacing),
      '& i, & svg': {
        fontSize: 'inherit',
      },
    },
    subMenuContent: ({ level }: MenuItemStylesParams) => ({
      zIndex: theme.zIndex.drawer + 1,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
      ...(popoutCollapsed && {
        '& > ul, & > div > ul': {
          [`& > li:not(:last-child), & > li > .${menuClasses.button}:not(:last-child)`]: {
            marginBlockEnd: `${theme.spacing(menuTokens.horizontal.item.submenuItemMarginBlockEndSpacing)} !important`,
          },
        },
        ...(level === 0 && {
          ...(settings.skin === 'bordered'
            ? {
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
              }
            : {
                boxShadow: (theme as any).customShadows?.sm || theme.shadows[2],
              }),
          [`& .${menuClasses.button}`]: {
            paddingInline: theme.spacing(menuTokens.horizontal.item.paddingInlineSpacing),
          },
          padding: theme.spacing(menuTokens.horizontal.item.submenuPaddingSpacing),
        }),
      }),
    }),
  }
}

export default menuItemStyles
