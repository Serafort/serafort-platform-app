import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
  Stack,
  Chip,
} from '@mui/material'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Check from '@mui/icons-material/Check'
import Download from '@mui/icons-material/Download'
import Print from '@mui/icons-material/Print'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Security from '@mui/icons-material/Security'
import VpnKey from '@mui/icons-material/VpnKey'
import { useTranslation } from 'react-i18next'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthInputLabel,
  AuthCodeInput,
  AuthCopyField,
  AuthQrPanel,
} from '../../../authentication-core/components/shared/auth'
import { mfaService, TOTPSetupResponse } from '../../services/mfa.service'
import Path from '../path'

const TOTP_CODE_LENGTH = 6

export default function MFASetupScreen() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [setupData, setSetupData] = useState<TOTPSetupResponse | null>(null)
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 3: Success & Recovery Codes
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [copiedCodes, setCopiedCodes] = useState(false)
  const [step, setStep] = useState<'scan' | 'recovery'>('scan')

  // 1. Fetch QR code and secret on mount
  useEffect(() => {
    let isMounted = true

    async function loadSetup() {
      try {
        setLoading(true)
        setError(null)
        const response = await mfaService.setupTotp()
        if (isMounted && response.data) {
          setSetupData(response.data)
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              t('mfa.setupError', 'Failed to initialize MFA setup.'),
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadSetup()

    return () => {
      isMounted = false
    }
  }, [t])

  const handleVerify = useCallback(async () => {
    if (code.length !== TOTP_CODE_LENGTH) return
    try {
      setVerifying(true)
      setError(null)
      const response = await mfaService.confirmTotp(code)
      if (response.data?.recoveryCodes) {
        setRecoveryCodes(response.data.recoveryCodes)
        setStep('recovery')
      } else {
        navigate(Path.mfa.verification_success)
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t('mfa.invalidCode', 'Invalid verification code. Please try again.'),
      )
    } finally {
      setVerifying(false)
    }
  }, [code, navigate, t])

  const handleCopyCodes = useCallback(() => {
    if (!recoveryCodes.length) return
    navigator.clipboard.writeText(recoveryCodes.join('\n'))
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }, [recoveryCodes])

  const handleDownloadCodes = useCallback(() => {
    if (!recoveryCodes.length) return
    const blob = new Blob(
      [
        `MFA Recovery Backup Codes\nGenerated: ${new Date().toISOString()}\n\n` +
          recoveryCodes.join('\n'),
      ],
      { type: 'text/plain;charset=utf-8' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mfa-recovery-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [recoveryCodes])

  const handlePrintCodes = useCallback(() => {
    if (!recoveryCodes.length) return
    // Opened as a standalone document rather than printing the app: the setup
    // card's surface effects and dark palette waste ink and can render the
    // codes illegibly on paper.
    const sheet = window.open('', '_blank', 'noopener,noreferrer,width=720,height=900')
    if (!sheet) return
    const title = t('mfa.saveBackupCodesTitle', 'Save Recovery Codes')
    const generated = new Date().toLocaleString()
    sheet.document.write(
      '<!doctype html><html><head><meta charset="utf-8"><title>' +
        title +
        '</title><style>' +
        'body{font-family:system-ui,sans-serif;padding:40px;color:#111}' +
        'h1{font-size:20px;margin:0 0 4px}p{color:#555;font-size:13px;margin:0 0 24px}' +
        'ul{list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
        'li{font-family:ui-monospace,monospace;font-size:16px;font-weight:700;' +
        'border:1px solid #ccc;border-radius:8px;padding:10px 14px;letter-spacing:1px}' +
        '</style></head><body><h1>' +
        title +
        '</h1><p>' +
        generated +
        '</p><ul>' +
        recoveryCodes.map((entry) => '<li>' + entry + '</li>').join('') +
        '</ul></body></html>',
    )
    sheet.document.close()
    sheet.focus()
    sheet.print()
  }, [recoveryCodes, t])

  // --- Loading: the authenticator secret is being provisioned -------------
  if (loading) {
    return (
      <AuthPageLayout maxWidth={520} backdrop='subtle'>
        <AuthCard padding='comfortable'>
          <Box
            role='status'
            aria-live='polite'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              py: 6,
            }}
          >
            <CircularProgress size={44} thickness={4} />
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
              {t('mfa.loadingSetup', 'Initializing authenticator setup...')}
            </Typography>
          </Box>
        </AuthCard>
      </AuthPageLayout>
    )
  }

  // --- Step 2: recovery codes --------------------------------------------
  if (step === 'recovery') {
    return (
      <AuthPageLayout maxWidth={560}>
        <AuthCard padding='standard'>
          <Box sx={{ textAlign: 'center' }}>
            <AuthCardHeader
              icon={<VpnKey sx={{ fontSize: 32 }} />}
              title={t('mfa.saveBackupCodesTitle', 'Save Recovery Codes')}
              subtitle={t(
                'mfa.saveBackupCodesSubtitle',
                'If you lose access to your authenticator app, these one-time codes are the only way to recover your account.',
              )}
              tone='success'
              iconSize={64}
            />
          </Box>

          <Alert
            severity='warning'
            sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
          >
            {t(
              'mfa.backupWarning',
              'Keep these codes in a safe place. They will not be displayed again.',
            )}
          </Alert>

          <Box
            component='ul'
            aria-label={t('mfa.recoveryCodesLabel', 'Recovery codes')}
            sx={{
              listStyle: 'none',
              p: 2,
              m: 0,
              mb: 3,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 1.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.action.selected, 0.05),
            }}
          >
            {recoveryCodes.map((codeItem) => (
              <Box component='li' key={codeItem}>
                <Chip
                  label={codeItem}
                  variant='outlined'
                  dir='ltr'
                  sx={{
                    width: '100%',
                    height: 40,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                />
              </Box>
            ))}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
            <Button
              fullWidth
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
              {copiedCodes ? t('common.copied', 'Copied!') : t('mfa.copyCodes', 'Copy Codes')}
            </Button>
            <Button
              fullWidth
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
              {t('mfa.downloadCodes', 'Download .txt')}
            </Button>
            <Button
              fullWidth
              variant='outlined'
              onClick={handlePrintCodes}
              startIcon={<Print />}
              sx={{
                minHeight: 44,
                borderRadius: 'var(--sf-radius-md, 8px)',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {t('mfa.printCodes', 'Print')}
            </Button>
          </Stack>

          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={() => navigate(Path.mfa.management || Path.mfa.dashboard)}
            endIcon={<ArrowForward />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: 'var(--sf-shadow-glow, none)',
            }}
          >
            {t('mfa.finishSetup', 'Finish & Continue')}
          </Button>
        </AuthCard>
      </AuthPageLayout>
    )
  }

  // --- Step 1: scan and confirm ------------------------------------------
  return (
    <AuthPageLayout maxWidth={520}>
      <AuthCard padding='standard'>
        <Box sx={{ textAlign: 'center' }}>
          <AuthCardHeader
            icon={<Security sx={{ fontSize: 32 }} />}
            title={t('mfa.setupHeading', 'Set Up Authenticator')}
            subtitle={t(
              'mfa.setupDescription',
              'Scan the QR code with Google Authenticator, Authy, or 1Password, then enter the 6-digit confirmation code.',
            )}
            iconSize={64}
          />
        </Box>

        {error && (
          <Alert
            severity='error'
            role='alert'
            aria-live='polite'
            sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
          >
            {error}
          </Alert>
        )}

        <AuthQrPanel src={setupData?.qrDataUrl} alt={t('mfa.qrAlt', 'Authenticator QR code')} />

        {setupData?.manualEntry && (
          <Box sx={{ mb: 3 }}>
            <AuthCopyField
              value={setupData.manualEntry}
              label={t('mfa.manualKeyLabel', 'Manual Entry Secret Key')}
              copyLabel={t('mfa.copySecret', 'Copy secret key')}
            />
          </Box>
        )}

        <Stack spacing={3}>
          <Box>
            <Box sx={{ textAlign: 'center' }}>
              <AuthInputLabel>{t('mfa.enterCode', '6-Digit Verification Code')}</AuthInputLabel>
            </Box>
            <AuthCodeInput
              id='mfa-totp-code'
              value={code}
              onChange={setCode}
              onComplete={handleVerify}
              length={TOTP_CODE_LENGTH}
              groups={[3, 3]}
              separator=''
              mode='numeric'
              disabled={verifying}
              error={Boolean(error)}
              autoFocus
              label={t('mfa.enterCode', '6-Digit Verification Code')}
              boxLabel={(position, total) =>
                t('mfa.codeBoxLabel', {
                  position,
                  total,
                  defaultValue: 'Verification code digit {{position}} of {{total}}',
                })
              }
            />
          </Box>

          <Button
            fullWidth
            variant='contained'
            size='large'
            disabled={code.length !== TOTP_CODE_LENGTH || verifying}
            onClick={handleVerify}
            endIcon={verifying ? <CircularProgress size={20} color='inherit' /> : <ArrowForward />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: 'var(--sf-shadow-glow, none)',
            }}
          >
            {verifying
              ? t('mfa.verifying', 'Verifying...')
              : t('mfa.verifySetupButton', 'Verify & Activate MFA')}
          </Button>
        </Stack>
      </AuthCard>
    </AuthPageLayout>
  )
}
