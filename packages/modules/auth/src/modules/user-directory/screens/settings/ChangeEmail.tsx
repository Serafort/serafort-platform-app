import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Alert,
  CircularProgress,
  Link,
  useTheme,
  alpha,
  Stack,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import VpnKey from '@mui/icons-material/VpnKey'
import LockReset from '@mui/icons-material/LockReset'
import Mail from '@mui/icons-material/Mail'
import AlternateEmail from '@mui/icons-material/AlternateEmail'
import Info from '@mui/icons-material/Info'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { themeConfig, useNotifications } from '@cap/platform-core'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Path } from '../../../../routes/path'
import { useCurrentUserQuery, useChangeEmail } from '../../hooks/useUserQuery'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'

const changeEmailRequestSchema = z.object({
  CurrentEmail: z.string().optional(),
  newEmail: z.string().email('Invalid email address').min(1, 'New email is required'),
  password: z.string().min(1, 'Password is required to confirm identity'),
})

type ChangeEmailRequestFormData = z.infer<typeof changeEmailRequestSchema>

function ChangeEmail() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const effects = getTenantThemeEffects(theme)
  const surfaceEffect = buildLayoutSurfaceEffect(effects, theme)

  const { addNotification } = useNotifications()
  const { data: user } = useCurrentUserQuery()
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successData, setSuccessData] = useState<{ message: string; verifyUrl?: string } | null>(
    null,
  )

  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword)

  const controlForm = useForm<ChangeEmailRequestFormData>({
    resolver: zodResolver(changeEmailRequestSchema),
    defaultValues: {
      CurrentEmail: '',
      newEmail: '',
      password: '',
    },
  })

  // Pre-fill current email when user data is available
  useEffect(() => {
    if (user?.data?.email) {
      controlForm.setValue('CurrentEmail', user.data.email)
    }
  }, [user, controlForm])

  const { mutate: changeEmail, isPending } = useChangeEmail({
    onSuccess: (response) => {
      const body = response.data as { message?: string; verifyUrl?: string } | undefined
      setSuccessData({
        message:
          body?.message ||
          t('auth.account.change_email_success_message', 'Verification email dispatched.'),
        verifyUrl: body?.verifyUrl,
      })
      addNotification({
        type: 'success',
        title: t('auth.account.change_email_success_title', 'Success'),
        message: t('auth.account.change_email_success_toast', 'Email change request initiated.'),
      })
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: t('auth.account.change_email_error_title', 'Error'),
        message:
          error.message || t('auth.account.change_email_error_toast', 'Failed to change email.'),
      })
    },
  })

  const onSubmit = (data: ChangeEmailRequestFormData) => {
    changeEmail({
      email: data.newEmail,
      password: data.password,
    })
  }

  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Container
          component='main'
          maxWidth='sm'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '80vh',
            justifyContent: 'center',
            alignItems: 'center',
            py: { xs: 4, sm: 8 },
          }}
        >
          <Card
            sx={{
              maxWidth: 480,
              width: '100%',
              borderRadius: 'var(--sf-radius-lg, 16px)',
              textAlign: 'center',
              p: 4,
              border: '1px solid',
              borderColor: 'divider',
              ...surfaceEffect,
            }}
          >
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant='h5' fontWeight='700' mb={2}>
              {t('auth.account.request_sent', 'Check Your Inbox')}
            </Typography>
            <Typography variant='body1' color='text.secondary' mb={4}>
              {successData.message}
            </Typography>

            {successData.verifyUrl && (
              <Alert
                severity='info'
                sx={{
                  mb: 4,
                  textAlign: 'left',
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.2),
                }}
              >
                <Typography variant='body2' fontWeight='bold'>
                  {t('auth.userDirectory.changeEmail.devModeVerificationLink', 'Dev Mode: Verification Link')}
                </Typography>
                <Link
                  href={successData.verifyUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{ wordBreak: 'break-all' }}
                >
                  {successData.verifyUrl}
                </Link>
              </Alert>
            )}

            <Button
              variant='contained'
              fullWidth
              onClick={() => navigate(Path.account.view)}
              sx={{
                minHeight: 48,
                borderRadius: 'var(--sf-radius-md, 8px)',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {t('auth.account.back_to_security', 'Back to Profile & Security')}
            </Button>
          </Card>
        </Container>
      </motion.div>
    )
  }

  return (
    <>
      <title>
        {t('auth.account.change_email_title', 'Change Email Address')} - {themeConfig.templateName}
      </title>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Container
          component='main'
          maxWidth='sm'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '80vh',
            justifyContent: 'center',
            alignItems: 'center',
            py: { xs: 4, sm: 6 },
            position: 'relative',
          }}
        >
          <CssBaseline />

          {/* Top Back Navigation Button */}
          <Box sx={{ width: '100%', maxWidth: 480, mb: 2.5 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(Path.account.view)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                minHeight: 44,
                px: 2,
                borderRadius: 'var(--sf-radius-md, 8px)',
                bgcolor: alpha(theme.palette.action.active, 0.04),
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.active, 0.08),
                  color: 'text.primary',
                },
              }}
            >
              {t('common.backToProfile', 'Back to Profile & Security')}
            </Button>
          </Box>

          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: 480,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: '1px solid',
              borderColor: 'divider',
              ...surfaceEffect,
            }}
          >
            <CardContent
              sx={{
                p: { xs: 3, sm: 4.5 },
                '&:last-child': { pb: { xs: 3, sm: 4.5 } },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Header Icon */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    borderRadius: 'var(--sf-radius-lg, 16px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                  }}
                >
                  <LockReset sx={{ fontSize: 36 }} />
                </Box>

                <Typography
                  variant='h5'
                  fontWeight='700'
                  textAlign='center'
                  sx={{
                    color: 'text.primary',
                    letterSpacing: '-0.02em',
                    mb: 1,
                  }}
                >
                  {t('auth.account.change_email_title', 'Change Email Address')}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  textAlign='center'
                  sx={{ lineHeight: 1.5, mb: 3.5, maxWidth: 360 }}
                >
                  {t(
                    'auth.account.change_email_description',
                    'Update your account email. You will receive a verification link at the new address.',
                  )}
                </Typography>

                <Box
                  component='form'
                  onSubmit={controlForm.handleSubmit(onSubmit)}
                  noValidate
                  sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  {/* Current Email Field */}
                  <Box>
                    <Typography
                      component='label'
                      htmlFor='currentEmail'
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      {t('auth.account.current_email', 'Current Email')}
                    </Typography>

                    <Controller
                      name='CurrentEmail'
                      control={controlForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          id='currentEmail'
                          fullWidth
                          disabled
                          placeholder={t('auth.account.email_placeholder', 'name@example.com')}
                          type='email'
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <Mail sx={{ fontSize: 20, color: 'text.disabled' }} />
                                </InputAdornment>
                              ),
                              sx: {
                                borderRadius: 'var(--sf-radius-md, 8px)',
                                minHeight: 48,
                                bgcolor: alpha(theme.palette.action.disabledBackground, 0.4),
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  {/* New Email Field */}
                  <Box>
                    <Typography
                      component='label'
                      htmlFor='newEmail'
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      {t('auth.account.new_email_label', 'New Email Address')}
                    </Typography>

                    <Controller
                      name='newEmail'
                      control={controlForm.control}
                      rules={{
                        required: t('auth.account.new_email_required', 'New email is required'),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t('auth.account.invalid_email', 'Invalid email address'),
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          id='newEmail'
                          fullWidth
                          placeholder={t(
                            'auth.account.new_email_placeholder',
                            'Enter new email address',
                          )}
                          type='email'
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <AlternateEmail sx={{ fontSize: 20, color: 'text.secondary' }} />
                                </InputAdornment>
                              ),
                              sx: {
                                borderRadius: 'var(--sf-radius-md, 8px)',
                                minHeight: 48,
                              },
                            },
                          }}
                        />
                      )}
                    />
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
                        mb: 1,
                      }}
                    >
                      {t('auth.account.confirm_password_label', 'Verify Identity')}
                    </Typography>
                    <Controller
                      name='password'
                      control={controlForm.control}
                      rules={{
                        required: t(
                          'auth.account.password_required',
                          'Password is required to confirm identity',
                        ),
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          id='confirmPassword'
                          fullWidth
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('auth.account.current_password_placeholder', 'Enter your current password')}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <VpnKey sx={{ fontSize: 20, color: 'text.secondary' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <IconButton
                                    onClick={handleClickShowConfirmPassword}
                                    edge='end'
                                    sx={{ minWidth: 44, minHeight: 44 }}
                                    aria-label={t('auth.userDirectory.changeEmail.togglePasswordVisibility', 'toggle password visibility')}
                                  >
                                    {showConfirmPassword ? (
                                      <VisibilityOff sx={{ fontSize: 20 }} />
                                    ) : (
                                      <Visibility sx={{ fontSize: 20 }} />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                              sx: {
                                borderRadius: 'var(--sf-radius-md, 8px)',
                                minHeight: 48,
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Alert
                    severity='info'
                    icon={<Info sx={{ fontSize: 20 }} />}
                    sx={{
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.info.main, 0.2),
                    }}
                  >
                    <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.25 }}>
                      {t('auth.account.verification_required', 'Verification Required')}
                    </Typography>
                    <Typography variant='caption' sx={{ lineHeight: 1.5, display: 'block' }}>
                      {t(
                        'auth.account.verification_required_desc',
                        'A confirmation link will be sent to your new email. Both addresses must remain valid during this process.',
                      )}
                    </Typography>
                  </Alert>

                  {/* Actions */}
                  <Stack spacing={1.5} sx={{ pt: 1 }}>
                    <Button
                      type='submit'
                      variant='contained'
                      fullWidth
                      disabled={isPending}
                      sx={{
                        minHeight: 48,
                        borderRadius: 'var(--sf-radius-md, 8px)',
                        textTransform: 'none',
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: 1,
                        },
                      }}
                    >
                      {isPending ? (
                        <CircularProgress size={24} color='inherit' />
                      ) : (
                        t('auth.account.update_email', 'Send Verification Link')
                      )}
                    </Button>

                    <Button
                      variant='outlined'
                      fullWidth
                      onClick={() => navigate(Path.account.view)}
                      sx={{
                        minHeight: 44,
                        borderRadius: 'var(--sf-radius-md, 8px)',
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'text.primary',
                          color: 'text.primary',
                        },
                      }}
                    >
                      {t('auth.account.cancel', 'Cancel')}
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </motion.div>
    </>
  )
}

export default ChangeEmail
