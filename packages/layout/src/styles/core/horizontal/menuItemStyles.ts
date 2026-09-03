import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import {
  menuTokens,
  getHorizontalMenuItemActiveGradient,
  getHorizontalSubmenuContentStyles,
} from '@cap/theme'
import type { MenuItemStyles, MenuItemStylesParams } from '../../../menu/types'
import type { Settings } from '@cap/platform-core'
import { menuClasses } from '../../../menu/utils/menuClasses'

const menuItemStyles = (settings: Settings, theme: Theme): MenuItemStyles => ({
  root: ({ level }: MenuItemStylesParams) => ({
    ...(level === 0 && {
      borderRadius: menuTokens.horizontal.item.borderRadius,
    }),
    [`&.${menuClasses.open} > .${menuClasses.button}`]: {
      backgroundColor: `${theme.palette.action.selected} !important`,
    },
    ...(level === 0
      ? {
          [`& .${menuClasses.button}.${menuClasses.active}`]: {
            color: `${theme.palette.primary.contrastText} !important`,
            background: getHorizontalMenuItemActiveGradient(theme),
          },
        }
      : {
          [`&:not([aria-expanded]) > .${menuClasses.button}.${menuClasses.active}`]: {
            backgroundColor: alpha(theme.palette.primary.main, menuTokens.horizontal.item.activeSubmenuAlpha),
            color: theme.palette.primary.main,
          },
          [`&[aria-expanded] > .${menuClasses.button}.${menuClasses.active}`]: {
            backgroundColor: `${theme.palette.action.selected} !important`,
          },
        }),
    [`&.${menuClasses.disabled} > .${menuClasses.button}`]: {
      color: theme.palette.text.disabled,
      '& *': {
        color: 'inherit',
      },
    },
  }),
  button: {
    borderRadius: theme.shape.borderRadius,
    paddingInline: theme.spacing(menuTokens.horizontal.item.paddingInlineSpacing),
    '&:not(:has(.MuiChip-root))': {
      paddingBlock: theme.spacing(menuTokens.horizontal.item.paddingBlockDefaultSpacing),
    },
    '&:has(.MuiChip-root)': {
      paddingBlock: theme.spacing(menuTokens.horizontal.item.paddingBlockChipSpacing),
    },
    [`&:not(.${menuClasses.active}):hover, &:not(.${menuClasses.active}):focus-visible, &:not(.${menuClasses.active})[aria-expanded="true"]`]:
      {
        backgroundColor: theme.palette.action.hover,
      },
  },
  icon: ({ level }: MenuItemStylesParams) => ({
    marginInlineEnd: theme.spacing(menuTokens.horizontal.item.iconMarginInlineEndSpacing),
    ...(level < 2
      ? { fontSize: menuTokens.horizontal.item.iconSizePrimary }
      : { fontSize: menuTokens.horizontal.item.iconSizeSecondary, color: theme.palette.text.secondary }),
    '& > i, & > svg': {
      fontSize: 'inherit',
    },
    '& .tabler-circle': {
      fontSize: menuTokens.horizontal.item.iconSizeSecondary,
      color: theme.palette.text.secondary,
      [`.${menuClasses.active} &`]: {
        color: theme.palette.primary.main,
      },
    },
  }),
  prefix: {
    marginInlineEnd: theme.spacing(menuTokens.horizontal.item.prefixMarginInlineEndSpacing),
  },
  suffix: {
    marginInlineStart: theme.spacing(menuTokens.horizontal.item.suffixMarginInlineStartSpacing),
  },
  subMenuStyles: {
    zIndex: theme.zIndex.appBar + menuTokens.horizontal.item.submenuZIndexOffset,
  },
  subMenuExpandIcon: {
    fontSize: menuTokens.horizontal.item.expandIconSize,
    marginInlineStart: theme.spacing(menuTokens.horizontal.item.expandIconMarginInlineStartSpacing),
    '& i, & svg': {
      fontSize: 'inherit',
    },
  },
  subMenuContent: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    ...getHorizontalSubmenuContentStyles(theme, settings.skin),
    '& > ul, & > div > ul': {
      padding: theme.spacing(menuTokens.horizontal.item.submenuPaddingSpacing),
      '& > li:not(:last-child)': {
        marginBlockEnd: theme.spacing(menuTokens.horizontal.item.submenuItemMarginBlockEndSpacing),
      },
    },
  },
})

export default menuItemStyles
