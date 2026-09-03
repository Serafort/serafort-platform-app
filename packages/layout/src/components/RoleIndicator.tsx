/**
 * Role Indicator Component (Tier 2 Layout Component)
 *
 * Visual chip indicator showing the current user's role (Guest, User, Admin)
 * Appears in vertical and horizontal navbar headers.
 */

import React from 'react'
import { Chip, Tooltip, Box, Skeleton } from '@mui/material'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import PersonIcon from '@mui/icons-material/Person'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useAuth, useGuest } from '@cap/platform-core'
import { useStateHydration } from '@cap/platform-store'
import { useTranslation } from 'react-i18next'

export interface RoleIndicatorProps {
  showLabel?: boolean
  size?: 'small' | 'medium'
}

export const RoleIndicator: React.FC<RoleIndicatorProps> = ({
  showLabel = true,
  size = 'small',
}) => {
  const { isHydrating } = useStateHydration()
  const { isAuthenticated, isAdmin } = useAuth()
  const { isGuest } = useGuest()
  const { t } = useTranslation()

  if (isHydrating) {
    return (
      <Skeleton
        variant='rounded'
        width={showLabel ? 72 : 32}
        height={size === 'small' ? 24 : 32}
        sx={{ borderRadius: 4 }}
      />
    )
  }

  const getRole = () => {
    if (isAuthenticated) {
      if (isAdmin) {
        return {
          label: t('navigation.admin'),
          color: 'error' as const,
          icon: <AdminPanelSettingsIcon fontSize='small' />,
          tooltip: t('navigation.adminAccess'),
        }
      }
      return {
        label: t('navigation.user'),
        color: 'success' as const,
        icon: <PersonIcon fontSize='small' />,
        tooltip: t('navigation.registeredUser'),
      }
    }

    if (isGuest) {
      return {
        label: t('navigation.guest'),
        color: 'warning' as const,
        icon: <PersonOffIcon fontSize='small' />,
        tooltip: t('navigation.guestMode'),
      }
    }

    return {
      label: t('navigation.guest'),
      color: 'default' as const,
      icon: <PersonOffIcon fontSize='small' />,
      tooltip: t('navigation.notAuthenticated'),
    }
  }

  const role = getRole()

  return (
    <Tooltip title={role.tooltip} arrow>
      <Box sx={{ display: 'inline-flex' }}>
        <Chip
          icon={role.icon}
          label={showLabel ? role.label : undefined}
          color={role.color}
          size={size}
          variant='outlined'
          sx={{
            fontWeight: 600,
            cursor: 'default',
          }}
        />
      </Box>
    </Tooltip>
  )
}

export default RoleIndicator
