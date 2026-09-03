import { css } from '@emotion/react'
import type { Theme } from '@mui/material/styles'
import { menuTokens } from '@cap/theme'
import type { ChildrenType } from '../../types'
import { menuClasses } from '../../utils/menuClasses'

type MenuButtonStylesProps = Partial<ChildrenType> & {
  level: number
  active?: boolean
  disabled?: boolean
  isCollapsed?: boolean
  isPopoutWhenCollapsed?: boolean
  theme?: Theme
}

export const menuButtonStyles = (props: MenuButtonStylesProps) => {
  // Props
  const { level, disabled, children, isCollapsed, isPopoutWhenCollapsed, theme } = props

  const hoverBg = theme?.palette?.action?.hover || 'rgba(0, 0, 0, 0.04)'
  const disabledColor = theme?.palette?.text?.disabled || 'rgba(0, 0, 0, 0.38)'
  const primaryMain = theme?.palette?.primary?.main || '#1976d2'

  return css({
    display: 'flex',
    alignItems: 'center',
    minBlockSize: menuTokens.vertical.button.minBlockSize,
    textDecoration: 'none',
    color: 'inherit',
    boxSizing: 'border-box',
    cursor: 'pointer',
    paddingInlineEnd: menuTokens.vertical.button.paddingInlineEnd,
    paddingInlineStart: `${
      level === 0 ? menuTokens.vertical.button.basePaddingInlineStart : (isPopoutWhenCollapsed && isCollapsed ? level : level + 1) * menuTokens.vertical.button.basePaddingInlineStart
    }px`,

    '&:hover, &[aria-expanded="true"]': {
      backgroundColor: hoverBg,
    },

    '&:focus-visible': {
      outline: 'none',
      backgroundColor: hoverBg,
    },

    ...(disabled && {
      pointerEvents: 'none',
      cursor: 'default',
      color: disabledColor,
    }),

    // All the active styles are applied to the button including menu items or submenu
    [`&.${menuClasses.active}`]: {
      ...(!children && { color: 'white' }),
      backgroundColor: children ? hoverBg : primaryMain,
    },
  })
}
