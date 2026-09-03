import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Backdrop,
  Button,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { themeConfig, IStatus } from '@cap/platform-core'
import { Alert as MAlert } from '@cap/platform-core'
import { QUERY_KEYS } from '@idaas/authentication-core/services'
import authService from "@idaas/authentication-core/services/auth.service"

export default function Validate() {
  const { t } = useTranslation()
  const { id, token, location } = useParams()
  const navigate = useNavigate()
  const {
    data: validateUserData,
    isSuccess: isSuccessValidateUser,
    isError: isErrorValidateUser,
  } = useQuery({
    queryKey: QUERY_KEYS.validateUser(id ?? '', token ?? ''),
    queryFn: () => authService.validateUser(id ?? '', token ?? ''),
    enabled: !!id && !!token,
  })
  const validateUser = validateUserData?.data
  const [loading] = React.useState(false)
  const [status, setStatus] = React.useState<IStatus>({
    open: false,
    type: '',
    state: '',
    msg: '',
  })
  const handleClickStatus = (newState: React.SetStateAction<IStatus>) => {
    setStatus({ type: '', state: '', msg: '', open: true, ...newState })
  }

  React.useEffect(() => {
    if (isSuccessValidateUser && validateUser) {
      const { firstname = '', lastname = '' } = validateUser.user ?? {}
      const type = validateUser.type
      console.log({ firstname, lastname, type })
      if (type === 'already validate')
        handleClickStatus({
          open: true,
          type: 'warning',
          state: 'save',
          msg: t('auth.validate.already_validated', { firstname, lastname }),
        })
      if (type === 'validate') {
        handleClickStatus({
          open: true,
          type: 'info',
          state: 'save',
          msg: t('auth.validate.success_message', { firstname, lastname }),
        })
      }
      navigate('/validate', {
        replace: true,
        state: {
          from: location,
          data: {
            page: 'validate',
            type: 'success',
            state: 'validate',
            msg: t('auth.validate.success_message', { firstname, lastname }),
          },
        },
      })
    }
    if (isErrorValidateUser) {
      handleClickStatus({
        open: true,
        type: 'error',
        state: 'save',
        msg: t('auth.validate.error_message'),
      })
    }
  }, [isErrorValidateUser, isSuccessValidateUser, location, navigate, validateUser, t])
  return (
    <React.Fragment>
      <title>
        {t('auth.validate.title_page')} - {themeConfig.templateName}
      </title>
      <meta name='description' content={t('auth.validate.meta_desc')} />
      <meta
        name='keywords'
        content={`registration validation, account validation, ${themeConfig.templateName}`}
      />

      <Container
        maxWidth='sm'
        sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Backdrop
          sx={{ color: '#FFFFFF', zIndex: (theme) => theme.zIndex.drawer + 10 }}
          open={loading}
        >
          <CircularProgress color='inherit' />
        </Backdrop>

        <Card sx={{ my: { xs: 3, md: 6 }, width: '100%', maxWidth: 450 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography component='h1' variant='h5' sx={{ textAlign: 'center', mb: 1 }}>
              {themeConfig.templateName}
            </Typography>
            <Typography component='h5' variant='body1' sx={{ mb: 2, textAlign: 'center' }}>
              {t('auth.validate.title')}
            </Typography>
            <MAlert sx={{ width: '100%' }}>{status.msg}</MAlert>
            {status?.type !== 'error' && (
              <Button
                fullWidth
                variant='contained'
                sx={{ mt: 3, mb: 2 }}
                onClick={() => {
                  navigate(location?.replace(/_/g, '/') || '/auth/sign-in', {
                    state: {
                      from: location,
                    },
                  })
                }}
              >
                {t('auth.validate.button_connect')}
              </Button>
            )}
          </CardContent>
        </Card>
      </Container>
    </React.Fragment>
  )
}
