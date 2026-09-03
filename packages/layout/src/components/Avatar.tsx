import type { ThemeColor } from '@cap/shared-types'
import type { AvatarProps } from '@mui/material/Avatar'
import MuiAvatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'

export type CustomAvatarProps = AvatarProps & {
  color?: ThemeColor
  skin?: 'light' | 'filled' | 'light-static'
  size?: number | string
}

const Avatar = styled(MuiAvatar)<CustomAvatarProps>(({ size }) => ({
  ...(size && {
    width: size,
    height: size,
  }),
}))

export default Avatar
