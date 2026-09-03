import { Button, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import 'react-phone-input-2/lib/style.css'
import Facebook from '@mui/icons-material/Facebook';
import Google from '@mui/icons-material/Google';
//
import FormLayout from './FormLayout';

export default function SocialAuthentication() {
  const { t } = useTranslation()
  return (
    <FormLayout
      title={t('auth.account.social_authentication')}
      description={t('auth.account.social_authentication_description')}
      warning={''}
    >
      <Grid container spacing={2} sx={{ mt: '30px' }}>
        <Grid size={{ xs: 6 }}>
          <Button fullWidth variant='outlined' color='primary'>
            <Google />
          </Button>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Button fullWidth variant='outlined' color='primary'>
            <Facebook />
          </Button>
        </Grid>
      </Grid>
    </FormLayout>
  )
}
