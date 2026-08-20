import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Box, Button, FormControlLabel, FormHelperText, FormControl, Grid, Paper, Stack, Typography, Checkbox } from '@mui/material';
import { DeactivateAccountSchema, type DeactivateAccountSchemaType } from '@auth/modules/authentication-core/utils/schema';

export default function DesactivateAccount() {
  const { t } = useTranslation()
  const controlForm = useForm<DeactivateAccountSchemaType>({
    resolver: zodResolver(DeactivateAccountSchema),
    defaultValues: {
      desactivate: false as any,
    },
  })
  const onSubmit = async (data: DeactivateAccountSchemaType) => {
    console.log('Deactivate confirmed:', data)
  }
  return (
    <Paper
      sx={{
        padding: '20px',
        mb: 4,
      }}
    >
      <Box component='form' onSubmit={controlForm.handleSubmit(onSubmit)}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name='desactivate'
            control={controlForm.control}
            render={({ field, fieldState }) => (
              <FormControl
                component='fieldset'
                error={!!fieldState.error}
              >
                <Typography variant='h6'>{t('auth.account.delete_account')} </Typography>
                <FormControlLabel
                  control={<Checkbox {...field} checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t('auth.account.deactivate_confirm')}
                  labelPlacement='end'
                />
                {fieldState.error && (
                  <FormHelperText error>{fieldState.error.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
        <Grid sx={{ mt: '30px' }} size={{ xs: 12 }}>
          <Stack direction='row' spacing={2} justifyContent='start'>
            <Button
              type='submit'
              variant='contained'
              color='error'
            >
              {t('auth.account.deactivate_submit_button')}
            </Button>
          </Stack>
        </Grid>
      </Box>
    </Paper>
  )
}
