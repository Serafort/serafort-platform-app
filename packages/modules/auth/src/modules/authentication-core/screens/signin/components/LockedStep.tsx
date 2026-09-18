import React, { useState } from 'react'
import {
  Box,
  Button,
  Alert as MAlert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  alpha,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAppealBan } from '../../../hooks/useAuthQuery'

interface LockedStepProps {
  timeLeft: number
  countdownDisplay: string
  onBackToLogin: () => void
  defaultEmail?: string
}

export const LockedStep: React.FC<LockedStepProps> = ({
  timeLeft,
  countdownDisplay,
  onBackToLogin,
  defaultEmail = '',
}) => {
  const { t } = useTranslation()
  const minutes = Math.ceil(timeLeft / 60)
  const [openAppeal, setOpenAppeal] = useState(false)
  const [appealEmail, setAppealEmail] = useState(defaultEmail)
  const [appealReason, setAppealReason] = useState('')
  const [appealSubmitted, setAppealSubmitted] = useState(false)
  const [appealError, setAppealError] = useState<string | null>(null)

  const appealMutation = useAppealBan({
    onSuccess: () => {
      setAppealSubmitted(true)
      setAppealError(null)
    },
    onError: (err: any) => {
      setAppealError(
        err?.response?.data?.message ||
          t('auth.lockout.appealError', 'Failed to submit appeal. Please try again later.'),
      )
    },
  })

  const handleOpenAppeal = () => {
    setAppealEmail(defaultEmail)
    setAppealReason('')
    setAppealSubmitted(false)
    setAppealError(null)
    setOpenAppeal(true)
  }

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!appealEmail.trim() || !appealReason.trim()) return
    appealMutation.mutate({
      email: appealEmail.trim(),
      reason: appealReason.trim(),
    })
  }

  return (
    <Box
      sx={{
        px: { xs: 3, sm: 4 },
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        textAlign: 'center',
      }}
    >
      <MAlert
        severity='error'
        sx={{
          textAlign: 'left',
          borderRadius: '12px',
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
          color: 'error.main',
        }}
      >
        {t(
          'auth.lockout.message',
          'Account temporarily locked. Try again in {{minutes}} minutes.',
          {
            minutes,
          },
        )}
        <br />
        <Box component='span' sx={{ fontWeight: 600 }}>
          {t('auth.lockout.countdown', 'Countdown')}: {countdownDisplay}
        </Box>
      </MAlert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          variant='outlined'
          color='primary'
          onClick={handleOpenAppeal}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
        >
          {t('auth.lockout.appealButton', 'Appeal Account Lock')}
        </Button>
        <Button
          variant='text'
          onClick={onBackToLogin}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
        >
          {t('auth.common.backToLogin', 'Back to sign in')}
        </Button>
      </Box>

      <Dialog
        open={openAppeal}
        onClose={() => !appealMutation.isPending && setOpenAppeal(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('auth.lockout.appealTitle', 'Submit Ban Appeal')}
        </DialogTitle>
        <form onSubmit={handleSubmitAppeal}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant='body2' color='text.secondary'>
              {t(
                'auth.lockout.appealDescription',
                'If you believe your account was locked or suspended in error, please submit an appeal with your registered email and an explanation.',
              )}
            </Typography>

            {appealSubmitted ? (
              <MAlert severity='success' sx={{ borderRadius: '12px' }}>
                {t(
                  'auth.lockout.appealSuccess',
                  'Your appeal has been submitted successfully. An administrator will review your account.',
                )}
              </MAlert>
            ) : (
              <>
                {appealError && (
                  <MAlert severity='error' sx={{ borderRadius: '12px' }}>
                    {appealError}
                  </MAlert>
                )}

                <TextField
                  label={t('auth.common.email', 'Email Address')}
                  type='email'
                  required
                  fullWidth
                  value={appealEmail}
                  onChange={(e) => setAppealEmail(e.target.value)}
                  disabled={appealMutation.isPending}
                  slotProps={{ input: { sx: { borderRadius: '10px' } } }}
                />

                <TextField
                  label={t('auth.lockout.reasonLabel', 'Reason for Appeal')}
                  required
                  fullWidth
                  multiline
                  rows={4}
                  placeholder={t(
                    'auth.lockout.reasonPlaceholder',
                    'Please explain why your account should be unlocked or reinstated...',
                  )}
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  disabled={appealMutation.isPending}
                  slotProps={{ input: { sx: { borderRadius: '10px' } } }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setOpenAppeal(false)}
              disabled={appealMutation.isPending}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {appealSubmitted
                ? t('auth.common.close', 'Close')
                : t('auth.common.cancel', 'Cancel')}
            </Button>
            {!appealSubmitted && (
              <Button
                type='submit'
                variant='contained'
                disabled={appealMutation.isPending || !appealEmail.trim() || !appealReason.trim()}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
              >
                {appealMutation.isPending ? (
                  <CircularProgress size={20} color='inherit' />
                ) : (
                  t('auth.lockout.submitAppeal', 'Submit Appeal')
                )}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
