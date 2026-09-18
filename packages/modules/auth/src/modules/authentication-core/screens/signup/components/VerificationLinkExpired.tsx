import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  Alert,
} from '@mui/material'
import History from '@mui/icons-material/History'
import Send from '@mui/icons-material/Send'
import { useTranslation } from 'react-i18next'
import { Path } from '../../../../../routes/path'
import authService from '../../../services/auth.service'
import { AuthOutcomeScreen, AuthActionButton, AuthBackLink } from '../../../components/shared/auth'

export default function VerificationLinkExpired() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  const [sending, setSending] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRequestNewLink = useCallback(async () => {
    if (!email) {
      navigate(Path.auth.signin)
      return
    }

    setSending(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await authService.resendVerification(email)
      setSuccessMsg(t('email.newLinkSent', 'A new verification link has been sent to your email.'))
      setTimeout(() => navigate(`${Path.checkEmail}?email=${encodeURIComponent(email)}`), 2000)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          t('email.newLinkError', 'Failed to send new link. Please try again later.'),
      )
    } finally {
      setSending(false)
    }
  }, [t, navigate, email])

  return (
    <AuthOutcomeScreen
      tone='warning'
      icon={<History sx={{ fontSize: 36 }} />}
      title={t('email.expiredHeading', 'Verification link expired')}
      description={t(
        'email.expiredDescription',
        'For security reasons, verification links expire after a short period. Request a new one below.',
      )}
      actions={
        <>
          {successMsg && (
            <Alert
              severity='success'
              sx={{
                mb: 2,
                borderRadius: 'var(--sf-radius-md, 8px)',
                textAlign: 'left',
                '& .MuiAlert-message': { fontWeight: 600 },
              }}
            >
              {successMsg}
            </Alert>
          )}
          {error && (
            <Alert
              severity='error'
              sx={{
                mb: 2,
                borderRadius: 'var(--sf-radius-md, 8px)',
                textAlign: 'left',
                '& .MuiAlert-message': { fontWeight: 600 },
              }}
            >
              {error}
            </Alert>
          )}

          <AuthActionButton
            fullWidth
            isLoading={sending}
            onClick={handleRequestNewLink}
            label={
              sending
                ? t('email.sending', 'Sending...')
                : t('email.requestNewLink', 'Request a new link')
            }
            startIcon={<Send />}
          />

          <Box sx={{ mt: 1 }}>
            <AuthBackLink
              label={t('common.backToLogin', 'Back to log in')}
              onClick={() => navigate(Path.auth.signin)}
            />
          </Box>
        </>
      }
    />
  )
}
