import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, IconButton, InputAdornment, TextField, Typography, Card, CardContent, CssBaseline, Alert, CircularProgress, Link } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import VpnKey from '@mui/icons-material/VpnKey';
import LockReset from '@mui/icons-material/LockReset';
import Mail from '@mui/icons-material/Mail';
import AlternateEmail from '@mui/icons-material/AlternateEmail';
import Info from '@mui/icons-material/Info';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { themeConfig, useNotifications } from '@cap/platform-core';
import { Controller, useForm } from 'react-hook-form';
import { Path } from '@cap/module-auth/routes/path';
import { useCurrentUserQuery, useChangeEmail } from '../../hooks/useUserQuery';
import { buildLayoutSurfaceEffect } from '@cap/layout';
import { getTenantThemeEffects } from '@cap/theme';

interface ChangeEmailRequestFormData {
  CurrentEmail: string
  newEmail: string
  password: string
}

function ChangeEmail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const { data: user } = useCurrentUserQuery()
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successData, setSuccessData] = useState<{ message: string; verifyUrl?: string } | null>(
    null,
  )

  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword)

  const controlForm = useForm<ChangeEmailRequestFormData>({
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
      setSuccessData({
        message: (response.data as any)?.message || t('auth.account.change_email_success_message'),
        verifyUrl: (response.data as any).verifyUrl,
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
    } as any)
  }

  if (successData) {
    return (
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
        }}
      >
        <Card
          sx={(theme: any) => ({
            maxWidth: 480,
            width: '100%',
            borderRadius: 3,
            textAlign: 'center',
            p: 4,
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          })}
        >
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant='h5' fontWeight='700' mb={2}>
            {t('auth.account.request_sent', 'Check Your Inbox')}
          </Typography>
          <Typography variant='body1' color='text.secondary' mb={4}>
            {successData.message}
          </Typography>

          {successData.verifyUrl && (
            <Alert severity='info' sx={{ mb: 4, textAlign: 'left' }}>
              <Typography variant='body2' fontWeight='bold'>
                Dev Mode: Verification Link
              </Typography>
              <Link href={successData.verifyUrl} target='_blank' sx={{ wordBreak: 'break-all' }}>
                {successData.verifyUrl}
              </Link>
            </Alert>
          )}

          <Button
            variant='contained'
            fullWidth
            onClick={() => navigate(Path.user.security)}
            sx={{ bgcolor: 'info.main', fontWeight: 700 }}
          >
            {t('auth.account.back_to_security', 'Back to Security')}
          </Button>
        </Card>
      </Container>
    )
  }

  return (
    <>
      <title>
        {t('auth.account.change_email_title')} - {themeConfig.templateName}
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
                {t('auth.account.change_email_title')}
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
                textAlign='center'
                sx={{ fontSize: '0.875rem', fontFamily: 'inherit', lineHeight: 1.5, mb: 4 }}
              >
                {t('auth.account.change_email_description')}
              </Typography>

              <Box
                component='form'
                onSubmit={controlForm.handleSubmit(onSubmit)}
                noValidate
                sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}
              >
                {/* Current Email Field */}
                <Box>
                  <Typography
                    component='label'
                    htmlFor='currentEmail'
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    {t('auth.account.current_email')}
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
                        placeholder={t('auth.account.email_placeholder')}
                        type='email'
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position='start'>
                                <Mail sx={{ fontSize: 20, color: 'text.disabled' }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            height: 48,
                            bgcolor: 'action.disabledBackground',
                            '& fieldset': { borderColor: 'divider' },
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Typography
                    component='label'
                    htmlFor='newEmail'
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
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
                                <AlternateEmail sx={{ fontSize: 20 }} />
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
                        placeholder={t('auth.account.current_password_placeholder')}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position='start'>
                                <VpnKey sx={{ fontSize: 20 }} />
                              </InputAdornment>
                            ),
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

                <Alert
                  severity='info'
                  icon={<Info sx={{ fontSize: 20 }} />}
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    bgcolor: 'info.lighter',
                    border: 1,
                    borderColor: 'info.light',
                    '& .MuiAlert-icon': {
                      color: 'info.main',
                    },
                  }}
                >
                  <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('auth.account.verification_required')}
                  </Typography>
                  <Typography variant='body2' sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {t('auth.account.verification_required_desc')}
                  </Typography>
                </Alert>

                {/* â”€â”€ SYSTEM PATTERN: cta_button (info.main variant) â”€â”€ */}
                <Button
                  type='submit'
                  variant='contained'
                  fullWidth
                  size='large'
                  disabled={isPending}
                  sx={{
                    height: 52,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    bgcolor: 'info.main',
                    color: 'info.contrastText',
                    boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.2)',
                    '&:hover': {
                      bgcolor: 'info.dark',
                    },
                  }}
                >
                  {isPending ? (
                    <CircularProgress size={24} color='inherit' />
                  ) : (
                    t('auth.account.update_email')
                  )}
                </Button>

                {/* Back Link */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant='text'
                    fullWidth
                    onClick={() => navigate(Path.user.security)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      color: 'text.secondary',
                    }}
                  >
                    {t('auth.account.cancel')}
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
            Â© {new Date().getFullYear()} {t('auth.common.appName')}.{' '}
            {t('auth.common.allRightsReserved')}
          </Typography>
        </Box>
      </Container>
    </>
  )
}

export default ChangeEmail

