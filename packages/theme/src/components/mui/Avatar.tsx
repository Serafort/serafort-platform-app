import React from 'react'
import MuiAvatar from '@mui/material/Avatar'
import { alpha, lighten, styled } from '@mui/material/styles'
import type { AvatarProps } from '@mui/material/Avatar'
import type { ThemeColor } from '@cap/shared-types'

export type CustomAvatarProps = AvatarProps & {
  color?: ThemeColor
  skin?: 'filled' | 'light' | 'light-static'
  size?: number
}

const Avatar = styled(MuiAvatar)<CustomAvatarProps>(({ skin, color, size, theme }) => {
  return {
    ...(color &&
      skin === 'light' && {
        backgroundColor: alpha(theme.palette[color as ThemeColor].main, 0.16),
        color: theme.palette[color as ThemeColor].main,
      }),
    ...(color &&
      skin === 'light-static' && {
        backgroundColor: lighten(theme.palette[color as ThemeColor].main, 0.84),
        color: theme.palette[color as ThemeColor].main,
      }),
    ...(color &&
      skin === 'filled' && {
        backgroundColor: theme.palette[color as ThemeColor].main,
        color: theme.palette[color as ThemeColor].contrastText,
      }),
    ...(size && {
      height: size,
      width: size,
    }),
  }
})

const CustomAvatar = React.forwardRef<HTMLDivElement, CustomAvatarProps>(
  (props: CustomAvatarProps, ref) => {
    // Props
    const { color, skin = 'filled', ...rest } = props

    return <Avatar color={color} skin={skin} ref={ref} {...rest} />
  },
)

export default CustomAvatar
