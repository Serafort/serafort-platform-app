import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  Grid,
  IconButton,
  TextField,
  InputAdornment,
  Backdrop,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth, HttpError } from '@cap/platform-core'
import { UserDto, ApiErrorResponse } from '@cap/shared-types'
import FormLayout from "@auth/authentication-core/components/form/FormLayout"

export default function ChangeEmail({ user }: { user: UserDto }) {
  const { t } = useTranslation()
  const { refreshAuth } = useAuth()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const handleShowPassword = () => setShowPassword(!showPassword)
  type ChangeEmail = {
    email: string
    password: string
  }
  const controlForm = useForm<ChangeEmail>({
    defaultValues: {
      email: user.email,
      password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: ChangeEmail) => {
      /*
      let _body = { password: data.password } as {
        email?: string
        password: string
      }
      */
      const hasChangedEmail = user.email?.toLowerCase() !== data.email?.toLowerCase()
      const hasChangedEmailCase = !hasChangedEmail && user.email !== data.email

      // if (hasChangedEmail) _body = { ..._body, email: data.email }
      if (hasChangedEmailCase)
        controlForm.setError(
          'email',
          {
            type: 'exist',
            message: t('auth.account.email_matches_current'),
          },
          { shouldFocus: true },
        )
      else controlForm.clearErrors('email')

      // return await userService.updateEmail(body)
    },
    onMutate: (variables) => {
      console.log('onMutate variables ', variables)
      setLoading(true)
    },
    onError: (error: HttpError) => {
      // console.log('onError ', { error, variables, context })
      controlForm.setError(
        'email',
        {
          type: 'exist',
          message: (error.response?.data as ApiErrorResponse | undefined)?.message,
        },
        { shouldFocus: true },
      )
    },
    onSuccess: async (data, variables, context) => {
      // Refresh auth to get updated user data
      await refreshAuth()
      console.log('onSuccess ', { data, variables, context })
    },
    onSettled: () => {
      console.log('onSettled ')
      setLoading(false)
    },
  })
  return (
    <React.Fragment>
      <Backdrop
        sx={{ color: '#FFFFFF', zIndex: (theme) => theme.zIndex.drawer + 10 }}
        open={loading}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
      <FormLayout
        title={t('auth.account.change_email')}
        description={t('auth.account.change_email_description')}
        warning={''}
      >
        <Box
          component='form'
          encType='multipart/form-data'
          onSubmit={controlForm.handleSubmit((data: ChangeEmail) => {
            return mutation.mutate(data)
          })}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12 }}>
              <Controller
                name='email'
                control={controlForm.control}
                rules={{
                  required: {
                    value: true,
                    message: t('auth.common.fieldRequired'),
                  },
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: t('auth.login.invalid_email'),
                  },
                  onBlur: (e) => {
                    const email = e.target.value
                    const hasChangedEmail = user.email?.toLowerCase() !== email?.toLowerCase()
                    const hasChangedEmailCase = !hasChangedEmail && user.email !== email
                    if (!email)
                      controlForm.setError(
                        'email',
                        {
                          type: 'exist',
                          message: t('auth.account.new_email_required'),
                        },
                        { shouldFocus: true },
                      )
                    else controlForm.clearErrors('email')
                    if (!hasChangedEmail && !hasChangedEmailCase)
                      controlForm.setError(
                        'email',
                        {
                          type: 'exist',
                          message: t('auth.account.email_matches_current'),
                        },
                        { shouldFocus: true },
                      )
                    else controlForm.clearErrors('email')
                  },
                }}
                render={({ field, formState }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    // disabled={disabled}
                    label={t('auth.common.email')}
                    // InputProps={{
                    //   inputProps: {
                    //     readOnly: true,
                    //   },
                    // }}
                    error={formState?.errors?.email !== undefined}
                    helperText={formState?.errors?.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='password'
                control={controlForm.control}
                rules={{ required: true }}
                render={({ field, formState }) => (
                  <TextField
                    {...field}
                    required
                    type={showPassword ? 'text' : 'password'}
                    label={t('auth.common.password')}
                    fullWidth
                    autoComplete='password'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={handleShowPassword}
                            edge='end'
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={formState?.errors?.root?.type !== undefined}
                    helperText={formState?.errors?.root?.message}
                  />
                )}
              />
            </Grid>

            <Grid sx={{ mt: '30px' }} size={{ xs: 12 }}>
              <Stack direction='row' spacing={2} justifyContent='start'>
                <Button type='submit' variant='contained' color='primary'>
                  {t('auth.common.saveChanges')}
                </Button>
                {/* <Button type='reset' variant='outlined' color='error'>
                Annuler
              </Button> */}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </FormLayout>
    </React.Fragment>
  )
}


