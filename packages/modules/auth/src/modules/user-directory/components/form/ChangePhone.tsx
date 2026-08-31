import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Grid, IconButton, TextField, InputAdornment, FormHelperText } from '@mui/material'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next'
import { UserDto } from '@cap/shared-types'
import FormLayout from "@auth/authentication-core/components/form/FormLayout"
import { ChangePhoneSchema, type ChangePhoneSchemaType } from '@auth/modules/authentication-core/utils/schema'

// Type-safe wrapper for PhoneInput to fix React 19 compatibility
const PhoneInputWrapper = PhoneInput as unknown as React.ComponentType<any>

export default function ChangePhone({ user }: { user: UserDto }) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const handleShowPassword = () => setShowPassword(!showPassword)
  const controlForm = useForm<ChangePhoneSchemaType>({
    resolver: zodResolver(ChangePhoneSchema),
    defaultValues: {
      phone: user.phone || '',
      password: '',
    },
  })
  const onSubmit = () => {}

  return (
    <FormLayout
      title={t('auth.account.change_phone')}
      description={t('auth.account.change_phone_description')}
      warning={''}
    >
      <Box
        component='form'
        encType='multipart/form-data'
        onSubmit={controlForm.handleSubmit(onSubmit)}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Controller
              name='phone'
              control={controlForm.control}
              render={({ field, fieldState }) => (
                <Box>
                  <PhoneInputWrapper
                    {...field}
                    country={'ht'}
                    placeholder={t('auth.account.phone')}
                    inputProps={{
                      name: 'phone',
                      required: true,
                      autoFocus: true,
                    }}
                    inputStyle={{
                      background: 'transparent',
                      fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
                      fontWeight: 400,
                      fontSize: '1rem',
                      lineHeight: '1.4375em',
                      letterSpacing: '0.00938em',
                      height: '1.4375em',
                      padding: '22.5px 14px',
                      width: '100%',
                      borderColor: fieldState.error ? '#d32f2f' : undefined,
                    }}
                  />
                  {fieldState.error && (
                    <FormHelperText error sx={{ ml: 1.5, mt: 0.5 }}>
                      {fieldState.error.message}
                    </FormHelperText>
                  )}
                </Box>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name='password'
              control={controlForm.control}
              render={({ field, fieldState }) => (
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
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          {/* <Grid sx={{ mt: '30px' }} size={{ xs: 12 }}>
            <Stack direction='row' spacing={2} justifyContent='start'>
              <Button type='submit' variant='contained' color='primary'>
                Save changes
              </Button>
              <Button type='reset' variant='outlined' color='error'>
                Annuler
              </Button>
            </Stack>
          </Grid> */}
        </Grid>
      </Box>
    </FormLayout>
  )
}


