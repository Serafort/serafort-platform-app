import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import Logout from '@mui/icons-material/Logout'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { Path } from '@cap/module-auth/routes/path'
import { AuthOutcomeScreen, AuthStatusBadge } from '../../components/shared/auth'

export default function EmailChangeSuccess() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()

  return (
    <AuthOutcomeScreen
      tone='success'
      icon={<CheckCircleOutline sx={{ fontSize: 36 }} />}
      title={t('email.successHeading', 'All set!')}
      description={t(
        'email.successDescription',
        'Your email address has been successfully updated. Use your new email on your next login.',
      )}
      actions={
        <>
          <Button
            fullWidth
            variant='contained'
            size='large'
            color='success'
            onClick={() => navigate(Path.account.overview)}
            endIcon={<ArrowForward />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
            }}
          >
            {t('common.backToDashboard', 'Back to Dashboard')}
          </Button>
          <Button
            fullWidth
            variant='outlined'
            size='large'
            startIcon={<Logout />}
            onClick={() => navigate(Path.auth.signin)}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 700,
              textTransform: 'none',
              color: 'text.primary',
              borderColor: 'divider',
            }}
          >
            {t('common.logoutRelogin', 'Sign out and Re-login')}
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <AuthStatusBadge status='verified' label={t('email.statusCompleted', 'Completed')} />
      </Box>
    </AuthOutcomeScreen>
  )
}
