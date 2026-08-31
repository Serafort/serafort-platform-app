import React, { useState, useCallback } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Stack,
  alpha,
  useTheme,
  Container,
  CssBaseline,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import WarningAmber from '@mui/icons-material/WarningAmber'
import DeleteForever from '@mui/icons-material/DeleteForever'
import FolderOffOutlined from '@mui/icons-material/FolderOffOutlined'
import CreditCardOffOutlined from '@mui/icons-material/CreditCardOffOutlined'
import LockClockOutlined from '@mui/icons-material/LockClockOutlined'
import DownloadForOfflineOutlined from '@mui/icons-material/DownloadForOfflineOutlined'
import PauseCircleOutline from '@mui/icons-material/PauseCircleOutline'
import LockOutlined from '@mui/icons-material/LockOutlined'
import SecurityOutlined from '@mui/icons-material/SecurityOutlined'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useErasureMutation, useExportMutation, useUserProfile } from '../../hooks/useUserQuery'
import { useAuth, useNotifications, themeConfig } from '@cap/platform-core'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import logger from '@idaas/authentication-core/utils/logger'
import { Path } from '../../../../routes/path'

// Validation Schema Factory
const deleteAccountSchema = (t: any) =>
  z.object({
    password: z
      .string()
      .min(
        1,
        t('auth.account.password_required', 'Password is required to confirm account deletion.'),
      ),
    confirmUndo: z.boolean().refine((val) => val === true, {
      message: t(
        'auth.account.confirm_undo_required',
        'You must acknowledge that this action cannot be undone.',
      ),
    }),
    confirmDataLoss: z.boolean().refine((val) => val === true, {
      message: t(
        'auth.account.confirm_data_loss_required',
        'You must acknowledge that all personal data will be permanently erased.',
      ),
    }),
    hardDelete: z.boolean().optional(),
  })

type DeleteAccountFormData = z.infer<ReturnType<typeof deleteAccountSchema>>

export default function DeleteAccount() {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const { data: profileResponse } = useUserProfile()
  const { addNotification } = useNotifications()

  const [showPassword, setShowPassword] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const user = profileResponse?.data || authUser

  const erasureMutation = useErasureMutation({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('auth.account.success', 'Success'),
        message: t(
          'auth.account.delete_success',
          'Your account has been deleted. You have been signed out.',
        ),
      })
      setOpenConfirmDialog(false)
      navigate(Path.auth.signin)
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: t('auth.account.error', 'Error'),
        message:
          err?.message ||
          t('auth.common.errorOccurred', 'An error occurred while attempting to delete the account.'),
      })
      setOpenConfirmDialog(false)
    },
  })

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema(t)),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmUndo: false,
      confirmDataLoss: false,
      hardDelete: false,
    },
  })

  const handleOpenDialog = useCallback(() => {
    setOpenConfirmDialog(true)
  }, [])

  const handleFinalSubmit = useCallback(async () => {
    const data = getValues()
    try {
      await erasureMutation.mutateAsync({
        password: data.password,
        hardDelete: data.hardDelete,
      })
      logger.info('GDPR Erasure requested successfully')
    } catch (err: unknown) {
      logger.error('Erasure error', { error: err })
    }
  }, [erasureMutation, getValues])

  // Queues a full GDPR data-export job server-side (tracked/downloaded on the
  // dedicated Data Export page) rather than dumping the handful of fields
  // already loaded into this screen.
  const exportMutation = useExportMutation({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('auth.account.export_data', 'Export Data'),
        message: t(
          'auth.account.export_queued',
          'Your data export has been requested. Track and download it from the Data Export page.',
        ),
      })
      navigate(Path.account.dataExport)
    },
    onError: (err) => {
      addNotification({
        type: 'error',
        title: t('auth.account.error', 'Error'),
        message: err?.message || t('auth.account.export_failed', 'Failed to request data export.'),
      })
    },
  })
  const isExporting = exportMutation.isPending

  const handleDownloadData = useCallback(() => {
    if (exportMutation.isPending) return
    exportMutation.mutate()
  }, [exportMutation])

  const handleDeactivateInstead = useCallback(() => {
    navigate(Path.account.deactivate)
  }, [navigate])

  const isDeleting = erasureMutation.isPending
  const deleteError = erasureMutation.error

  return (
    <>
      <title>
        {t('auth.account.delete_account', 'Delete Account')} - {themeConfig.templateName}
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

        {/* Top Back Navigation Button */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 620,
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <Button
            component={RouterLink}
            to={Path.account.view}
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
              '&:hover': {
                color: 'text.primary',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {t('auth.account.back_to_profile', 'Back to Profile & Security')}
          </Button>
        </Box>

        {/* Main Danger Container Card */}
        <Card
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: 620,
            borderRadius: '16px',
            border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            bgcolor: 'background.paper',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? `0 12px 32px -4px ${alpha(theme.palette.error.main, 0.15)}, 0 4px 16px rgba(0, 0, 0, 0.4)`
                : `0 12px 32px -4px ${alpha(theme.palette.error.main, 0.08)}, 0 4px 16px rgba(15, 23, 42, 0.04)`,
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
            {/* Header Danger Callout */}
            <Box
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.error.main, 0.12)
                    : alpha(theme.palette.error.main, 0.06),
                border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                borderRadius: '14px',
                p: { xs: 2, sm: 2.5 },
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3.5,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.15),
                  color: 'error.main',
                  flexShrink: 0,
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`,
                }}
              >
                <WarningAmber sx={{ fontSize: 28 }} />
              </Box>

              <Box>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 800,
                    color: 'error.main',
                    letterSpacing: '-0.02em',
                    fontSize: { xs: '1.125rem', sm: '1.25rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {t('auth.account.delete_account', 'Delete Account')}
                </Typography>

                <Typography
                  variant='body2'
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.error.light
                        : theme.palette.error.dark,
                    fontWeight: 600,
                    mt: 0.5,
                    fontSize: '0.875rem',
                  }}
                >
                  {t(
                    'auth.account.permanent_irreversible_warning',
                    'This action is permanent and cannot be undone.',
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Error Alert */}
            {deleteError && (
              <Alert
                severity='error'
                sx={{
                  mb: 3.5,
                  borderRadius: '12px',
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                  color: 'error.main',
                }}
              >
                {(deleteError as any)?.message ||
                  t(
                    'auth.common.errorOccurred',
                    'An error occurred while attempting to delete the account.',
                  )}
              </Alert>
            )}

            <Box
              component='form'
              onSubmit={handleSubmit(handleOpenDialog)}
              noValidate
              sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3.5 }}
            >
              {/* Section 1: Consequences Summary */}
              <Box>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    mb: 1.5,
                  }}
                >
                  {t('auth.account.what_happens_next', 'What happens next?')}
                </Typography>

                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.default, 0.6)
                        : alpha(theme.palette.grey[50], 0.8),
                  }}
                >
                  <Stack spacing={2}>
                    {/* Data Deletion */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
                          color: 'text.secondary',
                          flexShrink: 0,
                        }}
                      >
                        <FolderOffOutlined sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant='body2' fontWeight={700} color='text.primary'>
                          {t('auth.account.data_deletion_title', 'Complete Data Deletion')}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ display: 'block', mt: 0.25, lineHeight: 1.5 }}
                        >
                          {t(
                            'auth.account.data_deletion_desc',
                            'All personal profile details, activity records, security keys, and saved preferences will be permanently erased.',
                          )}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ borderColor: 'divider' }} />

                    {/* Subscription Cancellation */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
                          color: 'text.secondary',
                          flexShrink: 0,
                        }}
                      >
                        <CreditCardOffOutlined sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant='body2' fontWeight={700} color='text.primary'>
                          {t(
                            'auth.account.subscription_cancelled_title',
                            'Subscriptions & Memberships',
                          )}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ display: 'block', mt: 0.25, lineHeight: 1.5 }}
                        >
                          {t(
                            'auth.account.subscription_cancelled_desc',
                            'All active team memberships, API keys, and organization associations will be revoked immediately.',
                          )}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ borderColor: 'divider' }} />

                    {/* 30-Day Recovery Policy */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
                          color: 'text.secondary',
                          flexShrink: 0,
                        }}
                      >
                        <LockClockOutlined sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant='body2' fontWeight={700} color='text.primary'>
                          {t('auth.account.account_recovery_title', '30-Day Recovery Policy')}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ display: 'block', mt: 0.25, lineHeight: 1.5 }}
                        >
                          {t(
                            'auth.account.account_recovery_desc',
                            'Once confirmed, you will immediately lose access. Backups are purged after 30 days unless hard delete is selected.',
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Box>

              {/* Section 2: Safer Alternatives Callout */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.05)
                      : alpha(theme.palette.primary.main, 0.03),
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' fontWeight={700} color='text.primary'>
                      {t('auth.account.delete_not_ready_title', 'Not ready to delete?')}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', mt: 0.25, lineHeight: 1.4 }}
                    >
                      {t(
                        'auth.account.delete_not_ready_desc',
                        'You can temporarily deactivate your account or export a complete copy of your personal data.',
                      )}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      flexWrap: 'wrap',
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={handleDownloadData}
                      disabled={isExporting}
                      startIcon={
                        isExporting ? (
                          <CircularProgress size={16} color='inherit' />
                        ) : (
                          <DownloadForOfflineOutlined sx={{ fontSize: 18 }} />
                        )
                      }
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '8px',
                        borderColor: 'divider',
                        color: 'text.primary',
                        bgcolor: 'background.paper',
                        py: 0.75,
                        px: 2,
                        flex: { xs: 1, sm: 'initial' },
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                        },
                      }}
                    >
                      {t('auth.account.download_data', 'Download Data')}
                    </Button>

                    <Button
                      variant='outlined'
                      size='small'
                      onClick={handleDeactivateInstead}
                      startIcon={<PauseCircleOutline sx={{ fontSize: 18 }} />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '8px',
                        borderColor: 'divider',
                        color: 'text.primary',
                        bgcolor: 'background.paper',
                        py: 0.75,
                        px: 2,
                        flex: { xs: 1, sm: 'initial' },
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                        },
                      }}
                    >
                      {t('auth.account.deactivate_instead', 'Deactivate Account')}
                    </Button>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'divider' }} />

              {/* Section 3: Identity Verification & Consent Confirmation */}
              <Box>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    mb: 1.5,
                  }}
                >
                  {t('auth.account.verify_identity', 'Verify Identity & Confirm')}
                </Typography>

                <Stack spacing={2.5}>
                  {/* Password Input */}
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
                      {t('auth.account.enter_password', 'Enter your password to confirm')}
                    </Typography>
                    <Controller
                      name='password'
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          id='password'
                          fullWidth
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t(
                            'auth.account.password_placeholder',
                            'Enter your current password',
                          )}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          disabled={isDeleting}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <LockOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge='end'
                                    size='small'
                                    aria-label='toggle password visibility'
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
                              '&:hover fieldset': { borderColor: 'error.main' },
                              '&.Mui-focused fieldset': {
                                borderColor: 'error.main',
                                borderWidth: '1.5px',
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  {/* Explicit Consent Checkboxes */}
                  <Box>
                    <Controller
                      name='confirmUndo'
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              color='error'
                              disabled={isDeleting}
                              sx={{
                                color: 'text.secondary',
                                '&.Mui-checked': {
                                  color: 'error.main',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant='body2' fontWeight={500} color='text.primary'>
                              {t(
                                'auth.account.delete_confirm_undo',
                                'I understand that this action is permanent and cannot be reversed.',
                              )}
                            </Typography>
                          }
                        />
                      )}
                    />
                    {errors.confirmUndo && (
                      <Typography
                        variant='caption'
                        sx={{ color: 'error.main', ml: 4, display: 'block', fontWeight: 600 }}
                      >
                        {errors.confirmUndo.message}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Controller
                      name='confirmDataLoss'
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              color='error'
                              disabled={isDeleting}
                              sx={{
                                color: 'text.secondary',
                                '&.Mui-checked': {
                                  color: 'error.main',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant='body2' fontWeight={500} color='text.primary'>
                              {t(
                                'auth.account.delete_confirm_data_loss',
                                'I understand that all my personal data, memberships, and records will be deleted.',
                              )}
                            </Typography>
                          }
                        />
                      )}
                    />
                    {errors.confirmDataLoss && (
                      <Typography
                        variant='caption'
                        sx={{ color: 'error.main', ml: 4, display: 'block', fontWeight: 600 }}
                      >
                        {errors.confirmDataLoss.message}
                      </Typography>
                    )}
                  </Box>

                  {/* Optional GDPR Hard Delete Card */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.background.default, 0.6)
                          : alpha(theme.palette.grey[50], 0.8),
                      borderRadius: '10px',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Controller
                      name='hardDelete'
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              color='error'
                              disabled={isDeleting}
                              sx={{
                                color: 'text.secondary',
                                '&.Mui-checked': {
                                  color: 'error.main',
                                },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant='body2' fontWeight={700} color='text.primary'>
                                {t(
                                  'auth.account.hard_delete_title',
                                  'Permanent Purge (GDPR Right to Erasure)',
                                )}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{ display: 'block', mt: 0.25 }}
                              >
                                {t(
                                  'auth.account.hard_delete_desc',
                                  'Immediately purge all database records and backup archives without the standard 30-day retention grace period.',
                                )}
                              </Typography>
                            </Box>
                          }
                        />
                      )}
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Action Buttons Footer */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column-reverse', sm: 'row' },
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 1.5,
                  mt: 2,
                }}
              >
                <Button
                  component={RouterLink}
                  to={Path.account.view}
                  variant='outlined'
                  disabled={isDeleting}
                  sx={{
                    borderRadius: '10px',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    fontWeight: 600,
                    py: 1.25,
                    px: 3,
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      borderColor: 'text.primary',
                      color: 'text.primary',
                      bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                    },
                  }}
                >
                  {t('auth.common.cancel', 'Cancel')}
                </Button>

                <Button
                  type='submit'
                  variant='contained'
                  disabled={!isValid || isDeleting}
                  startIcon={
                    isDeleting ? (
                      <CircularProgress size={18} color='inherit' />
                    ) : (
                      <DeleteForever sx={{ fontSize: 20 }} />
                    )
                  }
                  sx={{
                    borderRadius: '10px',
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    fontWeight: 700,
                    py: 1.25,
                    px: 3.5,
                    textTransform: 'none',
                    boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.error.main, 0.3)}`,
                    transition: 'all 0.2s ease',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      bgcolor: 'error.dark',
                      boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.error.main, 0.45)}`,
                    },
                    '&:disabled': {
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.3),
                      color: (theme) => alpha(theme.palette.error.contrastText, 0.7),
                      boxShadow: 'none',
                    },
                  }}
                >
                  {isDeleting
                    ? t('auth.account.deleting', 'Processing...')
                    : t('auth.account.delete_button', 'Delete Account')}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Support Callout */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant='body2' color='text.secondary'>
            {t('auth.account.delete_questions', 'Have questions before deleting?')}{' '}
            <Button
              component={RouterLink}
              to={Path.account.view}
              sx={{
                color: 'primary.main',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  bgcolor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              {t('auth.account.delete_contact_support', 'Contact Support')}
            </Button>
          </Typography>
        </Box>
      </Container>

      {/* Final Confirmation Modal */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => !isDeleting && setOpenConfirmDialog(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 24px 48px -12px rgba(0, 0, 0, 0.8)'
                : '0 24px 48px -12px rgba(15, 23, 42, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 800,
            color: 'error.main',
            fontSize: '1.125rem',
            pt: 2.5,
            px: 2.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'error.main',
            }}
          >
            <WarningAmber sx={{ fontSize: 22 }} />
          </Box>
          {t('auth.account.delete_final_confirm_title', 'Permanently Delete Account?')}
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 1.5 }}>
          <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
            {t(
              'auth.account.delete_final_confirm_message',
              'Are you absolutely certain? This will immediately terminate your session, erase your account, and remove all associated data permanently. This action cannot be undone.',
            )}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            disabled={isDeleting}
            variant='outlined'
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.primary',
                color: 'text.primary',
              },
            }}
          >
            {t('auth.common.cancel', 'Cancel')}
          </Button>

          <Button
            onClick={handleFinalSubmit}
            variant='contained'
            disabled={isDeleting}
            startIcon={
              isDeleting ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <DeleteForever sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              borderRadius: '10px',
              bgcolor: 'error.main',
              color: 'error.contrastText',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.error.main, 0.3)}`,
              '&:hover': {
                bgcolor: 'error.dark',
              },
            }}
          >
            {isDeleting
              ? t('auth.account.deleting', 'Erasing Data...')
              : t('auth.account.delete_final_confirm_button', 'Yes, Delete Permanently')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
