import React from 'react'
import { Box, Typography, Button, Stack, CircularProgress, alpha } from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { AuthScreenIcon, AuthActionButton } from '../../../components/shared/auth'

interface SuccessStepProps {
  t: any
  onContinue?: () => void
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ t, onContinue }) => {
  return (
    <Box
      sx={{
        px: { xs: 3, sm: 4 },
        py: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 3,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <AuthScreenIcon
          icon={
            <CheckCircle
              sx={{
                fontSize: 36,
                color: 'success.main',
              }}
            />
          }
        />
      </Box>

      <Box>
        <Typography
          variant='h5'
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            mb: 1.5,
            fontFamily: 'var(--font-h5, inherit)',
          }}
        >
          {t('signUp.successTitle', 'Welcome aboard!')}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ lineHeight: 1.6, maxWidth: '340px', mx: 'auto' }}
        >
          {t(
            'signUp.successSubtitle',
            'Your account has been successfully verified. Preparing your workspace...',
          )}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
        <CircularProgress size={20} color='primary' thickness={5} />
        <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t('signUp.redirecting', 'Redirecting shortly...')}
        </Typography>
      </Box>

      {onContinue && (
        <AuthActionButton fullWidth onClick={onContinue} endIcon={<ArrowForward />} sx={{ mt: 1 }}>
          {t('signUp.continueNow', 'Continue to Workspace')}
        </AuthActionButton>
      )}
    </Box>
  )
}
