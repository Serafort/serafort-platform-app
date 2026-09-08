import React from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  alpha,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Google from '@mui/icons-material/Google'
import GitHub from '@mui/icons-material/GitHub'
import { Controller, Control } from 'react-hook-form'
import {
  AuthCardHeader,
  AuthInputLabel,
  AuthActionButton,
  AuthTextField,
  PasswordStrengthMeter,
} from '../../../components/shared/auth'
import { SignUpFormSchemaType } from '../../../utils/schema'
import { Path } from '@cap/module-auth/routes/path'

interface RegistrationStepProps {
  t: any
  control: Control<SignUpFormSchemaType>
  handleSubmit: (
    onValid: (data: SignUpFormSchemaType) => void,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>
  onSubmit: (data: SignUpFormSchemaType) => void
  /** Current password value, for the live strength meter. */
  password: string
  showPassword: boolean
  showConfirmPassword: boolean
  isRegisterPending: boolean
  isSubmitting?: boolean
  isValidating?: boolean
  isLocked?: boolean
  onTogglePassword: () => void
  onToggleConfirmPassword: () => void
  onSocialRegister: (provider: string) => void
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
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease-in-out',
  '& .MuiButton-startIcon': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    m: 0,
    mr: 1,
  },
  '&:hover': {
    bgcolor: (theme: any) => alpha(theme.palette.action.hover, 0.04),
    borderColor: 'divider',
  },
  '&:focus': {
    boxShadow: (theme: any) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}

export const RegistrationStep: React.FC<RegistrationStepProps> = ({
  t,
  control,
  handleSubmit,
  onSubmit,
  password,
  showPassword,
  showConfirmPassword,
  isRegisterPending,
  isSubmitting,
  isValidating,
  isLocked,
  onTogglePassword,
  onToggleConfirmPassword,
  onSocialRegister,
}) => {
  return (
    <>
      <Box sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 4 } }}>
        <AuthCardHeader
          icon={<PersonAdd sx={{ fontSize: 32 }} />}
          title={t('signUp.title', 'Create an account')}
          subtitle={t('signUp.subtitle', 'Join our multi-tenant SaaS platform today')}
        />
      </Box>

      {/* Form Section */}
      <Box
        sx={{
          px: { xs: 3, sm: 4 },
          pt: 1,
          pb: 4,
        }}
      >
        <Box
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          {/* First & Last Name Fields (2 Columns) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <AuthInputLabel>{t('signUp.firstNameLabel', 'FIRST NAME')}</AuthInputLabel>
              <Controller
                name='firstname'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <AuthTextField
                    {...field}
                    id='signup-firstname'
                    fullWidth
                    placeholder={t('signUp.firstNamePlaceholder', 'John')}
                    error={!!error}
                    helperText={error?.message ? t(error.message, error.message) : undefined}
                    disabled={isRegisterPending || isSubmitting || isLocked}
                    autoComplete='given-name'
                  />
                )}
              />
            </Box>
            <Box>
              <AuthInputLabel>{t('signUp.lastNameLabel', 'LAST NAME')}</AuthInputLabel>
              <Controller
                name='lastname'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <AuthTextField
                    {...field}
                    id='signup-lastname'
                    fullWidth
                    placeholder={t('signUp.lastNamePlaceholder', 'Doe')}
                    error={!!error}
                    helperText={error?.message ? t(error.message, error.message) : undefined}
                    disabled={isRegisterPending || isSubmitting || isLocked}
                    autoComplete='family-name'
                  />
                )}
              />
            </Box>
          </Box>

          {/* Email Field */}
          <Box>
            <AuthInputLabel>{t('signUp.emailLabel', 'EMAIL ADDRESS')}</AuthInputLabel>
            <Controller
              name='email'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <AuthTextField
                  {...field}
                  id='signup-email'
                  type='email'
                  fullWidth
                  placeholder={t('signUp.emailPlaceholder', 'name@company.com')}
                  error={!!error}
                  helperText={error?.message ? t(error.message, error.message) : undefined}
                  disabled={isRegisterPending || isSubmitting || isLocked}
                  autoComplete='email'
                />
              )}
            />
          </Box>

          {/* Password Field */}
          <Box>
            <AuthInputLabel>{t('signUp.passwordLabel', 'PASSWORD')}</AuthInputLabel>
            <Controller
              name='password'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <AuthTextField
                  {...field}
                  id='signup-password'
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder='••••••••••••'
                  error={!!error}
                  helperText={error?.message ? t(error.message, error.message) : undefined}
                  disabled={isRegisterPending || isSubmitting || isLocked}
                  autoComplete='new-password'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle password visibility'
                          onClick={onTogglePassword}
                          edge='end'
                          size='small'
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ fontSize: 20 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <PasswordStrengthMeter password={password} criteria='list' framed />
          </Box>

          {/* Confirm Password Field */}
          <Box>
            <AuthInputLabel>{t('signUp.confirmPasswordLabel', 'CONFIRM PASSWORD')}</AuthInputLabel>
            <Controller
              name='confirmPassword'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <AuthTextField
                  {...field}
                  id='signup-confirm-password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder='••••••••••••'
                  error={!!error}
                  helperText={error?.message ? t(error.message, error.message) : undefined}
                  disabled={isRegisterPending || isSubmitting || isLocked}
                  autoComplete='new-password'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle confirm password visibility'
                          onClick={onToggleConfirmPassword}
                          edge='end'
                          size='small'
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff sx={{ fontSize: 20 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>

          {/* Terms and Privacy Checkbox */}
          <Box>
            <Controller
              name='acceptTerms'
              control={control}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={isRegisterPending || isSubmitting || isLocked}
                        size='small'
                        color='primary'
                      />
                    }
                    label={
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ fontSize: '0.85rem' }}
                      >
                        {t('signUp.iAgreeTo', 'I agree to the')}{' '}
                        <MuiLink
                          component={Link}
                          to='/terms'
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {t('signUp.termsOfService', 'Terms of Service')}
                        </MuiLink>{' '}
                        {t('signUp.and', 'and')}{' '}
                        <MuiLink
                          component={Link}
                          to='/privacy'
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {t('signUp.privacyPolicy', 'Privacy Policy')}
                        </MuiLink>
                      </Typography>
                    }
                  />
                  {error && (
                    <FormHelperText error sx={{ ml: 1.5 }}>
                      {t(error.message || '', error.message || 'You must accept the terms.')}
                    </FormHelperText>
                  )}
                </Box>
              )}
            />
          </Box>

          {/* Submit Action Button */}
          <AuthActionButton
            type='submit'
            fullWidth
            loading={isRegisterPending || isSubmitting || isValidating}
            disabled={isLocked}
          >
            {isRegisterPending || isSubmitting
              ? t('signUp.submitting', 'Creating Account...')
              : t('signUp.submit', 'Create Account')}
          </AuthActionButton>

          {/* Social Sign-Up Section */}
          <Box sx={{ mt: 1, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography
                variant='caption'
                sx={{
                  color: 'text.secondary',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {t('signUp.orSignUpWith', 'OR SIGN UP WITH')}
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Button
                fullWidth
                variant='outlined'
                startIcon={<Google />}
                onClick={() => onSocialRegister('google')}
                disabled={isRegisterPending || isSubmitting || isLocked}
                sx={socialButtonSx}
              >
                Google
              </Button>
              <Button
                fullWidth
                variant='outlined'
                startIcon={<GitHub />}
                onClick={() => onSocialRegister('github')}
                disabled={isRegisterPending || isSubmitting || isLocked}
                sx={socialButtonSx}
              >
                GitHub
              </Button>
            </Box>
          </Box>

          {/* Already have an account footer */}
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              {t('signUp.alreadyHaveAccount', 'Already have an account?')}{' '}
              <MuiLink
                component={Link}
                to={Path.auth.signin}
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {t('signUp.signInHere', 'Sign in here')}
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  )
}
