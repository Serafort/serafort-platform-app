import React, { useState } from 'react'
import {
  alpha,
  Box,
  Typography,
  Card,
  CardContent,
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
import LocationOn from '@mui/icons-material/LocationOn'
import Security from '@mui/icons-material/Security'
import ArrowForward from '@mui/icons-material/ArrowForward'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import Devices from '@mui/icons-material/Devices'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Path } from '../../../../routes/path'
import { useSessions, useRevokeSession, useRevokeAllSessions } from '../../hooks/useSessionQuery'
import type { UserSession } from '../../types/session.types'
import { AdminPageHeader } from '../../../authentication-core/components/shared/admin'
import RefreshButton from '../../components/RefreshButton'
import {
  AuthConfirmDrawer,
  DevicePlatformIcon,
  resolveDevicePlatform,
} from '../../../authentication-core/components/shared/auth'

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
      toast.error(
        err?.message || t('auth.account.revoke_all_failed', 'Failed to revoke all sessions'),
      )
    },
  })

  const currentSession =
    sessions.find((s: UserSession) => s.current || s.isCurrentSession) ||
    (sessions.length > 0 ? sessions[0] : undefined)
  const otherSessions = currentSession
    ? sessions.filter((s: UserSession) => s.id !== currentSession.id)
    : sessions

  /**
   * Sessions arrive with a coarse `device_type` but also a user-agent-derived
   * browser/OS string. Feeding the richer string to the shared resolver is
   * what lets the list show an Apple, Android, Windows or Linux mark instead
   * of the same generic monitor for every row.
   */
  const describeDevice = (session: UserSession) =>
    [session.os, session.browser, session.device_name || session.deviceName]
      .filter(Boolean)
      .join(' ') ||
    session.device_type ||
    session.deviceType ||
    ''

  const sessionLocation = (session: UserSession) =>
    session.location || [session.city, session.country].filter(Boolean).join(', ') || ''

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
      <AdminPageHeader
        icon={<Devices />}
        title={
          adminView
            ? t('auth.admin.investigateSessions', 'Investigate Sessions')
            : t('auth.account.active_sessions_title', 'Active Sessions')
        }
        description={
          adminView
            ? t(
                'auth.admin.investigateDesc',
                'Detailed technical breakdown of all active security contexts for user {{name}}.',
                { name: userName || userId },
              )
            : t(
                'auth.account.active_sessions_desc',
                "View and manage the devices where you're currently signed in. If you see a device you don't recognize, revoke access immediately.",
              )
        }
        actions={
          <RefreshButton
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
            disabled={isLoading || isFetching}
          />
        }
      />

      {isError && (
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' onClick={() => refetch()}>
              {t('common.retry', 'Retry')}
            </Button>
          }
          sx={{ mb: 4, borderRadius: 'var(--sf-radius-md, 8px)' }}
        >
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          {error?.message ||
            t('auth.account.error_loading_sessions', 'Failed to load active sessions.')}
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
                <Skeleton variant='rectangular' height={100} sx={{ borderRadius: 'var(--sf-radius-lg, 12px)', mb: 4 }} />
              ) : currentSession ? (
                <Card
                  variant='outlined'
                  sx={{
                    borderRadius: 'var(--sf-radius-lg, 12px)',
                    mb: 4,
                    bgcolor: (th) => alpha(th.palette.success.main, 0.06),
                    borderColor: (th) => alpha(th.palette.success.main, 0.3),
                  }}
                >
                  <CardContent>
                    <ListItem disableGutters>
                      <ListItemIcon>
                        <DevicePlatformIcon
                          source={describeDevice(currentSession)}
                          active
                          label={t('auth.account.current_session', 'Current Session')}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={currentSession.device_name || currentSession.deviceName}
                        secondary={`${currentSession.browser || t('auth.account.unknown_browser', 'Unknown browser')} • ${currentSession.ip_address || currentSession.ipAddress || ''}`}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                      <Chip
                        icon={<CheckCircleOutline sx={{ fontSize: 16 }} />}
                        label={t('auth.account.active_now', 'Active Now')}
                        color='success'
                        size='small'
                        sx={{ fontWeight: 700 }}
                      />
                    </ListItem>
                  </CardContent>
                </Card>
              ) : (
                <Alert severity='warning' sx={{ mb: 4, borderRadius: 'var(--sf-radius-md, 8px)' }}>
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
          <Paper variant='outlined' sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }}>
            <List disablePadding>
              {isLoading ? (
                [1, 2].map((i: number) => (
                  <Box key={i} sx={{ p: 2 }}>
                    <Skeleton variant='rectangular' height={60} sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }} />
                  </Box>
                ))
              ) : otherSessions.length > 0 ? (
                otherSessions.map((session: UserSession, index: number) => (
                  <React.Fragment key={session.id}>
                    <ListItem
                      secondaryAction={
                        <Stack direction='row' spacing={1}>
                          {adminView && (
                            <Tooltip
                              title={t('auth.admin.viewSessionMetadata', 'View session metadata')}
                            >
                              <IconButton
                                aria-label={t(
                                  'auth.admin.viewSessionMetadata',
                                  'View session metadata',
                                )}
                                sx={{ width: 44, height: 44 }}
                              >
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
                            sx={{ minHeight: 44, textTransform: 'none' }}
                          >
                            {t('auth.account.revoke', 'Revoke')}
                          </Button>
                        </Stack>
                      }
                      sx={{ py: 2, px: 2 }}
                    >
                      <ListItemIcon>
                        <DevicePlatformIcon source={describeDevice(session)} />
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <Typography variant='subtitle2' fontWeight={700}>
                              {session.device_name ||
                                session.deviceName ||
                                session.browser ||
                                t('auth.account.unknown_device', 'Unknown device')}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Stack
                            direction='row'
                            spacing={0.75}
                            flexWrap='wrap'
                            useFlexGap
                            sx={{ mt: 0.75 }}
                          >
                            <Chip
                              size='small'
                              label={
                                session.browser ||
                                t('auth.account.unknown_browser', 'Unknown browser')
                              }
                              sx={{ height: 24, fontWeight: 600 }}
                            />
                            <Chip
                              size='small'
                              icon={<LocationOn sx={{ fontSize: 14 }} />}
                              label={
                                sessionLocation(session) ||
                                t('common.unknown_location', 'Unknown Location')
                              }
                              sx={{ height: 24, fontWeight: 600 }}
                            />
                            {(session.ip_address || session.ipAddress) && (
                              <Chip
                                size='small'
                                dir='ltr'
                                label={session.ip_address || session.ipAddress}
                                sx={{ height: 24, fontFamily: 'monospace', fontWeight: 600 }}
                              />
                            )}
                            <Chip
                              size='small'
                              variant='outlined'
                              label={resolveDevicePlatform(describeDevice(session))}
                              sx={{ height: 24, fontWeight: 600, textTransform: 'capitalize' }}
                            />
                          </Stack>
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
                      'Your account is not currently in use on any other devices.',
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
              sx={{ minHeight: 44, textTransform: 'none', borderRadius: 'var(--sf-radius-md, 8px)' }}
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
                borderRadius: 'var(--sf-radius-lg, 12px)',
                '& .MuiAlert-message': { width: '100%' },
                bgcolor: (th) => alpha(th.palette.info.main, 0.06),
                border: '1px solid',
                borderColor: (th) => alpha(th.palette.info.main, 0.3),
              }}
            >
              <AlertTitle sx={{ fontWeight: 'bold' }}>
                {t('auth.account.security_tip', 'Security Tip')}
              </AlertTitle>
              <Typography variant='body2' sx={{ mb: 2 }}>
                {t(
                  'auth.account.security_tip_desc',
                  "Did you find a session you don't recognize? Revoke it and change your password to secure your account.",
                )}
              </Typography>
              <Button
                variant='text'
                size='small'
                endIcon={<ArrowForward />}
                onClick={() => navigate(Path.account.changePassword)}
                sx={{ textTransform: 'none', fontWeight: 'bold', p: 0, minHeight: 44 }}
              >
                {t('auth.account.change_password', 'Change Password')}
              </Button>
            </Alert>
          </Grid>
        )}
      </Grid>

      <AuthConfirmDrawer
        id='session-revoke-confirm'
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirmAction}
        tone='error'
        loading={isRevoking || isRevokingAll}
        title={
          confirmDialog.type === 'single'
            ? t('auth.account.confirm_revoke_title', 'Revoke Session')
            : t('auth.account.confirm_revoke_all_title', 'Revoke All Other Sessions')
        }
        description={
          confirmDialog.type === 'single'
            ? t(
                'auth.account.confirm_revoke_msg',
                'Are you sure you want to terminate this session ({{name}})? The device will be signed out immediately.',
                { name: confirmDialog.sessionName },
              )
            : t(
                'auth.account.confirm_revoke_all_msg',
                'Are you sure you want to terminate all other active sessions? All other logged-in devices will need to sign in again.',
              )
        }
        confirmLabel={
          confirmDialog.type === 'single'
            ? t('auth.account.revoke', 'Revoke')
            : t('auth.account.revoke_all', 'Revoke All')
        }
      />
    </Container>
  )
}

export default ActiveSessionsManagement
