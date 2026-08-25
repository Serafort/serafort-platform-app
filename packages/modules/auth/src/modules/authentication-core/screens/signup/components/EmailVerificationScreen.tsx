import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import {
  Box, Button, Typography, Alert, Avatar, CircularProgress,
  Link as MuiLink, alpha, useTheme, Stack,
} from '@mui/material'
import Verified from '@mui/icons-material/Verified';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FetchResponse } from '@cap/platform-core'
import authService from '../../../services/auth.service'
import { Path } from "@cap/module-auth/routes/path"

export default function EmailVerificationScreen() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const params = useParams<{ email?: string }>()
  const [searchParams] = useSearchParams()

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
        const response: FetchResponse<any> = await authService.verifyEmail(targetEmail, signature)
        if (!isMounted) return

        if (response.status === 200 || response.status === 202 || response.data?.success) {
          setSuccess(true)
          if (response.data?.alreadyVerified) {
            setAlreadyVerified(true)
          }
        } else {
          setSuccess(false)
          setErrorMsg(response.data?.message || t('email.verificationFailed', 'Verification failed. The link may be invalid or expired.'))
        }
      } catch (error: any) {
        if (!isMounted) return
        setSuccess(false)
        const isExpiredOrForbidden = error.response?.status === 403 || error.response?.status === 410 || error.response?.data?.code === 'LINK_EXPIRED'
        setErrorMsg(
          error.response?.data?.message ||
          error.response?.data?.detail ||
          t('email.errorOccurred', 'An error occurred during verification.')
        )

        if (isExpiredOrForbidden) {
          navigate(Path.auth.verificationLinkExpired, { state: { email: targetEmail } })
        }
      } finally {
        if (isMounted) {
          setVerifying(false)
        }
      }
    }

    executeEmailVerification()

    return () => {
      isMounted = false
    }
  }, [targetEmail, signature, t, navigate])

  if (verifying) {
    return (
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress size={48} sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t('email.verifyingTitle', 'Verifying your email...')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar variant="square"
          sx={{ width: 56, height: 56, bgcolor: 'transparent', borderRadius: '24px', border: '2px solid',
            color: success ? (alreadyVerified ? 'info.main' : 'success.main') : 'error.main',
            borderColor: alpha(success ? (alreadyVerified ? theme.palette.info.main : theme.palette.success.main) : theme.palette.error.main, 0.2) }}>
          {success ? (alreadyVerified ? <CheckCircle sx={{ fontSize: 32 }} /> : <Verified sx={{ fontSize: 32 }} />) : <ErrorOutline sx={{ fontSize: 32 }} />}
        </Avatar>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {success
          ? (alreadyVerified ? t('email.alreadyVerifiedHeading', 'Email already verified') : t('email.verifiedHeading', 'Email verified!'))
          : t('email.failedHeading', 'Verification failed')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
        {success
          ? (alreadyVerified
              ? t('email.alreadyVerifiedDescription', 'This email address has already been confirmed. You can sign in to your account.')
              : t('email.verifiedDescription', 'Your email has been successfully verified. You can now sign in.'))
          : errorMsg || t('email.failedDescription', "We couldn't verify your email. The link may be invalid or expired.")}
      </Typography>

      {!success && errorMsg && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2, textAlign: 'left', '& .MuiAlert-message': { fontWeight: 600 } }}>
          {errorMsg}
        </Alert>
      )}

      <Stack spacing={2}>
        {success ? (
          <Button variant="contained" size="large" fullWidth onClick={() => navigate(Path.auth.signin)} endIcon={<ArrowForward />}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'primary.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.4)}`, '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-1px)' } }}>
            {t('email.continueToLogin', 'Continue to login')}
          </Button>
        ) : (
          <>
            <Button variant="contained" size="large" fullWidth component={Link} to={Path.auth.forgotPassword}
              sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'primary.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.4)}`, '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-1px)' } }}>
              {t('email.tryAgain', 'Request a new link')}
            </Button>
            <MuiLink component={Link} to={Path.auth.signin}
              sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              {t('common.backToLogin', 'Back to log in')}
            </MuiLink>
          </>
        )}
      </Stack>
    </Box>
  )
}
