import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import TimerOffOutlined from '@mui/icons-material/TimerOffOutlined'
import History from '@mui/icons-material/History'
import ContactSupport from '@mui/icons-material/ContactSupport'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { Path } from '@cap/module-auth/routes/path'
import { AuthOutcomeScreen, AuthStatusBadge } from '../../components/shared/auth'
import { AppPaths } from '@cap/shared-types'

export default function EmailChangeFailed() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()

  return (
    <AuthOutcomeScreen
      tone='error'
      icon={<TimerOffOutlined sx={{ fontSize: 36 }} />}
      title={t('email.expiredHeading', 'Link Expired')}
      description={t(
        'email.expiredDescription',
        'The email change verification link has expired or is invalid. For your security, these links are only active for a short period.',
      )}
      actions={
        <>
          <Button
            variant='contained'
            size='large'
            fullWidth
            onClick={() => navigate(Path.account.initiateEmailChange)}
            startIcon={<History />}
            endIcon={<ArrowForward />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
            }}
          >
            {t('email.requestNewLink', 'Request New Link')}
          </Button>
          {/* Previously rendered without a handler, so the button did nothing. */}
          <Button
            variant='outlined'
            size='large'
            fullWidth
            startIcon={<ContactSupport />}
            onClick={() => navigate(AppPaths.landing.contact)}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 700,
              textTransform: 'none',
              color: 'text.primary',
              borderColor: 'divider',
            }}
          >
            {t('common.contactSupport', 'Contact Support')}
          </Button>
          <Button
            onClick={() => navigate(Path.account.profile)}
            sx={{
              minHeight: 44,
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            {t('common.backToDashboard', 'Back to Dashboard')}
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <AuthStatusBadge status='expired' label={t('email.statusExpired', 'Expired')} />
      </Box>
    </AuthOutcomeScreen>
  )
}
