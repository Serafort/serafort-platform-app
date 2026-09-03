import { Link } from 'react-router-dom'
import { Typography } from '@mui/material'

export default function Copyright(props?: any) {
  return (
    <Typography variant='body2' color='text.secondary' align='center' {...props}>
      {'Copyright © '}
      <Link color='inherit' to='https://transitiondigitale.tech/'>
        {' '}
        Transition Digitale
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}
