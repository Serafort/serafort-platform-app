import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Container,
  Paper,
  IconButton,
  Alert,
  AlertTitle,
  Tooltip,
  Stack,
  Skeleton,
} from '@mui/material'
import Computer from '@mui/icons-material/Computer'
import Smartphone from '@mui/icons-material/Smartphone'
import Laptop from '@mui/icons-material/Laptop'
import Tablet from '@mui/icons-material/Tablet'
import LocationOn from '@mui/icons-material/LocationOn'
import Security from '@mui/icons-material/Security'
import ArrowForward from '@mui/icons-material/ArrowForward'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import Refresh from '@mui/icons-material/Refresh'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import Devices from '@mui/icons-material/Devices'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Path } from '../../../../routes/path'
import {
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
} from '../../hooks/useSessionQuery'
import type { UserSession } from '../../types/session.types'
import ConfirmationDialog from '../../../authentication-core/components/shared/Modals/ConfirmationDialog'

interface ActiveSessionsProps {
  adminView?: boolean
  userName?: string
  userId?: string
}

export const ActiveSessionsManagement: React.FC<ActiveSessionsProps> = ({
  adminView,
  userName,
  userId,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'single' | 'all'
    sessionId?: string | number
    sessionName?: string
  }>({
    open: false,
    type: 'single',
  })

  // Queries
  const { data: response, isLoading, isError, error, refetch, isFetching } = useSessions()
  const sessions = response?.data?.sessions || []

  // Mutations
  const { mutate: revoke, isPending: isRevoking } = useRevokeSession({
    onSuccess: () => {
      toast.success(t('auth.account.session_revoked', 'Session revoked successfully'))
      setConfirmDialog({ open: false, type: 'single' })
    },
    onError: (err: any) => {
      toast.error(err?.message || t('auth.account.revoke_failed', 'Failed to revoke session'))
    },
  })

  const { mutate: revokeAll, isPending: isRevokingAll } = useRevokeAllSessions({
    onSuccess: () => {
      toast.success(t('auth.account.all_others_revoked', 'All other sessions revoked successfully'))
      setConfirmDialog({ open: false, type: 'all' })
    },
    onError: (err: any) => {
      toast.error(err?.message || t('auth.account.revoke_all_failed', 'Failed to revoke all sessions'))
    },
  })

  const currentSession =
    sessions.find((s: UserSession) => s.current || s.isCurrentSession) ||
    (sessions.length > 0 ? sessions[0] : undefined)
  const otherSessions = currentSession
    ? sessions.filter((s: UserSession) => s.id !== currentSession.id)
    : sessions

  const getDeviceIcon = (type?: string) => {
    switch (type) {
      case 'desktop':
        return <Computer fontSize='small' />
      case 'mobile':
        return <Smartphone fontSize='small' />
      case 'laptop':
        return <Laptop fontSize='small' />
      case 'tablet':
        return <Tablet fontSize='small' />
      default:
        return <Computer fontSize='small' />
    }
  }

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

  const handleConfirmAction = () => {
    if (confirmDialog.type === 'single' && confirmDialog.sessionId) {
      revoke(confirmDialog.sessionId)
    } else if (confirmDialog.type === 'all') {
      revokeAll()
    }
  }

  return (
    <Container maxWidth='lg' sx={{ py: adminView ? 0 : 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant='h4' fontWeight='bold' gutterBottom>
            {adminView
              ? t('auth.admin.investigateSessions', 'Investigate Sessions')
              : t('auth.account.active_sessions_title', 'Active Sessions')}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {adminView
              ? t(
                  'auth.admin.investigateDesc',
                  'Detailed technical breakdown of all active security contexts for user {{name}}.',
                  { name: userName || userId }
                )
              : t(
                  'auth.account.active_sessions_desc',
                  "View and manage the devices where you're currently signed in. If you see a device you don't recognize, revoke access immediately."
                )}
          </Typography>
        </Box>
        <IconButton onClick={() => refetch()} disabled={isLoading || isFetching}>
          <Refresh sx={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
        </IconButton>
      </Box>

      {isError && (
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' onClick={() => refetch()}>
              {t('common.retry', 'Retry')}
            </Button>
          }
          sx={{ mb: 4, borderRadius: 2 }}
        >
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          {error?.message || t('auth.account.error_loading_sessions', 'Failed to load active sessions.')}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: adminView ? 12 : 8 }}>
          {/* Current Session */}
          {!adminView && (
            <>
              <Typography variant='h6' fontWeight='bold' sx={{ mb: 2 }}>
                {t('auth.account.current_session', 'Current Session')}
              </Typography>
              {isLoading ? (
                <Skeleton variant='rectangular' height={100} sx={{ borderRadius: 2, mb: 4 }} />
              ) : currentSession ? (
                <Card
                  variant='outlined'
                  sx={{
                    borderRadius: 2,
                    mb: 4,
                    bgcolor: 'primary.lighter',
                    borderColor: 'primary.light',
                  }}
                >
                  <CardContent>
                    <ListItem disableGutters>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
                          {getDeviceIcon(currentSession.device_type || currentSession.deviceType)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={currentSession.device_name || currentSession.deviceName}
                        secondary={`${currentSession.browser || 'Browser'} • IP: ${currentSession.ip_address || currentSession.ipAddress}`}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                      <Chip
                        icon={<CheckCircleOutline sx={{ fontSize: 16 }} />}
                        label={t('auth.account.active_now', 'Active Now')}
                        color='primary'
                        size='small'
                      />
                    </ListItem>
                  </CardContent>
                </Card>
              ) : (
                <Alert severity='warning' sx={{ mb: 4, borderRadius: 2 }}>
                  {t('auth.account.no_current_session', 'Unable to identify current session.')}
                </Alert>
              )}
            </>
          )}

          {/* Other Sessions */}
          <Typography variant='h6' fontWeight='bold' sx={{ mb: 2 }}>
            {adminView
              ? t('auth.admin.activeTokens', 'Active Access Tokens')
              : t('auth.account.other_active_sessions', 'Other Active Sessions')}
          </Typography>
          <Paper variant='outlined' sx={{ borderRadius: 2 }}>
            <List disablePadding>
              {isLoading ? (
                [1, 2].map((i: number) => (
                  <Box key={i} sx={{ p: 2 }}>
                    <Skeleton variant='rectangular' height={60} sx={{ borderRadius: 2 }} />
                  </Box>
                ))
              ) : otherSessions.length > 0 ? (
                otherSessions.map((session: UserSession, index: number) => (
                  <React.Fragment key={session.id}>
                    <ListItem
                      secondaryAction={
                        <Stack direction='row' spacing={1}>
                          {adminView && (
                            <Tooltip title='View Session Metadata'>
                              <IconButton size='small'>
                                <InfoOutlined fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Button
                            variant={adminView ? 'outlined' : 'text'}
                            color='error'
                            size='small'
                            disabled={isRevoking}
                            onClick={() => handleOpenRevokeSingle(session)}
                            startIcon={<DeleteOutline />}
                            sx={{ textTransform: 'none' }}
                          >
                            {t('auth.account.revoke', 'Revoke')}
                          </Button>
                        </Stack>
                      }
                      sx={{ py: 2, px: 2 }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          {getDeviceIcon(session.device_type || session.deviceType)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <Typography variant='subtitle2' fontWeight={700}>
                              {session.device_name || session.deviceName || session.browser || 'Device'}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                            <Typography variant='body2' color='text.secondary'>
                              {session.browser || 'Unknown browser'}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mt: 0.5,
                              }}
                            >
                              <LocationOn sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant='caption' color='text.secondary'>
                                {session.location || t('common.unknown_location', 'Unknown Location')} • IP:{' '}
                                {session.ip_address || session.ipAddress}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < otherSessions.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem sx={{ py: 4, textAlign: 'center' }}>
                  <ListItemText
                    primary={
                      <Stack alignItems='center' spacing={1}>
                        <Devices sx={{ fontSize: 40, color: 'text.disabled' }} />
                        <Typography variant='subtitle1' fontWeight={600}>
                          {t('auth.account.no_other_sessions', 'No other active sessions')}
                        </Typography>
                      </Stack>
                    }
                    secondary={t(
                      'auth.account.no_other_sessions_desc',
                      'Your account is not currently in use on any other devices.'
                    )}
                    secondaryTypographyProps={{ align: 'center', sx: { mt: 1 } }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              variant='outlined'
              color='error'
              disabled={isRevokingAll || otherSessions.length === 0}
              onClick={handleOpenRevokeAll}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              {adminView
                ? t('auth.admin.terminateAll', 'Terminate All User Sessions')
                : t('auth.account.logout_all_others', 'Log out of all other sessions')}
            </Button>
          </Box>
        </Grid>

        {!adminView && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Alert
              severity='info'
              icon={<Security color='info' />}
              sx={{
                borderRadius: 2,
                '& .MuiAlert-message': { width: '100%' },
                bgcolor: 'info.lighter',
                border: '1px solid',
                borderColor: 'info.light',
              }}
            >
              <AlertTitle sx={{ fontWeight: 'bold' }}>
                {t('auth.account.security_tip', 'Security Tip')}
              </AlertTitle>
              <Typography variant='body2' sx={{ mb: 2 }}>
                {t(
                  'auth.account.security_tip_desc',
                  "Did you find a session you don't recognize? Revoke it and change your password to secure your account."
                )}
              </Typography>
              <Button
                variant='text'
                size='small'
                endIcon={<ArrowForward />}
                onClick={() => navigate(Path.account.changePassword)}
                sx={{ textTransform: 'none', fontWeight: 'bold', p: 0 }}
              >
                {t('auth.account.change_password', 'Change Password')}
              </Button>
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirmAction}
        severity='warning'
        isSubmitting={isRevoking || isRevokingAll}
        title={
          confirmDialog.type === 'single'
            ? t('auth.account.confirm_revoke_title', 'Revoke Session')
            : t('auth.account.confirm_revoke_all_title', 'Revoke All Other Sessions')
        }
        message={
          confirmDialog.type === 'single'
            ? t(
                'auth.account.confirm_revoke_msg',
                'Are you sure you want to terminate this session ({{name}})? The device will be signed out immediately.',
                { name: confirmDialog.sessionName }
              )
            : t(
                'auth.account.confirm_revoke_all_msg',
                'Are you sure you want to terminate all other active sessions? All other logged-in devices will need to sign in again.'
              )
        }
        confirmLabel={
          confirmDialog.type === 'single'
            ? t('auth.account.revoke', 'Revoke')
            : t('auth.account.revoke_all', 'Revoke All')
        }
        cancelLabel={t('common.cancel', 'Cancel')}
      />
    </Container>
  )
}

export default ActiveSessionsManagement
