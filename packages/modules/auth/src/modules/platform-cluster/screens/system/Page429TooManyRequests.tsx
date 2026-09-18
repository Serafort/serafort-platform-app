import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Avatar,
  Stack,
  alpha,
  useTheme,
} from '@mui/material'
import Speed from '@mui/icons-material/Speed'
import Refresh from '@mui/icons-material/Refresh'
import SupportAgent from '@mui/icons-material/SupportAgent'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthPageLayout } from '@idaas/authentication-core/components/shared/auth'

export default function Page429TooManyRequests() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const [secondsRemaining, setSecondsRemaining] = useState(30)

  useEffect(() => {
    if (secondsRemaining <= 0) {
      window.location.reload()
      return
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsRemaining])

  const progressPercent = Math.max(0, Math.min(100, ((30 - secondsRemaining) / 30) * 100))

  return (
    <AuthPageLayout maxWidth={480}>
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar
            variant='rounded'
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: 'warning.main',
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.2),
            }}
          >
            <Speed sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>

        <Typography
          variant='overline'
          sx={{
            fontWeight: 800,
            color: 'warning.main',
            letterSpacing: '0.1em',
            display: 'block',
            mb: 1,
          }}
        >
          429 {t('system.limitReached', 'Rate Limit Reached')}
        </Typography>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '-0.025em' }}>
          {t('system.rateLimitHeading', 'Please Slow Down')}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontWeight: 500, mb: 3, lineHeight: 1.6, maxWidth: 400, mx: 'auto' }}
        >
          {t(
            'system.rateLimitDescription',
            "We've detected a high number of requests from your connection. Auto-retrying in a few moments.",
          )}
        </Typography>

        <Typography variant='h6' sx={{ fontWeight: 800, color: 'warning.main', mb: 2 }}>
          {secondsRemaining > 0 ? `Retrying in ${secondsRemaining}s...` : 'Retrying now...'}
        </Typography>

        <LinearProgress
          variant='determinate'
          value={progressPercent}
          sx={{
            height: 6,
            borderRadius: 'var(--sf-radius-sm, 4px)',
            mb: 4,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 'var(--sf-radius-sm, 4px)',
              bgcolor: 'warning.main',
            },
          }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant='outlined'
            fullWidth
            onClick={() => window.location.reload()}
            startIcon={<Refresh />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 600,
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'text.primary',
                bgcolor: alpha(theme.palette.action.hover, 0.5),
              },
            }}
          >
            {t('system.retryNow', 'Try Again Now')}
          </Button>
          <Button
            variant='contained'
            fullWidth
            onClick={() => navigate('/contact')}
            startIcon={<SupportAgent />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 1,
              },
            }}
          >
            {t('common.contactSupport', 'Get Help')}
          </Button>
        </Stack>
      </Box>
    </AuthPageLayout>
  )
}
