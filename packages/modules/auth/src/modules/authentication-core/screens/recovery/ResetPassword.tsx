import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  alpha,
  Stack,
  Link as MuiLink,
} from '@mui/material'
import LockOutlined from '@mui/icons-material/LockOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  FetchResponse,
  IUserResponseEmailResetPassword,
  secureTokenManager,
  useAppStore,
} from '@cap/platform-core'
import { LiquidGlassCard } from '@cap/theme'
import type { ResetPasswordRequest } from '../../types/api.types'
import { useResetPassword } from '../../hooks/useAuthQuery'
import authService from '../../services/auth.service'
import {
  AuthPageLayout,
  AuthScreenIcon,
  AuthInputLabel,
  AuthActionButton,
} from '../../components/shared/auth'
import { ResetPasswordSchema, ResetPasswordSchemaType } from '../../utils/schema'
import { useActionLock } from '../../hooks/useActionLock'
import Path from '../path'

const SUPPORT_EMAIL = 'support@example.com'

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
        const response: FetchResponse<any> = await authService.verifyResetPassword(
          decodedEmail,
          signature || tokenParam || '',
        )

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

  if (loading) {
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
          <CircularProgress size={48} />
        </Box>
      </AuthPageLayout>
    )
  }

  if (signatureError) {
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
              <Alert
                severity='error'
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  textAlign: 'left',
                  '& .MuiAlert-message': { fontWeight: 600 },
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {t('resetPassword.invalidLinkTitle', 'Invalid or Expired Link')}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    {t(
                      'resetPassword.invalidLinkDesc',
                      'This password reset link is invalid or has expired. Please request a new one.',
                    )}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    {t('resetPassword.supportText', 'Need help?')}{' '}
                    <MuiLink href={`mailto:${SUPPORT_EMAIL}`} sx={{ color: 'inherit' }}>
                      {SUPPORT_EMAIL}
                    </MuiLink>
                  </Typography>
                </Box>
              </Alert>
              <Button
                component={Link}
                to={Path.forgotPassword}
                fullWidth
                variant='contained'
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: '1rem',
                  textTransform: 'none',
                  bgcolor: 'primary.main',
                  boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-1px)' },
                }}
              >
                {t('resetPassword.requestNewLink', 'Request New Link')}
              </Button>
            </Box>
          </LiquidGlassCard>
        </Box>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout maxWidth={480}>
      <Box sx={{ width: '100%' }}>
        <LiquidGlassCard blur='24px' opacity={0.85} padding='0px' borderRadius='24px'>
          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <AuthScreenIcon icon={<LockOutlined sx={{ fontSize: 32 }} />} />
              </Box>
              <Typography variant='h4' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
                {t('resetPassword.title', 'Set new password')}
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
                {t('resetPassword.subtitle', "Choose a strong password you haven't used before.")}
              </Typography>
            </Box>

            {error && (
              <Alert
                severity='error'
                sx={{ mb: 4, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
                <Box>
                  <AuthInputLabel>
                    {t('resetPassword.newPasswordLabel', 'NEW PASSWORD')}
                  </AuthInputLabel>
                  <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••••••'
                        disabled={resetPasswordMutation.isPending || isSubmitting}
                        autoComplete='new-password'
                        error={Boolean(errors.password)}
                        helperText={errors.password?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge='end'
                                  size='small'
                                  aria-label='Toggle password visibility'
                                >
                                  {showPassword ? (
                                    <VisibilityOff sx={{ fontSize: 20 }} />
                                  ) : (
                                    <Visibility sx={{ fontSize: 20 }} />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 3, bgcolor: 'background.paper' },
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <AuthInputLabel>
                    {t('resetPassword.confirmPasswordLabel', 'CONFIRM PASSWORD')}
                  </AuthInputLabel>
                  <Controller
                    name='confirmPassword'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••••••'
                        disabled={resetPasswordMutation.isPending || isSubmitting}
                        autoComplete='new-password'
                        error={Boolean(errors.confirmPassword)}
                        helperText={errors.confirmPassword?.message}
                        slotProps={{
                          input: {
                            sx: { borderRadius: 3, bgcolor: 'background.paper' },
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
                  disabled={resetPasswordMutation.isPending || isSubmitting || isLocked}
                  sx={{ mt: 2 }}
                />
              </Stack>
            </form>
          </Box>
        </LiquidGlassCard>
      </Box>
    </AuthPageLayout>
  )
}
