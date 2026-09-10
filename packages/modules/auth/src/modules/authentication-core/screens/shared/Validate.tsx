import React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Stack } from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import VerifiedUser from '@mui/icons-material/VerifiedUser'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { themeConfig, useTenant } from '@cap/platform-core'
import { QUERY_KEYS } from '../../services/query'
import authService from '../../services/auth.service'
import { Path } from '@cap/module-auth/routes/path'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthActionButton,
  AuthBackLink,
} from '../../components/shared/auth'

export default function Validate() {
  const { t } = useTranslation('auth')
  const { tenant } = useTenant()
  const appName = tenant?.name || themeConfig.templateName
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
  const isValidating = !!id && !!token && !isSuccessValidateUser && !isErrorValidateUser

  const outcomeType = React.useMemo(() => {
    if (isErrorValidateUser) return 'error'
    if (isSuccessValidateUser && validateUser) {
      return validateUser.type === 'already validate' ? 'warning' : 'success'
    }
    return null
  }, [isErrorValidateUser, isSuccessValidateUser, validateUser])

  const outcomeMessage = React.useMemo(() => {
    if (outcomeType === 'error') {
      return t('auth.validate.error_message', 'Validation failed or expired token.')
    }
    if (validateUser) {
      const { firstname = '', lastname = '' } = validateUser.user ?? {}
      if (outcomeType === 'warning') {
        return t('auth.validate.already_validated', {
          firstname,
          lastname,
          defaultValue: 'Account is already validated.',
        })
      }
      return t('auth.validate.success_message', {
        firstname,
        lastname,
        defaultValue: 'Account validated successfully!',
      })
    }
    return ''
  }, [outcomeType, validateUser, t])

  return (
    <>
      <title>
        {t('auth.validate.title_page', 'Validate Account')} - {appName}
      </title>
      <meta name='description' content={t('auth.validate.meta_desc', 'Account validation')} />

      <AuthPageLayout maxWidth={480} backdrop='subtle'>
        <AuthCard padding='comfortable'>
          {isValidating ? (
            <Box
              role='status'
              aria-live='polite'
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                gap: 2,
              }}
            >
              <CircularProgress size={48} thickness={4} />
              <AuthCardHeader
                title={t('auth.validate.checkingTitle', 'Validating Account')}
                subtitle={t('auth.validate.checking', 'Checking your verification link…')}
              />
            </Box>
          ) : outcomeType === 'error' ? (
            <Box sx={{ textAlign: 'center' }}>
              <AuthCardHeader
                icon={<ErrorOutline sx={{ fontSize: 32 }} />}
                tone='error'
                toneTitle
                title={t('auth.validate.failedTitle', 'Validation Failed')}
                subtitle={outcomeMessage}
              />
              <Stack spacing={2} sx={{ mt: 3 }}>
                <AuthActionButton
                  fullWidth
                  onClick={() => navigate(Path.auth.signin)}
                  label={t('auth.validate.button_connect', 'Sign In')}
                />
                <AuthBackLink
                  label={t('common.backToLogin', 'Back to log in')}
                  onClick={() => navigate(Path.auth.signin)}
                />
              </Stack>
            </Box>
          ) : outcomeType === 'warning' ? (
            <Box sx={{ textAlign: 'center' }}>
              <AuthCardHeader
                icon={<VerifiedUser sx={{ fontSize: 32 }} />}
                tone='warning'
                toneTitle
                title={t('auth.validate.alreadyValidatedTitle', 'Already Validated')}
                subtitle={outcomeMessage}
              />
              <Stack spacing={2} sx={{ mt: 3 }}>
                <AuthActionButton
                  fullWidth
                  onClick={() => navigate(Path.auth.signin)}
                  endIcon={<ArrowForward />}
                  label={t('auth.validate.button_connect', 'Sign In')}
                />
              </Stack>
            </Box>
          ) : outcomeType === 'success' ? (
            <Box sx={{ textAlign: 'center' }}>
              <AuthCardHeader
                icon={<CheckCircle sx={{ fontSize: 32 }} />}
                tone='success'
                toneTitle
                title={t('auth.validate.successTitle', 'Account Validated!')}
                subtitle={outcomeMessage}
              />
              <Stack spacing={2} sx={{ mt: 3 }}>
                <AuthActionButton
                  fullWidth
                  onClick={() => navigate(Path.auth.signin)}
                  endIcon={<ArrowForward />}
                  label={t('auth.validate.button_connect', 'Sign In')}
                />
              </Stack>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <AuthCardHeader
                title={t('auth.validate.title', 'Account Validation')}
                subtitle={t('auth.validate.prompt', 'Please check your link or sign in below.')}
              />
              <AuthActionButton
                fullWidth
                onClick={() => navigate(Path.auth.signin)}
                label={t('auth.validate.button_connect', 'Sign In')}
              />
            </Box>
          )}
        </AuthCard>
      </AuthPageLayout>
    </>
  )
}
