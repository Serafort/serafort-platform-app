import React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { QUERY_KEYS } from '../../services/query'
import authService from '../../services/auth.service'
import { Path } from '@cap/module-auth/routes/path'

export default function Validate() {
  const { t } = useTranslation('auth')
  const { id, token } = useParams<{ id?: string; token?: string; email?: string }>()
  const [searchParams] = useSearchParams()
  const emailParam = useParams<{ email?: string }>().email || searchParams.get('email')
  const signatureParam = searchParams.get('signature')
  const navigate = useNavigate()

  // If email + signature are provided, redirect or forward to email verification flow
  React.useEffect(() => {
    if (emailParam && signatureParam) {
      navigate(
        `${Path.auth.verifyEmail.replace(':email', encodeURIComponent(emailParam))}?signature=${encodeURIComponent(signatureParam)}`,
        {
          replace: true,
        },
      )
    }
  }, [emailParam, signatureParam, navigate])

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
  const [status, setStatus] = React.useState<IStatus>({
    open: false,
    type: '',
    state: '',
    msg: '',
  })

  const handleClickStatus = (newState: Partial<IStatus>) => {
    setStatus((prev) => ({ ...prev, ...newState, open: true }))
  }

  React.useEffect(() => {
    if (isSuccessValidateUser && validateUser) {
      const { firstname = '', lastname = '' } = validateUser.user ?? {}
      const type = validateUser.type
      if (type === 'already validate') {
        handleClickStatus({
          type: 'warning',
          state: 'save',
          msg: t('auth.validate.already_validated', {
            firstname,
            lastname,
            defaultValue: 'Account is already validated.',
          }),
        })
      } else {
        handleClickStatus({
          type: 'info',
          state: 'save',
          msg: t('auth.validate.success_message', {
            firstname,
            lastname,
            defaultValue: 'Account validated successfully!',
          }),
        })
      }
    }
    if (isErrorValidateUser) {
      handleClickStatus({
        type: 'error',
        state: 'save',
        msg: t('auth.validate.error_message', 'Validation failed or expired token.'),
      })
    }
  }, [isErrorValidateUser, isSuccessValidateUser, validateUser, t])

  return (
    <React.Fragment>
      <title>
        {t('auth.validate.title_page', 'Validate Account')} - {themeConfig.templateName}
      </title>
      <meta name='description' content={t('auth.validate.meta_desc', 'Account validation')} />
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
          open={false}
        >
          <CircularProgress color='inherit' />
        </Backdrop>

        <Card sx={{ my: { xs: 3, md: 6 }, width: '100%', maxWidth: 450, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography
              component='h1'
              variant='h5'
              sx={{ textAlign: 'center', mb: 1, fontWeight: 700 }}
            >
              {themeConfig.templateName}
            </Typography>
            <Typography
              component='h5'
              variant='body1'
              sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}
            >
              {t('auth.validate.title', 'Account Validation')}
            </Typography>
            {status.open && (
              <MAlert sx={{ width: '100%' }} severity={status.type || 'info'}>
                {status.msg}
              </MAlert>
            )}
            {status?.type !== 'error' && (
              <Button
                fullWidth
                variant='contained'
                sx={{ mt: 3, mb: 2, borderRadius: 2, py: 1.2, fontWeight: 700 }}
                onClick={() => {
                  navigate(Path.auth.signin)
                }}
              >
                {t('auth.validate.button_connect', 'Sign In')}
              </Button>
            )}
          </CardContent>
        </Card>
      </Container>
    </React.Fragment>
  )
}
