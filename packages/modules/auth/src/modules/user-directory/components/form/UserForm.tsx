import React from 'react'
// Generic Auth Form Component
import {
  Box,
  Button,
  Checkbox,
  Container,
  DialogActions,
  Grid,
  FormControlLabel,
  FormHelperText,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cinInput } from "@auth/authentication-core/components/form/InputCustom"

export default function UserForm({
  data,
  handleClose,
  _handleClickStatus,
  setIsUpdated,
}: {
  data: any
  handleClose: () => void
  _handleClickStatus: any
  setIsUpdated: (val: boolean) => void
}) {
  const { t } = useTranslation()

  const schema = z.object({
    id_user: z.union([z.string(), z.number()]).optional(),
    userTypeID: z
      .union([z.string(), z.number()])
      .refine((val) => val !== '', t('auth.common.fieldRequired')),
    store_fk: z.string().optional(),
    first_name: z.string().min(1, t('auth.common.fieldRequired')),
    last_name: z.string().min(1, t('auth.common.fieldRequired')),
    username: z.string().min(1, t('auth.common.fieldRequired')),
    adress: z.string().min(1, t('auth.common.fieldRequired')),
    cin_nif: z.string().min(1, t('auth.common.fieldRequired')),
    email: z.string().email(t('auth.user_form.invalid_email')),
    phone: z.string().min(1, t('auth.common.fieldRequired')),
    password: z.string().min(1, t('auth.common.fieldRequired')),
    photo: z.string().optional(),
    createByAdmin: z.boolean().optional(),
    actif: z.boolean().optional(),
  })

  const controlForm = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id_user: '',
      userTypeID: '',
      store_fk: '',
      first_name: '',
      last_name: '',
      username: '',
      adress: '',
      cin_nif: '',
      email: '',
      phone: '',
      password: '',
      photo: '',
      createByAdmin: false,
      actif: false,
    },
  })

  const onSubmit = async (_data: any) => {
    // if (data?.id_user) {
    //   const response = await handlePutUser(data)
    //   if (response?.status === 200)
    //     handleClickStatus({
    //       type: 'success',
    //       state: 'modify',
    //       masg: "Modification de l'utilisateur rÃ©ussie",
    //     })
    //   if (response?.status >= 400)
    //     handleClickStatus({
    //       type: 'error',
    //       state: 'modify',
    //       masg: "Ã‰chec de la modification de l'utilisateur",
    //     })
    // } else {
    //   const response = await handleUserRegister(data)
    //   if (response?.status === 200)
    //     handleClickStatus({
    //       type: 'success',
    //       state: 'save',
    //       masg: "Enregistrement de l'utilisateur rÃ©ussi",
    //     })
    //   if (response?.status >= 400)
    //     handleClickStatus({
    //       type: 'error',
    //       state: 'save',
    //       masg: "Ã‰chec de l'enregistrement de l'utilisateur",
    //     })
    // }
    setIsUpdated(true)
    handleClose()
  }

  React.useEffect(() => {
    if (data) {
      controlForm.setValue('id_user', data?.id_user)
      controlForm.setValue('userTypeID', data?.userTypeID)
      controlForm.setValue('store_fk', data?.store_fk)
      controlForm.setValue('first_name', data?.first_name)
      controlForm.setValue('last_name', data?.last_name)
      controlForm.setValue('username', data?.username)
      controlForm.setValue('adress', data?.adress)
      controlForm.setValue('cin_nif', data?.cin_nif)
      controlForm.setValue('email', data?.email)
      controlForm.setValue('phone', data?.phone)
      controlForm.setValue('password', data?.password)
      controlForm.setValue('photo', data?.photo)
      controlForm.setValue('createByAdmin', data?.createByAdmin === 1 ? true : false)
      controlForm.setValue('actif', data?.actif === 1 ? true : false)
    }
  }, [controlForm, data])

  return (
    <div>
      <Container component='main' maxWidth='sm'>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box component='form' onSubmit={controlForm.handleSubmit(onSubmit)} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='userTypeID'
                  control={controlForm.control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={controlForm.formState?.errors?.userTypeID !== undefined}
                    >
                      <InputLabel required>{t('auth.user_form.cin_nif')}</InputLabel>
                      <Select
                        {...field}
                        style={{ width: '100%' }}
                        labelId='demo-simple-select-label'
                        id='demo-simple-select'
                        variant='outlined'
                      >
                        {[
                          { id: 1, role: 'SuperAdmin' },
                          { id: 2, role: 'Admin' },
                          { id: 3, role: 'Superviseur' },
                          { id: 4, role: 'Juge' },
                        ].map((el) => (
                          <MenuItem key={el.id} value={el.id}>
                            {el.role}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {controlForm.formState?.errors?.userTypeID?.message}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='store_fk'
                  control={controlForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      autoFocus
                      type='text'
                      label='store_fk'
                      fullWidth
                      variant='outlined'
                      error={controlForm.formState?.errors?.store_fk !== undefined}
                      helperText={controlForm.formState?.errors?.store_fk?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name='first_name'
                  control={controlForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      autoFocus
                      type='text'
                      label={t('auth.user_form.first_name')}
                      fullWidth
                      variant='outlined'
                      error={controlForm.formState?.errors?.first_name !== undefined}
                      helperText={controlForm.formState?.errors?.first_name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name='last_name'
                  control={controlForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      autoFocus
                      type='text'
                      label={t('auth.user_form.last_name')}
                      fullWidth
                      variant='outlined'
                      error={controlForm.formState?.errors?.last_name !== undefined}
                      helperText={controlForm.formState?.errors?.last_name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name='username'
                  control={controlForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      autoFocus
                      type='text'
                      label={t('auth.user_form.username')}
                      fullWidth
                      variant='outlined'
                      error={controlForm.formState?.errors?.username !== undefined}
                      helperText={controlForm.formState?.errors?.username?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='adress'
                  control={controlForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      autoFocus
                      type='address'
                      label={t('auth.user_form.address')}
                      fullWidth
                      variant='outlined'
                      error={controlForm.formState?.errors?.adress !== undefined}
                      helperText={controlForm.formState?.errors?.adress?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='cin_nif'
                  control={controlForm.control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      variant='outlined'
                      error={controlForm.formState?.errors?.cin_nif !== undefined}
                    >
                      <InputLabel required>{t('auth.user_form.cin_nif')}</InputLabel>
                      <OutlinedInput
                        {...field}
                        onChange={(nif: React.ChangeEvent<HTMLInputElement>) => field.onChange(nif)}
                        inputComponent={cinInput}
                      />
                      <FormHelperText>
                        {controlForm.formState?.errors?.cin_nif?.message}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='email'
                  control={controlForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      autoFocus
                      type='email'
                      label={t('auth.common.email')}
                      fullWidth
                      variant='outlined'
                      error={controlForm.formState?.errors?.email !== undefined}
                      helperText={controlForm.formState?.errors?.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='phone'
                  control={controlForm.control}
                  render={({ field }) => (
                    <PhoneInput
                      {...field}
                      country={'ht'}
                      placeholder={t('auth.user_form.phone')}
                      inputProps={{
                        name: 'phone',
                        required: true,
                        autoFocus: false,
                      }}
                      inputStyle={{
                        padding: 12,
                        width: '100%',
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='password'
                  control={controlForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      autoFocus
                      type='text'
                      label={t('auth.common.password')}
                      fullWidth
                      variant='outlined'
                      error={controlForm.formState?.errors?.password !== undefined}
                      helperText={controlForm.formState?.errors?.password?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name='photo'
                  control={controlForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      autoFocus
                      type='text'
                      label={t('auth.user_form.photo')}
                      fullWidth
                      variant='outlined'
                      error={controlForm.formState?.errors?.photo !== undefined}
                      helperText={controlForm.formState?.errors?.photo?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='actif'
                  control={controlForm.control}
                  render={({ field }) => (
                    <FormControl component='fieldset'>
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label={t('auth.user_form.active')}
                        labelPlacement='end'
                        // eslint-disable-next-line react-hooks/incompatible-library
                        checked={data?.id ? controlForm.watch('actif') : true}
                        onChange={(event, checked) => {
                          controlForm.setValue('actif', checked)
                        }}
                      />
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
            <DialogActions>
              <Button
                variant='contained'
                color='error'
                onClick={() => {
                  controlForm.reset()
                  handleClose()
                }}
              >
                {t('auth.common.cancel')}
              </Button>
              <Button
                autoFocus
                type='submit'
                color='primary'
                variant='contained'
                sx={{ margin: (theme) => theme.spacing(3, 0, 2) }}
              >
                {data?.id_user ? t('auth.common.modify') : t('auth.common.save')}
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Container>
    </div>
  )
}
