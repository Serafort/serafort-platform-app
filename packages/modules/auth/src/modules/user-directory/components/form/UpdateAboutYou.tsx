import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Grid,
  Typography,
  CardContent,
  Input,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import AccountCircle from '@mui/icons-material/AccountCircle'
// import { FormLayout } from 'src/components/form'
import FormLayout from '@auth/authentication-core/components/form/FormLayout'

export default function UpdateAboutYou() {
  const { t } = useTranslation()

  const schema = z.object({
    lastName: z.string().min(1, t('auth.common.fieldRequired')),
    firstName: z.string().min(1, t('auth.common.fieldRequired')),
    sexe: z.string().min(1, t('auth.common.fieldRequired')),
    address: z.string().min(1, t('auth.common.fieldRequired')),
  })

  const controlForm = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      lastName: '',
      firstName: '',
      sexe: '',
      address: '',
    },
  })
  const onSubmit = () => {}
  return (
    <FormLayout
      title={t('auth.account.about_you')}
      description={t('auth.account.about_you_description')}
      warning={''}
    >
      <Box component='form' onSubmit={controlForm.handleSubmit(onSubmit)}>
        <Grid container alignItems='flex-start' sx={{ mt: '30px' }} size={{ xs: 12 }}>
          <CardContent
            sx={{
              padding: 0,
              display: 'flex',
            }}
          >
            <Grid
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
              size={{ xs: 12, sm: 4 }}
            >
              <label htmlFor='icon-button-file'>
                <Input
                  sx={{ display: 'none' }}
                  // disabled={disabled}
                  // style={{ display: 'none' }}
                  // accept='image/*'
                  id='icon-button-file'
                  type='file'
                  onChange={(e: any) => {
                    const file = e.target.files[0]
                    // field.onChange(file)
                    const reader = new FileReader()
                    reader.onload = () => {
                      // controlForm.setValue('imageDrawing', {
                      //   result: event.target.result,
                      //   file: file,
                      // })
                    }
                    reader.readAsDataURL(file)
                  }}
                />
                <Avatar
                  variant='rounded'
                  // src={user.avatar}
                  alt={t('auth.account.no_image')}
                  style={{
                    width: '120px',
                    height: '120px',
                  }}
                  sx={{
                    margin: 'auto',
                  }}
                >
                  <AccountCircle
                    style={{
                      width: '100px',
                      height: '100px',
                    }}
                  />
                </Avatar>
              </label>
            </Grid>
            <Grid
              container
              spacing={0.5}
              sx={{
                ml: '2px',
              }}
            >
              <Grid sx={{ mb: '7px' }} size={{ xs: 12, sm: 4 }}>
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  sx={{
                    // mt: 3, mb: 2
                    lineHeight: '1.38462',
                    fontSize: '0.8125rem',
                  }}
                >
                  {t('auth.account.upload_new_photo')}
                </Button>
              </Grid>
              <Grid sx={{ my: '5px' }} size={{ xs: 12, sm: 12 }}>
                <Typography fontSize='0.9375rem' lineHeight='1.46667'>
                  {t('auth.account.upload_constraints')}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Controller
              name='lastName'
              control={controlForm.control}
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
                  margin='normal'
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Controller
              name='firstName'
              control={controlForm.control}
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
                  margin='normal'
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Controller
              name='sexe'
              control={controlForm.control}
              render={({ field, formState }) => (
                <FormControl
                  fullWidth
                  margin='normal'
                  // disabled={disabled}
                  error={formState?.errors?.sexe !== undefined}
                >
                  <InputLabel required>{t('auth.account.gender')}</InputLabel>
                  <Select label={t('auth.account.gender')} {...field}>
                    {[
                      { key: 'M', label: t('auth.account.gender_male') },
                      { key: 'F', label: t('auth.account.gender_female') },
                    ]?.map((value, index) => (
                      <MenuItem key={index} value={value.key}>
                        {value.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{formState?.errors?.sexe?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Controller
              name='address'
              control={controlForm.control}
              render={({ field, formState }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  // disabled={disabled}
                  type='text'
                  label={t('auth.account.address')}
                  error={formState?.errors?.address !== undefined}
                  helperText={formState?.errors?.address?.message}
                  margin='normal'
                />
              )}
            />
          </Grid>

          <Grid sx={{ mt: '30px' }} size={{ xs: 12 }}>
            <Stack direction='row' spacing={2} justifyContent='start'>
              <Button type='submit' variant='contained' color='primary'>
                {t('auth.common.saveChanges')}
              </Button>
              <Button
                type='reset'
                variant='outlined'
                color='error'
                onClick={() => controlForm.reset()}
              >
                {t('auth.common.cancel')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </FormLayout>
  )
}
