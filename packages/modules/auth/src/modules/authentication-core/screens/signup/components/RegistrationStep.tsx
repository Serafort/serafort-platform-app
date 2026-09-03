import React from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  LinearProgress,
  Stack,
  alpha,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import PersonAdd from '@mui/icons-material/PersonAdd'
import CheckCircle from '@mui/icons-material/CheckCircle'
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked'
import Google from '@mui/icons-material/Google'
import GitHub from '@mui/icons-material/GitHub'
import { Controller, Control } from 'react-hook-form'
import { AuthScreenIcon, AuthInputLabel, AuthActionButton } from '../../../components/shared/auth'
import { SignUpFormSchemaType } from '../../../utils/schema'
import { PasswordStrength } from '../hooks/useSignUpFlow'
import { Path } from '@cap/module-auth/routes/path'

interface RegistrationStepProps {
  t: any
  control: Control<SignUpFormSchemaType>
  handleSubmit: (
    onValid: (data: SignUpFormSchemaType) => void,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>
  onSubmit: (data: SignUpFormSchemaType) => void
  passwordStrength: PasswordStrength
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
      boxShadow: (theme: any) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
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
  passwordStrength,
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
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <AuthScreenIcon icon={<PersonAdd sx={{ fontSize: 32 }} />} />
      </Box>
      <Typography
        variant='h4'
        sx={{
          fontWeight: 900,
          mb: 1,
          letterSpacing: '-0.027em',
          textAlign: 'center',
          fontFamily: 'var(--font-h4, inherit)',
        }}
      >
        {t('signUp.title', 'Create an account')}
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        sx={{ fontWeight: 500, mb: 4, textAlign: 'center' }}
      >
        {t('signUp.subtitle', 'Join our multi-tenant SaaS platform today')}
      </Typography>

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
                  <TextField
                    {...field}
                    id='signup-firstname'
                    fullWidth
                    placeholder={t('signUp.firstNamePlaceholder', 'John')}
                    error={!!error}
                    helperText={error?.message ? t(error.message, error.message) : undefined}
                    disabled={isRegisterPending || isSubmitting || isLocked}
                    autoComplete='given-name'
                    sx={fieldSx}
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
                  <TextField
                    {...field}
                    id='signup-lastname'
                    fullWidth
                    placeholder={t('signUp.lastNamePlaceholder', 'Doe')}
                    error={!!error}
                    helperText={error?.message ? t(error.message, error.message) : undefined}
                    disabled={isRegisterPending || isSubmitting || isLocked}
                    autoComplete='family-name'
                    sx={fieldSx}
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
                <TextField
                  {...field}
                  id='signup-email'
                  type='email'
                  fullWidth
                  placeholder={t('signUp.emailPlaceholder', 'name@company.com')}
                  error={!!error}
                  helperText={error?.message ? t(error.message, error.message) : undefined}
                  disabled={isRegisterPending || isSubmitting || isLocked}
                  autoComplete='email'
                  sx={fieldSx}
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
                <TextField
                  {...field}
                  id='signup-password'
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder='••••••••••••'
                  error={!!error}
                  helperText={error?.message ? t(error.message, error.message) : undefined}
                  disabled={isRegisterPending || isSubmitting || isLocked}
                  autoComplete='new-password'
                  sx={fieldSx}
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

            {/* Password Strength Progress Bar & Breakdown */}
            {control._formValues.password && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.8,
                  }}
                >
                  <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {t('signUp.passwordStrength', 'Password Strength')}:
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{ fontWeight: 800, color: `${passwordStrength.color}.main` }}
                  >
                    {passwordStrength.label}
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={passwordStrength.score}
                  color={passwordStrength.color}
                  sx={{ height: 6, borderRadius: 3, mb: 1.5 }}
                />
                <Stack spacing={0.6}>
                  {[
                    {
                      label: t('signUp.reqLength', 'At least 8 characters'),
                      met: passwordStrength.criteria.minLength,
                    },
                    {
                      label: t('signUp.reqUppercase', 'At least one uppercase letter (A-Z)'),
                      met: passwordStrength.criteria.hasUppercase,
                    },
                    {
                      label: t('signUp.reqLowercase', 'At least one lowercase letter (a-z)'),
                      met: passwordStrength.criteria.hasLowercase,
                    },
                    {
                      label: t('signUp.reqNumber', 'At least one number (0-9)'),
                      met: passwordStrength.criteria.hasNumber,
                    },
                    {
                      label: t('signUp.reqSpecial', 'At least one special character (!@#$)'),
                      met: passwordStrength.criteria.hasSpecial,
                    },
                  ].map((req, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      {req.met ? (
                        <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                      ) : (
                        <RadioButtonUnchecked sx={{ fontSize: 14, color: 'text.disabled' }} />
                      )}
                      <Typography
                        variant='caption'
                        sx={{
                          color: req.met ? 'text.primary' : 'text.disabled',
                          fontWeight: req.met ? 600 : 400,
                          fontSize: '0.75rem',
                        }}
                      >
                        {req.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          {/* Confirm Password Field */}
          <Box>
            <AuthInputLabel>{t('signUp.confirmPasswordLabel', 'CONFIRM PASSWORD')}</AuthInputLabel>
            <Controller
              name='confirmPassword'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  id='signup-confirm-password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder='••••••••••••'
                  error={!!error}
                  helperText={error?.message ? t(error.message, error.message) : undefined}
                  disabled={isRegisterPending || isSubmitting || isLocked}
                  autoComplete='new-password'
                  sx={fieldSx}
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
