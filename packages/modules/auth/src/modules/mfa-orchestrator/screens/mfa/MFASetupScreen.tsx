import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Alert,
  TextField,
  Avatar,
  CircularProgress,
  alpha,
  useTheme,
  Stack,
  Card,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import QrCode2 from '@mui/icons-material/QrCode2'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Check from '@mui/icons-material/Check'
import Download from '@mui/icons-material/Download'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Security from '@mui/icons-material/Security'
import VpnKey from '@mui/icons-material/VpnKey'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { mfaService, TOTPSetupResponse } from '../../services/mfa.service'
import Path from '../path'

export default function MFASetupScreen() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [setupData, setSetupData] = useState<TOTPSetupResponse | null>(null)
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)

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

  const handleCopySecret = useCallback(() => {
    if (!setupData?.manualEntry) return
    navigator.clipboard.writeText(setupData.manualEntry)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
  }, [setupData?.manualEntry])

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) return
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

  if (loading) {
    return (
      <Box
        sx={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={48} sx={{ mb: 3 }} />
        <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t('mfa.loadingSetup', 'Initializing authenticator setup...')}
        </Typography>
      </Box>
    )
  }

  if (step === 'recovery') {
    return (
      <Box
        className='animate-scale-in'
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        sx={{ width: '100%', maxWidth: 520, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar
            variant='square'
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'transparent',
              color: 'success.main',
              borderRadius: '24px',
              border: '2px solid',
              borderColor: alpha(theme.palette.success.main, 0.2),
            }}
          >
            <VpnKey sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>

        <Typography variant='h4' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('mfa.saveBackupCodesTitle', 'Save Recovery Codes')}
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500, mb: 3 }}>
          {t(
            'mfa.saveBackupCodesSubtitle',
            'If you lose access to your authenticator app, these one-time codes are the only way to recover your account.',
          )}
        </Typography>

        <Alert
          severity='warning'
          sx={{
            mb: 3,
            textAlign: 'left',
            borderRadius: 2,
            '& .MuiAlert-message': { fontWeight: 600 },
          }}
        >
          {t(
            'mfa.backupWarning',
            'Keep these codes in a safe place. They will not be displayed again.',
          )}
        </Alert>

        <Card
          variant='outlined'
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1.5,
            }}
          >
            {recoveryCodes.map((codeItem, index) => (
              <Chip
                key={index}
                label={codeItem}
                variant='outlined'
                sx={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  py: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }}
              />
            ))}
          </Box>
        </Card>

        <Stack direction='row' spacing={2} sx={{ mb: 4 }}>
          <Button
            fullWidth
            variant='outlined'
            onClick={handleCopyCodes}
            startIcon={copiedCodes ? <Check /> : <ContentCopy />}
            sx={{ py: 1.25, borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
          >
            {copiedCodes ? t('common.copied', 'Copied!') : t('mfa.copyCodes', 'Copy Codes')}
          </Button>
          <Button
            fullWidth
            variant='outlined'
            onClick={handleDownloadCodes}
            startIcon={<Download />}
            sx={{ py: 1.25, borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
          >
            {t('mfa.downloadCodes', 'Download .txt')}
          </Button>
        </Stack>

        <Button
          fullWidth
          variant='contained'
          size='large'
          onClick={() => navigate(Path.mfa.management || Path.mfa.dashboard)}
          endIcon={<ArrowForward />}
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'none',
            bgcolor: 'primary.main',
            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-1px)' },
          }}
        >
          {t('mfa.finishSetup', 'Finish & Continue')}
        </Button>
      </Box>
    )
  }

  return (
    <Box
      className='animate-scale-in'
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 480, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar
          variant='square'
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'transparent',
            color: 'primary.main',
            borderRadius: '24px',
            border: '2px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }}
        >
          <Security sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      <Typography variant='h4' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {t('mfa.setupHeading', 'Set Up Authenticator')}
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        sx={{ fontWeight: 500, mb: 3, lineHeight: 1.6 }}
      >
        {t(
          'mfa.setupDescription',
          'Scan the QR code with Google Authenticator, Authy, or 1Password, then enter the 6-digit confirmation code.',
        )}
      </Typography>

      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 3,
            borderRadius: 2,
            textAlign: 'left',
            '& .MuiAlert-message': { fontWeight: 600 },
          }}
        >
          {error}
        </Alert>
      )}

      {setupData?.qrDataUrl ? (
        <Card
          variant='outlined'
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#FFFFFF',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          }}
        >
          <Box
            component='img'
            src={setupData.qrDataUrl}
            alt='Authenticator QR Code'
            sx={{ width: 200, height: 200, borderRadius: 2 }}
          />
        </Card>
      ) : (
        <Box
          sx={{ p: 4, mb: 3, borderRadius: 3, bgcolor: alpha(theme.palette.action.selected, 0.05) }}
        >
          <QrCode2 sx={{ fontSize: 64, color: 'text.disabled' }} />
        </Box>
      )}

      {setupData?.manualEntry && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.action.selected, 0.05),
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant='caption'
            sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}
          >
            {t('mfa.manualKeyLabel', 'Manual Entry Secret Key')}
          </Typography>
          <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
            <Typography
              variant='body2'
              sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '2px' }}
            >
              {setupData.manualEntry}
            </Typography>
            <Tooltip
              title={copiedSecret ? t('common.copied', 'Copied!') : t('common.copy', 'Copy')}
            >
              <IconButton size='small' onClick={handleCopySecret}>
                {copiedSecret ? (
                  <Check color='success' fontSize='small' />
                ) : (
                  <ContentCopy fontSize='small' />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}

      <Stack spacing={3}>
        <Box>
          <Typography
            variant='caption'
            sx={{
              fontWeight: 800,
              textTransform: 'uppercase',
              ml: 1,
              mb: 1,
              display: 'block',
              color: 'text.secondary',
              textAlign: 'left',
            }}
          >
            {t('mfa.enterCode', '6-Digit Verification Code')}
          </Typography>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='000 000'
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={verifying}
            inputProps={{
              style: {
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '8px',
                fontWeight: 700,
              },
            }}
            slotProps={{
              input: {
                sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
              },
            }}
          />
        </Box>

        <Button
          fullWidth
          variant='contained'
          size='large'
          disabled={code.length !== 6 || verifying}
          onClick={handleVerify}
          endIcon={verifying ? <CircularProgress size={20} color='inherit' /> : <ArrowForward />}
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'none',
            bgcolor: 'primary.main',
            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-1px)' },
          }}
        >
          {verifying
            ? t('mfa.verifying', 'Verifying...')
            : t('mfa.verifySetupButton', 'Verify & Activate MFA')}
        </Button>
      </Stack>
    </Box>
  )
}
