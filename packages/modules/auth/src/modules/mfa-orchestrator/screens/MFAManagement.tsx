import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material'
import Security from '@mui/icons-material/Security'
import PhoneAndroid from '@mui/icons-material/PhoneAndroid'
import VpnKey from '@mui/icons-material/VpnKey'
import Fingerprint from '@mui/icons-material/Fingerprint'
import CheckCircle from '@mui/icons-material/CheckCircle'
import WarningAmber from '@mui/icons-material/WarningAmber'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Check from '@mui/icons-material/Check'
import Download from '@mui/icons-material/Download'
import Autorenew from '@mui/icons-material/Autorenew'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@cap/platform-store'
import { mfaService } from '../services/mfa.service'
import Path from './path'

export default function MFAManagement() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)

  const [loading, setLoading] = useState(true)
  const [mfaEnabled, setMfaEnabled] = useState(Boolean(user?.mfaEnabled || (user as any)?.totpSecret))
  const [passkeyCount, setPasskeyCount] = useState(0)

  // Recovery codes modal
  const [codesModalOpen, setCodesModalOpen] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)

  // Disable MFA confirmation modal
  const [disableModalOpen, setDisableModalOpen] = useState(false)
  const [disabling, setDisabling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Fetch initial status
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Check user object or verify status
      if (user?.mfaEnabled) {
        setMfaEnabled(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load MFA settings.')
    } finally {
      setLoading(false)
    }
  }, [user?.mfaEnabled])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Handle View / Regenerate Backup Codes
  const handleOpenCodesModal = useCallback(async (regenerate = false) => {
    try {
      setCodesModalOpen(true)
      setLoadingCodes(true)
      setError(null)

      let response: any
      if (regenerate) {
        response = await mfaService.regenerateBackupCodes()
        setSuccessMsg(t('mfa.backupRegenerated', 'New backup recovery codes generated successfully.'))
      } else {
        response = await mfaService.getRecoveryCodes()
      }

      if (response.data?.recoveryCodes) {
        setRecoveryCodes(response.data.recoveryCodes)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve recovery codes.')
    } finally {
      setLoadingCodes(false)
    }
  }, [t])

  const handleCopyCodes = useCallback(() => {
    if (!recoveryCodes.length) return
    navigator.clipboard.writeText(recoveryCodes.join('\n'))
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }, [recoveryCodes])

  const handleDownloadCodes = useCallback(() => {
    if (!recoveryCodes.length) return
    const blob = new Blob(
      [`MFA Recovery Backup Codes\nAccount: ${user?.email || 'User'}\nGenerated: ${new Date().toISOString()}\n\n` + recoveryCodes.join('\n')],
      { type: 'text/plain;charset=utf-8' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mfa-recovery-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [recoveryCodes, user?.email])

  // Handle Disable MFA
  const handleDisableMfa = useCallback(async () => {
    try {
      setDisabling(true)
      setError(null)
      await mfaService.disableMfa()
      setMfaEnabled(false)
      setDisableModalOpen(false)
      setSuccessMsg(t('mfa.disabledSuccess', 'Two-Factor Authentication has been disabled.'))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable MFA.')
    } finally {
      setDisabling(false)
    }
  }, [t])

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 880, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            borderRadius: 2.5,
          }}
        >
          <Security sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            {t('mfa.managementTitle', 'Multi-Factor Authentication (2FA)')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mfa.managementSubtitle', 'Protect your account with additional authentication factors and security keys.')}
          </Typography>
        </Box>
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Security Status Banner */}
      <Card
        variant="outlined"
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          bgcolor: mfaEnabled
            ? alpha(theme.palette.success.main, 0.04)
            : alpha(theme.palette.warning.main, 0.04),
          borderColor: mfaEnabled
            ? alpha(theme.palette.success.main, 0.3)
            : alpha(theme.palette.warning.main, 0.3),
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            {mfaEnabled ? (
              <CheckCircle color="success" sx={{ fontSize: 36 }} />
            ) : (
              <WarningAmber color="warning" sx={{ fontSize: 36 }} />
            )}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {mfaEnabled
                  ? t('mfa.statusProtected', 'Your Account is Protected with 2FA')
                  : t('mfa.statusUnprotected', 'Two-Factor Authentication is Not Enabled')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mfaEnabled
                  ? t('mfa.statusProtectedDesc', 'A verification code or passkey is required whenever you sign in.')
                  : t('mfa.statusUnprotectedDesc', 'Enable an authenticator app or passkey to enhance account security.')}
              </Typography>
            </Box>
          </Stack>
          {!mfaEnabled && (
            <Button
              variant="contained"
              onClick={() => navigate(Path.mfa.setup)}
              endIcon={<ArrowForward />}
              sx={{ fontWeight: 700, borderRadius: 2.5, textTransform: 'none', px: 3, whiteSpace: 'nowrap' }}
            >
              {t('mfa.enableButton', 'Enable 2FA')}
            </Button>
          )}
        </Stack>
      </Card>

      <Stack spacing={3}>
        {/* 1. Authenticator App (TOTP) */}
        <Card variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', borderRadius: 2.5 }}>
                <PhoneAndroid />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {t('mfa.totpTitle', 'Authenticator App (TOTP)')}
                  </Typography>
                  <Chip
                    label={mfaEnabled ? t('common.active', 'Active') : t('common.disabled', 'Disabled')}
                    color={mfaEnabled ? 'success' : 'default'}
                    size="small"
                    sx={{ fontWeight: 700, height: 22 }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t('mfa.totpDesc', 'Use Google Authenticator, 1Password, or Authy to generate time-based verification codes.')}
                </Typography>
              </Box>
            </Stack>

            <Box>
              {mfaEnabled ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDisableModalOpen(true)}
                  startIcon={<DeleteOutline />}
                  sx={{ fontWeight: 700, borderRadius: 2.5, textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  {t('mfa.disable', 'Disable')}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => navigate(Path.mfa.setup)}
                  sx={{ fontWeight: 700, borderRadius: 2.5, textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  {t('mfa.setup', 'Set Up')}
                </Button>
              )}
            </Box>
          </Stack>
        </Card>

        {/* 2. Backup Recovery Codes */}
        {mfaEnabled && (
          <Card variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: 'background.paper' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', borderRadius: 2.5 }}>
                  <VpnKey />
                </Avatar>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {t('mfa.backupTitle', 'Backup Recovery Codes')}
                    </Typography>
                    <Chip
                      label={t('mfa.backupReady', '10 Codes')}
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 700, height: 22 }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {t('mfa.backupDesc', 'Single-use emergency codes to sign in if you lose access to your authenticator app.')}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  onClick={() => handleOpenCodesModal(false)}
                  sx={{ fontWeight: 700, borderRadius: 2.5, textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  {t('mfa.viewCodes', 'View Codes')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleOpenCodesModal(true)}
                  startIcon={<Autorenew />}
                  sx={{ fontWeight: 700, borderRadius: 2.5, textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  {t('mfa.regenerateCodes', 'Regenerate')}
                </Button>
              </Stack>
            </Stack>
          </Card>
        )}

        {/* 3. Passkeys & Security Keys (WebAuthn) */}
        <Card variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 2.5 }}>
                <Fingerprint />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {t('mfa.passkeysTitle', 'Passkeys & Security Keys')}
                  </Typography>
                  <Chip
                    label={t('mfa.fido2', 'FIDO2 / WebAuthn')}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 700, height: 22 }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t('mfa.passkeysDesc', 'Sign in securely using biometric sensors (Touch ID, Face ID, Windows Hello) or YubiKeys.')}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              onClick={() => navigate(Path.passkey.management)}
              endIcon={<ArrowForward />}
              sx={{ fontWeight: 700, borderRadius: 2.5, textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {t('mfa.managePasskeys', 'Manage Devices')}
            </Button>
          </Stack>
        </Card>
      </Stack>

      {/* Backup Codes Dialog */}
      <Dialog
        open={codesModalOpen}
        onClose={() => setCodesModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {t('mfa.dialogRecoveryTitle', 'Your Backup Recovery Codes')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {t(
              'mfa.dialogRecoveryDesc',
              'Each recovery code can only be used once. Store them securely in a password manager.'
            )}
          </DialogContentText>

          {loadingCodes ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1.5,
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.action.selected, 0.05),
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {recoveryCodes.map((code, idx) => (
                <Chip
                  key={idx}
                  label={code}
                  variant="outlined"
                  sx={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    py: 2,
                    borderRadius: 2,
                  }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={handleCopyCodes}
              disabled={loadingCodes || !recoveryCodes.length}
              startIcon={copiedCodes ? <Check /> : <ContentCopy />}
              sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
            >
              {copiedCodes ? t('common.copied', 'Copied!') : t('mfa.copyCodes', 'Copy')}
            </Button>
            <Button
              variant="outlined"
              onClick={handleDownloadCodes}
              disabled={loadingCodes || !recoveryCodes.length}
              startIcon={<Download />}
              sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
            >
              {t('mfa.downloadCodes', 'Download .txt')}
            </Button>
          </Stack>
          <Button
            onClick={() => setCodesModalOpen(false)}
            variant="contained"
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            {t('common.done', 'Done')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disable MFA Confirmation Dialog */}
      <Dialog
        open={disableModalOpen}
        onClose={() => !disabling && setDisableModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
          {t('mfa.disableDialogTitle', 'Disable Two-Factor Authentication?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'mfa.disableDialogDesc',
              'Disabling 2FA decreases your account security. You will only need your email and password to sign in.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDisableModalOpen(false)}
            disabled={disabling}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleDisableMfa}
            color="error"
            variant="contained"
            disabled={disabling}
            endIcon={disabling && <CircularProgress size={16} color="inherit" />}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            {disabling ? t('mfa.disabling', 'Disabling...') : t('mfa.confirmDisable', 'Disable 2FA')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
