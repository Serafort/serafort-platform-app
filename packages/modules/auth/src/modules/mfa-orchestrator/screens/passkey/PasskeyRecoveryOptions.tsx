import { useState, useEffect } from 'react'
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
  CircularProgress,
  Stack,
  useTheme,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
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
import { mfaService, TOTPSetupResponse } from '../../services/mfa.service'

const RECOVERY_OPTIONS = [
  {
    value: 'authenticator',
    icon: <Smartphone />,
    label: 'Authenticator App',
    description:
      'Use Google Authenticator, Authy, or 1Password for time-based verification codes.',
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
    value: 'backup_codes',
    icon: <Key />,
    label: 'Recovery Codes',
    description: 'Generate a set of one-time-use codes to store securely offline.',
    recommended: false,
  },
]

export default function PasskeyRecoveryOptions() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
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
      setError(err.response?.data?.message || err.message || 'Failed to initialize recovery setup.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSetup = async () => {
    setError(null)
    setLoading(true)
    try {
      if (selectedMethod === 'authenticator') {
        await mfaService.confirmTotp(verificationCode)
        setSuccessMsg(t('mfa.totpSetupSuccess', 'Authenticator app recovery configured successfully.'))
      } else if (selectedMethod === 'sms') {
        await mfaService.sms.confirm(verificationCode)
        setSuccessMsg(t('mfa.smsSetupSuccess', 'SMS recovery configured successfully.'))
      } else if (selectedMethod === 'backup_codes') {
        setSuccessMsg(t('mfa.backupReady', 'Backup recovery codes saved successfully.'))
      }
      setTimeout(() => navigate(-1), 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to verify recovery setup.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCodes = () => {
    if (!backupCodes.length) return
    navigator.clipboard.writeText(backupCodes.join('\n'))
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }

  const handleDownloadCodes = () => {
    if (!backupCodes.length) return
    const blob = new Blob(
      [`MFA Recovery Backup Codes\nGenerated: ${new Date().toISOString()}\n\n` + backupCodes.join('\n')],
      { type: 'text/plain;charset=utf-8' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passkey-recovery-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 500 }}
        >
          {t('common.back', 'Back')}
        </Button>
        <Typography variant="body2" color="text.secondary">
          /
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('passkey.passkeys', 'Passkeys')}
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
        <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em" sx={{ mb: 0.5 }}>
          {t('passkey.recovery_title', 'Passkey Recovery Options')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t(
            'passkey.recovery_subtitle',
            'Set up a backup method in case you lose access to your passkey device.'
          )}
        </Typography>
      </Box>

      {/* Warning Banner */}
      <Alert
        severity="warning"
        icon={<WarningAmber />}
        sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 500 } }}
      >
        {t(
          'passkey.recovery_warning',
          'Without a recovery method, losing your passkey device means losing access to your account permanently.'
        )}
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}

      {/* Method Selection */}
      <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={600}>
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
                        <Typography variant="subtitle2" fontWeight={600}>
                          {option.label}
                        </Typography>
                        {option.recommended && (
                          <Chip
                            label="Recommended"
                            size="small"
                            color="primary"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
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

      {/* Setup Section */}
      <Collapse in={showSetup}>
        <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              {t('passkey.verify_recovery', 'Verify Recovery Method')}
            </Typography>

            {loading && (
              <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} />
              </Box>
            )}

            {!loading && selectedMethod === 'authenticator' && setupData && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                {setupData.qrDataUrl && (
                  <Box
                    component="img"
                    src={setupData.qrDataUrl}
                    alt="QR Code"
                    sx={{ width: 160, height: 160, mx: 'auto', mb: 2, borderRadius: 2 }}
                  />
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Scan the QR code with your authenticator app, then enter the 6-digit code.
                </Typography>
                <TextField
                  fullWidth
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000 000"
                  inputProps={{
                    maxLength: 6,
                    style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.3em' },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            )}

            {!loading && selectedMethod === 'sms' && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter the 6-digit verification code sent to your registered phone number.
                </Typography>
                <TextField
                  fullWidth
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000 000"
                  inputProps={{
                    maxLength: 6,
                    style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.3em' },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            )}

            {!loading && selectedMethod === 'backup_codes' && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Save these backup codes in a secure password manager.
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1.5,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    mb: 2,
                  }}
                >
                  {backupCodes.map((c, i) => (
                    <Chip key={i} label={c} variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
                  ))}
                </Box>
                <Stack direction="row" spacing={1.5} justifyContent="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCopyCodes}
                    startIcon={copiedCodes ? <Check /> : <ContentCopy />}
                  >
                    {copiedCodes ? 'Copied' : 'Copy Codes'}
                  </Button>
                  <Button variant="outlined" size="small" onClick={handleDownloadCodes} startIcon={<Download />}>
                    Download .txt
                  </Button>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Collapse>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => navigate(-1)} sx={{ textTransform: 'none', fontWeight: 600 }}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={showSetup ? handleConfirmSetup : handleStartSetup}
          disabled={loading || (showSetup && selectedMethod !== 'backup_codes' && verificationCode.length !== 6)}
          endIcon={showSetup ? undefined : <ArrowForward />}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 4 }}
        >
          {showSetup
            ? selectedMethod === 'backup_codes'
              ? t('common.done', 'Done')
              : t('passkey.confirm_recovery', 'Confirm Recovery')
            : t('common.continue', 'Continue')}
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
        >
          <Lock sx={{ fontSize: 12 }} />
          {t('passkey.recovery_encrypted', 'All recovery data is securely hashed and encrypted.')}
        </Typography>
      </Box>
    </Container>
  )
}
