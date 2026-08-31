import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Grid, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
// import { FormLayout } from 'src/components/form'
import FormLayout from '@auth/authentication-core/components/form/FormLayout'

export default function UpdateSocialLinks() {
  const { t } = useTranslation()

  const schema = z.object({
    facebookUrl: z.string().url(t('auth.common.fieldRequired')),
    instagramUrl: z.string().url(t('auth.common.fieldRequired')),
    threadUrl: z.string().url(t('auth.common.fieldRequired')),
    twitterUrl: z.string().url(t('auth.common.fieldRequired')),
  })

  const controlForm = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      facebookUrl: '',
      instagramUrl: '',
      threadUrl: '',
      twitterUrl: '',
    },
  })
  const onSubmit = () => {}
  return (
    <FormLayout
      title={t('auth.account.update_social_links')}
      description={t('auth.account.update_social_links_description')}
      warning={''}
    >
      <Box component='form' onSubmit={controlForm.handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Controller
              name='facebookUrl'
              control={controlForm.control}
              render={({ field, formState }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  // disabled={disabled}
                  type='URL'
                  label={t('auth.account.facebook_url')}
                  error={formState?.errors?.facebookUrl !== undefined}
                  helperText={formState?.errors?.facebookUrl?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Controller
              name='instagramUrl'
              control={controlForm.control}
              render={({ field, formState }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  type='url'
                  label={t('auth.account.instagram_url')}
                  // disabled={disabled}
                  error={formState?.errors?.instagramUrl !== undefined}
                  helperText={formState?.errors?.instagramUrl?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Controller
              name='threadUrl'
              control={controlForm.control}
              render={({ field, formState }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  type='url'
                  label={t('auth.account.threads_url')}
                  // disabled={disabled}
                  error={formState?.errors?.threadUrl !== undefined}
                  helperText={formState?.errors?.threadUrl?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Controller
              name='twitterUrl'
              control={controlForm.control}
              render={({ field, formState }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  type='url'
                  label={t('auth.account.twitter_url')}
                  // disabled={disabled}
                  error={formState?.errors?.twitterUrl !== undefined}
                  helperText={formState?.errors?.twitterUrl?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </FormLayout>
  )
}
