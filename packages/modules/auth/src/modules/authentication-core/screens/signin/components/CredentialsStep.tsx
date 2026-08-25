import React from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  alpha,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Fingerprint from '@mui/icons-material/Fingerprint';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import { Controller, Control } from 'react-hook-form'
import { AuthScreenIcon, AuthInputLabel, AuthActionButton } from '../../../components/shared/auth'
import { LoginRequest } from '../../../types/api.types'
import { Path } from '@cap/module-auth/routes/path'

interface CredentialsStepProps {
  t: any
  control: Control<LoginRequest>
  handleSubmit: (onValid: (data: LoginRequest) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>
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
  isSubmitting,
  isValidating,
  isLocked,
  onShowPassword,
  onPasskeyLogin,
  onSocialLogin,
}) => {
  return (
    <>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <AuthScreenIcon icon={<VerifiedUser sx={{ fontSize: 32 }} />} />
      </Box>
      <Typography
        variant='h4'
        sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em', textAlign: 'center', fontFamily: 'var(--font-h4, inherit)' }}
      >
        {t('signIn.title', 'Welcome back')}
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        sx={{ fontWeight: 500, mb: 4, textAlign: 'center' }}
      >
        {t('signIn.subtitle', 'Please enter your details to sign in')}
      </Typography>

      {/* Form Section */}
      <Box
        sx={{
          px: { xs: 3, sm: 4 },
          pt: 3,
          pb: 4,
        }}
      >
        <Box
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          {/* Email Field */}
          <Box>
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
                <TextField
                  {...field}
                  id='email'
                  type='email'
                  fullWidth
                  autoComplete='username webauthn'
                  label={t('signIn.emailLabel', 'EMAIL ADDRESS')}
                  placeholder='name@example.com'
                  InputProps={{
                    endAdornment: isPasskeyAutofillAvailable && (
                      <InputAdornment position='end'>
                        <Fingerprint
                          sx={{
                            fontSize: 20,
                            color: 'primary.main',
                            opacity: 0.7,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: 48,
                      borderRadius: '12px',
                      bgcolor: 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '& fieldset': {
                        borderColor: 'divider',
                        transition: 'all 0.2s ease-in-out',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: '1px',
                      },
                      '&.Mui-focused': {
                        boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                      }
                    },
                    '& input::placeholder': {
                      color: 'text.secondary',
                      opacity: 0.7,
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary',
                      fontWeight: 500,
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* Password Field */}
          {showPasswordField && (
            <Box>
              <Controller
                name='password'
                control={control}
                rules={{
                  required: t('signIn.errorIncomplete', 'Password is required'),
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    autoComplete='current-password'
                    label={t('signIn.passwordLabel', 'PASSWORD')}
                    placeholder={t('auth.common.passwordPlaceholder')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton onClick={onShowPassword} edge='end' size='small'>
                            {showPassword ? (
                              <Visibility sx={{ fontSize: 20, color: 'text.secondary' }} />
                            ) : (
                              <VisibilityOff
                                sx={{ fontSize: 20, color: 'text.secondary' }}
                              />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        minHeight: 48,
                        borderRadius: '12px',
                        bgcolor: 'background.paper',
                        transition: 'all 0.2s ease-in-out',
                        '& fieldset': {
                          borderColor: 'divider',
                          transition: 'all 0.2s ease-in-out',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: '1px',
                        },
                        '&.Mui-focused': {
                          boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }
                      },
                      '& input::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.7,
                      },
                      '& .MuiInputLabel-root': {
                        color: 'text.secondary',
                        fontWeight: 500,
                      },
                    }}
                  />
                )}
              />
            </Box>
          )}

          {/* Forgot Password Link - Only show if not SSO */}
          {showPasswordField && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <MuiLink
                component={Link}
                to={Path.auth.forgotPassword}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <AuthActionButton
              type='submit'
              isLoading={isLoginPending || isDiscovering}
              isSubmitting={isSubmitting}
              isValidating={isValidating}
              isLocked={isLocked}
              label={
                isLoginPending || isDiscovering
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
              disabled={isLoginPending || isPasskeyPending}
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
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
                  borderColor: 'divider',
                },
                '&:focus': {
                  boxShadow: (theme) =>
                    `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
                '& .MuiButton-startIcon': {
                  color: 'primary.main',
                },
              }}
            >
              {isPasskeyPending
                ? t('auth.passkey.authenticating')
                : t('auth.passkey.sign_in_with_passkey')}
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
                color: 'text.secondary',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
              }}
            >
              {t('auth.login.or_continue_with')}
            </Typography>
          </Box>
        </Box>

        {/* Social Login */}
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6 }}>
            <Button
              fullWidth
              variant='outlined'
              startIcon={
                <Box
                  component='svg'
                  sx={{ height: 20, width: 20 }}
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    fill='#4285F4'
                  />
                  <path
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    fill='#34A853'
                  />
                  <path
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    fill='#FBBC05'
                  />
                  <path
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    fill='#EA4335'
                  />
                </Box>
              }
              onClick={() => onSocialLogin('google')}
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
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
                  borderColor: 'divider',
                },
                '&:focus': {
                  boxShadow: (theme) =>
                    `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              {t('auth.login.google')}
            </Button>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Button
              fullWidth
              variant='outlined'
              startIcon={
                <Box
                  component='svg'
                  sx={{ height: 20, width: 20 }}
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.05-.015-2.055-3.33.72-4.035-1.605-4.035-1.605-.54-1.38-1.335-1.755-1.335-1.755-1.085-.735.09-.72.09-.72 1.2.09 1.83 1.23 1.83 1.23 1.065 1.815 2.805 1.29 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.28-1.56 3.3-1.245 3.3-1.245.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z' />
                </Box>
              }
              onClick={() => onSocialLogin('github')}
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
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
                  borderColor: 'divider',
                },
                '&:focus': {
                  boxShadow: (theme) =>
                    `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              {t('signIn.github', 'GitHub')}
            </Button>
          </Grid>
        </Grid>

        {/* Sign Up Link */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
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
