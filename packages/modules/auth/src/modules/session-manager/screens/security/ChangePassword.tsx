import React, { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Card,
  CardContent,
  CssBaseline,
  useTheme,
  alpha,
  CircularProgress,
  Stack,
} from '@mui/material'
import LockOutlined from '@mui/icons-material/LockOutlined'
import VpnKeyOutlined from '@mui/icons-material/VpnKeyOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ArrowBack from '@mui/icons-material/ArrowBack'
import CheckCircle from '@mui/icons-material/CheckCircle'
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked'
import ShieldOutlined from '@mui/icons-material/ShieldOutlined'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { themeConfig, useNotifications } from '@cap/platform-core'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useChangePassword } from '../../hooks/useSessionQuery'
import { Path } from '../../../../routes/path'

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one number or special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>

export function ChangePassword() {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { addNotification } = useNotifications()
  const { mutate: changePassword, isPending } = useChangePassword()

  const controlForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  // Live watch password values for interactive checklist & strength meter
  const passwordValue = useWatch({ control: controlForm.control, name: 'password' }) || ''
  const confirmPasswordValue =
    useWatch({ control: controlForm.control, name: 'confirmPassword' }) || ''

  const requirements = useMemo(
    () => [
      {
        id: 'length',
        label: t('auth.set_new_password.char_limit', 'At least 8 characters'),
        met: passwordValue.length >= 8,
      },
      {
        id: 'uppercase',
        label: t('auth.set_new_password.uppercase', 'At least one uppercase letter (A-Z)'),
        met: /[A-Z]/.test(passwordValue),
      },
      {
        id: 'lowercase',
        label: t('auth.set_new_password.lowercase', 'At least one lowercase letter (a-z)'),
        met: /[a-z]/.test(passwordValue),
      },
      {
        id: 'number_special',
        label: t(
          'auth.set_new_password.number',
          'At least one number or special character (0-9, !@#$...)',
        ),
        met: /[0-9!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
      },
      {
        id: 'match',
        label: t('auth.set_new_password.passwords_match', 'Passwords match'),
        met: Boolean(confirmPasswordValue && passwordValue === confirmPasswordValue),
      },
    ],
    [passwordValue, confirmPasswordValue, t],
  )

  // Calculate password strength score (0 to 4)
  const strengthScore = useMemo(() => {
    if (!passwordValue) return 0
    let score = 0
    if (passwordValue.length >= 8) score += 1
    if (/[A-Z]/.test(passwordValue)) score += 1
    if (/[a-z]/.test(passwordValue)) score += 1
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) score += 1
    return score
  }, [passwordValue])

  const strengthPercentage = (strengthScore / 4) * 100

  const getStrengthMeta = (score: number) => {
    switch (score) {
      case 1:
        return {
          label: t('auth.register.strength_weak', 'Weak'),
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.12),
        }
      case 2:
        return {
          label: t('auth.register.strength_fair', 'Fair'),
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.12),
        }
      case 3:
        return {
          label: t('auth.register.strength_good', 'Good'),
          color: theme.palette.info.main,
          bgcolor: alpha(theme.palette.info.main, 0.12),
        }
      case 4:
        return {
          label: t('auth.register.strength_strong', 'Strong'),
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.12),
        }
      default:
        return {
          label: t('auth.register.strength_weak', 'Weak'),
          color: theme.palette.text.disabled,
          bgcolor: alpha(theme.palette.text.disabled, 0.1),
        }
    }
  }

  const currentStrengthMeta = getStrengthMeta(strengthScore)

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(data, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: t('auth.account.password_updated', 'Password Updated'),
          message: t(
            'auth.account.password_updated_desc',
            'Your password has been changed successfully.',
          ),
        })
        controlForm.reset()
        navigate(Path.account.overview)
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: t('auth.common.error', 'Error'),
          message:
            error.response?.data?.message ||
            t('auth.common.something_went_wrong', 'Something went wrong'),
        })
      },
    })
  }

  return (
    <>
      <title>
        {t('auth.set_new_password.title_page', 'Change Password')} - {themeConfig.templateName}
      </title>
      <Container
        component='main'
        maxWidth='md'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 120px)',
          justifyContent: 'center',
          alignItems: 'center',
          py: { xs: 4, sm: 6 },
          px: { xs: 2, sm: 3 },
          position: 'relative',
        }}
      >
        <CssBaseline />

        {/* Simplified Top Navigation Header */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 520,
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <Button
            component={RouterLink}
            to={Path.account.overview}
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'text.secondary',
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              '&:hover, &:not(.Mui-disabled):hover': {
                color: 'text.primary',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {t('auth.account.back_to_security', 'Back to Security & Account')}
          </Button>
        </Box>

        {/* Main Grouped Container Card */}
        <Card
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: 520,
            borderRadius: '16px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 32px -4px rgba(0, 0, 0, 0.5)'
                : '0 12px 32px -4px rgba(15, 23, 42, 0.08)',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 1,
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          }}
        >
          <CardContent
            sx={{
              p: { xs: 3, sm: 4.5 },
              '&:last-child': { pb: { xs: 3, sm: 4.5 } },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
              {/* Header Icon */}
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                }}
              >
                <ShieldOutlined sx={{ fontSize: 30 }} />
              </Box>

              <Typography
                variant='h5'
                fontWeight='700'
                textAlign='center'
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                  mb: 0.75,
                }}
              >
                {t('auth.account.change_password', 'Change Password')}
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                textAlign='center'
                sx={{ fontSize: '0.875rem', lineHeight: 1.5, maxWidth: 420 }}
              >
                {t(
                  'auth.account.change_password_desc',
                  'Update your account password to maintain maximum security across your sessions.',
                )}
              </Typography>
            </Box>

            <Box
              component='form'
              onSubmit={controlForm.handleSubmit(onSubmit)}
              noValidate
              sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              {/* Current Password Field */}
              <Box>
                <Typography
                  component='label'
                  htmlFor='currentPassword'
                  sx={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.75,
                  }}
                >
                  {t('auth.account.current_password', 'Current Password')}
                </Typography>
                <Controller
                  name='currentPassword'
                  control={controlForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      id='currentPassword'
                      fullWidth
                      placeholder={t(
                        'auth.account.current_password_placeholder',
                        'Enter your current password',
                      )}
                      type={showCurrentPassword ? 'text' : 'password'}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={isPending}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position='start'>
                              <LockOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                edge='end'
                                size='small'
                                aria-label='toggle current password visibility'
                              >
                                {showCurrentPassword ? (
                                  <VisibilityOff sx={{ fontSize: 18 }} />
                                ) : (
                                  <Visibility sx={{ fontSize: 18 }} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          minHeight: 48,
                          bgcolor: 'background.default',
                          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                          '& fieldset': { borderColor: 'divider' },
                          '&:hover fieldset': { borderColor: 'primary.main' },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '1.5px',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>

              {/* New Password Field */}
              <Box>
                <Typography
                  component='label'
                  htmlFor='password'
                  sx={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.75,
                  }}
                >
                  {t('auth.account.new_password_label', 'New Password')}
                </Typography>

                <Controller
                  name='password'
                  control={controlForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      id='password'
                      fullWidth
                      placeholder={t(
                        'auth.account.new_password_placeholder',
                        'Create a strong new password',
                      )}
                      type={showPassword ? 'text' : 'password'}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={isPending}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position='start'>
                              <VpnKeyOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge='end'
                                size='small'
                                aria-label='toggle new password visibility'
                              >
                                {showPassword ? (
                                  <VisibilityOff sx={{ fontSize: 18 }} />
                                ) : (
                                  <Visibility sx={{ fontSize: 18 }} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          minHeight: 48,
                          bgcolor: 'background.default',
                          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                          '& fieldset': { borderColor: 'divider' },
                          '&:hover fieldset': { borderColor: 'primary.main' },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '1.5px',
                          },
                        },
                      }}
                    />
                  )}
                />

                {/* Segmented Strength Meter */}
                {passwordValue.length > 0 && (
                  <Box sx={{ mt: 1.5, mb: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, height: 5, mb: 1 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            flex: 1,
                            height: '100%',
                            borderRadius: '4px',
                            bgcolor:
                              strengthScore >= i
                                ? currentStrengthMeta.color
                                : alpha(theme.palette.divider, 0.8),
                            transition: 'background-color 0.25s ease, transform 0.2s ease',
                          }}
                        />
                      ))}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {t('auth.register.password_strength', 'Password Strength:')}{' '}
                        <Typography
                          component='span'
                          sx={{
                            fontSize: 'inherit',
                            fontWeight: 700,
                            color: currentStrengthMeta.color,
                          }}
                        >
                          {currentStrengthMeta.label}
                        </Typography>
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'text.secondary',
                        }}
                      >
                        {Math.round(strengthPercentage)}%
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Confirm Password Field */}
              <Box>
                <Typography
                  component='label'
                  htmlFor='confirmPassword'
                  sx={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.75,
                  }}
                >
                  {t('auth.account.confirm_password_label', 'Confirm New Password')}
                </Typography>
                <Controller
                  name='confirmPassword'
                  control={controlForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      id='confirmPassword'
                      fullWidth
                      placeholder={t(
                        'auth.account.confirm_password_placeholder',
                        'Re-enter your new password',
                      )}
                      type={showConfirmPassword ? 'text' : 'password'}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={isPending}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position='start'>
                              <LockOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge='end'
                                size='small'
                                aria-label='toggle confirm password visibility'
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOff sx={{ fontSize: 18 }} />
                                ) : (
                                  <Visibility sx={{ fontSize: 18 }} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          minHeight: 48,
                          bgcolor: 'background.default',
                          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                          '& fieldset': { borderColor: 'divider' },
                          '&:hover fieldset': { borderColor: 'primary.main' },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '1.5px',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>

              {/* Password Requirements Checklist Card */}
              <Box
                sx={{
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.background.default, 0.6)
                      : alpha(theme.palette.primary.main, 0.03),
                  borderRadius: '12px',
                  p: 2,
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'text.secondary',
                    mb: 1.25,
                  }}
                >
                  {t('auth.register.password_requirements', 'Password Requirements')}
                </Typography>
                <Stack spacing={1}>
                  {requirements.map((req) => (
                    <Box
                      key={req.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {req.met ? (
                        <CheckCircle
                          sx={{
                            fontSize: 16,
                            color: 'success.main',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <RadioButtonUnchecked
                          sx={{
                            fontSize: 16,
                            color: 'text.disabled',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          color: req.met ? 'text.primary' : 'text.secondary',
                          fontWeight: req.met ? 600 : 400,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {req.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Action Button CTA */}
              <Button
                type='submit'
                fullWidth
                variant='contained'
                disabled={isPending}
                sx={{
                  py: 1.5,
                  borderRadius: '10px',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  mt: 1,
                  boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.2s ease',
                  '&:hover, &:not(.Mui-disabled):hover': {
                    bgcolor: (theme) => `${theme.palette.primary.dark} !important`,
                    color: (theme) => `${theme.palette.primary.contrastText} !important`,
                    boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                  '&:disabled, &.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                    boxShadow: 'none',
                  },
                }}
                startIcon={isPending ? <CircularProgress size={18} color='inherit' /> : undefined}
              >
                {isPending
                  ? t('auth.common.processing', 'Processing...')
                  : t('auth.account.update_password', 'Update Password')}
              </Button>

              {/* Cancel Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
                <Button
                  component={RouterLink}
                  to={Path.account.view}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    '&:hover, &:not(.Mui-disabled):hover': {
                      color: 'text.primary',
                      bgcolor: (theme) => alpha(theme.palette.action.hover, 0.08),
                    },
                  }}
                >
                  {t('auth.account.cancel', 'Cancel')}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Footer info */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
            &copy; {new Date().getFullYear()} {t('auth.common.appName', 'Nexus IDaaS')}.{' '}
            {t('auth.common.allRightsReserved', 'All rights reserved.')}
          </Typography>
        </Box>
      </Container>
    </>
  )
}

export default ChangePassword
