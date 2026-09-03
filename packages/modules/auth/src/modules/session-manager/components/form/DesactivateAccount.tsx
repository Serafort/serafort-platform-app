import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, Button, FormControlLabel, FormHelperText, FormControl, Grid, Paper, Stack, Typography, Checkbox } from '@mui/material';
//

export default function DesactivateAccount() {
  const { t } = useTranslation()
  const controlForm = useForm({
    defaultValues: {
      user_id: NaN,
      desactivate: false,
    },
  })
  const onSubmit = async () => {}
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
            render={({ field, formState }) => (
              <FormControl
                component='fieldset'
                error={formState?.errors?.desactivate !== undefined}
              >
                <Typography variant='h6'>{t('auth.account.delete_account')} </Typography>
                <FormControlLabel
                  // required
                  control={<Checkbox {...field} />}
                  label={t('auth.account.deactivate_confirm')}
                  labelPlacement='end'
                  // disabled={disabled}
                  onClick={() => field.onChange(!field.value)}
                  checked={field.value}
                />
                <FormHelperText>{formState?.errors?.desactivate?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>
        <Grid sx={{ mt: '30px' }} size={{ xs: 12 }}>
          <Stack direction='row' spacing={2} justifyContent='start'>
            <Button
              // type='reset'
              // type='submit'
              // position='left'
              variant='contained'
              color='error'
              // disabled={disabled}
              // onClick={() => {
              //   controlForm.reset()
              //   navigate('/home')
              // }}
            >
              {t('auth.account.deactivate_submit_button')}
            </Button>
          </Stack>
        </Grid>
      </Box>
    </Paper>
  )
}
