import React, { useState, useMemo } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Box,
  dropdownTokens,
} from '@cap/theme'
import AccountCircle from '@mui/icons-material/AccountCircle'
import Settings from '@mui/icons-material/Settings'
import Dashboard from '@mui/icons-material/Dashboard'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@cap/platform-core'
import { useAppStore } from '@cap/platform-store'
import { AppPaths, resolveDynamicPath } from '@cap/shared-types'
import { useTranslation } from 'react-i18next'
import { useSignOut } from '../hooks/useSignOut'

export const UserMenu: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const navItems = useAppStore((state) => state.navItems)
  const { signOut, isSigningOut } = useSignOut({
    onSuccess: () => {
      if (import.meta.env.DEV) console.log('Successfully signed out')
    },
  })

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  // Dynamically resolve route paths from registered module navItems ("Magnet Legos")
  const profilePath = useMemo(
    () => resolveDynamicPath(navItems, 'user-profile', AppPaths.account.overview),
    [navItems]
  )
  const settingsPath = useMemo(
    () => resolveDynamicPath(navItems, 'account-settings', AppPaths.account.edit),
    [navItems]
  )
  const dashboardPath = useMemo(
    () => resolveDynamicPath(navItems, 'admin-dashboard', AppPaths.dashboard.dashboard),
    [navItems]
  )

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    handleClose()
  }

  const handleSignOut = () => {
    handleClose()
    signOut()
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return 'U'
    const names = user.fullName.split(' ')
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase()
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size='small'
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        aria-label={t('navigation.userMenu', 'User menu')}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
          }}
        >
          {getUserInitials()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id='user-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: dropdownTokens.dropdownPopper.minInlineSizeUser,
            mt: 1.5,
            borderRadius: dropdownTokens.dropdownPopper.paperBorderRadius,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant='subtitle2' fontWeight={600}>
            {user?.fullName || t('user.defaultName', 'User')}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {user?.email || ''}
          </Typography>
          {user?.role && (
            <Typography
              variant='caption'
              sx={{
                display: 'block',
                mt: 0.5,
                px: 1,
                py: 0.25,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: 1,
                width: 'fit-content',
                textTransform: 'capitalize',
              }}
            >
              {user.roleName || String(user.role)}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Menu Items */}
        <MenuItem onClick={() => handleNavigate(dashboardPath)}>
          <ListItemIcon>
            <Dashboard fontSize='small' />
          </ListItemIcon>
          <ListItemText>{t('navigation.dashboard')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleNavigate(profilePath)}>
          <ListItemIcon>
            <AccountCircle fontSize='small' />
          </ListItemIcon>
          <ListItemText>{t('navigation.profile')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleNavigate(settingsPath)}>
          <ListItemIcon>
            <Settings fontSize='small' />
          </ListItemIcon>
          <ListItemText>{t('navigation.settings')}</ListItemText>
        </MenuItem>

        <Divider />

        {/* Sign Out */}
        <MenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          sx={{
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.lighter',
            },
          }}
        >
          <ListItemIcon>
            <LogoutOutlined fontSize='small' color='error' />
          </ListItemIcon>
          <ListItemText>
            {isSigningOut ? t('navigation.signingOut') : t('navigation.logout')}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default UserMenu
