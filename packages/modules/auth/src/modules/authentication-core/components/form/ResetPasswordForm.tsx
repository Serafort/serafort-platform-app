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
import authService from "@auth/modules/authentication-core/services/auth.service"

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
  const controlForm = useForm({
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
              rules={{
                required: {
                  value: true,
                  message: t('auth.common.passwordRequired'),
                },
                minLength: {
                  value: 8,
                  message: t('auth.login.password_length'),
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
                  message: t('auth.login.password_complexity'),
                },
              }}
              render={({ field }) => (
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
                  error={controlForm.formState?.errors?.newPassword !== undefined}
                  helperText={controlForm.formState?.errors?.newPassword?.message}
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
                variant='contained'
                color='error'
                sx={{ mr: '20px' }}
              >
                {t('auth.common.cancel')}
              </Button>
              <Button type='submit' variant='contained'>
                {t('auth.login.change_password')}
              </Button>
            </Stack>
          </Grid>
        </DialogActions>
      </Box>
    </Container>
  )
}
