import React from 'react'
import {
  Box,
  Button,
  Container,
  DialogActions,
  Grid,
  InputAdornment,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import 'react-phone-input-2/lib/style.css'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import authService from '@auth/modules/authentication-core/services/auth.service'
import { AuthActionButton } from '../shared/auth/AuthActionButton'

const resetPasswordFormSchema = z.object({
  username: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>

export default function ResetPasswordForm({
  handleClose,
  data,
  handleClickStatus,
}: {
  handleClose: () => void
  data: any
  handleClickStatus: (val: any) => void
}) {
  const { t } = useTranslation()
  const controlForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      username: '',
      newPassword: 'Admin#unirx2',
    },
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const handleShowPassword = () => setShowPassword(!showPassword)

  React.useEffect(() => {
    if (data) controlForm.setValue('username', data?.username)
  }, [controlForm, data])

  const onSubmit = async (data: any) => {
    if (data?.username) {
      try {
        const response = await authService.resetPassword(data)
        if (response?.status === 200) {
          handleClickStatus({
            type: 'success',
            state: 'modify',
            msg: t('auth.user_form.success_reset_password'),
          })
          handleClose()
        }
      } catch {
        handleClickStatus({
          type: 'error',
          state: 'modify',
          msg: t('auth.user_form.error_reset_password'),
        })
      }
    }
    handleClose()
  }

  return (
    <Container maxWidth='sm' style={{}}>
      <Box component='form' onSubmit={controlForm.handleSubmit(onSubmit)} sx={{ mt: 3 }}>
        <Typography sx={{ mb: 3 }}>{data?.email_user}</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name='newPassword'
              control={controlForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  required
                  type={showPassword ? 'text' : 'password'}
                  label={t('auth.login.new_password')}
                  fullWidth
                  autoComplete='password'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label={t('auth.login.toggle_password')}
                          onClick={handleShowPassword}
                          edge='end'
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        </Grid>
        <DialogActions>
          <Grid container justifyContent='flex-end' sx={{ mt: '20px' }}>
            <Stack direction='row' justifyContent='space-evenly'>
              <Button
                onClick={() => {
                  controlForm.reset()
                  handleClose()
                }}
                variant='outlined'
                color='error'
                sx={{ mr: '20px' }}
              >
                {t('auth.common.cancel')}
              </Button>
              <AuthActionButton type='submit' label={t('auth.login.change_password')} />
            </Stack>
          </Grid>
        </DialogActions>
      </Box>
    </Container>
  )
}
