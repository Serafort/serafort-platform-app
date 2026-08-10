/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from 'react'
import type { ReactNode, SyntheticEvent } from 'react'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import type { OptionsMenuType, OptionType } from './types'
import { useThemeSettings } from '../../../context/ThemeSettingsContext'

const OptionMenu = ({
  icon,
  iconClassName,
  options,
  leftAlignMenu,
  iconButtonProps,
}: OptionsMenuType) => {
  // States
  const [open, setOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const settings = useThemeSettings()

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: Event | SyntheticEvent) => {
    if (anchorEl && anchorEl.contains(event.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  return (
    <>
      <IconButton size='small' onClick={handleToggle} {...iconButtonProps}>
        {typeof icon === 'string' ? (
          <i className={classnames(icon, iconClassName)} />
        ) : (icon as ReactNode) ? (
          icon
        ) : (
          <i className={classnames('tabler-dots-vertical', iconClassName)} />
        )}
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={leftAlignMenu ? 'bottom-start' : 'bottom-end'}
        transition
        disablePortal
        sx={{ zIndex: 1 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open}>
                  {options.map((option: OptionType, index: number) => {
                    if (typeof option === 'string') {
                      return (
                        <MenuItem key={index} onClick={handleClose}>
                          {option}
                        </MenuItem>
                      )
                    } else if ('divider' in option) {
                      return option.divider && <Divider key={index} {...option.dividerProps} />
                    } else {
                      return (
                        <MenuItem
                          key={index}
                          {...(option.menuItemProps as any)}
                          component={option.href ? (Link as any) : 'li'}
                          {...(option.href && { to: option.href as any, ...option.linkProps })}
                          onClick={(e: any) => {
                            handleClose(e)
                            option.menuItemProps?.onClick?.(e as any)
                          }}
                        >
                          {(typeof option.icon === 'string' ? (
                            <i className={option.icon} />
                          ) : (
                            option.icon
                          )) || null}
                          {option.text}
                        </MenuItem>
                      )
                    }
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default OptionMenu
