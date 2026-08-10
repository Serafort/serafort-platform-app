import type { ReactNode } from 'react'
import type { IconButtonProps } from '@mui/material/IconButton'
import type { MenuItemProps } from '@mui/material/MenuItem'
import type { DividerProps } from '@mui/material/Divider'
import type { BoxProps } from '@mui/material/Box'
import { LinkProps } from 'react-router-dom'

export type OptionDividerType = {
  divider: boolean
  dividerProps?: DividerProps
  href?: never
  icon?: never
  text?: never
  linkProps?: never
  menuItemProps?: never
}
export type OptionMenuItemType = {
  text: ReactNode
  icon?: ReactNode
  linkProps?: BoxProps
  href?: LinkProps['to']
  menuItemProps?: MenuItemProps
  divider?: never
  dividerProps?: never
}

export type OptionType = string | OptionDividerType | OptionMenuItemType

export type OptionsMenuType = {
  icon?: ReactNode
  iconClassName?: string
  options: Array<OptionType>
  leftAlignMenu?: boolean
  iconButtonProps?: IconButtonProps
}
