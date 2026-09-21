import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import Celebration from '@mui/icons-material/Celebration'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { Path } from '../../../../../routes/path'
import { AuthOutcomeScreen, AuthActionButton } from '../../../components/shared/auth'
import { AppPaths } from '@cap/shared-types'

export default function EmailVerifiedSuccess() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()

  return (
    <AuthOutcomeScreen
      tone='success'
      icon={<Celebration sx={{ fontSize: 36 }} />}
      title={t('verify.verifiedHeading', "You're Verified!")}
      description={t(
        'verify.verifiedDescription',
        'Your email has been confirmed. You now have full access to all features.',
      )}
      actions={
        <>
          <AuthActionButton
            fullWidth
            onClick={() => navigate(AppPaths.dashboard.dashboard)}
            endIcon={<ArrowForward />}
            label={t('verify.getStarted', 'Explore Dashboard')}
          />
          <Button
            fullWidth
            variant='outlined'
            size='large'
            onClick={() => navigate(Path.account.overview)}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 700,
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'text.primary',
              },
            }}
          >
            {t('verify.completeProfile', 'Complete Profile Setup')}
          </Button>
        </>
      }
    />
  )
}
