import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import { useTranslation } from 'react-i18next'
import { FetchResponse } from '@cap/platform-core'
import type { EmailVerificationResult } from '../../../types/api.types'
import authService from '../../../services/auth.service'
import { Path } from '../../../../../routes/path'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthBackLink,
  AuthActionButton,
} from '../../../components/shared/auth'

import RegistrationSuccess from './RegistrationSuccess'
import { AppPaths } from '@cap/shared-types'

export default function EmailVerificationScreen() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const params = useParams<{ email?: string }>()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const targetEmail = useMemo(() => {
    const raw = params.email || searchParams.get('email') || ''
    if (!raw) return ''
    try {
      return decodeURIComponent(raw).trim().toLowerCase()
    } catch {
      return raw.trim().toLowerCase()
    }
  }, [params.email, searchParams])

  const signature = useMemo(() => {
    return searchParams.get('signature') || searchParams.get('token') || ''
  }, [searchParams])

  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState<boolean | null>(null)
  const [verifiedUserName, setVerifiedUserName] = useState<string>('')
  const [alreadyVerified, setAlreadyVerified] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let isMounted = true

    async function executeEmailVerification() {
      if (!targetEmail || !signature) {
        if (isMounted) {
          setVerifying(false)
          setSuccess(false)
          setErrorMsg(t('email.missingParams', 'Invalid verification link.'))
        }
        return
      }

      try {
        if (isMounted) setVerifying(true)
        // Forward the link's query string exactly as it arrived. The backend
        // signature covers it verbatim, so re-serialising it here — via
        // searchParams.toString(), say — could reorder or re-encode a
        // parameter and read as a tampered link.
        const res = await authService.verifyEmail(location.search)

        if (!isMounted) return
        setVerifying(false)

        if (res.status === 200 || res.status === 204) {
          setSuccess(true)
          const data = (res as FetchResponse<EmailVerificationResult>).data
          setVerifiedUserName(data?.user?.name || data?.name || '')
          setAlreadyVerified(data?.alreadyVerified || false)
        } else {
          setSuccess(false)
          setErrorMsg(
            t('email.failedGeneric', 'Email verification failed. The link may have expired.'),
          )
        }
      } catch (err: any) {
        if (!isMounted) return
        setVerifying(false)
        setSuccess(false)
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          t('email.failedGeneric', 'Email verification failed. The link may have expired.')
        setErrorMsg(message)
      }
    }

    executeEmailVerification()

    return () => {
      isMounted = false
    }
  }, [targetEmail, signature, location.search, t, navigate])

  if (verifying) {
    return (
      <AuthPageLayout maxWidth={480} backdrop='subtle'>
        <AuthCard padding='comfortable'>
          <Box
            role='status'
            aria-live='polite'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              gap: 2,
            }}
          >
            <CircularProgress size={48} thickness={4} />
            <Typography variant='h6' sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {t('email.verifyingTitle', 'Verifying your email...')}
            </Typography>
          </Box>
        </AuthCard>
      </AuthPageLayout>
    )
  }

  if (success) {
    return (
      <AuthPageLayout maxWidth={480}>
        <Box sx={{ width: '100%' }}>
          <RegistrationSuccess embedded userName={verifiedUserName} redirectPath={AppPaths.dashboard.dashboard} />
        </Box>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout maxWidth={480} backdrop='subtle'>
      <AuthCard padding='comfortable'>
        <AuthCardHeader
          icon={<ErrorOutline sx={{ fontSize: 32 }} />}
          tone='error'
          toneTitle
          title={t('email.failedHeading', 'Verification failed')}
          subtitle={
            errorMsg ||
            t(
              'email.failedDescription',
              "We couldn't verify your email. The link may be invalid or expired.",
            )
          }
        />

        {errorMsg && (
          <Alert
            severity='error'
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              textAlign: 'left',
              '& .MuiAlert-message': { fontWeight: 600 },
            }}
          >
            {errorMsg}
          </Alert>
        )}

        <Stack spacing={2}>
          <AuthActionButton
            fullWidth
            onClick={() => navigate(Path.auth.forgotPassword)}
            label={t('email.tryAgain', 'Request a new link')}
          />
          <AuthBackLink
            label={t('common.backToLogin', 'Back to log in')}
            onClick={() => navigate(Path.auth.signin)}
          />
        </Stack>
      </AuthCard>
    </AuthPageLayout>
  )
}
