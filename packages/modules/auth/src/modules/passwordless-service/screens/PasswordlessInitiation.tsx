import { useState } from 'react'
import { Box, Button, Divider, InputAdornment, Stack, Alert, Typography } from '@mui/material'
import Email from '@mui/icons-material/Email'
import AutoAwesome from '@mui/icons-material/AutoAwesome'
import LockOutlined from '@mui/icons-material/LockOutlined'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { safeRedirectPath } from '@cap/platform-core'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthInputLabel,
  AuthActionButton,
  AuthTextField,
  AuthSecurityNote,
} from '../../authentication-core/components/shared/auth'
import { usePasswordlessSend } from '../hooks'
import Path from './path'
import { Path as AuthPath } from '../../../routes/path'

const passwordlessInitiateSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .email('Please enter a valid email address.'),
})

type PasswordlessInitiateFormData = z.infer<typeof passwordlessInitiateSchema>

export default function PasswordlessInitiation() {
  // Keys are `passwordless.*`, matching how this sub-module's dictionary is
  // registered. They were previously written as `auth.passwordless.*`, a path
  // that exists in no dictionary, so every string silently fell back to its
  // English default and the fr/ar translations never rendered.
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Only forward a same-origin path; reject absolute/external URLs so the magic
  // link the backend emails cannot be pointed at an attacker domain.
  const redirectUrlParam =
    safeRedirectPath(searchParams.get('redirectUrl') || searchParams.get('returnTo')) || ''
  const initialEmail = searchParams.get('email') || ''

  const [serverError, setServerError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValidating },
  } = useForm<PasswordlessInitiateFormData>({
    resolver: zodResolver(passwordlessInitiateSchema),
    defaultValues: {
      email: initialEmail,
    },
    mode: 'onTouched',
  })

  const sendMutation = usePasswordlessSend({
    onSuccess: (_response, variables) => {
      const emailValue = typeof variables === 'string' ? variables : variables.email
      const params = new URLSearchParams()
      params.set('email', emailValue)
      if (redirectUrlParam) {
        params.set('redirectUrl', redirectUrlParam)
      }
      navigate(`${Path.verification}?${params.toString()}`)
    },
    onError: (err: any) => {
      setServerError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          t(
            'passwordless.send_failed',
            'Failed to send the magic link. Please check your email and try again.',
          ),
      )
    },
  })

  const isLoading = sendMutation.isPending

  const onSubmit = (data: PasswordlessInitiateFormData) => {
    setServerError(null)
    sendMutation.mutate({
      email: data.email,
      ...(redirectUrlParam ? { redirectUrl: redirectUrlParam } : {}),
    })
  }

  return (
    <AuthPageLayout maxWidth={460}>
      <AuthCard padding='standard'>
        <AuthCardHeader
          icon={<AutoAwesome sx={{ fontSize: 32 }} />}
          title={t('passwordless.heading', 'Sign in with Magic Link')}
          subtitle={t(
            'passwordless.subheading',
            'Enter your email address and we will send you a secure sign-in link—no password needed.',
          )}
          iconSize={64}
        />

        {serverError && (
          <Alert
            severity='error'
            role='alert'
            aria-live='polite'
            sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 8px)', '& .MuiAlert-message': { fontWeight: 600 } }}
          >
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            <Box>
              <AuthInputLabel htmlFor='passwordless-email'>
                {t('passwordless.email_address', 'Email Address')}
              </AuthInputLabel>
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <AuthTextField
                    {...field}
                    id='passwordless-email'
                    placeholder='name@company.com'
                    error={Boolean(errors.email)}
                    helperText={
                      errors.email?.message
                        ? t(errors.email.message, errors.email.message)
                        : undefined
                    }
                    disabled={isLoading}
                    autoComplete='email'
                    autoFocus
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
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
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              isValidating={isValidating}
              disabled={isLoading}
              label={
                isLoading
                  ? t('passwordless.sending', 'Sending Magic Link...')
                  : t('passwordless.send_magic_link', 'Send Magic Link')
              }
            />
          </Stack>
        </form>

        <Divider sx={{ my: 3.5, opacity: 0.6 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, px: 1 }}>
            {t('common.or', 'OR')}
          </Typography>
        </Divider>

        <Button
          variant='outlined'
          fullWidth
          onClick={() => navigate(AuthPath.auth.signin)}
          startIcon={<LockOutlined />}
          sx={{
            minHeight: 48,
            borderRadius: 'var(--sf-radius-lg, 12px)',
            fontWeight: 700,
            textTransform: 'none',
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          {t('passwordless.use_password_instead', 'Sign in with Password')}
        </Button>
      </AuthCard>

      <AuthSecurityNote>
        {t('passwordless.encrypted_notice', 'Encrypted & Single-Use Authentication')}
      </AuthSecurityNote>
    </AuthPageLayout>
  )
}
