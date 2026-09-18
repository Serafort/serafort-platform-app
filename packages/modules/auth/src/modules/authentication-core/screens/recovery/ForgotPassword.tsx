import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  alpha,
  Stack,
  Link as MuiLink,
} from '@mui/material'
import LockReset from '@mui/icons-material/LockReset'
import Mail from '@mui/icons-material/Mail'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { useForgotPassword } from '../../hooks/useAuthQuery'
import Path from '../path'
import { themeConfig, useTenant, type HttpError } from '@cap/platform-core'
import { LiquidGlassCard } from '@cap/theme'
import {
  AuthPageLayout,
  AuthScreenIcon,
  AuthInputLabel,
  AuthActionButton,
} from '../../components/shared/auth'
import { ForgotPasswordSchema, ForgotPasswordSchemaType } from '../../utils/schema'

export default function ForgotPassword() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const appName = tenant?.name || themeConfig.templateName

  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValidating },
  } = useForm<ForgotPasswordSchemaType>({
    defaultValues: { email: '' },
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'onTouched',
  })

  const forgotPasswordMutation = useForgotPassword({
    onError: (err: HttpError) => {
      setError(t(err.i18nKey, err.userMessage || 'An error occurred while sending reset email.'))
    },
  })

  const onSubmit = (data: ForgotPasswordSchemaType) => {
    setError(null)
    forgotPasswordMutation.mutate(
      { data: { email: data.email } },
      {
        onSuccess: () => {
          navigate(`${Path.checkEmail}?email=${encodeURIComponent(data.email)}&type=recovery`)
        },
      },
    )
  }

  const isPending = forgotPasswordMutation.isPending

  return (
    <>
      <title>
        {t('forgotPassword.title_page', 'Forgot Password')} - {appName}
      </title>
      <meta
        name='keywords'
        content={t('forgotPassword.keywords', {
          appName,
          defaultValue: `${appName} forgot password reset recovery`,
        })}
      />

      <AuthPageLayout>
        {/* Background Gradient Decoration */}
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            opacity: 1,
            pointerEvents: 'none',
            background: (theme) =>
              `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 40%), radial-gradient(circle at 90% 80%, ${alpha(theme.palette.secondary.main || theme.palette.primary.light, 0.4)} 0%, transparent 40%), radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.dark, 0.2)} 0%, transparent 60%)`,
          }}
        />

        <Box sx={{ width: '100%', maxWidth: '480px', mx: 'auto' }}>
          <LiquidGlassCard blur='24px' opacity={0.82} padding='0px' borderRadius='24px'>
            <Box sx={{ p: 4 }}>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <AuthScreenIcon icon={<LockReset sx={{ fontSize: 32 }} />} />
                </Box>
                <Typography variant='h4' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
                  {t('forgotPassword.title', 'Forgot password?')}
                </Typography>
                <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
                  {t(
                    'forgotPassword.subtitle',
                    "Enter your email and we'll send you a reset link.",
                  )}
                </Typography>
              </Box>

              {error && (
                <Alert
                  id='forgot-password-error'
                  severity='error'
                  role='alert'
                  aria-live='polite'
                  sx={{ mb: 4, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                  <Box>
                    <AuthInputLabel>
                      {t('forgotPassword.emailLabel', 'EMAIL ADDRESS')}
                    </AuthInputLabel>
                    <Controller
                      name='email'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          id='forgot-password-email'
                          fullWidth
                          type='email'
                          placeholder='name@example.com'
                          disabled={isPending || isSubmitting}
                          autoComplete='email'
                          autoFocus
                          error={Boolean(errors.email)}
                          helperText={errors.email?.message ? t(errors.email.message) : undefined}
                          aria-describedby={error ? 'forgot-password-error' : undefined}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <Mail sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                              sx: {
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  <AuthActionButton
                    id='forgot-password-submit'
                    type='submit'
                    isLoading={isPending}
                    isSubmitting={isSubmitting}
                    isValidating={isValidating}
                    label={
                      isPending
                        ? t('forgotPassword.submitting', 'Sending...')
                        : t('forgotPassword.submit', 'Send Reset Link')
                    }
                    disabled={isPending || isSubmitting}
                    sx={{ mt: 2 }}
                  />
                </Stack>
              </form>

              <Box sx={{ mt: 5, textAlign: 'center' }}>
                <MuiLink
                  id='forgot-password-back-to-signin'
                  component='button'
                  onClick={() => navigate(Path.signin)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' },
                    '& .MuiSvgIcon-root': { fontSize: 18, transition: 'transform 0.2s' },
                    '&:hover .MuiSvgIcon-root': {
                      transform: (theme) =>
                        theme.direction === 'rtl' ? 'translateX(4px)' : 'translateX(-4px)',
                    },
                  }}
                >
                  <ArrowBack />
                  {t('forgotPassword.backToSignIn', 'Back to sign in')}
                </MuiLink>
              </Box>
            </Box>
          </LiquidGlassCard>
        </Box>
      </AuthPageLayout>
    </>
  )
}
