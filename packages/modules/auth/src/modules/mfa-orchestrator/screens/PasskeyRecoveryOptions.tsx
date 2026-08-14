import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Alert,
  alpha,
  Collapse,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack';
import Shield from '@mui/icons-material/Shield';
import Smartphone from '@mui/icons-material/Smartphone';
import Email from '@mui/icons-material/Email';
import Sms from '@mui/icons-material/Sms';
import Key from '@mui/icons-material/Key';
import QrCode2 from '@mui/icons-material/QrCode2';
import ArrowForward from '@mui/icons-material/ArrowForward';
import WarningAmber from '@mui/icons-material/WarningAmber';
import Lock from '@mui/icons-material/Lock';
import { useTranslation } from 'react-i18next'

const RECOVERY_OPTIONS = [
  {
    value: 'authenticator',
    icon: <Smartphone />,
    label: 'Authenticator App',
    description:
      'Use Google Authenticator, Authy, or Microsoft Authenticator for time-based codes.',
    recommended: true,
  },
  {
    value: 'sms',
    icon: <Sms />,
    label: 'SMS Recovery',
    description:
      'Receive a one-time recovery code via text message to your registered phone number.',
    recommended: false,
  },
  {
    value: 'email',
    icon: <Email />,
    label: 'Email Recovery',
    description: 'Receive a recovery link or code to your registered email address.',
    recommended: false,
  },
  {
    value: 'backup_codes',
    icon: <Key />,
    label: 'Recovery Codes',
    description: 'Generate a set of one-time-use codes to store securely offline.',
    recommended: false,
  },
]

export default function PasskeyRecoveryOptions() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedMethod, setSelectedMethod] = useState('authenticator')
  const [showSetup, setShowSetup] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  return (
    <Container maxWidth='sm' sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 500 }}
        >
          {t('common.back', 'Back')}
        </Button>
        <Typography variant='body2' color='text.secondary'>
          /
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {t('auth.passkey.passkeys', 'Passkeys')}
        </Typography>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Shield sx={{ fontSize: 28, color: 'warning.main' }} />
        </Box>
        <Typography variant='h5' fontWeight={700} letterSpacing='-0.02em' sx={{ mb: 0.5 }}>
          {t('auth.passkey.recovery_title', 'Passkey Recovery Options')}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {t(
            'auth.passkey.recovery_subtitle',
            'Set up a backup method in case you lose access to your passkey device.',
          )}
        </Typography>
      </Box>

      {/* Warning Banner */}
      <Alert
        severity='warning'
        icon={<WarningAmber />}
        sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 500 } }}
      >
        {t(
          'auth.passkey.recovery_warning',
          'Without a recovery method, losing your passkey device means losing access to your account permanently.',
        )}
      </Alert>

      {/* Method Selection */}
      <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant='subtitle1' fontWeight={600}>
              {t('auth.passkey.select_recovery', 'Select Recovery Method')}
            </Typography>
          </Box>
          <RadioGroup
            value={selectedMethod}
            onChange={(e) => {
              setSelectedMethod(e.target.value)
              setShowSetup(false)
            }}
          >
            {RECOVERY_OPTIONS.map((option, index) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio sx={{ ml: 2 }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: (theme) =>
                          selectedMethod === option.value
                            ? alpha(theme.palette.primary.main, 0.1)
                            : 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& .MuiSvgIcon-root': {
                          fontSize: 20,
                          color:
                            selectedMethod === option.value ? 'primary.main' : 'text.secondary',
                        },
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='subtitle2' fontWeight={600}>
                          {option.label}
                        </Typography>
                        {option.recommended && (
                          <Chip
                            label='Recommended'
                            size='small'
                            color='primary'
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                          />
                        )}
                      </Box>
                      <Typography variant='caption' color='text.secondary'>
                        {option.description}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{
                  mx: 0,
                  px: 1,
                  borderBottom: index < RECOVERY_OPTIONS.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.15s',
                }}
              />
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Setup Section (visible after clicking Continue) */}
      <Collapse in={showSetup}>
        <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
          <CardContent>
            <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
              {t('auth.passkey.verify_recovery', 'Verify Recovery Method')}
            </Typography>
            {selectedMethod === 'authenticator' && (
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 160,
                    height: 160,
                    mx: 'auto',
                    borderRadius: 3,
                    bgcolor: 'action.hover',
                    border: 2,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <QrCode2 sx={{ fontSize: 100, color: 'text.disabled' }} />
                </Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  Scan this code with your authenticator app, then enter the 6-digit code.
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder='000000'
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.3em',
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
            />
          </CardContent>
        </Card>
      </Collapse>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => navigate(-1)} sx={{ textTransform: 'none', fontWeight: 600 }}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          variant='contained'
          onClick={() => setShowSetup(true)}
          endIcon={showSetup ? undefined : <ArrowForward />}
          disabled={showSetup && verificationCode.length < 6}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 4 }}
        >
          {showSetup
            ? t('auth.passkey.confirm_recovery', 'Confirm Recovery')
            : t('common.continue', 'Continue')}
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography
          variant='caption'
          color='text.disabled'
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
        >
          <Lock sx={{ fontSize: 12 }} />
          {t('auth.passkey.recovery_encrypted', 'All recovery data is end-to-end encrypted.')}
        </Typography>
      </Box>
    </Container>
  )
}
