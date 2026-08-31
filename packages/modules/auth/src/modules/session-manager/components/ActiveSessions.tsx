import React, { useState } from 'react'
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Typography,
  Chip,
  Box,
  Skeleton,
  Alert,
  alpha,
  useTheme,
  Stack,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DevicesIcon from '@mui/icons-material/Devices'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Computer from '@mui/icons-material/Computer'
import Smartphone from '@mui/icons-material/Smartphone'
import Laptop from '@mui/icons-material/Laptop'
import Tablet from '@mui/icons-material/Tablet'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
} from '../hooks/useSessionQuery'
import type { UserSession } from '../types/session.types'
import ConfirmationDialog from '../../authentication-core/components/shared/Modals/ConfirmationDialog'

export function ActiveSessions() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { data, isLoading, isError, error, refetch } = useSessions()
  const revokeSessionMutation = useRevokeSession()
  const revokeAllMutation = useRevokeAllSessions()

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'single' | 'all'
    sessionId?: string | number
    sessionName?: string
  }>({
    open: false,
    type: 'single',
  })

  const sessions: UserSession[] = data?.data?.sessions || []
  const otherSessions = sessions.filter((s) => !s.current && !s.isCurrentSession)

  const handleOpenRevokeSingle = (session: UserSession) => {
    setConfirmDialog({
      open: true,
      type: 'single',
      sessionId: session.id,
      sessionName: session.deviceName || session.device_name || session.browser || 'Session',
    })
  }

  const handleOpenRevokeAll = () => {
    setConfirmDialog({
      open: true,
      type: 'all',
    })
  }

  const handleCloseDialog = () => {
    setConfirmDialog({ open: false, type: 'single' })
  }

  const handleConfirmRevocation = () => {
    if (confirmDialog.type === 'single' && confirmDialog.sessionId) {
      revokeSessionMutation.mutate(confirmDialog.sessionId, {
        onSuccess: () => {
          toast.success(t('auth.active_sessions.success_end_session', 'The session has been terminated.'))
          handleCloseDialog()
        },
        onError: (err: any) => {
          toast.error(err?.message || t('auth.active_sessions.error_end_session', 'Failed to terminate session.'))
        },
      })
    } else if (confirmDialog.type === 'all') {
      revokeAllMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success(t('auth.active_sessions.success_end_all', 'All other active sessions have been terminated.'))
          handleCloseDialog()
        },
        onError: (err: any) => {
          toast.error(err?.message || t('auth.active_sessions.error_end_all', 'Failed to terminate all sessions.'))
        },
      })
    }
  }

  const isPending = revokeSessionMutation.isPending || revokeAllMutation.isPending

  const getDeviceIcon = (type?: string) => {
    switch (type) {
      case 'desktop':
        return <Computer fontSize='small' sx={{ color: 'primary.main' }} />
      case 'mobile':
        return <Smartphone fontSize='small' sx={{ color: 'primary.main' }} />
      case 'laptop':
        return <Laptop fontSize='small' sx={{ color: 'primary.main' }} />
      case 'tablet':
        return <Tablet fontSize='small' sx={{ color: 'primary.main' }} />
      default:
        return <DevicesIcon fontSize='small' sx={{ color: 'primary.main' }} />
    }
  }

  return (
    <>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ padding: { xs: 3, sm: 4 } }}>
          <Box
            display='flex'
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent='space-between'
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={2}
            mb={3}
          >
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              {t('auth.active_sessions.title', 'Active Sessions')}
            </Typography>
            <Button
              variant='outlined'
              color='error'
              size='small'
              onClick={handleOpenRevokeAll}
              disabled={isLoading || otherSessions.length === 0}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              {t('auth.active_sessions.button_end_all', 'Sign Out All Other Devices')}
            </Button>
          </Box>

          {isError && (
            <Alert
              severity='error'
              action={
                <Button color='inherit' size='small' onClick={() => refetch()}>
                  {t('common.retry', 'Retry')}
                </Button>
              }
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error?.message || t('auth.account.error_loading_sessions', 'Failed to load sessions.')}
            </Alert>
          )}

          {isLoading ? (
            <Stack spacing={2}>
              {[1, 2].map((i) => (
                <Skeleton key={i} variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          ) : sessions.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <DevicesIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant='body1' color='text.secondary'>
                {t('auth.account.no_other_sessions', 'No active sessions found.')}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {sessions.map((session, index) => {
                const isCurrent = session.current || session.isCurrentSession
                const lastActivityDate = session.last_activity || session.lastActivity || session.created_at
                const formattedDate = lastActivityDate
                  ? new Date(lastActivityDate).toLocaleString()
                  : ''

                return (
                  <ListItem
                    key={session.id}
                    divider={index !== sessions.length - 1}
                    sx={{ py: 2, px: 0 }}
                    secondaryAction={
                      !isCurrent && (
                        <IconButton
                          edge='end'
                          onClick={() => handleOpenRevokeSingle(session)}
                          color='error'
                          size='small'
                          aria-label='Revoke session'
                          disabled={isPending}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      )
                    }
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        mr: 2,
                      }}
                    >
                      {getDeviceIcon(session.device_type || session.deviceType)}
                    </Box>
                    <ListItemText
                      disableTypography
                      primary={
                        <Box display='flex' alignItems='center' gap={1}>
                          <Typography variant='body1' sx={{ fontWeight: 600 }}>
                            {session.device_name || session.deviceName || session.browser || 'Device'}
                          </Typography>
                          {isCurrent && (
                            <Chip
                              label={t('auth.active_sessions.device_current', 'Current Device')}
                              size='small'
                              color='primary'
                              sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                          {session.ip_address || session.ipAddress}
                          {session.location ? ` • ${session.location}` : ''}
                          {formattedDate ? ` • ${t('auth.active_sessions.last_active', { date: formattedDate, defaultValue: `Last active: ${formattedDate}` })}` : ''}
                        </Typography>
                      }
                    />
                  </ListItem>
                )
              })}
            </List>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmRevocation}
        severity='warning'
        isSubmitting={isPending}
        title={
          confirmDialog.type === 'all'
            ? t('auth.active_sessions.dialog_title_all', 'Revoke All Other Sessions?')
            : t('auth.active_sessions.dialog_title_single', 'Revoke Device Session?')
        }
        message={
          confirmDialog.type === 'all'
            ? t(
                'auth.active_sessions.dialog_desc_all',
                'This will sign out your account from all other browsers and mobile devices. You will remain signed in on this device.'
              )
            : t(
                'auth.active_sessions.dialog_desc_single',
                'Are you sure you want to terminate this session ({{name}})? The device will immediately lose access and must sign in again.',
                { name: confirmDialog.sessionName }
              )
        }
        confirmLabel={
          confirmDialog.type === 'all'
            ? t('auth.active_sessions.confirm_revoke_all', 'Revoke All')
            : t('auth.active_sessions.confirm_revoke_single', 'Revoke Session')
        }
        cancelLabel={t('common.cancel', 'Cancel')}
      />
    </>
  )
}

export default ActiveSessions
