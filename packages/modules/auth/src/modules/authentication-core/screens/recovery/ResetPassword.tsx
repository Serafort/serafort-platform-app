import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField, Typography, Alert, InputAdornment, IconButton, CircularProgress, alpha, useTheme, Stack, Link as MuiLink } from '@mui/material';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FetchResponse, IUserResponseEmailResetPassword } from '@cap/platform-core';
import type { ResetPasswordRequest } from '../../types/api.types';
import { useResetPassword } from '@cap/module-auth/modules/authentication-core/hooks/useAuthQuery';
import authService from '@cap/module-auth/modules/authentication-core/services/auth.service';
import { AuthPageLayout, AuthScreenIcon, AuthInputLabel, AuthActionButton } from '@cap/module-auth/modules/authentication-core/components/shared/auth';
import { ResetPasswordSchema, ResetPasswordSchemaType } from '../../utils/schema';
import { useActionLock } from '../../hooks/useActionLock';

const SUPPORT_EMAIL = 'support@example.com'

export default function ResetPassword() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const { email } = useParams()
  const [searchParams] = useSearchParams()
  const signature = searchParams.get('signature')
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
    async function fetchData() {
      try {
        setLoading(true)
        const response: FetchResponse<IUserResponseEmailResetPassword> =
          await authService.verifyResetPassword(email || '', signature ?? '')
        if (response.status === 202) {
          if (!response.data.isSignatureValid) {
            setSignatureError(t('resetPassword.invalidLinkTitle', 'Invalid or Expired Link'))
          } else {
            setToken(response.data.token || '')
          }
        }
      } catch (err: any) {
        setSignatureError(err.message || t('resetPassword.errorVerifying', 'Could not verify reset link.'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [email, signature, t])

  const resetPasswordMutation = useResetPassword({
    onSuccess: () => {
      navigate('/auth/sign-in')
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.detail ||
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
          token,
          email: email || '',
          password: data.password,
          confirmPassword: data.confirmPassword,
        }
        resetPasswordMutation.mutate({ data: payload })
      })
    },
    [token, email, executeWithLock, resetPasswordMutation],
  )

  if (loading) {
    return (
      <Box sx={{ height: '100dvh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (signatureError) {
    return (
      <Box
        className="animate-scale-in"
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, md: 5 } }}
      >
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>
              {t('resetPassword.invalidLinkTitle', 'Invalid or Expired Link')}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              {t('resetPassword.invalidLinkDesc', 'This password reset link is invalid or has expired. Please request a new one.')}
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
          to="/auth/forgot-password"
          fullWidth
          variant="contained"
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'none',
            bgcolor: 'info.main',
            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
            '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' },
          }}
        >
          {t('resetPassword.requestNewLink', 'Request New Link')}
        </Button>
      </Box>
    )
  }

  return (
    <AuthPageLayout>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <AuthScreenIcon icon={<LockOutlined sx={{ fontSize: 32 }} />} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('resetPassword.title', 'Set new password')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('resetPassword.subtitle', 'Choose a strong password you haven\'t used before.')}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 4, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          <Box>
            <AuthInputLabel>{t('resetPassword.newPasswordLabel', 'NEW PASSWORD')}</AuthInputLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  disabled={resetPasswordMutation.isPending || isSubmitting}
                  autoComplete="new-password"
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" aria-label="Toggle password visibility">
                            {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box>
            <AuthInputLabel>{t('resetPassword.confirmPasswordLabel', 'CONFIRM PASSWORD')}</AuthInputLabel>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  disabled={resetPasswordMutation.isPending || isSubmitting}
                  autoComplete="new-password"
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword?.message}
                  slotProps={{
                    input: {
                      sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                    },
                  }}
                />
              )}
            />
          </Box>

          <AuthActionButton
            type="submit"
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
    </AuthPageLayout>
  )
}

