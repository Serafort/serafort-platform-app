import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Grid, TextField, Button, Stack, Backdrop, CircularProgress } from '@mui/material'
import { useTranslation } from 'react-i18next'
import FormLayout from "@auth/authentication-core/components/form/FormLayout"
import { useMutation } from '@tanstack/react-query'
import { IUpdateNames } from '@cap/platform-core'
import { UserDto } from '@cap/shared-types'

export default function ChangeAccount({ user }: { user: UserDto }) {
  const { t } = useTranslation()
  const [loading, setLoading] = React.useState<boolean>(false)

  const schema = z.object({
    firstName: z.string().min(1, t('auth.common.fieldRequired')),
    lastName: z.string().min(1, t('auth.common.fieldRequired')),
  })

  const controlForm = useForm<IUpdateNames>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      lastName: user.lastName,
      firstName: user.firstName,
    },
  })
  const mutation = useMutation({
    mutationFn: async (data: IUpdateNames) => {
      let body = {} as {
        lastname?: string
        firstname?: string
      }
      const hasChangedFirstName = user.firstName?.toLowerCase() !== data.firstName?.toLowerCase()
      const hasChangedFirstNameCase = !hasChangedFirstName && user.firstName !== data.firstName

      if (hasChangedFirstName) body = { ...body, firstname: data.firstName }
      if (hasChangedFirstNameCase)
        controlForm.setError(
          'firstName',
          {
            type: 'exist',
            message: t('auth.account.firstname_matches_current'),
          },
          { shouldFocus: true },
        )
      else controlForm.clearErrors('firstName')

      const hasChangedLastName = user.lastName?.toLowerCase() !== data.lastName?.toLowerCase()
      const hasChangedLastNameCase = !hasChangedLastName && user.lastName !== data.lastName

      if (hasChangedLastName) body = { ...body, lastname: data.lastName }
      if (hasChangedLastNameCase)
        controlForm.setError(
          'lastName',
          {
            type: 'exist',
            message: t('auth.account.lastname_matches_current'),
          },
          { shouldFocus: true },
        )
      else controlForm.clearErrors('lastName')

      // return await userService.updateProfile(body)
    },
    onMutate: () => {
      setLoading(true)
    },
    onSettled: () => {
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
        title={t('auth.account.change_info')}
        description={t('auth.account.change_info_description')}
        warning={''}
      >
        <Box
          component='form'
          // onSubmit={controlForm.handleSubmit(onSubmit)}
          onSubmit={controlForm.handleSubmit((data: IUpdateNames) => {
            return mutation.mutate(data)
          })}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12 }}>
              <Controller
                name='firstName'
                control={controlForm.control}
                rules={{
                  onBlur: (e) => {
                    const firstName = e.target.value
                    const hasChangedFirstName =
                      user.firstName?.toLowerCase() !== firstName?.toLowerCase()
                    const hasChangedFirstNameCase =
                      !hasChangedFirstName && user.firstName !== firstName

                    if (!firstName)
                      controlForm.setError(
                        'firstName',
                        {
                          type: 'exist',
                          message: 'Please provide a new first name',
                        },
                        { shouldFocus: true },
                      )
                    else controlForm.clearErrors('firstName')
                    if (!hasChangedFirstName && !hasChangedFirstNameCase)
                      controlForm.setError(
                        'firstName',
                        {
                          type: 'exist',
                          message: t('auth.account.firstname_matches_current'),
                        },
                        { shouldFocus: true },
                      )
                    else controlForm.clearErrors('firstName')
                  },
                }}
                render={({ field, formState }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    type='text'
                    label={t('auth.account.first_name')}
                    // disabled={disabled}
                    error={formState?.errors?.firstName !== undefined}
                    helperText={formState?.errors?.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 12 }}>
              <Controller
                name='lastName'
                control={controlForm.control}
                rules={{
                  onBlur: (e) => {
                    const lastName = e.target.value
                    const hasChangedLastName =
                      user.lastName?.toLowerCase() !== lastName?.toLowerCase()
                    const hasChangedLastNameCase = !hasChangedLastName && user.lastName !== lastName
                    if (!lastName)
                      controlForm.setError(
                        'firstName',
                        {
                          type: 'exist',
                          message: 'Please provide a new first name',
                        },
                        { shouldFocus: true },
                      )
                    else controlForm.clearErrors('lastName')
                    if (!hasChangedLastName && !hasChangedLastNameCase)
                      controlForm.setError(
                        'lastName',
                        {
                          type: 'exist',
                          message: t('auth.account.lastname_matches_current'),
                        },
                        { shouldFocus: true },
                      )
                    else controlForm.clearErrors('lastName')
                  },
                }}
                render={({ field, formState }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    // disabled={disabled}
                    type='text'
                    label={t('auth.account.last_name')}
                    error={formState?.errors?.lastName !== undefined}
                    helperText={formState?.errors?.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid sx={{ mt: '30px' }} size={{ xs: 12 }}>
              <Stack direction='row' spacing={2} justifyContent='start'>
                <Button type='submit' variant='contained' color='primary'>
                  {t('auth.common.saveChanges')}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </FormLayout>
    </React.Fragment>
  )
}


