import { useState } from 'react'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  useTheme,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DevicesIcon from '@mui/icons-material/Devices'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '@cap/platform-core'
import { useSessions, useRevokeSession, useRevokeAllSessions } from '../../authentication-core/hooks/useAuthQuery'

export function ActiveSessions() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { addNotification } = useNotifications()
  const { data, isLoading } = useSessions()
  const revokeSessionMutation = useRevokeSession()
  const revokeAllMutation = useRevokeAllSessions()

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'single' | 'all'
    sessionId?: string
  }>({
    open: false,
    type: 'single',
  })

  if (isLoading) return null

  const handleOpenRevokeSingle = (sessionId: string) => {
    setConfirmDialog({
      open: true,
      type: 'single',
      sessionId,
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
          addNotification({
            type: 'success',
            title: t('auth.active_sessions.success_title', 'Session Revoked'),
            message: t('auth.active_sessions.success_end_session', 'The session has been terminated.'),
          })
          handleCloseDialog()
        },
        onError: (err: any) => {
          addNotification({
            type: 'error',
            title: t('common.error', 'Error'),
            message: err.message || t('auth.active_sessions.error_end_session', 'Failed to terminate session.'),
          })
        },
      })
    } else if (confirmDialog.type === 'all') {
      revokeAllMutation.mutate(undefined, {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: t('auth.active_sessions.success_title', 'All Sessions Revoked'),
            message: t('auth.active_sessions.success_end_all', 'All other active sessions have been terminated.'),
          })
          handleCloseDialog()
        },
        onError: (err: any) => {
          addNotification({
            type: 'error',
            title: t('common.error', 'Error'),
            message: err.message || t('auth.active_sessions.error_end_all', 'Failed to terminate all sessions.'),
          })
        },
      })
    }
  }

  const isPending = revokeSessionMutation.isPending || revokeAllMutation.isPending

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
            mb={4}
          >
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              {t('auth.active_sessions.title', 'Active Sessions')}
            </Typography>
            <Button
              variant='outlined'
              color='error'
              size='small'
              onClick={handleOpenRevokeAll}
              disabled={!data?.data?.sessions || data.data.sessions.length <= 1}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              {t('auth.active_sessions.button_end_all', 'Sign Out All Other Devices')}
            </Button>
          </Box>

          <List disablePadding>
            {data?.data?.sessions?.map((session: any, index: number) => (
              <ListItem
                key={session.id}
                divider={index !== (data?.data?.sessions?.length || 0) - 1}
                sx={{ py: 2, px: 0 }}
                secondaryAction={
                  !session.current && (
                    <IconButton
                      edge='end'
                      onClick={() => handleOpenRevokeSingle(session.id)}
                      color='error'
                      size='small'
                      aria-label="Revoke session"
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
                  <DevicesIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
                <ListItemText
                  primary={
                    <Box display='flex' alignItems='center' gap={1}>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {session.device_name}
                      </Typography>
                      {session.current && (
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
                    <Typography variant='body2' color='text.secondary'>
                      {session.ip_address} {' • '}
                      {t('auth.active_sessions.last_active', {
                        date: new Date(session.last_activity).toLocaleString(),
                        defaultValue: `Last active: ${new Date(session.last_activity).toLocaleString()}`,
                      })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Themed Confirmation Modal */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800 }}>
          <WarningAmberIcon color="error" />
          {confirmDialog.type === 'all'
            ? t('auth.active_sessions.dialog_title_all', 'Revoke All Other Sessions?')
            : t('auth.active_sessions.dialog_title_single', 'Revoke Device Session?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {confirmDialog.type === 'all'
              ? t(
                  'auth.active_sessions.dialog_desc_all',
                  'This will sign out your account from all other browsers and mobile devices. You will remain signed in on this device.',
                )
              : t(
                  'auth.active_sessions.dialog_desc_single',
                  'Are you sure you want to terminate this session? The device will immediately lose access and must sign in again.',
                )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={isPending} color="inherit" sx={{ fontWeight: 700 }}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleConfirmRevocation}
            disabled={isPending}
            variant="contained"
            color="error"
            sx={{ fontWeight: 800, borderRadius: 2 }}
          >
            {isPending
              ? t('common.processing', 'Revoking...')
              : confirmDialog.type === 'all'
                ? t('auth.active_sessions.confirm_revoke_all', 'Revoke All')
                : t('auth.active_sessions.confirm_revoke_single', 'Revoke Session')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}




