import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Typography, Alert, InputAdornment, Stack } from '@mui/material'
import LockReset from '@mui/icons-material/LockReset'
import Mail from '@mui/icons-material/Mail'
import { useTranslation } from 'react-i18next'
import { useForgotPassword } from '../../hooks/useAuthQuery'
import Path from '../path'
import { themeConfig, useTenant, type HttpError } from '@cap/platform-core'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthInputLabel,
  AuthActionButton,
  AuthTextField,
  AuthBackLink,
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

      <AuthPageLayout maxWidth={480}>
        <AuthCard padding='standard'>
          <AuthCardHeader
            icon={<LockReset sx={{ fontSize: 32 }} />}
            title={t('forgotPassword.title', 'Forgot password?')}
            subtitle={t(
              'forgotPassword.subtitle',
              "Enter your email and we'll send you a reset link.",
            )}
          />

          {error && (
            <Alert
              id='forgot-password-error'
              severity='error'
              role='alert'
              aria-live='polite'
              sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              <Box>
                <AuthInputLabel htmlFor='forgot-password-email'>
                  {t('forgotPassword.emailLabel', 'EMAIL ADDRESS')}
                </AuthInputLabel>
                <Controller
                  name='email'
                  control={control}
                  render={({ field }) => (
                    <AuthTextField
                      {...field}
                      id='forgot-password-email'
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
              />
            </Stack>
          </form>

          <AuthBackLink
            id='forgot-password-back-to-signin'
            label={t('forgotPassword.backToSignIn', 'Back to sign in')}
            onClick={() => navigate(Path.signin)}
          />

          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', textAlign: 'center', mt: 1 }}
          >
            {t(
              'forgotPassword.privacyNote',
              'For your security, we send the same confirmation whether or not the address is registered.',
            )}
          </Typography>
        </AuthCard>
      </AuthPageLayout>
    </>
  )
}
