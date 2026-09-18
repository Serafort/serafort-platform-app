import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
  Link as MuiLink,
} from '@mui/material'
import LockOutlined from '@mui/icons-material/LockOutlined'
import LinkOff from '@mui/icons-material/LinkOff'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useTranslation } from 'react-i18next'
import { FetchResponse, useAppStore } from '@cap/platform-core'
import type { ResetPasswordRequest } from '../../types/api.types'
import { useResetPassword } from '../../hooks/useAuthQuery'
import authService from '../../services/auth.service'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthInputLabel,
  AuthActionButton,
  AuthTextField,
  PasswordStrengthMeter,
} from '../../components/shared/auth'
import { ResetPasswordSchema, ResetPasswordSchemaType } from '../../utils/schema'
import { useActionLock } from '../../hooks/useActionLock'
import Path from '../path'

const SUPPORT_EMAIL = 'support@serafort.com'

export default function ResetPassword() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const params = useParams<{ email?: string }>()
  const [searchParams] = useSearchParams()

  const decodedEmail = useMemo(() => {
    const raw = params.email || searchParams.get('email') || ''
    if (!raw) return ''
    try {
      return decodeURIComponent(raw).trim().toLowerCase()
    } catch {
      return raw.trim().toLowerCase()
    }
  }, [params.email, searchParams])

  const signature = searchParams.get('signature')
  const tokenParam = searchParams.get('token')
  const { isLocked, executeWithLock } = useActionLock(100)

  const [loading, setLoading] = useState(true)
  const [signatureError, setSignatureError] = useState<string | null>(null)
  const [token, setToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValidating },
  } = useForm<ResetPasswordSchemaType>({
    defaultValues: { password: '', confirmPassword: '' },
    resolver: zodResolver(ResetPasswordSchema),
    mode: 'onTouched',
  })

  const watchedPassword = useWatch({ control, name: 'password' }) || ''

  useEffect(() => {
    let isMounted = true

    async function verifySignature() {
      if (!decodedEmail || (!signature && !tokenParam)) {
        if (isMounted) {
          setLoading(false)
          setSignatureError(t('resetPassword.invalidLink', 'Invalid password reset link.'))
        }
        return
      }

      try {
        if (isMounted) setLoading(true)
        // The backend's GET /reset-password/:email handler validates the whole
        // signed URL (`request.hasValidSignature()`) *and* separately requires a
        // `token` query param (`request.input('token')`) — the signed link the
        // backend mails out always carries both. Passing just the bare
        // `signature` value here (as opposed to the full query string) used to
        // build a URL missing `token`, which the backend rejects as
        // 'Invalid password reset parameters.' every time this branch ran.
        const response: FetchResponse<any> = tokenParam
          ? await authService.verifyResetToken(decodedEmail, tokenParam)
          : await authService.verifyResetPassword(decodedEmail, searchParams.toString())

        if (!isMounted) return
        setLoading(false)

        if (response.status === 200 || response.status === 202) {
          setToken(response.data?.token || tokenParam || '')
        } else {
          setSignatureError(
            response.data?.message ||
              t('resetPassword.linkExpired', 'The password reset link has expired or is invalid.'),
          )
        }
      } catch (err: any) {
        if (!isMounted) return
        setLoading(false)
        setSignatureError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            t('resetPassword.verificationFailed', 'Failed to verify reset link.'),
        )
      }
    }

    verifySignature()

    return () => {
      isMounted = false
    }
  }, [decodedEmail, signature, tokenParam, t])

  const resetPasswordMutation = useResetPassword({
    onSuccess: async (response: FetchResponse<any>) => {
      const { user, token: authToken } = response.data || {}
      if (authToken || user) {
        await authService.handleLoginSuccess({ user, accessToken: authToken })
      }
      if (user) {
        useAppStore.getState().setUser(user)
      }
      navigate(Path.passwordResetSuccess, { replace: true })
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          t('resetPassword.errorGeneric', 'An error occurred. Please try again.'),
      )
    },
  })

  const onSubmit = useCallback(
    (data: ResetPasswordSchemaType) => {
      executeWithLock(async () => {
        setError(null)
        const payload: ResetPasswordRequest = {
          token: token || tokenParam || '',
          email: decodedEmail,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }
        resetPasswordMutation.mutate({ data: payload })
      })
    },
    [token, tokenParam, decodedEmail, executeWithLock, resetPasswordMutation],
  )

  // --- Loading: the reset signature is still being verified ---------------
  if (loading) {
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
              gap: 2,
              py: 6,
            }}
          >
            <CircularProgress size={44} thickness={4} />
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
              {t('resetPassword.verifyingLink', 'Verifying your reset link…')}
            </Typography>
          </Box>
        </AuthCard>
      </AuthPageLayout>
    )
  }

  // --- Error: the link is invalid or expired ------------------------------
  if (signatureError) {
    return (
      <AuthPageLayout maxWidth={480} backdrop='subtle'>
        <AuthCard padding='comfortable'>
          <Box sx={{ textAlign: 'center' }}>
            <AuthCardHeader
              icon={<LinkOff sx={{ fontSize: 32 }} />}
              title={t('resetPassword.invalidLinkTitle', 'Invalid or Expired Link')}
              subtitle={t(
                'resetPassword.invalidLinkDesc',
                'This password reset link is invalid or has expired. Please request a new one.',
              )}
              tone='error'
              toneTitle
              iconSize={64}
            />

            <Button
              component={Link}
              to={Path.forgotPassword}
              fullWidth
              variant='contained'
              sx={{
                minHeight: 48,
                borderRadius: 'var(--sf-radius-lg, 12px)',
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
              }}
            >
              {t('resetPassword.requestNewLink', 'Request New Link')}
            </Button>

            <Typography variant='body2' color='text.secondary' sx={{ mt: 3, fontWeight: 500 }}>
              {t('resetPassword.supportText', 'Need help?')}{' '}
              <MuiLink href={`mailto:${SUPPORT_EMAIL}`} sx={{ fontWeight: 700 }}>
                {SUPPORT_EMAIL}
              </MuiLink>
            </Typography>
          </Box>
        </AuthCard>
      </AuthPageLayout>
    )
  }

  // --- Idle: choose a new password ---------------------------------------
  const isBusy = resetPasswordMutation.isPending || isSubmitting

  return (
    <AuthPageLayout maxWidth={480}>
      <AuthCard padding='standard'>
        <AuthCardHeader
          icon={<LockOutlined sx={{ fontSize: 32 }} />}
          title={t('resetPassword.title', 'Set new password')}
          subtitle={t(
            'resetPassword.subtitle',
            "Choose a strong password you haven't used before.",
          )}
        />

        {error && (
          <Alert
            severity='error'
            role='alert'
            aria-live='polite'
            sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 8px)', '& .MuiAlert-message': { fontWeight: 600 } }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <Box>
              <AuthInputLabel htmlFor='reset-password'>
                {t('resetPassword.newPasswordLabel', 'NEW PASSWORD')}
              </AuthInputLabel>
              <Controller
                name='password'
                control={control}
                render={({ field }) => (
                  <AuthTextField
                    {...field}
                    id='reset-password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••••••'
                    disabled={isBusy}
                    autoComplete='new-password'
                    autoFocus
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge='end'
                              size='small'
                              aria-label={
                                showPassword
                                  ? t('common.hidePassword', 'Hide password')
                                  : t('common.showPassword', 'Show password')
                              }
                              aria-pressed={showPassword}
                            >
                              {showPassword ? (
                                <VisibilityOff sx={{ fontSize: 20 }} />
                              ) : (
                                <Visibility sx={{ fontSize: 20 }} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
              <PasswordStrengthMeter password={watchedPassword} criteria='chips' />
            </Box>

            <Box>
              <AuthInputLabel htmlFor='reset-confirm-password'>
                {t('resetPassword.confirmPasswordLabel', 'CONFIRM PASSWORD')}
              </AuthInputLabel>
              <Controller
                name='confirmPassword'
                control={control}
                render={({ field }) => (
                  <AuthTextField
                    {...field}
                    id='reset-confirm-password'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='••••••••••••'
                    disabled={isBusy}
                    autoComplete='new-password'
                    error={Boolean(errors.confirmPassword)}
                    helperText={errors.confirmPassword?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              edge='end'
                              size='small'
                              aria-label={
                                showConfirmPassword
                                  ? t('common.hidePassword', 'Hide password')
                                  : t('common.showPassword', 'Show password')
                              }
                              aria-pressed={showConfirmPassword}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff sx={{ fontSize: 20 }} />
                              ) : (
                                <Visibility sx={{ fontSize: 20 }} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Box>

            <AuthActionButton
              type='submit'
              isLoading={resetPasswordMutation.isPending}
              isSubmitting={isSubmitting}
              isValidating={isValidating}
              isLocked={isLocked}
              label={
                resetPasswordMutation.isPending
                  ? t('resetPassword.submitting', 'Resetting...')
                  : t('resetPassword.submit', 'Reset Password')
              }
              disabled={isBusy || isLocked}
            />
          </Stack>
        </form>
      </AuthCard>
    </AuthPageLayout>
  )
}
