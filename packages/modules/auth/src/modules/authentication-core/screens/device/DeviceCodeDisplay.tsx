import React, { useState } from 'react'
import { Box, Alert, Stack, Button, CircularProgress } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Devices from '@mui/icons-material/Devices'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import { useNavigate } from 'react-router-dom'
import { useDeviceAuth } from '@idaas/authentication-core/hooks'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthInputLabel,
  AuthCodeInput,
  AuthBackLink,
  AuthSecurityNote,
} from '../../components/shared/auth'

/** RFC 8628 user codes are eight characters, conventionally shown as XXXX-XXXX. */
const CODE_LENGTH = 8
const CODE_GROUPS = [4, 4]

const DeviceCodeDisplay = () => {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { mutate: verifyCode, isPending } = useDeviceAuth()

  const isComplete = code.length === CODE_LENGTH

  const submitCode = (value: string) => {
    setErrorMessage(null)

    verifyCode(value, {
      onSuccess: (response: any) => {
        if (response.data.success && response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl
        } else {
          setErrorMessage(t('device.errorGeneric', 'Verification failed. Please check the code.'))
        }
      },
      onError: (err: any) => {
        setErrorMessage(
          err.response?.data?.error === 'invalid_user_code'
            ? t('device.invalidCode', 'Invalid or expired code. Please try again.')
            : t('device.errorGeneric', 'Verification failed.'),
        )
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isComplete || isPending) return
    submitCode(code)
  }

  return (
    <AuthPageLayout maxWidth={480}>
      <AuthCard padding='standard'>
        <AuthCardHeader
          icon={<Devices sx={{ fontSize: 32 }} />}
          title={t('device.activateTitle', 'Activate Device')}
          subtitle={t(
            'device.enterCodeHelp',
            'Enter the code displayed on your other device to securely link it to your account.',
          )}
        />

        {errorMessage && (
          <Alert
            severity='error'
            role='alert'
            aria-live='polite'
            sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
          >
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <Box>
              <Box sx={{ textAlign: 'center' }}>
                <AuthInputLabel>{t('device.codeLabel', 'Device Code')}</AuthInputLabel>
              </Box>
              <AuthCodeInput
                id='device-code'
                value={code}
                onChange={setCode}
                // Submitting as soon as the eighth character lands keeps the
                // flow inside the Doherty threshold: the user finishes typing
                // and the result is already on its way.
                onComplete={submitCode}
                length={CODE_LENGTH}
                groups={CODE_GROUPS}
                mode='alphanumeric'
                disabled={isPending}
                error={Boolean(errorMessage)}
                autoFocus
                label={t('device.codeLabel', 'Device Code')}
                boxLabel={(position, total) =>
                  t('device.codeBoxLabel', {
                    position,
                    total,
                    defaultValue: 'Device code character {{position}} of {{total}}',
                  })
                }
              />
            </Box>

            <Button
              type='submit'
              fullWidth
              variant='contained'
              size='large'
              disabled={isPending || !isComplete}
              endIcon={
                isPending ? <CircularProgress size={20} color='inherit' /> : <CheckCircleOutline />
              }
              sx={{
                minHeight: 48,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
              }}
            >
              {t('device.continue', 'Continue')}
            </Button>
          </Stack>
        </form>

        <AuthBackLink label={t('common.back', 'Back')} onClick={() => navigate(-1)} />
      </AuthCard>

      <AuthSecurityNote>
        {t('device.securityWarning', 'Never share your activation code with anyone.')}
      </AuthSecurityNote>
    </AuthPageLayout>
  )
}

export default DeviceCodeDisplay
