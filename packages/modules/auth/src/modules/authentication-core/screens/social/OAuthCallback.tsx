import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import { useAppStore } from '@cap/platform-store'
import { AuthOutcomeScreen, AuthPageLayout, AuthCard } from '../../components/shared/auth'
import authService from '../../services/auth.service'
import { normalizeAuthUser } from '../../utils/normalizeAuthUser'
import { resolveRedirectPathForUser } from '../../utils/resolveRedirect'
import Path from '../path'

type Phase = 'exchanging' | 'success' | 'error'

/**
 * Single-flight cache of in-progress exchanges, keyed by the one-time code.
 *
 * The backend consumes the code with GETDEL, so it is valid for exactly one
 * call. That makes "fire the request once" a correctness requirement, not an
 * optimisation -- a second call always comes back `invalid_grant`.
 *
 * A `useRef` guard inside the component is NOT enough: the app runs under
 * React StrictMode, which unmounts and remounts every component on mount in
 * development. A remount builds fresh refs, so a ref-guarded effect still fires
 * twice, spends the code, and shows a successful sign-in as an expired link.
 * (Verified in the browser: the ref version issued two requests.) Keying the
 * promise at module scope survives remount, and every mounted instance awaits
 * the same result instead of racing for it.
 */
const exchangesInFlight = new Map<string, Promise<any>>()

const exchangeOnce = (code: string): Promise<any> => {
  const existing = exchangesInFlight.get(code)
  if (existing) return existing

  const request = authService.social.exchange(code)
  exchangesInFlight.set(code, request)
  return request
}

/** Lets a retry genuinely re-request after a failure. */
const forgetExchange = (code: string) => exchangesInFlight.delete(code)

/**
 * Landing screen for social sign-in (Google, GitHub, ...).
 *
 * The Authentication service finishes the OAuth dance server-side and redirects
 * here with `?code=` — a one-time, 60-second Redis handle, deliberately NOT the
 * access token, so no credential is ever placed in a URL, browser history or
 * Referer header. This screen trades that handle for the real session via
 * POST /api/auth/social/exchange and then lands the user where their role
 * belongs.
 *
 * The exchange is called directly rather than through `useSocialExchange`,
 * because react-query drops a `mutate` call's per-invocation callbacks when the
 * component unmounts -- under StrictMode that silently strands the screen on
 * its loading state.
 */
const OAuthCallback: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const setUser = useAppStore((state) => state.setUser)

  const [phase, setPhase] = useState<Phase>('exchanging')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Captured once. The effect clears `?code=` from the URL, so later reads
  // would come back empty -- including the read a retry depends on.
  const codeRef = useRef<string | null>(null)
  if (codeRef.current === null) {
    codeRef.current = searchParams.get('code')
  }
  const code = codeRef.current

  const describeFailure = useCallback(
    (error: any): string => {
      // The backend distinguishes an expired/replayed handle from a disabled
      // account. Both are safe to surface; neither reveals whether an account
      // exists.
      const reason = error?.response?.data?.error
      if (reason === 'invalid_grant') {
        return t(
          'auth.callback.expired',
          'This sign-in link has expired or was already used. Please sign in again.',
        )
      }
      if (reason === 'account_inactive') {
        return t(
          'auth.callback.inactive',
          'This account is inactive. Contact your administrator for access.',
        )
      }
      return t('auth.callback.failed', 'We could not complete your sign-in. Please try again.')
    },
    [t],
  )

  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!code) {
      setPhase('error')
      setErrorMessage(
        t(
          'auth.callback.missing_code',
          'This sign-in link is incomplete. Please start again from the sign-in page.',
        ),
      )
      return
    }

    let cancelled = false
    let redirectTimer: ReturnType<typeof setTimeout> | undefined

    setPhase('exchanging')
    setErrorMessage(null)

    exchangeOnce(code)
      .then((response: any) => {
        if (cancelled) return

        const body = response?.data
        const rawUser = body?.user

        if (!rawUser) {
          setPhase('error')
          setErrorMessage(
            t(
              'auth.callback.no_session',
              'Sign-in completed but no account came back. Please try signing in again.',
            ),
          )
          return
        }

        // `setUser` promotes a `token` field on the user into the session token
        // and hands it to the secure token manager, which is the same path the
        // password and passkey flows take.
        setUser({ ...rawUser, token: body?.token })

        const normalized = normalizeAuthUser<{ role?: string }>(rawUser)
        const destination = resolveRedirectPathForUser(normalized?.role)

        setPhase('success')
        redirectTimer = setTimeout(() => navigate(destination, { replace: true }), 900)
      })
      .catch((error: any) => {
        if (cancelled) return
        // A spent promise must not be replayed to a retry.
        forgetExchange(code)
        setPhase('error')
        setErrorMessage(describeFailure(error))
      })

    return () => {
      cancelled = true
      if (redirectTimer) clearTimeout(redirectTimer)
    }
  }, [code, attempt, describeFailure, navigate, setUser, t])

  // Drop the one-time handle from the address bar so a reload or a shared link
  // cannot replay a spent code into a confusing error.
  useEffect(() => {
    if (searchParams.has('code')) {
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  if (phase === 'exchanging') {
    return (
      <AuthPageLayout maxWidth={460}>
        <AuthCard padding='comfortable'>
          <Stack spacing={3} alignItems='center' sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size={56} thickness={3} aria-hidden='true' />
            <Box role='status' aria-live='polite'>
              <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                {t('auth.callback.title', 'Completing sign-in')}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'auth.callback.description',
                  'Finishing up with your provider and preparing your account.',
                )}
              </Typography>
            </Box>
          </Stack>
        </AuthCard>
      </AuthPageLayout>
    )
  }

  if (phase === 'success') {
    return (
      <AuthOutcomeScreen
        tone='success'
        icon={<CheckCircleOutline />}
        title={t('auth.callback.success_title', "You're signed in")}
        description={t('auth.callback.success_description', 'Taking you to your account…')}
      />
    )
  }

  return (
    <AuthOutcomeScreen
      tone='error'
      icon={<ErrorOutline />}
      title={t('auth.callback.error_title', 'Sign-in could not be completed')}
      description={errorMessage}
      actions={
        <>
          <Button
            fullWidth
            variant='contained'
            onClick={() => navigate(Path.signin, { replace: true })}
            sx={{ minHeight: 48, textTransform: 'none', fontWeight: 700 }}
          >
            {t('auth.common.backToLogin', 'Back to sign in')}
          </Button>
          {code && (
            <Button
              fullWidth
              variant='outlined'
              onClick={() => setAttempt((n) => n + 1)}
              sx={{ minHeight: 48, textTransform: 'none', fontWeight: 700 }}
            >
              {t('common.retry', 'Retry')}
            </Button>
          )}
        </>
      }
    />
  )
}

export default OAuthCallback
