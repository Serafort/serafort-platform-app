import React from 'react';
import { Box, Typography, Card, CardContent, Avatar, Button, Grid, List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Container, Paper, IconButton, Alert, AlertTitle, Tooltip, Stack, Skeleton } from '@mui/material';
import Computer from '@mui/icons-material/Computer';
import Smartphone from '@mui/icons-material/Smartphone';
import Laptop from '@mui/icons-material/Laptop';
import Tablet from '@mui/icons-material/Tablet';
import LocationOn from '@mui/icons-material/LocationOn';
import Security from '@mui/icons-material/Security';
import ArrowForward from '@mui/icons-material/ArrowForward';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Refresh from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSessions, useRevokeSession, useRevokeAllSessions, Path, UserSession } from '@auth';

interface ActiveSessionsProps {
  adminView?: boolean
  userName?: string
  userId?: string
}

const ActiveSessionsManagement = ({ adminView, userName, userId }: ActiveSessionsProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // Queries
  const { data: response, isLoading, refetch } = useSessions()
  const sessions = response?.data?.sessions || []

  // Mutations
  const { mutate: revoke, isPending: isRevoking } = useRevokeSession({
    onSuccess: () => {
      toast.success(t('auth.account.session_revoked', 'Session revoked successfully'), {  })
    },
    onError: (error: any) => {
      toast.error(error.message || t('auth.account.revoke_failed', 'Failed to revoke session'), {  })
    },
  })

  const { mutate: revokeAll, isPending: isRevokingAll } = useRevokeAllSessions({
    onSuccess: () => {
      toast.success(t('auth.account.all_others_revoked', 'All other sessions revoked'), {  })
    },
    onError: (error: any) => {
      toast.error(
        error.message || t('auth.account.revoke_all_failed', 'Failed to revoke all sessions')
      )
    },
  })

  const currentSession = sessions.find((s: UserSession) => s.current)
  const otherSessions = sessions.filter((s: UserSession) => !s.current)

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop':
        return <Computer />
      case 'mobile':
        return <Smartphone />
      case 'laptop':
        return <Laptop />
      case 'tablet':
        return <Tablet />
      default:
        return <Computer />
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
                  { name: userName || userId },
                )
              : t(
                  'auth.account.active_sessions_desc',
                  "View and manage the devices where you're currently signed in. If you see a device you don't recognize, revoke access immediately.",
                )}
          </Typography>
        </Box>
        <IconButton onClick={() => refetch()} disabled={isLoading}>
          <Refresh />
        </IconButton>
      </Box>

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
                          {getDeviceIcon(currentSession.device_type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={currentSession.device_name}
                        secondary={`${currentSession.browser} â€¢ ${currentSession.ip_address}`}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                      <Chip
                        label={t('auth.account.active_now', 'Active Now')}
                        color='primary'
                        size='small'
                      />
                    </ListItem>
                  </CardContent>
                </Card>
              ) : (
                <Alert severity='warning' sx={{ mb: 4 }}>
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
                  <Skeleton key={i} variant='rectangular' height={80} sx={{ mb: 1, borderRadius: 2 }} />
                ))
              ) : otherSessions.length > 0 ? (
                otherSessions.map((session: UserSession, index: number) => (
                  <React.Fragment key={session.id}>
                    <ListItem
                      secondaryAction={
                        <Stack direction='row' spacing={1}>
                          {adminView && (
                            <Tooltip title='View Full User Agent'>
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
                            onClick={() => revoke(session.id)}
                            startIcon={<DeleteOutline />}
                            sx={{ textTransform: 'none' }}
                          >
                            {t('auth.account.revoke', 'Revoke')}
                          </Button>
                        </Stack>
                      }
                      sx={{ py: 2 }}
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
                          {getDeviceIcon(session.device_type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <Typography variant='subtitle2' fontWeight={700}>
                              {session.device_name}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Box component='span' sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant='body2' color='text.secondary'>
                              {session.browser}
                            </Typography>
                            <Box
                              component='span'
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mt: 0.5,
                              }}
                            >
                              <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                              <Typography variant='caption' color='text.secondary'>
                                {session.location || t('common.unknown_location', 'Unknown Location')} â€¢ IP:{' '}
                                {session.ip_address}
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
                <ListItem>
                  <ListItemText
                    primary={t('auth.account.no_other_sessions', 'No other active sessions.')}
                    secondary={t(
                      'auth.account.no_other_sessions_desc',
                      'Your account is not currently in use on any other devices.',
                    )}
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
              onClick={() => revokeAll()}
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
                  "Did you find a session you don't recognize? Revoke it and change your password to secure your account.",
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
    </Container>
  )
}

export default ActiveSessionsManagement

