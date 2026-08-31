import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  Box,
  Button,
  FormControlLabel,
  FormHelperText,
  FormControl,
  Grid,
  Paper,
  Stack,
  Typography,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  DeactivateAccountSchema,
  type DeactivateAccountSchemaType,
} from '../../../authentication-core/utils/schema'
import { useDeactivateAccountMutation } from '../../hooks/useSessionQuery'
import { Path } from '../../../../routes/path'
import ConfirmationDialog from '../../../authentication-core/components/shared/Modals/ConfirmationDialog'

export default function DesactivateAccount() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const controlForm = useForm<DeactivateAccountSchemaType>({
    resolver: zodResolver(DeactivateAccountSchema),
    defaultValues: {
      desactivate: false as any,
    },
  })

  const { mutate: deactivate, isPending } = useDeactivateAccountMutation({
    onSuccess: () => {
      toast.success(
        t('auth.account.deactivate_success', 'Your account has been deactivated successfully.')
      )
      setConfirmOpen(false)
      navigate(Path.auth.login || '/auth/login')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t('auth.account.deactivate_failed', 'Failed to deactivate account.')
      )
      setConfirmOpen(false)
    },
  })

  const onSubmit = (_data: DeactivateAccountSchemaType) => {
    setConfirmOpen(true)
  }

  const handleConfirmDeactivate = () => {
    deactivate()
  }

  return (
    <Paper
      sx={{
        padding: '24px',
        mb: 4,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'error.light',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
          <WarningAmberIcon color='error' />
          <Typography variant='h6' fontWeight={700} color='error.main'>
            {t('auth.account.delete_account', 'Deactivate Account')}
          </Typography>
        </Stack>
        <Typography variant='body2' color='text.secondary'>
          {t(
            'auth.account.deactivate_warning_desc',
            'Deactivating your account will disable your login access and terminate all active sessions. You can contact an administrator to reactivate.'
          )}
        </Typography>
      </Box>

      <Box component='form' onSubmit={controlForm.handleSubmit(onSubmit)}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name='desactivate'
            control={controlForm.control}
            render={({ field, fieldState }) => (
              <FormControl component='fieldset' error={!!fieldState.error}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      color='error'
                    />
                  }
                  label={t(
                    'auth.account.deactivate_confirm',
                    'I understand that my account will be deactivated immediately.'
                  )}
                  labelPlacement='end'
                />
                {fieldState.error && (
                  <FormHelperText error>{fieldState.error.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid sx={{ mt: 3 }} size={{ xs: 12 }}>
          <Stack direction='row' spacing={2} justifyContent='start'>
            <Button
              type='submit'
              variant='contained'
              color='error'
              disabled={isPending || !controlForm.watch('desactivate')}
              startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : undefined}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              {isPending
                ? t('common.processing', 'Deactivating...')
                : t('auth.account.deactivate_submit_button', 'Deactivate Account')}
            </Button>
          </Stack>
        </Grid>
      </Box>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDeactivate}
        severity='error'
        isSubmitting={isPending}
        title={t('auth.account.confirm_deactivate_title', 'Confirm Account Deactivation')}
        message={t(
          'auth.account.confirm_deactivate_msg',
          'Are you sure you want to deactivate your account? All active sessions will be terminated and you will be signed out immediately.'
        )}
        confirmLabel={t('auth.account.deactivate_submit_button', 'Deactivate Account')}
        cancelLabel={t('common.cancel', 'Cancel')}
      />
    </Paper>
  )
}
