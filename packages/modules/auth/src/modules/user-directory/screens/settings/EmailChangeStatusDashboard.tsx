// EmailChangeStatusDashboard.tsx
// High-fidelity Email Change Progress & Status Dashboard matching profile.tsx design system

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Container,
  Paper,
  Divider,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Info from '@mui/icons-material/Info'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Mail from '@mui/icons-material/Mail'
import Security from '@mui/icons-material/Security'
import CancelOutlined from '@mui/icons-material/CancelOutlined'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNotifications } from '@cap/platform-core'
import { useGetUser, useRequestEmailChange } from '../../hooks/useUserQuery'

export default function EmailChangeStatusDashboard() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { addNotification } = useNotifications()

  const { data: userData } = useGetUser()
  const currentUser = userData?.data

  const stateNewEmail = (location.state as { newEmail?: string } | null)?.newEmail ?? ''
  const currentEmail = currentUser?.email ?? '—'

  // 15-minute countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const resendMutation = useRequestEmailChange({
    onSuccess: () => {
      setSecondsRemaining(15 * 60)
      addNotification?.({
        type: 'success',
        title: t('auth.account.resend_success', 'Verification Link Resent'),
        message: t('auth.account.resend_desc', 'A fresh confirmation link was sent to {{email}}.', {
          email: stateNewEmail,
        }),
      })
    },
    onError: (err) => {
      addNotification?.({
        type: 'error',
        title: t('auth.account.resend_failed', 'Resend Failed'),
        message:
          err?.message ||
          t(
            'auth.account.resend_failed_desc',
            'Unable to resend confirmation link at this moment.',
          ),
      })
    },
  })
  const isResending = resendMutation.isPending

  useEffect(() => {
    if (secondsRemaining <= 0) return
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsRemaining])

  const hours = String(Math.floor(secondsRemaining / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((secondsRemaining % 3600) / 60)).padStart(2, '0')
  const seconds = String(secondsRemaining % 60).padStart(2, '0')

  const steps = useMemo(
    () => [
      {
        label: t('auth.account.verify_current_email', 'Request Email Change'),
        description: t(
          'auth.account.current_email_desc',
          `Identity verified for current account (${currentEmail}).`,
        ),
        completed: true,
      },
      {
        label: t('auth.account.confirm_new_email', 'Confirm New Email Address'),
        description: t(
          'auth.account.confirm_new_email_desc',
          `We've dispatched a secure confirmation link to ${stateNewEmail}. Please click the link to finalize your new login credentials.`,
        ),
        completed: false,
      },
    ],
    [t, currentEmail, stateNewEmail],
  )

  const handleResend = () => {
    if (!stateNewEmail || isResending || secondsRemaining === 0) return
    resendMutation.mutate({ newEmail: stateNewEmail })
  }

  const handleCancelRequest = () => {
    setIsCancelDialogOpen(false)
    // No backend endpoint exists to revoke a pending email-change request; the
    // link simply expires on its own. Navigate away without claiming a
    // server-side cancellation.
    addNotification?.({
      type: 'info',
      title: t('auth.account.email_change_dismissed', 'Returned to Profile'),
      message: t(
        'auth.account.email_change_dismissed_desc',
        'The pending confirmation link will expire on its own if you do not use it.',
      ),
    })
    navigate('/profile')
  }

  return (
    <Container maxWidth='md' sx={{ py: { xs: 3, md: 5 } }}>
      {/* Navigation and Title */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          sx={{
            mb: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            p: 0,
            minWidth: 0,
            '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
          }}
        >
          {t('common.backToProfile', 'Back to Profile')}
        </Button>
        <Typography variant='h4' fontWeight={800} letterSpacing='-0.025em' gutterBottom>
          {t('auth.account.email_change_request', 'Email Change Request')}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {t(
            'auth.account.email_change_request_desc',
            'Follow the verification steps below to securely transition your account email.',
          )}
        </Typography>
      </Box>

      {/* Main Stepper Card */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stepper orientation='vertical' nonLinear activeStep={1}>
            {steps.map((step, index) => (
              <Step key={step.label} expanded active={index === 1}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor:
                          step.completed || index <= 1
                            ? theme.palette.primary.main
                            : alpha(theme.palette.text.disabled, 0.2),
                        color: theme.palette.primary.contrastText,
                        boxShadow:
                          index === 1
                            ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`
                            : 'none',
                      }}
                    >
                      {step.completed ? (
                        <CheckCircle sx={{ fontSize: 20 }} />
                      ) : (
                        <Typography variant='caption' fontWeight={800}>
                          {index + 1}
                        </Typography>
                      )}
                    </Box>
                  )}
                >
                  <Typography variant='subtitle1' fontWeight={700}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2, mt: 0.5 }}>
                    {step.description}
                  </Typography>
                  {index === 1 && (
                    <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1 }}>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={handleResend}
                        disabled={isResending || secondsRemaining === 0}
                        startIcon={
                          isResending ? (
                            <CircularProgress size={16} color='inherit' />
                          ) : (
                            <Mail sx={{ fontSize: 16 }} />
                          )
                        }
                        sx={{
                          textTransform: 'none',
                          borderRadius: 2,
                          fontWeight: 600,
                          borderColor: alpha(theme.palette.divider, 0.2),
                        }}
                      >
                        {isResending
                          ? t('auth.account.resending_link', 'Resending Link...')
                          : t('auth.account.resend_confirmation_link', 'Resend Confirmation Link')}
                      </Button>
                    </Stack>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ my: 3.5, opacity: 0.6 }} />

          {/* Expiration Countdown */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.background.default, 0.6),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              textAlign: 'center',
            }}
          >
            <Typography
              variant='caption'
              color='text.secondary'
              textTransform='uppercase'
              fontWeight={700}
              letterSpacing='0.08em'
            >
              {t('auth.account.security_link_expires_in', 'Security Link Expires In')}
            </Typography>
            <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 2 }}>
              {[
                { value: hours, label: t('common.hours', 'Hours') },
                { value: minutes, label: t('common.minutes', 'Minutes') },
                { value: seconds, label: t('common.seconds', 'Seconds') },
              ].map((unit, i) => (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Paper
                    variant='outlined'
                    sx={{
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      mb: 0.75,
                      bgcolor: 'background.paper',
                      borderColor: alpha(theme.palette.divider, 0.15),
                    }}
                  >
                    <Typography
                      variant='h5'
                      fontWeight={800}
                      color={secondsRemaining < 120 ? 'error.main' : 'primary.main'}
                    >
                      {unit.value}
                    </Typography>
                  </Paper>
                  <Typography variant='caption' color='text.secondary' fontWeight={600}>
                    {unit.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
            {secondsRemaining === 0 && (
              <Alert severity='warning' sx={{ mt: 2, borderRadius: 2 }}>
                {t(
                  'auth.account.link_expired_alert',
                  'The confirmation link has expired. Please click "Resend Confirmation Link" to generate a new one.',
                )}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Info & Cancellation Banner */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          bgcolor: alpha(theme.palette.info.main, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Stack direction='row' spacing={1.5} alignItems='flex-start'>
          <Info color='info' sx={{ mt: 0.25 }} />
          <Box>
            <Typography variant='subtitle2' fontWeight={700} color='info.main'>
              {t('auth.account.cancel_change_prompt', 'Need to cancel this change?')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t(
                'auth.account.cancel_change_prompt_desc',
                "If you didn't initiate this request or prefer to keep your existing email address, you can cancel the process at any time.",
              )}
            </Typography>
          </Box>
        </Stack>
        <Button
          variant='outlined'
          color='error'
          size='small'
          onClick={() => setIsCancelDialogOpen(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            whiteSpace: 'nowrap',
            alignSelf: { xs: 'flex-start', sm: 'center' },
          }}
        >
          {t('auth.account.cancel_request', 'Cancel Request')}
        </Button>
      </Box>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CancelOutlined color='error' />
          <Typography variant='h6' fontWeight={700}>
            {t('auth.account.cancel_email_change_dialog_title', 'Cancel Email Change?')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary'>
            {t(
              'auth.account.cancel_email_change_dialog_desc',
              'Are you sure you want to cancel this pending email change? Your account will continue to use {{email}}.',
              { email: currentEmail },
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsCancelDialogOpen(false)}
            color='inherit'
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('auth.account.keep_pending', 'Keep Pending')}
          </Button>
          <Button
            onClick={handleCancelRequest}
            variant='contained'
            color='error'
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {t('auth.account.confirm_cancel', 'Confirm Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
