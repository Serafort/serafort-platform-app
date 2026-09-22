import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import LinkIcon from '@mui/icons-material/Link'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useAppStore } from '@cap/platform-store'
import {
  AuthActionButton,
  AuthCardHeader,
  AuthInputLabel,
  AuthOutcomeScreen,
  AuthPageLayout,
  AuthCard,
  AuthTextField,
} from '../../components/shared/auth'
import authService from '../../services/auth.service'
import { normalizeAuthUser } from '../../utils/normalizeAuthUser'
import { resolveRedirectPathForUser } from '../../utils/resolveRedirect'
import Path from '../path'

type Phase = 'exchanging' | 'success' | 'error' | 'confirmLink' | 'linkConfirmed'

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

  // Account Linking & Identity Consolidation (Tier-2 plan item 3): under a
  // tenant's `require_verified_merge` policy, SocialAuthController.callback
  // redirects here with `?linkToken=` instead of `?code=` -- the OAuth match
  // was verified but not auto-linked, and the caller must prove ownership of
  // the existing account (its password) before the merge completes.
  const linkTokenRef = useRef<string | null>(null)
  if (linkTokenRef.current === null) {
    linkTokenRef.current = searchParams.get('linkToken')
  }
  const linkToken = linkTokenRef.current
  const linkProviderRef = useRef<string | null>(null)
  if (linkProviderRef.current === null) {
    linkProviderRef.current = searchParams.get('provider')
  }
  const linkProvider = linkProviderRef.current

  const [linkPassword, setLinkPassword] = useState('')
  const [showLinkPassword, setShowLinkPassword] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [isConfirmingLink, setIsConfirmingLink] = useState(false)

  const describeLinkFailure = useCallback(
    (error: any): string => {
      const reason = error?.response?.data?.error
      if (reason === 'invalid_or_expired_link_token') {
        return t(
          'auth.callback.link_expired',
          'This confirmation link has expired. Please sign in with your provider again.',
        )
      }
      if (reason === 'invalid_password') {
        return t('auth.callback.link_wrong_password', 'That password is incorrect.')
      }
      if (reason === 'existing_account_unverified') {
        return t(
          'auth.callback.link_unverified',
          'This account cannot be linked until its email is verified.',
        )
      }
      return t(
        'auth.callback.link_failed',
        'We could not link your account. Please try again.',
      )
    },
    [t],
  )

  const handleConfirmLink = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      if (!linkToken || !linkPassword) return

      setIsConfirmingLink(true)
      setLinkError(null)
      try {
        await authService.social.confirmLink(linkToken, linkPassword)
        setPhase('linkConfirmed')
      } catch (error: any) {
        setLinkError(describeLinkFailure(error))
      } finally {
        setIsConfirmingLink(false)
      }
    },
    [linkToken, linkPassword, describeLinkFailure],
  )

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
    if (linkToken) {
      setPhase('confirmLink')
      return
    }

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
  // cannot replay a spent code (or link-confirmation token) into a confusing
  // error.
  useEffect(() => {
    if (searchParams.has('code') || searchParams.has('linkToken')) {
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

  if (phase === 'confirmLink') {
    return (
      <AuthPageLayout maxWidth={460}>
        <AuthCard padding='comfortable'>
          <Box sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 4 } }}>
            <AuthCardHeader
              icon={<LinkIcon sx={{ fontSize: 32 }} />}
              title={t('auth.callback.confirm_link_title', 'Confirm account link')}
              subtitle={t(
                'auth.callback.confirm_link_subtitle',
                linkProvider
                  ? `An account with this email already exists. Enter its password to link your ${linkProvider} sign-in.`
                  : 'An account with this email already exists. Enter its password to link your sign-in.',
              )}
            />
          </Box>

          <Box
            component='form'
            onSubmit={handleConfirmLink}
            noValidate
            sx={{
              px: { xs: 3, sm: 4 },
              pt: 1,
              pb: { xs: 3, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2.25,
            }}
          >
            {linkError && (
              <Alert severity='error' variant='outlined'>
                {linkError}
              </Alert>
            )}

            <Box>
              <AuthInputLabel htmlFor='link-password'>
                {t('signIn.passwordLabel', 'Password')}
              </AuthInputLabel>
              <AuthTextField
                id='link-password'
                type={showLinkPassword ? 'text' : 'password'}
                fullWidth
                autoFocus
                autoComplete='current-password'
                placeholder={t('auth.common.passwordPlaceholder', '••••••••')}
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                disabled={isConfirmingLink}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => setShowLinkPassword((v) => !v)}
                        edge='end'
                        size='small'
                        sx={{ minInlineSize: 44, minBlockSize: 44 }}
                        disabled={isConfirmingLink}
                        aria-label={t(
                          'auth.login.toggle_password',
                          'toggle password visibility',
                        )}
                      >
                        {showLinkPassword ? (
                          <Visibility sx={{ fontSize: 20, color: 'text.secondary' }} />
                        ) : (
                          <VisibilityOff sx={{ fontSize: 20, color: 'text.secondary' }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <AuthActionButton
              type='submit'
              isLoading={isConfirmingLink}
              isSubmitting={isConfirmingLink}
              label={
                isConfirmingLink
                  ? t('auth.callback.confirming_link', 'Linking…')
                  : t('auth.callback.confirm_link_submit', 'Confirm & link account')
              }
            />

            <Button
              fullWidth
              variant='text'
              onClick={() => navigate(Path.signin, { replace: true })}
              disabled={isConfirmingLink}
              sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }}
            >
              {t('auth.common.backToLogin', 'Back to sign in')}
            </Button>
          </Box>
        </AuthCard>
      </AuthPageLayout>
    )
  }

  if (phase === 'linkConfirmed') {
    return (
      <AuthOutcomeScreen
        tone='success'
        icon={<CheckCircleOutline />}
        title={t('auth.callback.link_confirmed_title', 'Account linked')}
        description={t(
          'auth.callback.link_confirmed_description',
          linkProvider
            ? `Your ${linkProvider} sign-in is now linked. Sign in to continue.`
            : 'Your account is now linked. Sign in to continue.',
        )}
        actions={
          <Button
            fullWidth
            variant='contained'
            onClick={() => navigate(Path.signin, { replace: true })}
            sx={{ minHeight: 48, textTransform: 'none', fontWeight: 700 }}
          >
            {t('auth.common.backToLogin', 'Back to sign in')}
          </Button>
        }
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
