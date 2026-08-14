import { useState, useMemo } from 'react';
import { Box, Button, Container, IconButton, InputAdornment, TextField, Typography, Card, CardContent, CssBaseline, useTheme, alpha, CircularProgress } from '@mui/material';
import Lock from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockReset from '@mui/icons-material/LockReset';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import { themeConfig, useNotifications } from '@cap/platform-core';
import { buildLayoutSurfaceEffect } from '@cap/layout';
import { getTenantThemeEffects } from '@cap/theme';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useChangePassword } from '@auth';

interface ChangePasswordFormData {
  currentPassword: string
  password: string
  confirmPassword: string
}

function ChangePassword() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleClickShowPassword = () => setShowPassword(!showPassword)
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword)

  const { addNotification } = useNotifications()
  const { mutate: changePassword, isPending } = useChangePassword()

  const controlForm = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Password Logic
  const passwordValue = useWatch({ control: controlForm.control, name: 'password' }) || ''

  const requirements = useMemo(
    () => [
      { label: t('auth.set_new_password.char_limit'), met: passwordValue.length >= 8 },
      { label: t('auth.set_new_password.uppercase'), met: /[A-Z]/.test(passwordValue) },
      {
        label: t('auth.set_new_password.number'),
        met: /[0-9!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
      },
    ],
    [passwordValue, t],
  )

  const strength = useMemo(() => {
    if (!passwordValue) return 0
    return (requirements.filter((r) => r.met).length / requirements.length) * 100
  }, [passwordValue, requirements])

  const getStrengthLabel = (val: number) => {
    if (val <= 33) return t('auth.register.strength_weak')
    if (val <= 66) return t('auth.register.strength_medium')
    return t('auth.register.strength_strong')
  }

  const getStrengthColor = (val: number, theme: any) => {
    if (val <= 33) return theme.palette.error.main
    if (val <= 66) return theme.palette.warning.main
    return theme.palette.success.main
  }

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(data, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: t('auth.account.password_updated', 'Password Updated'),
          message: t('auth.account.password_updated_desc', 'Your password has been changed successfully.'),
        })
        controlForm.reset()
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: t('auth.common.error', 'Error'),
          message: error.response?.data?.message || t('auth.common.something_went_wrong', 'Something went wrong'),
        })
      },
    })
  }

  return (
    <>
      <title>
        {t('auth.set_new_password.title_page')} - {themeConfig.templateName}
      </title>
      <Container
        component='main'
        maxWidth={false}
        disableGutters
        className='animate-scale-in'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          py: { xs: 8, sm: 12 },
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        <CssBaseline />
        {/* Abstract Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: (theme) =>
              `radial-gradient(${theme.palette.divider} 0.5px, transparent 0.5px)`,
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(180deg, white, rgba(255, 255, 255, 0))',
            opacity: 0.2,
            pointerEvents: 'none',
          }}
        />

        {/* â”€â”€ SYSTEM PATTERN: metric_card (OrganizationProfile style background) â”€â”€ */}
        <Card
          sx={(theme: any) => ({
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '480px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
            border: '1px solid ' + theme.palette.divider,
            mx: { xs: 2, sm: 4 },
            zIndex: 1,
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          })}
        >
          <CardContent
            sx={{
              padding: { xs: '32px 24px', sm: '32px 40px' },
              '&:last-child': { pb: { xs: '32px', sm: '40px' } },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Header Icon */}
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'info.lighter',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <LockReset sx={{ color: 'info.main', fontSize: 32 }} />
              </Box>

              <Typography
                variant='h4'
                fontWeight='700'
                textAlign='center'
                sx={{
                  fontSize: '1.5rem',
                  lineHeight: 1.2,
                  color: 'text.primary',
                  fontFamily: 'inherit',
                  mb: 1,
                }}
              >
                {t('auth.account.change_password')}
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
                textAlign='center'
                sx={{ fontSize: '0.875rem', fontFamily: 'inherit', lineHeight: 1.5, mb: 4 }}
              >
                {t('auth.account.change_password_desc')}
              </Typography>

              <Box
                component='form'
                onSubmit={controlForm.handleSubmit(onSubmit)}
                noValidate
                sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}
              >
                {/* â”€â”€ SYSTEM PATTERN: text_field (InputProps -> slotProps.input) â”€â”€ */}
                <Box>
                  <Typography
                    component='label'
                    htmlFor='currentPassword'
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    {t('auth.account.current_password')}
                  </Typography>
                  <Controller
                    name='currentPassword'
                    control={controlForm.control}
                    rules={{ required: true }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        id='currentPassword'
                        fullWidth
                        placeholder={t('auth.account.current_password_placeholder')}
                        type='password'
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position='start'>
                                <Lock sx={{ fontSize: 20, color: 'text.disabled' }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            height: 48,
                            bgcolor: 'background.paper',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'info.main' },
                            '&.Mui-focused fieldset': {
                              borderColor: 'info.main',
                              borderWidth: '1px',
                            },
                          },
                          '& .MuiInputBase-input': { fontSize: '1rem' },
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
                      fontWeight: 500,
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    {t('auth.account.new_password_label', 'New Password')}
                  </Typography>

                  <Controller
                    name='password'
                    control={controlForm.control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        id='password'
                        fullWidth
                        placeholder={t('auth.set_new_password.password_placeholder')}
                        type={showPassword ? 'text' : 'password'}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton onClick={handleClickShowPassword} edge='end'>
                                  {showPassword ? (
                                    <VisibilityOff sx={{ fontSize: 20 }} />
                                  ) : (
                                    <Visibility sx={{ fontSize: 20 }} />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            height: 48,
                            bgcolor: 'background.paper',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'info.main' },
                            '&.Mui-focused fieldset': {
                              borderColor: 'info.main',
                              borderWidth: '1px',
                            },
                          },
                          '& .MuiInputBase-input': { fontSize: '1rem' },
                        }}
                      />
                    )}
                  />

                  {/* Strength Meter */}
                  <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, height: 4, mb: 1 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            flex: 1,
                            height: '100%',
                            borderRadius: 'full',
                            bgcolor:
                              strength >= i * 25 ? getStrengthColor(strength, theme) : 'divider',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {t('auth.register.password_strength')}{' '}
                      <Typography
                        component='span'
                        sx={{
                          fontSize: 'inherit',
                          fontWeight: 500,
                          color: getStrengthColor(strength, theme),
                        }}
                      >
                        {getStrengthLabel(strength)}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>

                {/* Confirm Password Field */}
                <Box>
                  <Typography
                    component='label'
                    htmlFor='confirmPassword'
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    {t('auth.set_new_password.confirm_password_label')}
                  </Typography>
                  <Controller
                    name='confirmPassword'
                    control={controlForm.control}
                    rules={{
                      required: true,
                      validate: (val) =>
                        val === (passwordValue || '') || t('auth.register.passwords_must_match'),
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        id='confirmPassword'
                        fullWidth
                        placeholder={t('auth.set_new_password.confirm_password_placeholder')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton onClick={handleClickShowConfirmPassword} edge='end'>
                                  {showConfirmPassword ? (
                                    <VisibilityOff sx={{ fontSize: 20 }} />
                                  ) : (
                                    <Visibility sx={{ fontSize: 20 }} />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            height: 48,
                            bgcolor: 'background.paper',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'info.main' },
                            '&.Mui-focused fieldset': {
                              borderColor: 'info.main',
                              borderWidth: '1px',
                            },
                          },
                          '& .MuiInputBase-input': { fontSize: '1rem' },
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Requirements Card */}
                <Box
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
                    borderRadius: '8px',
                    p: 2,
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.info.main, 0.1),
                  }}
                >
                  <Typography
                    sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', mb: 1.5 }}
                  >
                    {t('auth.register.password_requirements')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {requirements.map((req, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            bgcolor: req.met ? 'success.main' : 'text.disabled',
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            color: req.met ? 'success.main' : 'text.secondary',
                            fontWeight: req.met ? 500 : 400,
                          }}
                        >
                          {req.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* â”€â”€ SYSTEM PATTERN: cta_button (info.main variant) â”€â”€ */}
                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  sx={{
                    py: 1.75,
                    borderRadius: '8px',
                    bgcolor: 'info.main',
                    color: 'info.contrastText',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    mt: 1,
                    boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.2)',
                    '&:hover': {
                      bgcolor: 'info.dark',
                      boxShadow: 'none',
                    },
                  }}
                  disabled={isPending}
                  startIcon={
                    isPending ? <CircularProgress size={20} color='inherit' /> : undefined
                  }
                >
                  {isPending
                    ? t('auth.common.processing', 'Processing...')
                    : t('auth.account.update_password')}
                </Button>

                {/* Back Link */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    onClick={() => window.history.back()}
                    startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                        bgcolor: 'transparent',
                      },
                    }}
                  >
                    {t('auth.account.cancel')}
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
            Â© {new Date().getFullYear()} {t('auth.common.appName')}{' '}
            {t('auth.common.allRightsReserved')}
          </Typography>
        </Box>
      </Container>
    </>
  )
}

export default ChangePassword

