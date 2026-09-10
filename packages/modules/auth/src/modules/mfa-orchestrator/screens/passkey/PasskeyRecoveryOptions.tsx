import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  alpha,
  Collapse,
  CircularProgress,
  Stack,
  useTheme,
} from '@mui/material'
import Shield from '@mui/icons-material/Shield'
import Smartphone from '@mui/icons-material/Smartphone'
import Sms from '@mui/icons-material/Sms'
import Key from '@mui/icons-material/Key'
import ArrowForward from '@mui/icons-material/ArrowForward'
import WarningAmber from '@mui/icons-material/WarningAmber'
import Lock from '@mui/icons-material/Lock'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Check from '@mui/icons-material/Check'
import Download from '@mui/icons-material/Download'
import { useTranslation } from 'react-i18next'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthBackLink,
  AuthCodeInput,
  AuthInputLabel,
  AuthQrPanel,
  AuthCopyField,
} from '../../../authentication-core/components/shared/auth'
import { mfaService, TOTPSetupResponse } from '../../services/mfa.service'

export default function PasskeyRecoveryOptions() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const RECOVERY_OPTIONS = [
    {
      value: 'authenticator',
      icon: <Smartphone />,
      label: t('passkey.recovery_authenticator', 'Authenticator App'),
      description: t(
        'passkey.recovery_authenticator_desc',
        'Use Google Authenticator, Authy, or 1Password for time-based verification codes.',
      ),
      recommended: true,
    },
    {
      value: 'sms',
      icon: <Sms />,
      label: t('passkey.recovery_sms', 'SMS Recovery'),
      description: t(
        'passkey.recovery_sms_desc',
        'Receive a one-time recovery code via text message to your registered phone number.',
      ),
      recommended: false,
    },
    {
      value: 'backup_codes',
      icon: <Key />,
      label: t('passkey.recovery_backup_codes', 'Recovery Codes'),
      description: t(
        'passkey.recovery_backup_codes_desc',
        'Generate a set of one-time-use codes to store securely offline.',
      ),
      recommended: false,
    },
  ]
  const [selectedMethod, setSelectedMethod] = useState('authenticator')
  const [showSetup, setShowSetup] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [setupData, setSetupData] = useState<TOTPSetupResponse | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [copiedCodes, setCopiedCodes] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleStartSetup = async () => {
    setError(null)
    setShowSetup(true)
    setLoading(true)
    try {
      if (selectedMethod === 'authenticator') {
        const res = await mfaService.setupTotp()
        setSetupData(res.data)
      } else if (selectedMethod === 'sms') {
        await mfaService.sms.sendCode()
      } else if (selectedMethod === 'backup_codes') {
        const res = await mfaService.regenerateBackupCodes()
        setBackupCodes(res.data?.recoveryCodes || [])
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t('passkey.recovery_init_failed', 'Failed to initialize recovery setup.'),
      )
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSetup = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      if (selectedMethod === 'authenticator') {
        await mfaService.confirmTotp(verificationCode)
        setSuccessMsg(
          t('mfa.totpSetupSuccess', 'Authenticator app recovery configured successfully.'),
        )
      } else if (selectedMethod === 'sms') {
        await mfaService.sms.confirm(verificationCode)
        setSuccessMsg(t('mfa.smsSetupSuccess', 'SMS recovery configured successfully.'))
      } else if (selectedMethod === 'backup_codes') {
        setSuccessMsg(t('mfa.backupReady', 'Backup recovery codes saved successfully.'))
      }
      setTimeout(() => navigate(-1), 1500)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t('passkey.recovery_verify_failed', 'Failed to verify recovery setup.'),
      )
    } finally {
      setLoading(false)
    }
  }, [selectedMethod, verificationCode, navigate, t])

  const handleCopyCodes = () => {
    if (!backupCodes.length) return
    navigator.clipboard.writeText(backupCodes.join('\n'))
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }

  const handleDownloadCodes = () => {
    if (!backupCodes.length) return
    const blob = new Blob(
      [
        `MFA Recovery Backup Codes\nGenerated: ${new Date().toISOString()}\n\n` +
          backupCodes.join('\n'),
      ],
      { type: 'text/plain;charset=utf-8' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passkey-recovery-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AuthPageLayout maxWidth={560}>
      <AuthCard padding='comfortable'>
        <Box sx={{ mb: 2 }}>
          <AuthBackLink onClick={() => (showSetup ? setShowSetup(false) : navigate(-1))}>
            {showSetup ? t('common.back', 'Back to options') : t('common.back', 'Back')}
          </AuthBackLink>
        </Box>

        <AuthCardHeader
          icon={<Shield sx={{ fontSize: 32 }} />}
          iconSize={64}
          tone='warning'
          title={
            showSetup
              ? t('passkey.verify_recovery', 'Verify Recovery Method')
              : t('passkey.recovery_title', 'Passkey Recovery Options')
          }
          subtitle={
            showSetup
              ? t(
                  'passkey.verify_recovery_desc',
                  'Confirm your backup factor to protect your account.',
                )
              : t(
                  'passkey.recovery_subtitle',
                  'Set up a backup method in case you lose access to your passkey device.',
                )
          }
        />

        {!showSetup && (
          <Alert
            severity='warning'
            icon={<WarningAmber />}
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              '& .MuiAlert-message': { fontWeight: 500 },
            }}
          >
            {t(
              'passkey.recovery_warning',
              'Without a recovery method, losing your passkey device means losing access to your account permanently.',
            )}
          </Alert>
        )}

        {error && (
          <Alert
            severity='error'
            role='alert'
            aria-live='polite'
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              '& .MuiAlert-message': { fontWeight: 600 },
            }}
          >
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert
            severity='success'
            role='status'
            aria-live='polite'
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              '& .MuiAlert-message': { fontWeight: 600 },
            }}
          >
            {successMsg}
          </Alert>
        )}

        {/* Method Selection */}
        {!showSetup && (
          <Card
            variant='outlined'
            sx={{
              borderRadius: 'var(--sf-radius-lg, 12px)',
              borderColor: 'divider',
              mb: 3,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 1.75, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant='subtitle2' fontWeight={700}>
                  {t('passkey.select_recovery', 'Select Recovery Method')}
                </Typography>
              </Box>
              <RadioGroup
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value)
                  setShowSetup(false)
                  setError(null)
                }}
              >
                {RECOVERY_OPTIONS.map((option, index) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio sx={{ ml: 1.5 }} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--sf-radius-md, 8px)',
                            bgcolor:
                              selectedMethod === option.value
                                ? alpha(theme.palette.primary.main, 0.1)
                                : 'action.hover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '& .MuiSvgIcon-root': {
                              fontSize: 20,
                              color:
                                selectedMethod === option.value
                                  ? 'primary.main'
                                  : 'text.secondary',
                            },
                          }}
                        >
                          {option.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant='subtitle2' fontWeight={700}>
                              {option.label}
                            </Typography>
                            {option.recommended && (
                              <Chip
                                label={t('passkey.recommended', 'Recommended')}
                                size='small'
                                color='primary'
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
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
        )}

        {/* Setup Section */}
        <Collapse in={showSetup}>
          <Box sx={{ mb: 3 }}>
            {loading && (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={36} thickness={4} />
              </Box>
            )}

            {!loading && selectedMethod === 'authenticator' && setupData && (
              <Stack spacing={3}>
                <AuthQrPanel
                  src={setupData.qrDataUrl}
                  alt={t('passkey.qr_alt', 'QR code')}
                />
                {setupData.manualEntry && (
                  <AuthCopyField
                    value={setupData.manualEntry}
                    label={t('mfa.manualKeyLabel', 'Manual Entry Secret Key')}
                    copyLabel={t('mfa.copySecret', 'Copy secret key')}
                  />
                )}
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 1 }}>
                    <AuthInputLabel>
                      {t('mfa.enterCode', '6-Digit Verification Code')}
                    </AuthInputLabel>
                  </Box>
                  <AuthCodeInput
                    id='recovery-totp-code'
                    value={verificationCode}
                    onChange={setVerificationCode}
                    onComplete={handleConfirmSetup}
                    length={6}
                    groups={[3, 3]}
                    separator=''
                    mode='numeric'
                    autoFocus
                    label={t('mfa.enterCode', '6-Digit Verification Code')}
                  />
                </Box>
              </Stack>
            )}

            {!loading && selectedMethod === 'sms' && (
              <Stack spacing={3}>
                <Typography variant='body2' color='text.secondary' textAlign='center'>
                  {t(
                    'passkey.sms_instruction',
                    'Enter the 6-digit verification code sent to your registered phone number.',
                  )}
                </Typography>
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 1 }}>
                    <AuthInputLabel>
                      {t('mfa.smsCodeLabel', '6-Digit SMS Code')}
                    </AuthInputLabel>
                  </Box>
                  <AuthCodeInput
                    id='recovery-sms-code'
                    value={verificationCode}
                    onChange={setVerificationCode}
                    onComplete={handleConfirmSetup}
                    length={6}
                    groups={[3, 3]}
                    separator=''
                    mode='numeric'
                    autoFocus
                    label={t('mfa.smsCodeLabel', '6-Digit SMS Code')}
                  />
                </Box>
              </Stack>
            )}

            {!loading && selectedMethod === 'backup_codes' && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5 }}>
                  {t(
                    'passkey.backup_instruction',
                    'Save these backup codes in a secure password manager.',
                  )}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 1.5,
                    p: 2,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 2.5,
                  }}
                >
                  {backupCodes.map((c, i) => (
                    <Chip
                      key={i}
                      label={c}
                      variant='outlined'
                      dir='ltr'
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        height: 38,
                        borderRadius: 'var(--sf-radius-md, 8px)',
                      }}
                    />
                  ))}
                </Box>
                <Stack direction='row' spacing={1.5} justifyContent='center'>
                  <Button
                    variant='outlined'
                    onClick={handleCopyCodes}
                    startIcon={copiedCodes ? <Check /> : <ContentCopy />}
                    sx={{
                      minHeight: 44,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      fontWeight: 700,
                      textTransform: 'none',
                    }}
                  >
                    {copiedCodes
                      ? t('passkey.copied', 'Copied')
                      : t('passkey.copy_codes', 'Copy Codes')}
                  </Button>
                  <Button
                    variant='outlined'
                    onClick={handleDownloadCodes}
                    startIcon={<Download />}
                    sx={{
                      minHeight: 44,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      fontWeight: 700,
                      textTransform: 'none',
                    }}
                  >
                    {t('passkey.download_txt', 'Download .txt')}
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Actions */}
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={showSetup ? handleConfirmSetup : handleStartSetup}
            disabled={
              loading ||
              (showSetup &&
                selectedMethod !== 'backup_codes' &&
                verificationCode.length !== 6)
            }
            endIcon={showSetup ? undefined : <ArrowForward />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: 'var(--sf-shadow-glow, none)',
            }}
          >
            {showSetup
              ? selectedMethod === 'backup_codes'
                ? t('common.done', 'Done')
                : t('passkey.confirm_recovery', 'Confirm Recovery')
              : t('common.continue', 'Continue')}
          </Button>

          <Button
            fullWidth
            variant='text'
            onClick={() => navigate(-1)}
            disabled={loading}
            sx={{
              minHeight: 44,
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { color: 'text.primary' },
            }}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
        </Stack>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography
            variant='caption'
            color='text.disabled'
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
          >
            <Lock sx={{ fontSize: 13 }} />
            {t(
              'passkey.recovery_encrypted',
              'All recovery data is securely hashed and encrypted.',
            )}
          </Typography>
        </Box>
      </AuthCard>
    </AuthPageLayout>
  )
}
