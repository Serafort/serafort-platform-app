// InitiateEmailChange.tsx
// High-fidelity Initiate Email Change screen matching profile.tsx design system

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  TextField,
  Alert,
  AlertTitle,
  Container,
  IconButton,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
  InputAdornment,
} from '@mui/material'
import Mail from '@mui/icons-material/Mail'
import Security from '@mui/icons-material/Security'
import Warning from '@mui/icons-material/Warning'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Lock from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CalendarToday from '@mui/icons-material/CalendarToday'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNotifications } from '@cap/platform-core'
import { useGetUser, useChangeEmail } from '../../hooks/useUserQuery'
import { Path } from '../../../../routes/path'

const initiateSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required to verify identity'),
})

type InitiateFormData = z.infer<typeof initiateSchema>

export default function InitiateEmailChange() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const [showPassword, setShowPassword] = useState(false)

  const { data: userData } = useGetUser()
  const currentUser = userData?.data

  const { mutate: changeEmail, isPending: isSubmitting } = useChangeEmail({
    onSuccess: (_response, variables) => {
      addNotification?.({
        type: 'success',
        title: t('auth.account.verification_dispatched', 'Verification Link Dispatched'),
        message: t(
          'auth.account.verification_dispatched_desc',
          'A confirmation link has been sent to {{email}}.',
          { email: variables.email },
        ),
      })
      navigate(Path.account.emailChangeStatus, {
        state: { newEmail: variables.email },
      })
    },
    onError: (err) => {
      addNotification?.({
        type: 'error',
        title: t('auth.account.request_failed', 'Request Failed'),
        message: err?.message || t('auth.account.email_change_failed', 'Unable to initiate email change request.'),
      })
    },
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InitiateFormData>({
    resolver: zodResolver(initiateSchema),
    defaultValues: {
      newEmail: '',
      currentPassword: '',
    },
  })

  const currentEmail = currentUser?.email ?? '—'
  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : t('auth.account.active_member', 'Active Member')

  const onSubmit = (data: InitiateFormData) => {
    changeEmail({ email: data.newEmail, password: data.currentPassword })
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          sx={{
            mb: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            p: 0,
            minWidth: 0,
            '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
          }}
        >
          {t('common.backToProfile', 'Back to Profile')}
        </Button>
        <Typography variant="h4" fontWeight={800} letterSpacing="-0.025em" gutterBottom>
          {t('auth.account.initiate_email_change_title', 'Initiate Email Change')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(
            'auth.account.initiate_email_change_desc',
            'Update your primary contact email for login and security notifications. This action requires re-verification.'
          )}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3.5}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              {/* Account Status Card */}
              <Card
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
                  bgcolor: 'background.paper',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                    {t('auth.account.current_account_status', 'Current Account Status')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        mr: 2,
                        width: 44,
                        height: 44,
                      }}
                    >
                      <Mail />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {currentEmail}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 0.25 }}>
                        <CalendarToday sx={{ fontSize: 13, mr: 0.5 }} />
                        <Typography variant="caption">
                          {t('auth.account.member_since', 'Member since {{date}}', { date: memberSince })}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Form Input Card */}
              <Card
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
                  bgcolor: 'background.paper',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
                  >
                    <Security sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                    {t('auth.account.security_verification', 'New Email & Identity Verification')}
                  </Typography>

                  <Stack spacing={2.5}>
                    <Controller
                      name="newEmail"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={t('auth.account.new_email_address', 'New Email Address')}
                          placeholder={t('auth.account.new_email_placeholder', 'e.g. name@work.com')}
                          error={Boolean(errors.newEmail)}
                          helperText={errors.newEmail?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Mail color="action" />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="currentPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type={showPassword ? 'text' : 'password'}
                          label={t('auth.account.current_password', 'Current Password')}
                          placeholder={t('auth.account.confirm_password_placeholder', 'Confirm your password')}
                          error={Boolean(errors.currentPassword)}
                          helperText={errors.currentPassword?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isSubmitting}
                endIcon={
                  isSubmitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ArrowForward />
                  )
                }
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                {isSubmitting
                  ? t('auth.account.dispatching_verification', 'Dispatching Verification...')
                  : t('auth.account.continue_to_confirmation', 'Continue to Confirmation')}
              </Button>
            </Stack>
          </Grid>

          {/* Right Warning Column */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2.5}>
              <Alert
                severity="warning"
                icon={<Warning fontSize="inherit" />}
                sx={{
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <AlertTitle sx={{ fontWeight: 700 }}>
                  {t('auth.account.session_termination_warning', 'Security Notice')}
                </AlertTitle>
                <Typography variant="body2" color="text.secondary">
                  {t(
                    'auth.account.session_termination_desc',
                    'Changing your primary email address will require immediate re-verification. All other active sessions will be invalidated for security.'
                  )}
                </Typography>
              </Alert>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                  {t(
                    'auth.account.security_footer',
                    'Protected by end-to-end multi-factor validation and enterprise audit logging.'
                  )}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Container>
  )
}
