import React from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  Grid,
  Typography,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  alpha,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Fingerprint from '@mui/icons-material/Fingerprint'
import VerifiedUser from '@mui/icons-material/VerifiedUser'
import { Controller, Control } from 'react-hook-form'
import {
  AuthCardHeader,
  AuthInputLabel,
  AuthActionButton,
  AuthTextField,
  AuthSocialButton,
} from '../../../components/shared/auth'
import { LoginRequest } from '../../../types/api.types'
import { Path } from '@cap/module-auth/routes/path'

interface CredentialsStepProps {
  t: any
  control: Control<LoginRequest>
  handleSubmit: (
    onValid: (data: LoginRequest) => void,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>
  onSubmit: (data: LoginRequest) => void
  showPasswordField: boolean
  showPassword: boolean
  isPasskeyAutofillAvailable: boolean
  isSsoProvider: boolean
  isDiscovering: boolean
  isLoginPending: boolean
  isPasskeyPending: boolean
  isSubmitting?: boolean
  isValidating?: boolean
  isLocked?: boolean
  onShowPassword: () => void
  onPasskeyLogin: () => void
  onSocialLogin: (provider: string) => void
}

export const CredentialsStep: React.FC<CredentialsStepProps> = ({
  t,
  control,
  handleSubmit,
  onSubmit,
  showPasswordField,
  showPassword,
  isPasskeyAutofillAvailable,
  isSsoProvider,
  isDiscovering,
  isLoginPending,
  isPasskeyPending,
  isSubmitting = false,
  isValidating = false,
  isLocked = false,
  onShowPassword,
  onPasskeyLogin,
  onSocialLogin,
}) => {
  const isBusy =
    isLoginPending || isDiscovering || isPasskeyPending || isSubmitting || isValidating || isLocked

  return (
    <>
      {/* Header Section — shared block, matches RegistrationStep / ForgotPassword */}
      <Box sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 4 } }}>
        <AuthCardHeader
          icon={<VerifiedUser sx={{ fontSize: 32 }} />}
          title={t('signIn.title', 'Welcome back')}
          subtitle={t('signIn.subtitle', 'Please enter your details to sign in')}
        />
      </Box>

      {/* Form Section */}
      <Box
        sx={{
          px: { xs: 3, sm: 4 },
          pt: 1,
          pb: { xs: 3, sm: 4 },
        }}
      >
        <Box
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}
        >
          {/* Email Field */}
          <Box>
            <AuthInputLabel htmlFor='email'>
              {t('signIn.emailLabel', 'EMAIL ADDRESS')}
            </AuthInputLabel>
            <Controller
              name='email'
              control={control}
              rules={{
                required: t('signIn.errorIncomplete', 'Email is required'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('signIn.errorInvalid', 'Invalid email address'),
                },
              }}
              render={({ field, fieldState }) => (
                <AuthTextField
                  {...field}
                  id='email'
                  type='email'
                  fullWidth
                  autoComplete='username webauthn'
                  placeholder='name@example.com'
                  disabled={isBusy}
                  InputProps={{
                    endAdornment: isPasskeyAutofillAvailable && (
                      <InputAdornment position='end'>
                        <Fingerprint sx={{ fontSize: 20, color: 'primary.main', opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Box>

          {/* Password Field */}
          {showPasswordField && (
            <Box>
              <AuthInputLabel htmlFor='password'>
                {t('signIn.passwordLabel', 'PASSWORD')}
              </AuthInputLabel>
              <Controller
                name='password'
                control={control}
                rules={{
                  required: t('signIn.errorIncomplete', 'Password is required'),
                }}
                render={({ field, fieldState }) => (
                  <AuthTextField
                    {...field}
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    autoComplete='current-password'
                    placeholder={t('auth.common.passwordPlaceholder', '••••••••')}
                    disabled={isBusy}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            onClick={onShowPassword}
                            edge='end'
                            size='small'
                            disabled={isBusy}
                            aria-label={t(
                              'auth.login.toggle_password',
                              'toggle password visibility',
                            )}
                          >
                            {showPassword ? (
                              <Visibility sx={{ fontSize: 20, color: 'text.secondary' }} />
                            ) : (
                              <VisibilityOff sx={{ fontSize: 20, color: 'text.secondary' }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>
          )}

          {/* Forgot Password Link - Only show if not SSO */}
          {showPasswordField && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -0.5 }}>
              <MuiLink
                component={Link}
                to={Path.auth.forgotPassword}
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  transition: 'color 0.15s ease',
                  '&:hover': {
                    color: 'primary.dark',
                    textDecoration: 'underline',
                  },
                }}
              >
                {t('signIn.forgotPassword', 'Forgot password?')}
              </MuiLink>
            </Box>
          )}

          {/* Primary Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 0.5 }}>
            <AuthActionButton
              type='submit'
              isLoading={isLoginPending || isDiscovering || isSubmitting}
              isSubmitting={isSubmitting}
              isValidating={isValidating}
              isLocked={isLocked}
              label={
                isLoginPending || isDiscovering || isSubmitting
                  ? isDiscovering
                    ? t('signIn.checking', 'Checking...')
                    : t('signIn.submitting', 'Signing In...')
                  : isSsoProvider
                    ? t('signIn.continueSso', 'Continue with SSO')
                    : t('signIn.submit', 'Sign In')
              }
            />

            <Button
              fullWidth
              variant='outlined'
              startIcon={<Fingerprint sx={{ fontSize: 20 }} />}
              onClick={onPasskeyLogin}
              disabled={isBusy}
              sx={{
                height: 48,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                borderColor: 'divider',
                color: 'text.primary',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  borderColor: 'primary.main',
                },
                '&:focus': {
                  boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
                },
                '& .MuiButton-startIcon': {
                  color: 'primary.main',
                },
              }}
            >
              {isPasskeyPending
                ? t('auth.passkey.authenticating', 'Authenticating...')
                : t('auth.passkey.sign_in_with_passkey', 'Sign in with Passkey')}
            </Button>
          </Box>
        </Box>

        {/* Divider */}
        <Box sx={{ position: 'relative', my: 3 }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            />
          </Box>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant='caption'
              sx={{
                bgcolor: 'background.paper',
                px: 1.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {t('auth.login.or_continue_with', 'OR CONTINUE WITH')}
            </Typography>
          </Box>
        </Box>

        {/* Social Login */}
        <Grid container spacing={1.5} sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Grid size={{ xs: 6 }}>
            <AuthSocialButton
              provider='google'
              label={t('auth.login.google', 'Google')}
              disabled={isBusy}
              onClick={() => onSocialLogin('google')}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <AuthSocialButton
              provider='github'
              label={t('auth.login.github', 'GitHub')}
              disabled={isBusy}
              onClick={() => onSocialLogin('github')}
            />
          </Grid>
        </Grid>

        {/* Sign Up Link */}
        <Box sx={{ mt: 3.5, textAlign: 'center' }}>
          <Typography
            variant='body2'
            component='span'
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              fontFamily: 'inherit',
            }}
          >
            {t('signIn.noAccount', "Don't have an account?")}{' '}
          </Typography>
          <MuiLink
            component={Link}
            to={Path.auth.signup}
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              fontFamily: 'inherit',
              transition: 'color 0.15s ease',
              '&:hover': {
                color: 'primary.dark',
                textDecoration: 'underline',
              },
            }}
          >
            {t('signIn.signUpHere', 'Sign up here')}
          </MuiLink>
        </Box>
      </Box>
    </>
  )
}
