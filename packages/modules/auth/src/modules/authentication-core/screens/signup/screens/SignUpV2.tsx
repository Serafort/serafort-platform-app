import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  alpha,
} from '@mui/material'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Google from '@mui/icons-material/Google'
import GitHub from '@mui/icons-material/GitHub'
import { useTranslation } from 'react-i18next'
import { API_CONFIG, ENDPOINTS, themeConfig, useTenant, type HttpError } from '@cap/platform-core'
import { LiquidGlassCard } from '@cap/theme'
import { AppPaths } from '@cap/shared-types'
import { Path } from '@cap/module-auth/routes/path'
import type { RegisterRequest } from '../../../types/api.types'
import { useRegister } from '../../../hooks/useAuthQuery'
import {
  AuthPageLayout,
  AuthScreenIcon,
  AuthInputLabel,
  AuthActionButton,
} from '../../../components/shared/auth'
import { SignUpFormSchema, type SignUpFormSchemaType } from '../../../utils/schema'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 48,
    borderRadius: '12px',
    bgcolor: 'background.paper',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: 'divider',
    },
    '&:hover fieldset': {
      borderColor: 'primary.main',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: '1px',
    },
    '&.Mui-focused': {
      boxShadow: (theme: { palette: { primary: { main: string } } }) =>
        `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}

const socialButtonSx = {
  py: 1.2,
  minHeight: 48,
  borderRadius: '12px',
  fontWeight: 700,
  textTransform: 'none' as const,
  color: 'text.primary',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  '&:hover': {
    bgcolor: (theme: { palette: { action: { hover: string } } }) =>
      alpha(theme.palette.action.hover, 0.04),
    borderColor: 'divider',
  },
  '&:focus': {
    boxShadow: (theme: { palette: { primary: { main: string } } }) =>
      `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}

function resolveRegisterError(err: HttpError, t: (key: string, fallback: string) => string): string {
  if (err.status === 409) {
    return t('signUp.errorDuplicateEmail', 'An account with this email already exists.')
  }
  return t(err.i18nKey, err.userMessage || t('signUp.errorGeneric', 'An error occurred during registration.'))
}

export default function SignUpV2() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const appName = tenant?.name || themeConfig.templateName

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValidating },
  } = useForm<SignUpFormSchemaType>({
    resolver: zodResolver(SignUpFormSchema),
    mode: 'onTouched',
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const registerMutation = useRegister({
    onSuccess: (_data, variables) => {
      const email = variables.data.email
      navigate(`${Path.auth.checkEmail}?email=${encodeURIComponent(email)}`)
    },
    onError: (err: HttpError) => {
      setError(resolveRegisterError(err, t))
    },
  })

  const isPending = registerMutation.isPending

  const onSubmit = useCallback(
    (formData: SignUpFormSchemaType) => {
      setError(null)
      const data: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        isTermsSign: formData.acceptTerms,
      }
      registerMutation.mutate({ data })
    },
    [registerMutation],
  )

  const handleSocialRegister = (provider: string) => {
    window.location.assign(`${API_CONFIG.baseURL}${ENDPOINTS.auth.social.redirect(provider)}`)
  }

  const translateFieldError = (message?: string) => (message ? t(message, message) : undefined)

  return (
    <>
      <title>
        {t('signUp.title_page', 'Create an account')} - {appName}
      </title>
      <meta
        name="keywords"
        content={t('signUp.keywords', {
          appName,
          defaultValue: `${appName} sign up register create account`,
        })}
      />

      <AuthPageLayout>
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            pointerEvents: 'none',
            background: (theme) =>
              `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 40%), radial-gradient(circle at 90% 80%, ${alpha(theme.palette.secondary.main || theme.palette.primary.light, 0.4)} 0%, transparent 40%), radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.dark, 0.2)} 0%, transparent 60%)`,
          }}
        />

        <Box sx={{ width: '100%', maxWidth: '480px', mx: 'auto' }}>
          <LiquidGlassCard blur="24px" opacity={0.82} padding="0px" borderRadius="24px">
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <AuthScreenIcon icon={<PersonAdd sx={{ fontSize: 32 }} />} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
                  {t('signUp.title', 'Create an account')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {t('signUp.subtitle', 'Join {{appName}} today', { appName })}
                </Typography>
              </Box>

              <Box sx={{ minHeight: 56, mb: 2 }}>
                {error && (
                  <Alert
                    id="sign-up-error"
                    severity="error"
                    role="alert"
                    aria-live="assertive"
                    sx={{ borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
                  >
                    {error}
                  </Alert>
                )}
              </Box>

              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google sx={{ color: 'text.primary' }} />}
                  onClick={() => handleSocialRegister('google')}
                  disabled={isPending}
                  sx={socialButtonSx}
                >
                  {t('register.signUpGoogle', 'Continue with Google')}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GitHub sx={{ color: 'text.primary' }} />}
                  onClick={() => handleSocialRegister('github')}
                  disabled={isPending}
                  sx={socialButtonSx}
                >
                  {t('register.signupGithub', 'Continue with GitHub')}
                </Button>
              </Stack>

              <Divider sx={{ my: 3, opacity: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {t('signUp.orSignUpWith', 'Or with email')}
                </Typography>
              </Divider>

              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <AuthInputLabel htmlFor="sign-up-firstname">
                        {t('signUp.firstNameLabel', 'First name')}
                      </AuthInputLabel>
                      <Controller
                        name="firstname"
                        control={control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            id="sign-up-firstname"
                            fullWidth
                            placeholder={t('register.firstnamePlaceholder', 'Jane')}
                            disabled={isPending}
                            autoComplete="given-name"
                            autoFocus
                            error={!!fieldState.error}
                            helperText={translateFieldError(fieldState.error?.message)}
                            aria-describedby={error ? 'sign-up-error' : undefined}
                            sx={fieldSx}
                          />
                        )}
                      />
                    </Box>
                    <Box>
                      <AuthInputLabel htmlFor="sign-up-lastname">
                        {t('signUp.lastNameLabel', 'Last name')}
                      </AuthInputLabel>
                      <Controller
                        name="lastname"
                        control={control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            id="sign-up-lastname"
                            fullWidth
                            placeholder={t('register.lastnamePlaceholder', 'Doe')}
                            disabled={isPending}
                            autoComplete="family-name"
                            error={!!fieldState.error}
                            helperText={translateFieldError(fieldState.error?.message)}
                            sx={fieldSx}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <AuthInputLabel htmlFor="sign-up-email">
                      {t('signUp.emailLabel', 'Email address')}
                    </AuthInputLabel>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          id="sign-up-email"
                          fullWidth
                          type="email"
                          placeholder={t('register.emailPlaceholder', 'name@example.com')}
                          disabled={isPending}
                          autoComplete="email"
                          error={!!fieldState.error}
                          helperText={translateFieldError(fieldState.error?.message)}
                          sx={fieldSx}
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <AuthInputLabel htmlFor="sign-up-password">
                      {t('signUp.passwordLabel', 'Password')}
                    </AuthInputLabel>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          id="sign-up-password"
                          fullWidth
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.common.passwordPlaceholder', 'Enter a password')}
                          disabled={isPending}
                          autoComplete="new-password"
                          error={!!fieldState.error}
                          helperText={
                            translateFieldError(fieldState.error?.message) ||
                            t(
                              'register.passwordHint',
                              'At least 8 characters, with upper, lower, number, and special character.',
                            )
                          }
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    edge="end"
                                    size="small"
                                    aria-label={
                                      showPassword
                                        ? t('signUp.hidePassword', 'Hide password')
                                        : t('signUp.showPassword', 'Show password')
                                    }
                                  >
                                    {showPassword ? (
                                      <VisibilityOff sx={{ fontSize: 20, color: 'text.secondary' }} />
                                    ) : (
                                      <Visibility sx={{ fontSize: 20, color: 'text.secondary' }} />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={fieldSx}
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <AuthInputLabel htmlFor="sign-up-confirm-password">
                      {t('signUp.confirmPasswordLabel', 'Confirm password')}
                    </AuthInputLabel>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          id="sign-up-confirm-password"
                          fullWidth
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('signUp.confirmPasswordPlaceholder', 'Re-enter your password')}
                          disabled={isPending}
                          autoComplete="new-password"
                          error={!!fieldState.error}
                          helperText={translateFieldError(fieldState.error?.message)}
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                                    edge="end"
                                    size="small"
                                    aria-label={
                                      showConfirmPassword
                                        ? t('signUp.hideConfirmPassword', 'Hide confirm password')
                                        : t('signUp.showConfirmPassword', 'Show confirm password')
                                    }
                                  >
                                    {showConfirmPassword ? (
                                      <VisibilityOff sx={{ fontSize: 20, color: 'text.secondary' }} />
                                    ) : (
                                      <Visibility sx={{ fontSize: 20, color: 'text.secondary' }} />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={fieldSx}
                        />
                      )}
                    />
                  </Box>

                  <Controller
                    name="acceptTerms"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Box>
                        <FormControlLabel
                          sx={{ mx: 0, alignItems: 'flex-start' }}
                          control={
                            <Checkbox
                              id="sign-up-accept-terms"
                              checked={field.value}
                              onChange={(event) => field.onChange(event.target.checked)}
                              disabled={isPending}
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, pt: 1 }}>
                              {t('signUp.iAgreeTo', 'I agree to the')}{' '}
                              <MuiLink
                                component={Link}
                                to={AppPaths.landing.termsOfService}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ fontWeight: 700, color: 'primary.main' }}
                              >
                                {t('signUp.termsOfService', 'Terms of Service')}
                              </MuiLink>{' '}
                              {t('signUp.and', 'and')}{' '}
                              <MuiLink
                                component={Link}
                                to={AppPaths.landing.privacyPolicy}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ fontWeight: 700, color: 'primary.main' }}
                              >
                                {t('signUp.privacyPolicy', 'Privacy Policy')}
                              </MuiLink>
                            </Typography>
                          }
                        />
                        {fieldState.error && (
                          <FormHelperText error sx={{ ml: 1.5 }}>
                            {translateFieldError(fieldState.error.message)}
                          </FormHelperText>
                        )}
                      </Box>
                    )}
                  />

                  <AuthActionButton
                    type="submit"
                    isLoading={isPending}
                    isSubmitting={isSubmitting}
                    isValidating={isValidating}
                    disabled={isPending || isSubmitting}
                    label={
                      isPending
                        ? t('signUp.submitting', 'Creating account...')
                        : t('signUp.submit', 'Create account')
                    }
                    sx={{
                      bgcolor: 'primary.main',
                      boxShadow: (theme) => `0 10px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-1px)',
                        boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                      },
                    }}
                  />
                </Stack>
              </Box>

              <Box sx={{ mt: 5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {t('signUp.alreadyHaveAccount', 'Already have an account?')}{' '}
                  <MuiLink
                    component={Link}
                    to={Path.auth.signin}
                    sx={{
                      fontWeight: 800,
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.dark', textDecoration: 'underline' },
                    }}
                  >
                    {t('signUp.signInHere', 'Sign in here')}
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </LiquidGlassCard>
        </Box>
      </AuthPageLayout>
    </>
  )
}
