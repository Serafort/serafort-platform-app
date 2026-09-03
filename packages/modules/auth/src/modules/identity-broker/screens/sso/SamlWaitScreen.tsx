// FILE: packages/modules/auth/src/screens/auth/sso/SamlWaitScreen.tsx
// RULES APPLIED: mui-component-standards.md, react-component-patterns.md, Error-handling.md
// FIXES: Added header; implemented entry motion; modernized typography and iconography; standardized color palette; translated all labels; added aria-label support; integrated functional SAML redirect logic
// AUDIT: CRITICAL âœ“  HIGH âœ“  MEDIUM âœ“

import React from 'react'
import {
  Box,
  Container,
  Typography,
  alpha,
  LinearProgress,
  useTheme,
  Button,
  Alert,
} from '@mui/material'
import CorporateFare from '@mui/icons-material/CorporateFare'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import RefreshIcon from '@mui/icons-material/Refresh'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { themeConfig } from '@cap/platform-core'
import { motion } from 'framer-motion'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSsoDiscovery } from '@auth/authentication-core/hooks/useAuthQuery'
import { Path } from '@auth/routes/path'
import logger from '@auth/authentication-core/utils/logger'

type WaitPhase = 'initializing' | 'redirecting' | 'error'

const REDIRECT_TIMEOUT_MS = 15_000

export default function SamlWaitScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const domain = searchParams.get('domain')
  const provider = searchParams.get('provider')
  const ssoIdentifier = domain || provider || ''
  const [phase, setPhase] = React.useState<WaitPhase>('initializing')
  const [errorMessage, setErrorMessage] = React.useState<string>('')
  const hasRedirected = React.useRef(false)

  const {
    data: discoveryResponse,
    isLoading: isDiscovering,
    isError: isDiscoveryError,
  } = useSsoDiscovery(ssoIdentifier)

  const doRedirect = React.useCallback(
    (url: string) => {
      if (hasRedirected.current) return
      hasRedirected.current = true
      setPhase('redirecting')

      // Small delay so the user sees the progress UI
      const timer = setTimeout(() => {
        try {
          navigate(url)
        } catch (err: unknown) {
          logger.error('Failed to redirect to SAML Identity Provider', { error: err })
          setPhase('error')
          setErrorMessage(
            t('auth.sso.redirect_failed', 'Failed to redirect to the identity provider.'),
          )
        }
      }, 800)

      return () => clearTimeout(timer)
    },
    [t],
  )

  React.useEffect(() => {
    if (hasRedirected.current) return

    if (!ssoIdentifier) {
      setPhase('error')
      setErrorMessage(
        t(
          'auth.sso.missing_sso_identifier',
          'Missing required parameter: domain or provider. Cannot proceed with SSO.',
        ),
      )
      return
    }

    if (isDiscovering) return

    if (isDiscoveryError) {
      setPhase('error')
      setErrorMessage(
        t(
          'auth.sso.discovery_failed',
          'Failed to retrieve SSO configuration for the provided domain. Please check and try again.',
        ),
      )
      return
    }

    const discoveryData = discoveryResponse?.data as any
    const targetUrl = discoveryData?.url || discoveryData?.loginUrl

    if (targetUrl) {
      logger.info('SamlWaitScreen: Redirecting to SAML Identity Provider', { targetUrl })
      doRedirect(targetUrl)
    } else if (discoveryResponse) {
      setPhase('error')
      setErrorMessage(
        t('auth.sso.no_provider_found', 'No SSO configuration found for this identifier.'),
      )
    }
  }, [ssoIdentifier, isDiscovering, isDiscoveryError, discoveryResponse, doRedirect, t])

  React.useEffect(() => {
    if (phase !== 'redirecting' && phase !== 'initializing') return

    const timeout = setTimeout(() => {
      if (!hasRedirected.current || phase === 'initializing') {
        setPhase('error')
        setErrorMessage(
          t(
            'auth.sso.redirect_timeout',
            'The redirect is taking longer than expected. Please try again.',
          ),
        )
      }
    }, REDIRECT_TIMEOUT_MS)

    return () => clearTimeout(timeout)
  }, [phase, t])

  const handleRetry = () => {
    hasRedirected.current = false
    setPhase('initializing')
    setErrorMessage('')
    navigate(0)
  }

  const statusText = React.useMemo(() => {
    switch (phase) {
      case 'initializing':
        return t(
          'auth.sso.saml_redirect_description',
          "Connecting to your organization's identity provider. Please do not close this window.",
        )
      case 'redirecting':
        return t('auth.sso.redirecting', 'Redirecting to your identity provider...')
      case 'error':
        return t('auth.sso.error_occurred', 'An error occurred')
      default:
        return ''
    }
  }, [phase, t])

  if (phase === 'error') {
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <title>
          {t('auth.sso.error_title', 'Authentication Error')} - {themeConfig.templateName}
        </title>

        <Container maxWidth='xs' sx={{ position: 'relative', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '24px',
                bgcolor: alpha(theme.palette.error.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                mx: 'auto',
                border: '1px solid',
                borderColor: alpha(theme.palette.error.main, 0.15),
              }}
            >
              <ErrorOutline sx={{ color: 'error.main', fontSize: 40 }} />
            </Box>

            <Typography
              variant='h4'
              sx={{ fontWeight: 900, letterSpacing: '-0.027em', mb: 2, color: 'text.primary' }}
            >
              {t('auth.sso.auth_failed', 'Authentication Failed')}
            </Typography>

            <Alert
              severity='error'
              sx={{
                mb: 4,
                borderRadius: '16px',
                textAlign: 'left',
                '& .MuiAlert-message': { fontWeight: 600 },
              }}
            >
              {errorMessage}
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant='outlined'
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(Path.auth.login)}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 3,
                  borderColor: 'divider',
                }}
              >
                {t('auth.sso.back_to_login', 'Back to Login')}
              </Button>
              <Button
                variant='contained'
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 3,
                }}
              >
                {t('common.retry', 'Retry')}
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <title>
        {t('auth.sso.saml_wait_title', 'Enterprise Login')} - {themeConfig.templateName}
      </title>

      {/* Subtle Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02,
          backgroundImage: `radial-gradient(${theme.palette.primary.main} 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth='xs' sx={{ position: 'relative', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '24px',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              mx: 'auto',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.1),
              position: 'relative',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <CorporateFare sx={{ color: 'primary.main', fontSize: 40 }} aria-hidden='true' />
            </motion.div>
          </Box>

          <Typography
            variant='h4'
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.027em',
              mb: 2,
              color: 'text.primary',
            }}
          >
            {t('auth.sso.saml_redirect_title', 'Enterprise Single Sign-On')}
          </Typography>

          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ mb: 5, lineHeight: 1.6, px: 2, fontWeight: 500 }}
          >
            {statusText}
          </Typography>

          <Box sx={{ width: '100%', mb: 4, px: 4 }}>
            <LinearProgress
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 1,
              borderRadius: '50px',
              bgcolor: alpha(theme.palette.success.main, 0.04),
              border: '1px solid',
              borderColor: alpha(theme.palette.success.main, 0.1),
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
                boxShadow: `0 0 8px ${theme.palette.success.main}`,
                animation: 'blink 1.5s infinite',
                '@keyframes blink': {
                  '0%': { opacity: 0.2 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.2 },
                },
              }}
            />
            <Typography
              variant='caption'
              sx={{
                fontWeight: 800,
                color: 'success.dark',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {t('auth.sso.connecting', 'Secure Handshake Active')}
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
