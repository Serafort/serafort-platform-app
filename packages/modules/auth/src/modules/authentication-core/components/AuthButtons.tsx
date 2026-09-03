import { Stack, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const AuthButtons = () => {
  const { t } = useTranslation()

  return (
    <Stack direction='row' spacing={2} marginLeft='10px'>
      <Button
        component={Link}
        to='/auth/sign-up'
        variant='outlined'
        size='small'
        sx={{
          textDecoration: 'none',
          color: 'primary.main',
        }}
      >
        {t('auth.login.sign_up_link')}
      </Button>
      <Button
        component={Link}
        to='/auth/sign-in'
        variant='contained'
        size='small'
        sx={{
          textDecoration: 'none',
          color: 'primary.contrastText',
        }}
      >
        {t('auth.login.title')}
      </Button>
    </Stack>
  )
}

export default AuthButtons
