import { useState, useMemo } from 'react'
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
} from '@mui/material'
import Add from '@mui/icons-material/Add';
import LaptopMac from '@mui/icons-material/LaptopMac';
import Smartphone from '@mui/icons-material/Smartphone';
import Usb from '@mui/icons-material/Usb';
import MoreVert from '@mui/icons-material/MoreVert';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next'
import { useUserPasskeys, useDeletePasskey, useUpdatePasskey } from '@auth/modules/user-directory/hooks'
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
      return <LaptopMac />
    case 'smartphone':
      return <Smartphone />
    case 'security_key':
      return <Usb />
    default:
      return <LaptopMac />
  }
}

const getDeviceIconColor = (deviceType: string) => {
  switch (deviceType) {
    case 'laptop':
      return {
        bgcolor: 'rgba(19, 127, 236, 0.1)',
        color: 'primary.main',
      }
    case 'smartphone':
      return {
        bgcolor: 'rgba(156, 39, 176, 0.1)',
        color: '#9c27b0',
      }
    case 'security_key':
      return {
        bgcolor: 'rgba(255, 152, 0, 0.1)',
        color: '#ff9800',
      }
    default:
      return {
        bgcolor: 'rgba(19, 127, 236, 0.1)',
        color: 'primary.main',
      }
  }
}

const formatDate = (dateString: string | null, t: any): string => {
  if (!dateString) return t('auth.passkey.last_used_never')

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 5) return t('auth.passkey.time_just_now')
  if (diffMins < 60) return t('auth.passkey.time_minutes_ago', { count: diffMins })
  if (diffHours < 24) {
    return diffHours === 1
      ? t('auth.passkey.time_yesterday')
      : t('auth.passkey.time_hours_ago', { count: diffHours })
  }
  if (diffDays === 1) return t('auth.passkey.time_yesterday')
  if (diffDays < 30) return t('auth.passkey.time_days_ago', { count: diffDays })
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return months === 1
      ? t('auth.passkey.time_month_ago')
      : t('auth.passkey.time_months_ago', { count: months })
  }

  return date.toLocaleDateString()
}

const formatCreatedDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
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
  // const theme = useTheme()

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
      name: pk.name || t('auth.passkey.unnamed_device'),
      deviceType: pk.deviceType || 'laptop',
      createdAt: pk.createdAt || pk.created_at,
      lastUsedAt: pk.lastUsedAt || pk.last_used_at || null,
      credentialId: pk.credentialId || pk.credential_id,
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
      setSuccessMessage(t('auth.passkey.success_renamed'))
      setRenameDialogOpen(false)
      setMenuState({ anchorEl: null, passkey: null })
      setTimeout(() => setSuccessMessage(''), 5173)
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
      setSuccessMessage(t('auth.passkey.success_deleted'))
      setDeleteDialogOpen(false)
      setMenuState({ anchorEl: null, passkey: null })
      setTimeout(() => setSuccessMessage(''), 5173)
    } catch (error) {
      console.error('Failed to delete passkey:', error)
    }
  }

  const handleSetupSuccess = () => {
    setSetupDialogOpen(false)
    refetch()
    setSuccessMessage(t('auth.passkey.success_added'))
    setTimeout(() => setSuccessMessage(''), 5173)
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
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
          p: { xs: 2, md: 4, lg: 5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Success Message */}
        {successMessage && (
          <Alert severity='success' onClose={() => setSuccessMessage('')} sx={{ borderRadius: 2 }}>
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
            gap: 3,
          }}
        >
          <Box sx={{ maxWidth: 720 }}>
            <Typography
              variant='h3'
              sx={{
                fontSize: { xs: '1.875rem', md: '2.25rem' },
                fontWeight: 900,
                letterSpacing: '-0.033em',
                mb: 1,
              }}
            >
              {t('auth.passkey.management_title')}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
              {t('auth.passkey.management_desc')}
            </Typography>
          </Box>

          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => setSetupDialogOpen(true)}
            sx={{
              flexShrink: 0,
              height: 40,
              px: 2,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 1,
              '&:hover': {
                boxShadow: 2,
              },
            }}
          >
            {t('auth.passkey.add_passkey')}
          </Button>
        </Box>

        {/* Passkeys Table Card */}
        <Card
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 1,
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 8,
              }}
            >
              <CircularProgress />
            </Box>
          ) : passkeys.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 4,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: '50%',
                  p: 2,
                  mb: 2,
                }}
              >
                <Add sx={{ fontSize: 40, color: 'text.disabled' }} />
              </Box>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                {t('auth.passkey.no_passkeys')}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {t('auth.passkey.get_started')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: { xs: 600, md: 800 } }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: 'action.hover',
                    }}
                  >
                    <TableCell
                      sx={{
                        width: { xs: 60, md: 80 },
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                      }}
                    >
                      {t('auth.passkey.device')}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: { xs: '25%', md: '30%' },
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                      }}
                    >
                      {t('auth.passkey.name')}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: { xs: '20%', md: '25%' },
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                        display: { xs: 'none', sm: 'table-cell' },
                      }}
                    >
                      {t('auth.passkey.created')}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: { xs: '25%', md: '20%' },
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                      }}
                    >
                      {t('auth.passkey.last_used')}
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{
                        width: { xs: 60, md: 100 },
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                      }}
                    >
                      {t('auth.common.actions')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {passkeys.map((passkey) => (
                    <TableRow
                      key={passkey.id}
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            ...getDeviceIconColor(passkey.deviceType),
                          }}
                        >
                          {getDeviceIcon(passkey.deviceType)}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography
                            variant='body2'
                            sx={{
                              fontWeight: 500,
                              fontSize: '0.875rem',
                            }}
                          >
                            {passkey.name}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              display: { xs: 'block', sm: 'none' },
                              fontSize: '0.75rem',
                            }}
                          >
                            {formatCreatedDate(passkey.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', sm: 'table-cell' },
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
                      <TableCell>
                        {isRecentlyUsed(passkey.lastUsedAt) ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
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
                                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                                  opacity: 0.75,
                                  '@keyframes ping': {
                                    '75%, 100%': {
                                      transform: 'scale(2)',
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
                                fontWeight: 500,
                                fontSize: '0.875rem',
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
                      <TableCell align='right'>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, passkey)}
                          sx={{
                            color: 'text.disabled',
                            '&:hover': {
                              color: 'text.primary',
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
            boxShadow: 3,
            border: 1,
            borderColor: 'divider',
          },
        }}
      >
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <Edit fontSize='small' />
          </ListItemIcon>
          <ListItemText>{t('auth.common.rename')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            color: 'error.main',
          }}
        >
          <ListItemIcon>
            <Delete fontSize='small' color='error' />
          </ListItemIcon>
          <ListItemText>{t('auth.common.delete')}</ListItemText>
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
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{t('auth.passkey.rename_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('auth.passkey.rename_description')}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label={t('auth.passkey.device_name')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isRenaming}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setRenameDialogOpen(false)}
            disabled={isRenaming}
            sx={{ textTransform: 'none' }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            onClick={handleRenameSubmit}
            variant='contained'
            disabled={isRenaming || !newName.trim()}
            sx={{ textTransform: 'none' }}
          >
            {isRenaming ? <CircularProgress size={20} /> : t('auth.common.save')}
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
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{t('auth.passkey.delete_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('auth.passkey.delete_confirm')}</DialogContentText>
          {menuState.passkey && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  ...getDeviceIconColor(menuState.passkey.deviceType),
                }}
              >
                {getDeviceIcon(menuState.passkey.deviceType)}
              </Avatar>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {menuState.passkey.name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deletePasskeyMutation.isPending}
            sx={{ textTransform: 'none' }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant='contained'
            color='error'
            disabled={deletePasskeyMutation.isPending}
            sx={{ textTransform: 'none' }}
          >
            {deletePasskeyMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              t('auth.common.delete')
            )}
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
