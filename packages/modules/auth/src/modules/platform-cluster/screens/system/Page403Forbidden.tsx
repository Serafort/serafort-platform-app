import { Box, Typography, Button, Avatar, Stack, alpha, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LockOutlined from '@mui/icons-material/LockOutlined'
import {
  BackIcon as ArrowBack,
  ForwardIcon as ArrowForward,
} from '../../components/common/DirectionalIcon'
import { AuthPageLayout } from '@idaas/authentication-core/components/shared/auth'
import { Path } from '../../../../routes/path'

const Page403Forbidden = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const theme = useTheme()

  return (
    <AuthPageLayout maxWidth={480}>
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar
            variant='rounded'
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.2),
            }}
          >
            <LockOutlined sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>

        <Typography
          variant='overline'
          sx={{
            fontWeight: 800,
            color: 'error.main',
            letterSpacing: '0.1em',
            display: 'block',
            mb: 1,
          }}
        >
          403 {t('errors.forbidden', 'Forbidden')}
        </Typography>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '-0.025em' }}>
          {t('errors.forbiddenTitle', 'Access Forbidden')}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6, maxWidth: 400, mx: 'auto' }}
        >
          {t(
            'errors.forbiddenDesc',
            "You don't have permission to access this resource. Please contact your administrator if you believe this is an error.",
          )}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant='outlined'
            fullWidth
            onClick={() => navigate(-1)}
            startIcon={<ArrowBack />}
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
            {t('common.goBack', 'Go Back')}
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
            {t('signin.title', 'Sign In')}
          </Button>
        </Stack>
      </Box>
    </AuthPageLayout>
  )
}

export default Page403Forbidden
