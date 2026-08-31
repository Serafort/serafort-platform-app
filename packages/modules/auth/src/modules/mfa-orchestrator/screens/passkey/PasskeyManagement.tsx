import React, { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  alpha,
  Theme,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import LaptopMac from '@mui/icons-material/LaptopMac'
import Smartphone from '@mui/icons-material/Smartphone'
import Usb from '@mui/icons-material/Usb'
import MoreVert from '@mui/icons-material/MoreVert'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import Fingerprint from '@mui/icons-material/Fingerprint'
import ArrowBack from '@mui/icons-material/ArrowBack'
import WarningAmber from '@mui/icons-material/WarningAmber'
import Security from '@mui/icons-material/Security'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { buildSurfaceEffect, getTenantThemeEffects } from '@cap/theme'
import { useUserPasskeys, useDeletePasskey, useUpdatePasskey } from '../../../user-directory/hooks'
import { Path } from '../../../../routes/path'
import PasskeySetup from './PasskeySetup'

interface PasskeyDevice {
  id: string | number
  name: string
  deviceType: 'laptop' | 'smartphone' | 'security_key'
  createdAt: string
  lastUsedAt: string | null
  credentialId: string
}

interface MenuState {
  anchorEl: HTMLElement | null
  passkey: PasskeyDevice | null
}

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case 'laptop':
      return <LaptopMac sx={{ fontSize: 22 }} />
    case 'smartphone':
      return <Smartphone sx={{ fontSize: 22 }} />
    case 'security_key':
      return <Usb sx={{ fontSize: 22 }} />
    default:
      return <LaptopMac sx={{ fontSize: 22 }} />
  }
}

const getDeviceIconColor = (deviceType: string, theme: Theme) => {
  switch (deviceType) {
    case 'laptop':
      return {
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
      }
    case 'smartphone':
      return {
        bgcolor: alpha(theme.palette.secondary.main, 0.12),
        color: theme.palette.secondary.main,
      }
    case 'security_key':
      return {
        bgcolor: alpha(theme.palette.warning.main, 0.12),
        color: theme.palette.warning.main,
      }
    default:
      return {
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
      }
  }
}

const formatDate = (dateString: string | null, t: any): string => {
  if (!dateString) return t('auth.passkey.last_used_never', 'Never')

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 5) return t('auth.passkey.time_just_now', 'Just now')
  if (diffMins < 60)
    return t('auth.passkey.time_minutes_ago', '{{count}} minutes ago', { count: diffMins })
  if (diffHours < 24) {
    return diffHours === 1
      ? t('auth.passkey.time_yesterday', 'Yesterday')
      : t('auth.passkey.time_hours_ago', '{{count}} hours ago', { count: diffHours })
  }
  if (diffDays === 1) return t('auth.passkey.time_yesterday', 'Yesterday')
  if (diffDays < 30)
    return t('auth.passkey.time_days_ago', '{{count}} days ago', { count: diffDays })
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return months === 1
      ? t('auth.passkey.time_month_ago', '1 month ago')
      : t('auth.passkey.time_months_ago', '{{count}} months ago', { count: months })
  }

  return date.toLocaleDateString()
}

const formatCreatedDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const isRecentlyUsed = (dateString: string | null): boolean => {
  if (!dateString) return false
  const date = new Date(dateString)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000)
  return diffMins < 5
}

export default function PasskeyManagement() {
  const { t } = useTranslation()
  const theme = useTheme()
  const surfaceEffects = buildSurfaceEffect(getTenantThemeEffects(theme), theme)

  // State
  const [menuState, setMenuState] = useState<MenuState>({
    anchorEl: null,
    passkey: null,
  })
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Queries & Mutations
  const { data: passkeysRes, isLoading, refetch } = useUserPasskeys()
  const deletePasskeyMutation = useDeletePasskey()
  const updatePasskeyMutation = useUpdatePasskey()

  const passkeys: PasskeyDevice[] = useMemo(() => {
    return (passkeysRes?.data || []).map((pk: any) => ({
      id: pk.id,
      name: pk.name || t('auth.passkey.unnamed_device', 'Unnamed Device'),
      deviceType: pk.deviceType || pk.device_type || 'laptop',
      createdAt: pk.createdAt || pk.created_at || new Date().toISOString(),
      lastUsedAt: pk.lastUsedAt || pk.last_used_at || null,
      credentialId: pk.credentialId || pk.credential_id || '',
    }))
  }, [passkeysRes, t])

  // Handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, passkey: PasskeyDevice) => {
    setMenuState({
      anchorEl: event.currentTarget,
      passkey,
    })
  }

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      passkey: null,
    })
  }

  const handleRenameClick = () => {
    if (menuState.passkey) {
      setNewName(menuState.passkey.name)
      setRenameDialogOpen(true)
      handleMenuClose()
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
    handleMenuClose()
  }

  const handleRenameSubmit = async () => {
    if (!menuState.passkey || !newName.trim()) return

    setIsRenaming(true)
    try {
      await updatePasskeyMutation.mutateAsync({
        id: menuState.passkey.id,
        name: newName.trim(),
      })
      await refetch()
      setSuccessMessage(t('auth.passkey.success_renamed', 'Passkey renamed successfully'))
      setRenameDialogOpen(false)
      setMenuState({ anchorEl: null, passkey: null })
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Failed to rename passkey:', error)
    } finally {
      setIsRenaming(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!menuState.passkey) return

    try {
      await deletePasskeyMutation.mutateAsync(menuState.passkey.id)
      await refetch()
      setSuccessMessage(t('auth.passkey.success_deleted', 'Passkey deleted successfully'))
      setDeleteDialogOpen(false)
      setMenuState({ anchorEl: null, passkey: null })
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Failed to delete passkey:', error)
    }
  }

  const handleSetupSuccess = async () => {
    setSetupDialogOpen(false)
    await refetch()
    setSuccessMessage(t('auth.passkey.success_added', 'Passkey added successfully'))
    setTimeout(() => setSuccessMessage(''), 5000)
  }

  const handleSetupError = (error: string) => {
    console.error('Passkey setup error:', error)
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        height: '100%',
        bgcolor: 'background.default',
        py: { xs: 2, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1100,
          width: '100%',
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Navigation Breadcrumb / Back Link */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            component={RouterLink}
            to={Path.account.overview}
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              p: 0,
              '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
            }}
          >
            {t('auth.common.back', 'Back to Account')}
          </Button>
        </Box>

        {/* Success Alert */}
        {successMessage && (
          <Alert
            severity='success'
            onClose={() => setSuccessMessage('')}
            sx={{
              borderRadius: '12px',
              border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.success.main, 0.1)}`,
            }}
          >
            {successMessage}
          </Alert>
        )}

        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2.5,
          }}
        >
          <Box>
            <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 0.75 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Fingerprint sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                    color: 'text.primary',
                  }}
                >
                  {t('auth.passkey.management_title', 'Passkey Management')}
                </Typography>
              </Box>
            </Stack>
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', maxWidth: 640, lineHeight: 1.6 }}
            >
              {t(
                'auth.passkey.management_desc',
                'Manage your registered passkeys for fast, phishing-resistant passwordless sign-in across your devices.',
              )}
            </Typography>
          </Box>

          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => setSetupDialogOpen(true)}
            sx={{
              borderRadius: '10px',
              height: 44,
              px: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            {t('auth.passkey.add_passkey', 'Add Passkey')}
          </Button>
        </Box>

        {/* Passkeys Table Card */}
        <Card
          sx={{
            ...surfaceEffects,
            borderRadius: '16px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            overflow: 'hidden',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 4px 24px rgba(0, 0, 0, 0.4)'
                : '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                py: 10,
              }}
            >
              <CircularProgress size={36} thickness={4} />
              <Typography variant='body2' color='text.secondary'>
                {t('auth.common.loading', 'Loading passkeys...')}
              </Typography>
            </Box>
          ) : passkeys.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 10,
                px: 4,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '20px',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5,
                }}
              >
                <Fingerprint sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                {t('auth.passkey.no_passkeys', 'No passkeys found')}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 380, mb: 3 }}>
                {t(
                  'auth.passkey.no_passkeys_desc',
                  'You have not added any passkeys yet. Add one to securely sign in without a password.',
                )}
              </Typography>
              <Button
                variant='outlined'
                startIcon={<Add />}
                onClick={() => setSetupDialogOpen(true)}
                sx={{
                  borderRadius: '10px',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                }}
              >
                {t('auth.passkey.get_started', 'Get started by adding a passkey')}
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.background.default, 0.6)
                          : alpha(theme.palette.grey[50], 0.8),
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <TableCell
                      sx={{
                        width: 70,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                        py: 1.75,
                      }}
                    >
                      {t('auth.passkey.device', 'Device')}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                        py: 1.75,
                      }}
                    >
                      {t('auth.passkey.name', 'Passkey Name')}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                        display: { xs: 'none', sm: 'table-cell' },
                        py: 1.75,
                      }}
                    >
                      {t('auth.passkey.created', 'Created')}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                        py: 1.75,
                      }}
                    >
                      {t('auth.passkey.last_used', 'Last Used')}
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{
                        width: 80,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                        py: 1.75,
                      }}
                    >
                      {t('auth.common.actions', 'Actions')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {passkeys.map((passkey) => {
                    const iconStyle = getDeviceIconColor(passkey.deviceType, theme)
                    const isRecent = isRecentlyUsed(passkey.lastUsedAt)

                    return (
                      <TableRow
                        key={passkey.id}
                        sx={{
                          borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                          '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                          },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <TableCell sx={{ py: 1.75 }}>
                          <Avatar
                            variant='rounded'
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '10px',
                              ...iconStyle,
                            }}
                          >
                            {getDeviceIcon(passkey.deviceType)}
                          </Avatar>
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          <Box>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: 'text.primary',
                              }}
                            >
                              {passkey.name}
                            </Typography>
                            {passkey.credentialId && (
                              <Typography
                                variant='caption'
                                sx={{
                                  color: 'text.disabled',
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {passkey.credentialId.slice(0, 16)}...
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{
                            display: { xs: 'none', sm: 'table-cell' },
                            py: 1.75,
                          }}
                        >
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ fontSize: '0.875rem' }}
                          >
                            {formatCreatedDate(passkey.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          {isRecent ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  position: 'relative',
                                  width: 8,
                                  height: 8,
                                }}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    bgcolor: 'success.main',
                                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                                    opacity: 0.75,
                                    '@keyframes ping': {
                                      '75%, 100%': {
                                        transform: 'scale(2.2)',
                                        opacity: 0,
                                      },
                                    },
                                  }}
                                />
                                <Box
                                  sx={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    bgcolor: 'success.main',
                                  }}
                                />
                              </Box>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  color: 'success.main',
                                }}
                              >
                                {formatDate(passkey.lastUsedAt, t)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              sx={{ fontSize: '0.875rem' }}
                            >
                              {formatDate(passkey.lastUsedAt, t)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align='right' sx={{ py: 1.75 }}>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, passkey)}
                            size='small'
                            sx={{
                              color: 'text.secondary',
                              borderRadius: '8px',
                              '&:hover': {
                                color: 'text.primary',
                                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
                              },
                            }}
                          >
                            <MoreVert fontSize='small' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Security Info Card */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: '14px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.4)
                : alpha(theme.palette.grey[50], 0.6),
            border: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.12),
              color: 'info.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Security sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant='subtitle2' fontWeight={700} color='text.primary'>
              {t('auth.passkey.secured_by_webauthn', 'Secured by FIDO2 & WebAuthn')}
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
              {t(
                'auth.passkey.benefit_safety_desc',
                'Passkeys are cryptographically backed credentials stored securely on your devices, protecting against phishing and credential stuffing.',
              )}
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 160,
            borderRadius: '12px',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 32px rgba(0, 0, 0, 0.6)'
                : '0 8px 24px rgba(15, 23, 42, 0.12)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            p: 0.5,
          },
        }}
      >
        <MenuItem onClick={handleRenameClick} sx={{ borderRadius: '8px', py: 1 }}>
          <ListItemIcon>
            <Edit fontSize='small' sx={{ color: 'text.secondary' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}>
            {t('auth.common.rename', 'Rename')}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            borderRadius: '8px',
            py: 1,
            color: 'error.main',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <ListItemIcon>
            <Delete fontSize='small' color='error' />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}>
            {t('auth.common.delete', 'Delete')}
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={() => !isRenaming && setRenameDialogOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 24px 48px -12px rgba(0, 0, 0, 0.8)'
                : '0 24px 48px -12px rgba(15, 23, 42, 0.25)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pt: 2.5, px: 2.5, fontSize: '1.125rem' }}>
          {t('auth.passkey.rename_title', 'Rename Passkey')}
        </DialogTitle>
        <DialogContent sx={{ px: 2.5, py: 1.5 }}>
          <DialogContentText sx={{ mb: 2, fontSize: '0.875rem' }}>
            {t(
              'auth.passkey.rename_description',
              'Enter a new name for this passkey to help you identify it across your devices.',
            )}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label={t('auth.passkey.device_name', 'Device Name')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isRenaming}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setRenameDialogOpen(false)}
            disabled={isRenaming}
            variant='outlined'
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'divider',
              color: 'text.secondary',
            }}
          >
            {t('auth.common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleRenameSubmit}
            variant='contained'
            disabled={isRenaming || !newName.trim()}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              minWidth: 90,
            }}
          >
            {isRenaming ? (
              <CircularProgress size={18} color='inherit' />
            ) : (
              t('auth.common.save', 'Save')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deletePasskeyMutation.isPending && setDeleteDialogOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 24px 48px -12px rgba(0, 0, 0, 0.8)'
                : '0 24px 48px -12px rgba(15, 23, 42, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 800,
            color: 'error.main',
            fontSize: '1.125rem',
            pt: 2.5,
            px: 2.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'error.main',
            }}
          >
            <WarningAmber sx={{ fontSize: 22 }} />
          </Box>
          {t('auth.passkey.delete_title', 'Delete Passkey')}
        </DialogTitle>
        <DialogContent sx={{ px: 2.5, py: 1.5 }}>
          <DialogContentText sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            {t(
              'auth.passkey.delete_confirm',
              'Are you sure you want to delete this passkey? You will no longer be able to use it to sign in to your account.',
            )}
          </DialogContentText>
          {menuState.passkey && (
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                borderRadius: '10px',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Avatar
                variant='rounded'
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  ...getDeviceIconColor(menuState.passkey.deviceType, theme),
                }}
              >
                {getDeviceIcon(menuState.passkey.deviceType)}
              </Avatar>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {menuState.passkey.name}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {t('auth.passkey.created', 'Created')}:{' '}
                  {formatCreatedDate(menuState.passkey.createdAt)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deletePasskeyMutation.isPending}
            variant='outlined'
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'divider',
              color: 'text.secondary',
            }}
          >
            {t('auth.common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant='contained'
            disabled={deletePasskeyMutation.isPending}
            startIcon={
              deletePasskeyMutation.isPending ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <Delete sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              borderRadius: '10px',
              bgcolor: 'error.main',
              color: 'error.contrastText',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.error.main, 0.3)}`,
              '&:hover': {
                bgcolor: 'error.dark',
              },
            }}
          >
            {deletePasskeyMutation.isPending
              ? t('auth.common.deleting', 'Deleting...')
              : t('auth.common.delete', 'Delete Passkey')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Setup Dialog */}
      {setupDialogOpen && (
        <PasskeySetup
          open={setupDialogOpen}
          onClose={() => setSetupDialogOpen(false)}
          onSuccess={handleSetupSuccess}
          onError={handleSetupError}
        />
      )}
    </Box>
  )
}
