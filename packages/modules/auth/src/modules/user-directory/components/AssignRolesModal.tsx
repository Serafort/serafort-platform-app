// AssignRolesModal.tsx
// Modal for assigning/syncing user roles with dynamic permission preview

import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  TextField,
  Alert,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useTranslation } from 'react-i18next'
import { useRolesQuery } from '../hooks/useUserDirectoryQuery'
import { useAssignRolesMutation } from '../hooks/useUserDirectoryMutations'
import { UserRoleDTO } from '../types/userDirectory.types'
import DialogCloseButton from './DialogCloseButton'

export interface AssignRolesModalProps {
  open: boolean
  userId: string | number | null
  userName?: string
  currentRoles?: Array<UserRoleDTO | { id: number; name: string }>
  onClose: () => void
  onSuccess?: () => void
}

const TITLE_ID = 'assign-roles-dialog-title'

export default function AssignRolesModal({
  open,
  userId,
  userName,
  currentRoles = [],
  onClose,
  onSuccess,
}: AssignRolesModalProps) {
  const theme = useTheme()
  const { t } = useTranslation('common')
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [reason, setReason] = useState<string>('')

  const {
    data: rolesResponse,
    isLoading: isRolesLoading,
    isError: isRolesError,
    refetch: refetchRoles,
  } = useRolesQuery()

  // Roles come from the tenant's role catalogue only. There is deliberately no
  // placeholder list: assigning a role id that was invented client-side would
  // grant whatever that id means on the server.
  const availableRoles = useMemo(() => rolesResponse?.data ?? [], [rolesResponse])

  useEffect(() => {
    if (open) {
      setSelectedRoleIds(currentRoles.map((r) => r.id))
      setReason('')
    }
  }, [open, currentRoles])

  const assignRolesMutation = useAssignRolesMutation({
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
  })

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    )
  }

  const handleSave = () => {
    if (!userId || selectedRoleIds.length === 0) return
    assignRolesMutation.mutate({
      id: userId,
      data: {
        roleIds: selectedRoleIds,
        reason: reason.trim() || undefined,
      },
    })
  }

  const selectedRolesDetails = useMemo(() => {
    return availableRoles.filter((r) => selectedRoleIds.includes(r.id))
  }, [availableRoles, selectedRoleIds])

  return (
    <Dialog
      open={open}
      onClose={assignRolesMutation.isPending ? undefined : onClose}
      maxWidth='sm'
      fullWidth
      aria-labelledby={TITLE_ID}
      PaperProps={{
        sx: {
          borderRadius: 'var(--sf-radius-lg, 12px)',
          boxShadow: `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.25)}`,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
        },
      }}
    >
      <DialogTitle
        component='div'
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Stack direction='row' spacing={1.5} alignItems='center'>
          <Box
            sx={{
              p: 1,
              borderRadius: 'var(--sf-radius-md, 8px)',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
            }}
          >
            <AdminPanelSettingsIcon />
          </Box>
          <Box>
            <Typography id={TITLE_ID} variant='h6' component='h2' fontWeight={700}>
              {t('auth.userDirectory.dialogs.assignRoles.title', 'Assign Roles & Permissions')}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {userName
                ? t(
                    'auth.userDirectory.dialogs.assignRoles.subtitleNamed',
                    'Modifying role assignments for {{name}}',
                    { name: userName },
                  )
                : t(
                    'auth.userDirectory.dialogs.assignRoles.subtitle',
                    'Update user security roles',
                  )}
            </Typography>
          </Box>
        </Stack>
        <DialogCloseButton onClick={onClose} disabled={assignRolesMutation.isPending} />
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography variant='subtitle2' fontWeight={600}>
            {t('auth.userDirectory.dialogs.assignRoles.availableRoles', 'Available tenant roles')}
          </Typography>

          {isRolesLoading ? (
            <Stack spacing={1} aria-busy='true'>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant='rounded' height={56} />
              ))}
            </Stack>
          ) : isRolesError ? (
            <Alert
              severity='error'
              action={
                <Button color='inherit' size='small' onClick={() => refetchRoles()} sx={{ minHeight: 44 }}>
                  {t('auth.common.retry', 'Retry')}
                </Button>
              }
            >
              {t(
                'auth.userDirectory.dialogs.assignRoles.loadError',
                'Roles could not be loaded. Try again before changing assignments.',
              )}
            </Alert>
          ) : availableRoles.length === 0 ? (
            <Alert severity='info'>
              {t(
                'auth.userDirectory.dialogs.assignRoles.empty',
                'No roles are defined for this tenant yet.',
              )}
            </Alert>
          ) : (
            <List
              aria-label={t(
                'auth.userDirectory.dialogs.assignRoles.availableRoles',
                'Available tenant roles',
              )}
              sx={{
                p: 0,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 'var(--sf-radius-md, 8px)',
                overflow: 'hidden',
              }}
            >
              {availableRoles.map((role, idx) => {
                const isSelected = selectedRoleIds.includes(role.id)
                return (
                  <React.Fragment key={role.id}>
                    {idx > 0 && (
                      <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }} />
                    )}
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => toggleRole(role.id)}
                        selected={isSelected}
                        sx={{
                          p: 1.75,
                          minHeight: 56,
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                          '&:hover, &.Mui-selected:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${theme.palette.primary.main}`,
                            outlineOffset: -2,
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 44 }}>
                          <Checkbox
                            edge='start'
                            checked={isSelected}
                            tabIndex={-1}
                            disableRipple
                            color='primary'
                            inputProps={{ 'aria-label': role.name }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction='row' spacing={1} alignItems='center'>
                              <Typography variant='body2' fontWeight={700}>
                                {role.name}
                              </Typography>
                              {role.slug === 'admin' && (
                                <Chip
                                  label={t('auth.userDirectory.dialogs.assignRoles.adminChip', 'Admin')}
                                  size='small'
                                  color='primary'
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Typography variant='caption' color='text.secondary'>
                              {role.description ||
                                t(
                                  'auth.userDirectory.dialogs.assignRoles.defaultDescription',
                                  'Provides standard tenant capabilities',
                                )}
                            </Typography>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                )
              })}
            </List>
          )}

          {/* Dynamic Capability Preview */}
          {selectedRolesDetails.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 'var(--sf-radius-md, 8px)',
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography
                variant='caption'
                color='primary.main'
                fontWeight={700}
                display='block'
                mb={1}
              >
                {t('auth.userDirectory.dialogs.assignRoles.effective', 'Effective granted capabilities')}
              </Typography>
              <Stack direction='row' flexWrap='wrap' gap={0.75}>
                {selectedRolesDetails.map((r) => (
                  <Chip
                    key={r.id}
                    icon={<CheckCircleIcon fontSize='small' />}
                    label={r.name}
                    size='small'
                    color='primary'
                    variant='outlined'
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <TextField
            fullWidth
            label={t('auth.userDirectory.dialogs.assignRoles.reason', 'Audit reason (optional)')}
            placeholder={t(
              'auth.userDirectory.dialogs.assignRoles.reasonPlaceholder',
              'e.g. Promoted to team lead, security audit adjustment',
            )}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            InputProps={{ sx: { minHeight: 48 } }}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          justifyContent: 'space-between',
        }}
      >
        <Button
          onClick={onClose}
          color='inherit'
          sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }}
        >
          {t('auth.common.cancel', 'Cancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={assignRolesMutation.isPending || selectedRoleIds.length === 0 || isRolesError}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            borderRadius: 'var(--sf-radius-md, 8px)',
            minWidth: 120,
            minHeight: 44,
          }}
        >
          {assignRolesMutation.isPending ? (
            <CircularProgress size={20} color='inherit' />
          ) : (
            t('auth.userDirectory.dialogs.assignRoles.save', 'Save roles')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
