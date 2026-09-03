import { Stack, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const AuthButtons = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Stack direction='row' spacing={2} marginLeft='10px'>
      <Button
        component={Link}
        to='/auth/sign-up'
        variant='outlined'
        size='small'
        style={{
          textDecoration: 'none',
          color: theme.palette.primary.main,
        }}
      >
        {t('auth.login.sign_up_link')}
      </Button>
      <Button
        component={Link}
        to='/auth/sign-in'
        variant='contained'
        size='small'
        style={{
          textDecoration: 'none',
          color: theme.palette.primary.contrastText,
        }}
      >
        {t('auth.login.title')}
      </Button>
    </Stack>
  )
}

export default AuthButtons
