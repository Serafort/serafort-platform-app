// FILE: packages/modules/auth/src/screens/auth/sso/AuthWaitScreen.tsx
// RULES APPLIED: mui-component-standards.md, react-component-patterns.md
// FIXES: Added header; replaced bare strings with t(); refined h5 to h4; added aria-hidden to decorative icons; implemented page-level entry motion
// AUDIT: CRITICAL âœ“  HIGH âœ“  MEDIUM âœ“

import {
  Box,
  Container,
  Typography,
  CircularProgress,
  alpha,
  useTheme,
  LinearProgress,
  Button,
  Alert,
} from '@mui/material'
import Security from '@mui/icons-material/Security';
import Lock from '@mui/icons-material/Lock';
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth, safeRedirectPath } from '@cap/platform-core'
import { useLocation, useNavigate } from 'react-router-dom'
import { Path } from "@auth/routes/path"

export default function AuthWaitScreen() {
  const { t } = useTranslation()
  const theme = useTheme()

  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, refreshAuth } = useAuth()

  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const redirectTo = useMemo(() => {
    const qs = new URLSearchParams(location.search)
    // Accept only same-origin paths; ignore absolute/external targets.
    const qp = safeRedirectPath(qs.get('redirectTo'))
    if (qp) return qp
    const stateRedirectTo = safeRedirectPath((location.state as any)?.redirectTo)
    if (stateRedirectTo) return stateRedirectTo

    return '/dashboard'
  }, [location.search, location.state])

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, user, navigate, redirectTo])

  useEffect(() => {
    setError(null)
    setSecondsElapsed(0)

    let cancelled = false
    let intervalId: number | undefined
    let timeoutId: number | undefined

    const tick = async () => {
      try {
        if (typeof refreshAuth === 'function') {
          await refreshAuth()
        }
      } catch {
        if (!cancelled) {
          setError(t('auth.sso.session_refresh_failed', 'Unable to verify your session.'))
        }
      }
    }

    intervalId = window.setInterval(() => {
      setSecondsElapsed((s) => s + 1)
      void tick()
    }, 1500)

    timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setError(
          t(
            'auth.sso.auth_wait_timeout',
            'This is taking longer than expected. You can retry or return to sign in.',
          ),
        )
      }
    }, 30000)

    void tick()

    return () => {
      cancelled = true
      if (intervalId) window.clearInterval(intervalId)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [refreshAuth, t])

  const progressValue = Math.min((secondsElapsed / 30) * 100, 100)

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          opacity: 0.03,
          backgroundImage: `radial-gradient(${theme.palette.primary.main} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <Container maxWidth='xs' sx={{ position: 'relative', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Box sx={{ mb: 6, position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant='indeterminate'
              size={120}
              thickness={2}
              sx={{
                color: 'primary.main',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Security sx={{ fontSize: 48 }} aria-hidden='true' />
              </motion.div>
            </Box>
          </Box>

          <Typography
            variant='h4'
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.027em',
              mb: 1,
            }}
          >
            {t('auth.sso.authenticating', 'Authenticating Securely')}
          </Typography>

          <Typography variant='body1' color='text.secondary' sx={{ mb: 6, px: 2 }}>
            {t(
              'auth.sso.wait_description',
              'Building a secure connection with your identity provider. This will only take a moment.',
            )}
          </Typography>

          <Box sx={{ px: 4 }}>
            <LinearProgress
              variant='determinate'
              value={progressValue}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                },
              }}
            />

            {error && (
              <Box sx={{ mt: 3 }}>
                <Alert
                  severity='warning'
                  sx={{
                    textAlign: 'left',
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.warning.main, 0.06),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.warning.main, 0.2),
                    '& .MuiAlert-message': { fontWeight: 600 },
                  }}
                >
                  {error}
                </Alert>

                <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                  <Button
                    fullWidth
                    variant='contained'
                    onClick={() => {
                      setError(null)
                      setSecondsElapsed(0)
                    }}
                    sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 3 }}
                  >
                    {t('common.retry', 'Retry')}
                  </Button>
                  <Button
                    fullWidth
                    variant='outlined'
                    onClick={() => navigate(Path.auth.signin, { replace: true })}
                    sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 3 }}
                  >
                    {t('auth.signin', 'Sign in')}
                  </Button>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Lock sx={{ fontSize: 14 }} aria-hidden='true' />
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.075em',
                  }}
                >
                  {t('auth.sso.ssl_secure', 'SSL SECURE')}
                </Typography>
              </Box>
              <Typography
                variant='caption'
                color='primary'
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                }}
              >
                {t('auth.sso.protocol_oidc_saml', 'PROTOCOL: OIDC/SAML')}
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Footer Branding */}
      <Box sx={{ position: 'absolute', bottom: 40, width: '100%', textAlign: 'center' }}>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{
            opacity: 0.4,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {t('auth.sso.nexus_version', 'Nexus Protocol Engine v2.4')}
        </Typography>
      </Box>
    </Box>
  )
}

