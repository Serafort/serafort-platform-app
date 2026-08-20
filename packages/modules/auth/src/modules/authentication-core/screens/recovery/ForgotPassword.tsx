import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, Typography, Alert, InputAdornment, alpha, useTheme, Stack, Link as MuiLink } from '@mui/material';
import LockReset from '@mui/icons-material/LockReset';
import Mail from '@mui/icons-material/Mail';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import { useForgotPassword } from '@idaas/authentication-core/hooks/useAuthQuery';
import { Path } from '@cap/module-auth/routes/path';
import { AuthPageLayout, AuthScreenIcon, AuthInputLabel, AuthActionButton } from '@idaas/authentication-core/components/shared/auth';
import { ForgotPasswordSchema, ForgotPasswordSchemaType } from '../../utils/schema';
import { useActionLock } from '../../hooks/useActionLock';

export default function ForgotPassword() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const { isLocked, executeWithLock } = useActionLock(100)

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
    onSuccess: () => {
      navigate(Path.auth.checkEmail)
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.detail ||
          t('forgotPassword.errorGeneric', 'An error occurred. Please try again.'),
      )
    },
  })

  const onSubmit = useCallback(
    (data: ForgotPasswordSchemaType) => {
      executeWithLock(async () => {
        setError(null)
        forgotPasswordMutation.mutate({ data: { email: data.email } })
      })
    },
    [executeWithLock, forgotPasswordMutation],
  )

  const isPending = forgotPasswordMutation.isPending

  return (
    <AuthPageLayout>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <AuthScreenIcon icon={<LockReset sx={{ fontSize: 32 }} />} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('forgotPassword.title', 'Forgot password?')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('forgotPassword.subtitle', "Enter your email and we'll send you a reset link.")}
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
            <AuthInputLabel>{t('forgotPassword.emailLabel', 'EMAIL ADDRESS')}</AuthInputLabel>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="email"
                  placeholder="name@example.com"
                  disabled={isPending || isSubmitting}
                  autoComplete="email"
                  autoFocus
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                    },
                  }}
                />
              )}
            />
          </Box>

          <AuthActionButton
            type="submit"
            isLoading={isPending}
            isSubmitting={isSubmitting}
            isValidating={isValidating}
            isLocked={isLocked}
            label={
              isPending
                ? t('forgotPassword.submitting', 'Sending...')
                : t('forgotPassword.submit', 'Send Reset Link')
            }
            disabled={isPending || isSubmitting || isLocked}
            sx={{ mt: 2 }}
          />
        </Stack>
      </form>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <MuiLink
          component="button"
          onClick={() => navigate(Path.auth.signin)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'text.secondary',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': { color: 'info.main' },
            '& .MuiSvgIcon-root': { fontSize: 18, transition: 'transform 0.2s' },
            '&:hover .MuiSvgIcon-root': { transform: 'translateX(-4px)' },
          }}
        >
          <ArrowBack />
          {t('forgotPassword.backToSignIn', 'Back to sign in')}
        </MuiLink>
      </Box>
    </AuthPageLayout>
  )
}

