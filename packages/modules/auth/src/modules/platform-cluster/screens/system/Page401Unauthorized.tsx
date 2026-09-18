import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Avatar, alpha, useTheme, Stack } from '@mui/material'
import LockOutlined from '@mui/icons-material/LockOutlined'
import Home from '@mui/icons-material/Home'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { AuthPageLayout } from '@idaas/authentication-core/components/shared/auth'
import { Path } from '../../../../routes/path'

export default function Page401Unauthorized() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

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
            <LockOutlined sx={{ fontSize: 32 }} />
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
          401 {t('system.error', 'Error')}
        </Typography>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '-0.025em' }}>
          {t('system.unauthorizedHeading', 'Access Denied')}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6, maxWidth: 400, mx: 'auto' }}
        >
          {t(
            'system.unauthorizedDescription',
            "You don't have permission to access this page. Please make sure you're signed in with the correct account.",
          )}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant='outlined'
            fullWidth
            onClick={() => navigate('/')}
            startIcon={<Home />}
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
            {t('system.backHome', 'Back Home')}
          </Button>
          <Button
            variant='contained'
            fullWidth
            onClick={() => navigate(Path.auth.signin)}
            endIcon={<ArrowForward />}
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
            {t('common.loginButton', 'Log In')}
          </Button>
        </Stack>

        <Typography
          variant='caption'
          sx={{ mt: 4, display: 'block', color: 'text.disabled', fontWeight: 500 }}
        >
          {t('system.incidentId', 'Incident ID')}:{' '}
          <Box component='span' sx={{ fontFamily: 'monospace' }}>
            UNAUTH-{new Date().getFullYear()}-REF-4829
          </Box>
        </Typography>
      </Box>
    </AuthPageLayout>
  )
}
