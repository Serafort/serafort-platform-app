import type { Theme } from '@mui/material/styles'
import { menuTokens } from '@cap/theme'
import type { VerticalNavState } from '../../../menu/contexts/verticalNavContext'
import type { MenuProps } from '../../../menu/vertical-menu'
import { menuClasses } from '../../../menu/utils/menuClasses'

const menuSectionStyles = (
  verticalNavOptions: VerticalNavState,
  theme: Theme,
): MenuProps['menuSectionStyles'] => {
  const { isCollapsed, isHovered } = verticalNavOptions
  const collapsedNotHovered = isCollapsed && !isHovered

  return {
    root: {
      marginBlockStart: theme.spacing(0),
      [`& .${menuClasses.menuSectionContent}`]: {
        color: theme.palette.text.disabled,
        paddingInline: menuTokens.vertical.section.paddingInline,
        paddingBlock: `${theme.spacing(
          collapsedNotHovered
            ? menuTokens.vertical.section.collapsedPaddingBlockSpacing
            : menuTokens.vertical.section.expandedPaddingBlockSpacing
        )} !important`,
        marginBlockStart: theme.spacing(menuTokens.vertical.section.marginBlockStartSpacing),

        '&:before': {
          content: '""',
          blockSize: 1,
          inlineSize: menuTokens.vertical.section.indicatorInlineSize,
          backgroundColor: theme.palette.text.disabled,
        },
        ...(!collapsedNotHovered && {
          '&:before': {
            content: 'none',
          },
        }),

        [`& .${menuClasses.menuSectionLabel}`]: {
          flexGrow: 0,
          textTransform: 'uppercase',
          fontSize: menuTokens.vertical.section.labelFontSize,
          lineHeight: menuTokens.vertical.section.labelLineHeight,
          letterSpacing: menuTokens.vertical.section.labelLetterSpacing,
          ...(collapsedNotHovered && {
            display: 'none',
          }),
        },
      },
    },
  }
}

export default menuSectionStyles
