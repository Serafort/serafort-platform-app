// FILE: packages/modules/auth/src/screens/auth/sso/OidcWaitScreen.tsx
// RULES APPLIED: mui-component-standards.md, react-component-patterns.md, Error-handling.md
// PURPOSE: OIDC Authorization Redirect Screen â€” handles the initial redirect to the backend
// OIDC authorization endpoint with proper query parameters, interaction resume, and error states.

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
  CircularProgress,
} from '@mui/material'
import Security from '@mui/icons-material/Security'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import RefreshIcon from '@mui/icons-material/Refresh'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { themeConfig, API_CONFIG } from '@cap/platform-core'
import { motion } from 'framer-motion'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useOidcInteraction } from '@auth/identity-broker/hooks/useOidcCompliance'
import { Path } from '@auth/routes/path'
import logger from '@auth/authentication-core/utils/logger'
import { ENDPOINTS } from '@cap/platform-core'

type WaitPhase = 'initializing' | 'redirecting' | 'interaction' | 'error'

const OIDC_AUTH_URL = `${API_CONFIG?.baseURL || ''}${ENDPOINTS?.auth?.oidc?.auth || '/api/v1/auth/oidc/authorize'}`
const REDIRECT_TIMEOUT_MS = 15_000

export default function OidcWaitScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const responseType = searchParams.get('response_type') || 'code'
  const scope = searchParams.get('scope') || 'openid'
  const state = searchParams.get('state')
  const nonce = searchParams.get('nonce')
  const interactionUid = searchParams.get('interaction')

  const [phase, setPhase] = React.useState<WaitPhase>('initializing')
  const [errorMessage, setErrorMessage] = React.useState<string>('')
  const hasRedirected = React.useRef(false)

  const {
    data: interactionResponse,
    isLoading: isInteractionLoading,
    isError: isInteractionError,
  } = useOidcInteraction(interactionUid)

  const buildAuthUrl = React.useCallback(() => {
    const params = new URLSearchParams()
    if (clientId) params.set('client_id', clientId)
    if (redirectUri) params.set('redirect_uri', redirectUri)
    params.set('response_type', responseType)
    params.set('scope', scope)
    if (state) params.set('state', state)
    if (nonce) params.set('nonce', nonce)
    return `${OIDC_AUTH_URL}?${params.toString()}`
  }, [clientId, redirectUri, responseType, scope, state, nonce])

  const doRedirect = React.useCallback((url: string) => {
    if (hasRedirected.current) return
    hasRedirected.current = true
    setPhase('redirecting')

    // Small delay so the user sees the progress UI
    const timer = setTimeout(() => {
      window.location.assign(url)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    if (hasRedirected.current) return

    // Case 1: Resume an existing interaction
    if (interactionUid) {
      setPhase('interaction')

      if (isInteractionLoading) return

      if (isInteractionError) {
        setPhase('error')
        setErrorMessage(
          t(
            'auth.sso.interaction_expired',
            'The authentication session has expired. Please start again.',
          ),
        )
        return
      }

      const details = interactionResponse?.data
      if (details?.prompt?.name === 'login') {
        navigate(`${Path.identity.oidcLoginPrompt}?interaction=${interactionUid}`, {
          replace: true,
        })
        return
      }
      if (details?.prompt?.name === 'consent') {
        navigate(`${Path.identity.permissionConsent}?uid=${interactionUid}`, { replace: true })
        return
      }

      // If no specific prompt, try to confirm directly
      if (details) {
        navigate(`${Path.identity.oidcLoginPrompt}?interaction=${interactionUid}`, {
          replace: true,
        })
      }
      return
    }

    // Case 2: Fresh OIDC authorization â€” validate required params
    if (!clientId) {
      setPhase('error')
      setErrorMessage(
        t(
          'auth.sso.missing_client_id',
          'Missing required parameter: client_id. Cannot proceed with SSO.',
        ),
      )
      return
    }

    if (!redirectUri) {
      setPhase('error')
      setErrorMessage(
        t(
          'auth.sso.missing_redirect_uri',
          'Missing required parameter: redirect_uri. Cannot proceed with SSO.',
        ),
      )
      return
    }

    // All good â€” build URL and redirect
    const authUrl = buildAuthUrl()
    logger.info('OidcWaitScreen: Redirecting to OIDC authorization endpoint', { authUrl })
    doRedirect(authUrl)
  }, [
    interactionUid,
    isInteractionLoading,
    isInteractionError,
    interactionResponse,
    clientId,
    redirectUri,
    buildAuthUrl,
    doRedirect,
    navigate,
    t,
  ])

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
    window.location.reload()
  }

  const statusText = React.useMemo(() => {
    switch (phase) {
      case 'initializing':
        return t('auth.sso.initializing', 'Initializing secure connection...')
      case 'redirecting':
        return t('auth.sso.redirecting', 'Redirecting to your identity provider...')
      case 'interaction':
        return t('auth.sso.loading_interaction', 'Loading authentication session...')
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
        {t('auth.sso.oidc_wait_title', 'SSO Authentication')} - {themeConfig.templateName}
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
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
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Security sx={{ color: 'primary.main', fontSize: 40 }} aria-hidden='true' />
            </motion.div>
          </Box>

          <Typography
            variant='h4'
            sx={{ fontWeight: 900, letterSpacing: '-0.027em', mb: 2, color: 'text.primary' }}
          >
            {t('auth.sso.redirecting_title', 'Authenticating with SSO')}
          </Typography>

          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ mb: 2, lineHeight: 1.6, px: 2, fontWeight: 500 }}
          >
            {statusText}
          </Typography>

          {/* Client info badge */}
          {clientId && (
            <Typography
              variant='caption'
              sx={{
                display: 'block',
                mb: 4,
                fontWeight: 700,
                color: 'text.secondary',
                letterSpacing: '0.05em',
              }}
            >
              {t('auth.sso.client_label', 'Client')}: {clientId}
            </Typography>
          )}

          <Box sx={{ width: '100%', mb: 4, px: 4 }}>
            {phase === 'interaction' && isInteractionLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={28} thickness={5} />
              </Box>
            ) : (
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
            )}
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
              {t('auth.sso.secure_connection', 'Secure end-to-end encrypted connection')}
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
