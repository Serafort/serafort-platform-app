import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { MouseEvent } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Button,
  ClickAwayListener,
  CircularProgress,
  Divider,
  Fade,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import AttachMoney from '@mui/icons-material/AttachMoney'
import Help from '@mui/icons-material/Help'
import Logout from '@mui/icons-material/Logout'
import Person from '@mui/icons-material/Person'
import Settings from '@mui/icons-material/Settings'
import { useSettings, useAppStore } from '@cap/platform-store'
import { buildLayoutSurfaceEffect } from '../../utils/buildLayoutSurfaceEffect'
import { useAuth } from '@cap/platform-core'
import { AppPaths, resolveDynamicPath } from '@cap/shared-types'
import { zIndexScale, dropdownTokens, getUserDropdownItemHoverBg, getUserBadgeShadow, getTenantThemeEffects } from '@cap/theme'
import { useTranslation } from 'react-i18next'

const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: dropdownTokens.userDropdown.badgeDotSize,
  height: dropdownTokens.userDropdown.badgeDotSize,
  borderRadius: dropdownTokens.userDropdown.badgeDotBorderRadius,
  cursor: 'pointer',
  backgroundColor: theme.palette.success.main,
  boxShadow: getUserBadgeShadow(theme),
}))

const UserDropdown = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navItems = useAppStore((state) => state.navItems)
  const { user: authUser, logout, isLoggingOut } = useAuth()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const navigate = useNavigate()
  const { settings } = useSettings()

  // Dynamically resolve route paths from registered module navItems ("Magnet Legos")
  const profilePath = React.useMemo(
    () => resolveDynamicPath(navItems, 'user-profile', AppPaths.account.overview),
    [navItems]
  )
  const settingsPath = React.useMemo(
    () => resolveDynamicPath(navItems, 'account-settings', AppPaths.account.edit),
    [navItems]
  )
  const pricingPath = React.useMemo(
    () => resolveDynamicPath(navItems, 'guest-pricing', AppPaths.landing.pricing),
    [navItems]
  )
  const aboutPath = React.useMemo(
    () => resolveDynamicPath(navItems, 'guest-about', AppPaths.landing.about),
    [navItems]
  )

  // Extract user data from IAuth structure
  const user = authUser?.user || authUser

  const handleDropdownOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(open ? null : event.currentTarget)
  }

  const handleDropdownClose = (
    event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent),
    url?: string,
  ) => {
    if (url) navigate(url)

    if (anchorEl && anchorEl.contains(event?.target as HTMLElement)) return

    setAnchorEl(null)
  }

  const handleUserLogout = () => {
    setAnchorEl(null)
    logout()
  }

  return (
    <React.Fragment>
      <Badge
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          marginInlineStart: dropdownTokens.userDropdown.badgeMarginInlineStart,
        }}
      >
        <Avatar
          alt={user?.firstName || ''}
          src={user?.avatar || ''}
          onClick={handleDropdownOpen}
          sx={{
            cursor: 'pointer',
            blockSize: dropdownTokens.userDropdown.avatarSize,
            inlineSize: dropdownTokens.userDropdown.avatarSize,
          }}
        />
      </Badge>
      <Popper
        open={open}
        transition
        placement='bottom-end'
        anchorEl={anchorEl}
        sx={{
          minInlineSize: dropdownTokens.dropdownPopper.minInlineSizeUser,
          marginBlockStart: dropdownTokens.dropdownPopper.marginBlockStart,
          zIndex: zIndexScale.dropdown,
        }}
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top',
            }}
          >
            <Paper
              className='animate-scale-in'
              sx={(theme: any) => ({
                borderRadius: dropdownTokens.dropdownPopper.paperBorderRadius,
                overflow: 'hidden',
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
                ...(settings.skin === 'bordered'
                  ? { border: '1px solid ' + theme.palette.divider, boxShadow: 'none' }
                  : {}),
              })}
            >
              <ClickAwayListener
                onClickAway={(e) => handleDropdownClose(e as MouseEvent | TouchEvent)}
              >
                <MenuList>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      paddingBlock: dropdownTokens.userDropdown.headerPaddingBlock,
                      paddingInline: dropdownTokens.userDropdown.headerPaddingInline,
                      gap: dropdownTokens.userDropdown.headerGap,
                    }}
                    tabIndex={-1}
                  >
                    <Avatar alt={user?.firstName || ''} src={user?.avatar || ''} />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 500,
                        }}
                        color='text.primary'
                      >
                        {user?.firstName || ''}
                      </Typography>
                      <Typography variant='caption'>{user?.email || ''}</Typography>
                    </Box>
                  </Box>
                  <Divider
                    sx={{
                      marginBlock: '0.25rem',
                    }}
                  />
                  <MenuItem
                    onClick={(e) => handleDropdownClose(e, profilePath)}
                    sx={{
                      marginInline: dropdownTokens.userDropdown.itemMarginInline,
                      marginBlock: dropdownTokens.userDropdown.itemMarginBlock,
                      borderRadius: dropdownTokens.userDropdown.itemBorderRadius,
                      gap: dropdownTokens.userDropdown.itemGap,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: getUserDropdownItemHoverBg(theme),
                        transform: dropdownTokens.userDropdown.itemHoverTranslateX,
                        '& svg': { color: 'primary.main' },
                      },
                    }}
                  >
                    <Person sx={{ fontSize: dropdownTokens.dropdownPopper.itemIconFontSize, transition: 'color 0.2s' }} />
                    <Typography color='text.primary' sx={{ fontWeight: 500 }}>
                      {t('navigation.profile')}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => handleDropdownClose(e, settingsPath)}
                    sx={{
                      marginInline: dropdownTokens.userDropdown.itemMarginInline,
                      marginBlock: dropdownTokens.userDropdown.itemMarginBlock,
                      borderRadius: dropdownTokens.userDropdown.itemBorderRadius,
                      gap: dropdownTokens.userDropdown.itemGap,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: getUserDropdownItemHoverBg(theme),
                        transform: dropdownTokens.userDropdown.itemHoverTranslateX,
                        '& svg': { color: 'primary.main' },
                      },
                    }}
                  >
                    <Settings sx={{ fontSize: dropdownTokens.dropdownPopper.itemIconFontSize, transition: 'color 0.2s' }} />
                    <Typography color='text.primary' sx={{ fontWeight: 500 }}>
                      {t('navigation.settings')}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => handleDropdownClose(e, pricingPath)}
                    sx={{
                      marginInline: '0.5rem',
                      gap: dropdownTokens.userDropdown.itemGap,
                    }}
                  >
                    <AttachMoney sx={{ fontSize: dropdownTokens.dropdownPopper.itemIconFontSize }} />
                    <Typography color='text.primary'>{t('navigation.pricing')}</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => handleDropdownClose(e, aboutPath)}
                    sx={{
                      marginInline: '0.5rem',
                      gap: dropdownTokens.userDropdown.itemGap,
                    }}
                  >
                    <Help sx={{ fontSize: dropdownTokens.dropdownPopper.itemIconFontSize }} />
                    <Typography color='text.primary'>{t('navigation.about')}</Typography>
                  </MenuItem>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      paddingBlock: dropdownTokens.userDropdown.logoutBoxPaddingBlock,
                      paddingInline: dropdownTokens.userDropdown.logoutBoxPaddingInline,
                    }}
                  >
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      disabled={isLoggingOut}
                      endIcon={
                        isLoggingOut ? <CircularProgress size={16} color='inherit' /> : <Logout />
                      }
                      onClick={handleUserLogout}
                      sx={{
                        '& .MuiButton-endIcon': { marginInlineStart: dropdownTokens.userDropdown.logoutEndIconMargin },
                      }}
                    >
                      {isLoggingOut ? t('navigation.signingOut') : t('navigation.logout')}
                    </Button>
                  </Box>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </React.Fragment>
  )
}

export default UserDropdown
