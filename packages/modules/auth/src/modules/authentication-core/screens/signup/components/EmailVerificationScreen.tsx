import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams, useLocation, Link } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Alert,
  Avatar,
  CircularProgress,
  Link as MuiLink,
  alpha,
  useTheme,
  Stack,
} from '@mui/material'
import Verified from '@mui/icons-material/Verified'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FetchResponse } from '@cap/platform-core'
import authService from '../../../services/auth.service'
import { Path } from '../../../../../routes/path'
import { AuthPageLayout } from '../../../components/shared/auth'
import { LiquidGlassCard } from '@cap/theme'

import RegistrationSuccess from './RegistrationSuccess'

export default function EmailVerificationScreen() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
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
          const data = (res as FetchResponse<any>).data
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
  }, [targetEmail, signature, t, navigate])

  if (verifying) {
    return (
      <AuthPageLayout maxWidth={480}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <CircularProgress size={48} sx={{ mb: 3 }} />
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {t('email.verifyingTitle', 'Verifying your email...')}
          </Typography>
        </Box>
      </AuthPageLayout>
    )
  }

  if (success) {
    return (
      <AuthPageLayout maxWidth={480}>
        <Box sx={{ width: '100%' }}>
          <RegistrationSuccess userName={verifiedUserName} redirectPath='/dashboard' />
        </Box>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout maxWidth={480}>
      <Box sx={{ width: '100%' }}>
        <LiquidGlassCard blur='24px' opacity={0.85} padding='0px' borderRadius='24px'>
          <Box
            className='animate-scale-in'
            component={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                variant='circular'
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: alpha(theme.palette.error.main, 0.12),
                  color: 'error.main',
                  border: '2px solid',
                  borderColor: alpha(theme.palette.error.main, 0.3),
                  boxShadow: `0 0 24px ${alpha(theme.palette.error.main, 0.25)}`,
                }}
              >
                <ErrorOutline sx={{ fontSize: 36 }} />
              </Avatar>
            </Box>

            <Typography variant='h4' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
              {t('email.failedHeading', 'Verification failed')}
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}
            >
              {errorMsg ||
                t(
                  'email.failedDescription',
                  "We couldn't verify your email. The link may be invalid or expired.",
                )}
            </Typography>

            {errorMsg && (
              <Alert
                severity='error'
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  textAlign: 'left',
                  '& .MuiAlert-message': { fontWeight: 600 },
                }}
              >
                {errorMsg}
              </Alert>
            )}

            <Stack spacing={2}>
              <Button
                variant='contained'
                size='large'
                fullWidth
                component={Link}
                to={Path.auth.forgotPassword}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: '1rem',
                  textTransform: 'none',
                  bgcolor: 'primary.main',
                  boxShadow: (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.4)}`,
                  '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-1px)' },
                }}
              >
                {t('email.tryAgain', 'Request a new link')}
              </Button>
              <MuiLink
                component={Link}
                to={Path.auth.signin}
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {t('common.backToLogin', 'Back to log in')}
              </MuiLink>
            </Stack>
          </Box>
        </LiquidGlassCard>
      </Box>
    </AuthPageLayout>
  )
}
