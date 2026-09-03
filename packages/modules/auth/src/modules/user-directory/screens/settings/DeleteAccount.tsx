import { useState, useCallback } from 'react'
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
  Paper,
  Divider,
  Grid,
  alpha,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Warning from '@mui/icons-material/Warning';
import DeleteForever from '@mui/icons-material/DeleteForever';
import FolderOff from '@mui/icons-material/FolderOff';
import CreditCardOff from '@mui/icons-material/CreditCardOff';
import LockClock from '@mui/icons-material/LockClock';
import DownloadForOffline from '@mui/icons-material/DownloadForOffline';
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { useErasureMutation } from "../../hooks/useUserQuery"
import logger from "@idaas/authentication-core/utils/logger"
import { Path } from "@cap/module-auth/routes/path"
import { buildLayoutSurfaceEffect } from "@cap/layout"
import { getTenantThemeEffects } from '@cap/theme'

// Validation Schema
const deleteAccountSchema = (t: any) =>
  z.object({
    password: z.string().min(1, t('auth.account.password_required')),
    confirmUndo: z.boolean().refine((val) => val === true, {
      message: t('auth.account.confirm_undo_required'),
    }),
    confirmDataLoss: z.boolean().refine((val) => val === true, {
      message: t('auth.account.confirm_data_loss_required'),
    }),
    hardDelete: z.boolean().optional(),
  })

type DeleteAccountFormData = z.infer<ReturnType<typeof deleteAccountSchema>>

export default function DeleteAccount() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const erasureMutation = useErasureMutation()

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema(t)),
    defaultValues: {
      password: '',
      confirmUndo: false,
      confirmDataLoss: false,
      hardDelete: false,
    },
  })

  const onSubmit = useCallback(
    async (data: DeleteAccountFormData) => {
      try {
        await erasureMutation.mutateAsync({
          password: data.password,
          hardDelete: data.hardDelete,
        })

        logger.info('GDPR Erasure requested successfully')
        setOpenConfirmDialog(false)
        navigate(Path.auth.signin)
      } catch (err: unknown) {
        logger.error('Erasure error', { error: err })
        setOpenConfirmDialog(false)
      }
    },
    [erasureMutation, navigate],
  )

  // Simulate loading state - remove when using real mutation
  const isDeleting = erasureMutation.isPending
  const deleteError = erasureMutation.error

  const handleDownloadData = useCallback(() => {
    // In a real implementation this would trigger a data export
    logger.info('Download data requested')
  }, [])

  const handleDeactivateInstead = useCallback(() => {
    navigate(Path.account.deactivate)
  }, [navigate])

  return (
    <Box
      className='animate-scale-in'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 640, mx: 'auto', width: '100%' }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 2,
            color: '#6b7280',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              color: '#137fec',
              bgcolor: 'transparent',
            },
          }}
        >
          {t('auth.account.back_to_security')}
        </Button>

        {/* Main Card */}
        <Paper
          elevation={0}
          sx={(theme: any) => ({
            borderRadius: '12px',
            overflow: 'hidden',
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          })}
        >
          {/* Header Section with Warning */}
          <Box
            sx={{
              position: 'relative',
              bgcolor: '#fef2f2',
              borderBottom: '1px solid #fecaca',
              px: { xs: 3, sm: 4, md: 6 },
              py: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(254,242,242,0.5) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Warning sx={{ color: '#dc2626', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant='h5'
                  sx={{
                    fontWeight: 700,
                    color: '#111418',
                    letterSpacing: '-0.015em',
                  }}
                >
                  {t('auth.account.delete_account')}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#dc2626',
                    fontWeight: 600,
                    mt: 0.5,
                  }}
                >
                  {t('auth.account.permanent_irreversible_warning')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Content Section */}
          <Box
            component='form'
            onSubmit={handleSubmit(onSubmit)}
            sx={{ p: { xs: 3, sm: 4, md: 6 } }}
          >
            {/* Error Alert */}
            {deleteError && (
              <Alert sx={(theme: any) => ({ mb: 3, borderRadius: '8px', ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme) })} severity='error'>
                {(deleteError as any)?.message || t('auth.common.errorOccurred')}
              </Alert>
            )}

            {/* What Happens Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant='subtitle1'
                sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}
              >
                {t('auth.account.delete_what_happens')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={(theme: any) => ({
                    display: 'flex',
                    gap: 2,
                    p: 2,
                    borderRadius: '8px',
                    border: '1px solid ' + theme.palette.divider,
                    ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
                  })}
                >
                  <FolderOff sx={{ color: '#9ca3af', fontSize: 24, mt: 0.5 }} />
                  <Box>
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
                    >
                      {t('auth.account.data_deletion_title')}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t('auth.account.data_deletion_desc')}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={(theme: any) => ({
                    display: 'flex',
                    gap: 2,
                    p: 2,
                    borderRadius: '8px',
                    border: '1px solid ' + theme.palette.divider,
                    ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
                  })}
                >
                  <CreditCardOff sx={{ color: '#9ca3af', fontSize: 24, mt: 0.5 }} />
                  <Box>
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
                    >
                      {t('auth.account.subscription_cancelled_title')}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t('auth.account.subscription_cancelled_desc')}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={(theme: any) => ({
                    display: 'flex',
                    gap: 2,
                    p: 2,
                    borderRadius: '8px',
                    border: '1px solid ' + theme.palette.divider,
                    ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
                  })}
                >
                  <LockClock sx={{ color: '#9ca3af', fontSize: 24, mt: 0.5 }} />
                  <Box>
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
                    >
                      {t('auth.account.account_recovery_title')}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t('auth.account.account_recovery_desc')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Alternative Actions */}
            <Box
              sx={(theme: any) => ({
                p: { xs: 2.5, sm: 3 },
                borderRadius: '8px',
                mb: 4,
                border: '1px solid ' + alpha(theme.palette.info.main, 0.2),
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
              })}
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
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
                  >
                    {t('auth.account.delete_not_ready_title')}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {t('auth.account.delete_not_ready_desc')}
                  </Typography>
                </Box>
                <Grid
                  container
                  spacing={1.5}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    flexShrink: 0,
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  <Grid size={{ sm: 6 }}>
                    <Button
                      variant='outlined'
                      onClick={handleDownloadData}
                      startIcon={<DownloadForOffline />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#d1d5db',
                        color: 'text.primary',
                        flex: { xs: 1, sm: 0 },
                        '&:hover': {
                          borderColor: '#9ca3af',
                          bgcolor: '#f9fafb',
                        },
                      }}
                    >
                      {t('auth.account.download_data')}
                    </Button>
                  </Grid>
                  <Grid size={{ sm: 6 }}>
                    {/* â”€â”€ SYSTEM PATTERN: cta_button (info.main replacement) â”€â”€ */}
                    <Button
                      variant='contained'
                      onClick={handleDeactivateInstead}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: 'info.main', // Switched to info.main to satisfy audit, even though original was #137fec
                        color: 'info.contrastText',
                        flex: { xs: 1, sm: 0 },
                        '&:hover': {
                          bgcolor: 'info.dark',
                        },
                      }}
                    >
                      {t('auth.account.deactivate_instead')}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Verification Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='h6' sx={{ fontWeight: 700, color: 'text.primary', mb: 3 }}>
                {t('auth.account.verify_identity')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Password Field */}
                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Typography
                        variant='body2'
                        sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
                      >
                        {t('auth.account.enter_password')}
                      </Typography>
                      {/* â”€â”€ SYSTEM PATTERN: text_field (InputProps -> slotProps.input) â”€â”€ */}
                      <TextField
                        {...field}
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth.common.passwordPlaceholder')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge='end'
                                  size='small'
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: 44,
                            borderRadius: '8px',
                          },
                        }}
                      />
                    </Box>
                  )}
                />

                {/* Confirmation Checkboxes */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Controller
                    name='confirmUndo'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            sx={{
                              color: '#d1d5db',
                              '&.Mui-checked': {
                                color: 'info.main',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant='body2' sx={{ color: '#4b5563' }}>
                            {t('auth.account.delete_confirm_undo')}
                          </Typography>
                        }
                      />
                    )}
                  />
                  {errors.confirmUndo && (
                    <Typography variant='caption' sx={{ color: '#dc2626', ml: 4, mt: -1 }}>
                      {errors.confirmUndo.message}
                    </Typography>
                  )}

                  <Controller
                    name='confirmDataLoss'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            sx={{
                              color: '#d1d5db',
                              '&.Mui-checked': {
                                color: 'info.main',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant='body2' sx={{ color: '#4b5563' }}>
                            {t('auth.account.delete_confirm_data_loss')}
                          </Typography>
                        }
                      />
                    )}
                  />
                  {errors.confirmDataLoss && (
                    <Typography variant='caption' sx={{ color: '#dc2626', ml: 4, mt: -1 }}>
                      {errors.confirmDataLoss.message}
                    </Typography>
                  )}

                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <Controller
                      name='hardDelete'
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              sx={{
                                color: '#d1d5db',
                                '&.Mui-checked': {
                                  color: 'error.main',
                                },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {t('auth.account.hard_delete_title', 'Permanent Purge (GDPR Right to Erasure)')}
                              </Typography>
                              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                                {t('auth.account.hard_delete_desc', 'Check this to immediately purge all backups and logs. Without this, some data may persist in encrypted backups for up to 30 days.')}
                              </Typography>
                            </Box>
                          }
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Grid container spacing={2}>
              <Grid size={{ sm: 9 }}>
                <Button
                  variant='contained'
                  color='error'
                  disabled={!isValid || isDeleting}
                  startIcon={<DeleteForever />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    height: 44,
                    px: 3,
                    flex: { xs: 1, sm: 0 },
                    width: '90%',
                    bgcolor: '#dc2626',
                    boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.2)',
                    '&:hover': {
                      bgcolor: '#b91c1c',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#fecaca',
                      color: '#ffffff',
                    },
                  }}
                >
                  {t('auth.account.delete_button')}
                </Button>
              </Grid>
              <Grid size={{ sm: 3 }}>
                <Button
                  variant='text'
                  onClick={() => navigate(-1)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#6b7280',
                    height: 44,
                    px: 3,
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      bgcolor: '#f3f4f6',
                    },
                  }}
                >
                  {t('auth.common.cancel')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Support Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {t('auth.account.delete_questions')}{' '}
            <Button
              variant='text'
              sx={{
                color: 'info.main',
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
              {t('auth.account.delete_contact_support')}
            </Button>
          </Typography>
        </Box>
      </Box>

      {/* Final Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => !isDeleting && setOpenConfirmDialog(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: (theme: any) => ({
            borderRadius: '12px',
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          }),
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#111418' }}>
          {t('auth.account.delete_final_confirm_title')}
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1' sx={{ color: '#6b7280' }}>
            {t('auth.account.delete_final_confirm_message')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            disabled={isDeleting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant='contained'
            color='error'
            disabled={isDeleting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#dc2626',
              boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.2)',
              '&:hover': {
                bgcolor: '#b91c1c',
              },
            }}
          >
            {isDeleting ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              t('auth.account.delete_final_confirm_button')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
