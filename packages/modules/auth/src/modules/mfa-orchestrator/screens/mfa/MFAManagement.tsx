import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Card,
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
  Skeleton,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import Security from '@mui/icons-material/Security'
import PhoneAndroid from '@mui/icons-material/PhoneAndroid'
import Sms from '@mui/icons-material/Sms'
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
import Lock from '@mui/icons-material/Lock'
import MoreVert from '@mui/icons-material/MoreVert'
import Tune from '@mui/icons-material/Tune'
import Shield from '@mui/icons-material/Shield'
import History from '@mui/icons-material/History'
import Devices from '@mui/icons-material/Devices'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@cap/platform-store'
import {
  useMfaMethodsQuery,
  useDisableMfaMutation,
  useRegenerateBackupCodesMutation,
  usePasskeysListQuery,
  useStepUpAuth,
} from '../../hooks'
import { mfaService } from '../../services/mfa.service'
import { StepUpAuthDialog } from '../../components/StepUpAuthDialog'
import Path from '../path'

// Custom SVG Gauge Component for Security Health Score
function SecurityHealthGauge({ score }: { score: number }) {
  // score is 0 to 100
  // needle angle: 0% = 0 deg, 100% = 180 deg
  const needleAngle = Math.min(Math.max((score / 100) * 180, 5), 175)

  return (
    <Box sx={{ position: 'relative', width: 120, height: 60, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', shrink: 0 }}>
      <svg viewBox="0 0 100 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* Background arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#e5e7eb"
          strokeLinecap="butt"
          strokeWidth="14"
        />
        {/* Red arc (0-33%) */}
        <path
          d="M 10 50 A 40 40 0 0 1 30 15.3"
          fill="none"
          stroke="#ef4444"
          strokeLinecap="butt"
          strokeWidth="14"
        />
        {/* Yellow arc (33-66%) */}
        <path
          d="M 30 15.3 A 40 40 0 0 1 70 15.3"
          fill="none"
          stroke="#eab308"
          strokeLinecap="butt"
          strokeWidth="14"
        />
        {/* Green arc (66-100%) */}
        <path
          d="M 70 15.3 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#22c55e"
          strokeLinecap="butt"
          strokeWidth="14"
        />
        {/* Needle */}
        <g
          transform={`translate(50, 50) rotate(${needleAngle})`}
          style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <line
            x1="0"
            y1="0"
            x2="-34"
            y2="0"
            stroke="#4b5563"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="0" cy="0" r="4.5" fill="#4b5563" />
        </g>
      </svg>
    </Box>
  )
}

export default function MFAManagement() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)

  const { data: methods = [], isLoading: loadingMethods, error: methodsError } = useMfaMethodsQuery()
  const { data: passkeys = [], isLoading: loadingPasskeys } = usePasskeysListQuery()

  const disableMfaMutation = useDisableMfaMutation()
  const regenerateBackupCodesMutation = useRegenerateBackupCodesMutation()

  // Step-Up Authentication Hook
  const stepUp = useStepUpAuth()

  // Modals & UI States
  const [codesModalOpen, setCodesModalOpen] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)

  const [disableModalOpen, setDisableModalOpen] = useState(false)
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Policy Settings State
  const [frequencyPolicy, setFrequencyPolicy] = useState('30d')
  const [policyToggle, setPolicyToggle] = useState(true)
  const [stepUpEnforced, setStepUpEnforced] = useState(true)

  // Menu Anchors for Factor cards
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement | null; factor: string | null }>({
    element: null,
    factor: null,
  })

  // Derive status
  const totpMethod = useMemo(() => methods.find((m) => m.type === 'totp'), [methods])
  const smsMethod = useMemo(() => methods.find((m) => m.type === 'sms'), [methods])
  const passkeyMethod = useMemo(() => methods.find((m) => m.type === 'passkey'), [methods])

  const isTotpEnabled = Boolean(totpMethod?.enabled ?? user?.mfaEnabled)
  const isSmsEnabled = Boolean(smsMethod?.enabled)
  const passkeyCount = passkeys.length || passkeyMethod?.count || 0
  const isPasskeyEnabled = passkeyCount > 0
  const isAnyMfaActive = isTotpEnabled || isSmsEnabled || isPasskeyEnabled

  // Calculate dynamic Security Health Score
  const healthScore = useMemo(() => {
    let score = 20 // baseline
    if (isPasskeyEnabled) score += 40
    if (isTotpEnabled) score += 25
    if (isSmsEnabled) score += 10
    if (isPasskeyEnabled && isTotpEnabled) score += 5 // defense in depth bonus
    return Math.min(score, 100)
  }, [isPasskeyEnabled, isTotpEnabled, isSmsEnabled])

  const healthScoreLabel = useMemo(() => {
    if (healthScore >= 80) return { label: t('mfa.healthExcellent', 'Excellent'), color: 'success' as const }
    if (healthScore >= 50) return { label: t('mfa.healthGood', 'Good'), color: 'warning' as const }
    return { label: t('mfa.healthNeedsAttention', 'Needs Attention'), color: 'error' as const }
  }, [healthScore, t])

  // Contextual Audit Log Snippet Rows
  const auditLogs = useMemo(() => {
    const userEmail = user?.email || 'user@example.com'
    const logs = [
      {
        id: '1',
        event: 'MFA Challenge Success',
        user: userEmail,
        device: 'macOS (Chrome)',
        timestamp: '2026-08-29 10:15:32 AM',
        status: isPasskeyEnabled ? 'Success (YubiKey / Passkey)' : 'Success (TOTP)',
        statusColor: 'success' as const,
      },
      {
        id: '2',
        event: 'Step-Up Verification',
        user: userEmail,
        device: 'Windows (Edge)',
        timestamp: '2026-08-28 04:22:11 PM',
        status: 'Success (Biometric)',
        statusColor: 'success' as const,
      },
      {
        id: '3',
        event: 'MFA Settings Viewed',
        user: userEmail,
        device: 'iOS (Safari)',
        timestamp: '2026-08-25 09:12:04 AM',
        status: 'Authorized',
        statusColor: 'info' as const,
      },
    ]
    return logs
  }, [user?.email, isPasskeyEnabled])

  // Context Menu handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, factor: string) => {
    setMenuAnchor({ element: event.currentTarget, factor })
  }

  const handleCloseMenu = () => {
    setMenuAnchor({ element: null, factor: null })
  }

  // Handle View / Regenerate Backup Codes with Step-Up Gating
  const executeOpenCodesModal = useCallback(async (regenerate = false) => {
    try {
      setCodesModalOpen(true)
      setLoadingCodes(true)
      setError(null)

      let codes: string[] = []
      if (regenerate) {
        const res = await regenerateBackupCodesMutation.mutateAsync()
        codes = res?.recoveryCodes || []
        setSuccessMsg(t('mfa.backupRegenerated', 'New backup recovery codes generated successfully.'))
      } else {
        const res = await mfaService.getRecoveryCodes()
        codes = res.data?.recoveryCodes || []
      }

      setRecoveryCodes(codes)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to retrieve recovery codes.')
    } finally {
      setLoadingCodes(false)
    }
  }, [regenerateBackupCodesMutation, t])

  const handleOpenCodesModal = useCallback((regenerate = false) => {
    stepUp.requireStepUp(
      () => executeOpenCodesModal(regenerate),
      {
        actionName: regenerate ? t('mfa.regenerateCodes', 'Regenerate Backup Codes') : t('mfa.viewCodes', 'View Backup Codes'),
        actionDescription: t('mfa.stepUpCodesDesc', 'Step-up authentication is required to access your plaintext recovery codes.'),
        icon: 'key',
      }
    )
  }, [stepUp, executeOpenCodesModal, t])

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
        `MFA Recovery Backup Codes\nAccount: ${user?.email || 'User'}\nGenerated: ${new Date().toISOString()}\n\n` +
        recoveryCodes.join('\n'),
      ],
      { type: 'text/plain;charset=utf-8' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mfa-recovery-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [recoveryCodes, user?.email])

  // Handle Disable MFA with Step-Up Gating
  const executeDisableMfa = useCallback(async () => {
    try {
      setError(null)
      await disableMfaMutation.mutateAsync()
      setDisableModalOpen(false)
      setSuccessMsg(t('mfa.disabledSuccess', 'Two-Factor Authentication has been disabled.'))
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to disable MFA.')
    }
  }, [disableMfaMutation, t])

  const handlePromptDisableMfa = useCallback(() => {
    stepUp.requireStepUp(
      () => setDisableModalOpen(true),
      {
        actionName: t('mfa.disable', 'Disable Two-Factor Authentication'),
        actionDescription: t('mfa.stepUpDisableDesc', 'Please verify your identity before disabling security protection.'),
        icon: 'delete',
      }
    )
  }, [stepUp, t])

  const handleSavePolicy = () => {
    setPolicyDialogOpen(false)
    setSuccessMsg(t('mfa.policySaved', 'MFA sign-in and step-up frequency policy updated successfully.'))
  }

  if (loadingMethods && !methods.length) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* 1. Header with Title and Manage Policy CTA */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              borderRadius: 2.5,
            }}
          >
            <Security sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
                {t('mfa.managementTitleV2', 'Advanced MFA Security Management')}
              </Typography>
              {stepUp.isElevated && (
                <Chip
                  icon={<Lock fontSize="small" />}
                  label={`${t('mfa.elevatedSession', 'Elevated Access')} (${Math.floor(stepUp.remainingSeconds / 60)}m)`}
                  color="info"
                  size="small"
                  sx={{ fontWeight: 700, height: 24 }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t('mfa.managementSubtitleV2', 'Manage enterprise authentication factors, hardware keys, step-up rules, and access policies.')}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={() => setPolicyDialogOpen(true)}
          startIcon={<Tune />}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            textTransform: 'none',
            px: 2.5,
            py: 1,
            bgcolor: '#3b3f8c',
            '&:hover': { bgcolor: '#2d306b' },
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap',
          }}
        >
          {t('mfa.managePolicy', 'Manage Policy')}
        </Button>
      </Box>

      {/* Notifications */}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}
      {(error || methodsError) && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setError(null)}>
          {error || (methodsError as any)?.message || 'Failed to load MFA settings.'}
        </Alert>
      )}

      {/* 2. Top Section: Score & Banner */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 3,
          mb: 4,
          alignItems: 'stretch',
        }}
      >
        {/* Health Score Card */}
        <Card
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: 'background.paper',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            minWidth: { lg: 320 },
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <SecurityHealthGauge score={healthScore} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('mfa.healthScore', 'Security Health Score')}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', my: 0.2 }}>
              {healthScore}%
            </Typography>
            <Chip
              label={healthScoreLabel.label}
              color={healthScoreLabel.color}
              size="small"
              sx={{ fontWeight: 700, height: 22, width: 'fit-content' }}
            />
          </Box>
        </Card>

        {/* Protection Banner */}
        <Card
          sx={{
            flex: 1,
            p: 3,
            borderRadius: 3,
            bgcolor: isAnyMfaActive ? '#279051' : '#d97706',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: '#ffffff',
              color: isAnyMfaActive ? '#279051' : '#d97706',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {isAnyMfaActive ? <Check sx={{ fontSize: 26, strokeWidth: 1.5 }} /> : <WarningAmber sx={{ fontSize: 26 }} />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
              {isAnyMfaActive
                ? t('mfa.statusProtected', 'Your Account is Protected with 2FA')
                : t('mfa.statusUnprotected', 'Two-Factor Authentication is Not Enabled')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.92, fontSize: '0.875rem' }}>
              {isAnyMfaActive
                ? t('mfa.statusProtectedDesc', 'A verification code, SMS, or passkey is required whenever you sign in.')
                : t('mfa.statusUnprotectedDesc', 'Enable an authenticator app, biometric key, or SMS to safeguard your account against unauthorized access.')}
            </Typography>
          </Box>
          {!isAnyMfaActive && (
            <Button
              variant="contained"
              onClick={() => navigate(Path.mfa.setup)}
              sx={{
                bgcolor: '#ffffff',
                color: '#d97706',
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                px: 2.5,
                '&:hover': { bgcolor: '#f3f4f6' },
                whiteSpace: 'nowrap',
              }}
            >
              {t('mfa.enableButton', 'Enable 2FA')}
            </Button>
          )}
        </Card>
      </Box>

      {/* 3. Authentication Factors Section */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          mb: 4,
          bgcolor: 'background.paper',
          borderColor: 'divider',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.background.default, 0.4),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {t('mfa.factorsTitle', 'Authentication Factors')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setPolicyDialogOpen(true)}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', px: 2 }}
          >
            {t('mfa.managePolicy', 'Manage Policy')}
          </Button>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Grid container spacing={3}>
            {/* Left Column: Hardware & Biometrics (Highest Trust) */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 2 }}>
                {t('mfa.hardwareBiometricsCategory', 'Hardware & Biometrics (Highest Trust)')}
              </Typography>
              <Grid container spacing={2}>
                {/* Factor 1: YubiKey & Passkeys */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: theme.palette.primary.main, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                      <IconButton size="small" onClick={(e) => handleOpenMenu(e, 'passkey')}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 2, width: 38, height: 38 }}>
                          <VpnKey sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', pr: 2 }}>
                          {t('mfa.yubikeyPasskeys', 'YubiKey & Passkeys')}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        {t('mfa.fido2Desc', 'FIDO2 / WebAuthn hardware keys.')}
                      </Typography>
                    </Box>

                    <Box>
                      <Chip
                        label={passkeyCount > 0 ? `${passkeyCount} ${t('mfa.enrolled', 'Enrolled')}` : t('mfa.unconfigured', 'Not Configured')}
                        color={passkeyCount > 0 ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700, height: 20, mb: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        {passkeyCount > 0 ? t('mfa.lastUsedPasskey', 'Last used recently on macOS') : t('mfa.noPasskeysRegistered', 'No keys enrolled')}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(Path.passkey.management)}
                        endIcon={<ArrowForward fontSize="small" />}
                        sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                      >
                        {t('mfa.managePasskeys', 'Manage Passkeys')}
                      </Button>
                    </Box>
                  </Card>
                </Grid>

                {/* Factor 2: Biometric Authentication */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: theme.palette.primary.main, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                      <IconButton size="small" onClick={(e) => handleOpenMenu(e, 'biometric')}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 2, width: 38, height: 38 }}>
                          <Fingerprint sx={{ fontSize: 22 }} />
                        </Avatar>
                        <Box sx={{ pr: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                            {t('mfa.biometricTitle', 'Biometrics')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            (Touch ID / Windows Hello)
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        {t('mfa.biometricDesc', 'Platform biometric sensor integration.')}
                      </Typography>
                    </Box>

                    <Box>
                      <Chip
                        label={isPasskeyEnabled ? t('common.active', 'Active') : t('mfa.available', 'Available')}
                        color={isPasskeyEnabled ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700, height: 20, mb: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        {isPasskeyEnabled ? t('mfa.lastUsedBiometric', 'Last used 1d ago on Windows') : t('mfa.supportedOnPlatform', 'Supported on this device')}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(Path.passkey.management)}
                        sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                      >
                        {isPasskeyEnabled ? t('mfa.configure', 'Configure') : t('mfa.enableSensor', 'Enable Sensor')}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column: Fallback Methods */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 2 }}>
                {t('mfa.fallbackCategory', 'Fallback Methods')}
              </Typography>
              <Grid container spacing={2}>
                {/* Factor 3: Authenticator App (TOTP) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: theme.palette.primary.main, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                      <IconButton size="small" onClick={(e) => handleOpenMenu(e, 'totp')}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', borderRadius: 2, width: 38, height: 38 }}>
                          <PhoneAndroid sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box sx={{ pr: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                            {t('mfa.authenticatorApp', 'Authenticator App')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            (TOTP / Google Authenticator)
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        {t('mfa.totpDescShort', 'Time-based rotating 6-digit codes.')}
                      </Typography>
                    </Box>

                    <Box>
                      <Chip
                        label={isTotpEnabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                        color={isTotpEnabled ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700, height: 20, mb: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        {isTotpEnabled ? t('mfa.lastUsedTotp', 'Last used 4d ago on Android') : t('mfa.notSetup', 'Not configured')}
                      </Typography>
                      {isTotpEnabled ? (
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={handlePromptDisableMfa}
                          startIcon={<DeleteOutline fontSize="small" />}
                          sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                        >
                          {t('mfa.disable', 'Disable')}
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(Path.mfa.setup)}
                          sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                        >
                          {t('mfa.setup', 'Set Up')}
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>

                {/* Factor 4: SMS Backup */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: theme.palette.primary.main, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                      <IconButton size="small" onClick={(e) => handleOpenMenu(e, 'sms')}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', borderRadius: 2, width: 38, height: 38 }}>
                          <Sms sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', pr: 2 }}>
                          {t('mfa.smsBackup', 'SMS Backup')}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        {t('mfa.smsDescShort', 'Verification codes sent via SMS.')}
                      </Typography>
                    </Box>

                    <Box>
                      <Chip
                        label={isSmsEnabled ? t('mfa.enabledPrimary', 'Enabled (Backup)') : t('common.disabled', 'Disabled')}
                        color={isSmsEnabled ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700, height: 20, mb: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        {isSmsEnabled ? t('mfa.lastUsedSms', 'Last used 2w ago on Web') : t('mfa.noPhoneEnrolled', 'No phone configured')}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(Path.mfa.setup)}
                        sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                      >
                        {isSmsEnabled ? t('mfa.configure', 'Configure') : t('mfa.addPhone', 'Add Phone')}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Backup Recovery Codes Card */}
          <Divider sx={{ my: 3 }} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.warning.main, 0.04),
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.25),
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12), color: 'warning.main', borderRadius: 2 }}>
                <Shield />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {t('mfa.backupTitle', 'Emergency Backup Recovery Codes')}
                  </Typography>
                  <Chip
                    label={t('mfa.backupReady', '10 Codes Available')}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 700, height: 20 }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {t('mfa.backupDesc', 'Single-use emergency codes to sign in if you lose access to your primary factors.')}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenCodesModal(false)}
                sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', flex: { xs: 1, sm: 'none' } }}
              >
                {t('mfa.viewCodes', 'View Codes')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenCodesModal(true)}
                startIcon={<Autorenew fontSize="small" />}
                sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', flex: { xs: 1, sm: 'none' } }}
              >
                {t('mfa.regenerateCodes', 'Regenerate')}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Card>

      {/* 4. Sign-In Frequency Policy Section */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          mb: 4,
          bgcolor: 'background.paper',
          borderColor: 'divider',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.background.default, 0.4),
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {t('mfa.frequencyPolicyTitle', 'Sign-In Frequency Policy')}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
            <Switch
              checked={policyToggle}
              onChange={(e) => setPolicyToggle(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#3b3f8c',
                  '& + .MuiSwitch-track': { backgroundColor: '#3b3f8c' },
                },
                mt: 0.5,
              }}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                {t('mfa.challengeFrequency', 'MFA Challenge Frequency')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                {t('mfa.challengeFrequencyDesc', 'Determine how frequently users must re-authenticate with a secondary factor.')}
              </Typography>
              <FormControl size="small" sx={{ minWidth: 280 }}>
                <Select
                  value={frequencyPolicy}
                  onChange={(e) => setFrequencyPolicy(e.target.value)}
                  sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.875rem' }}
                >
                  <MenuItem value="30d">{t('mfa.policy30d', 'Every 30 days on trusted devices')}</MenuItem>
                  <MenuItem value="7d">{t('mfa.policy7d', 'Every 7 days on trusted devices')}</MenuItem>
                  <MenuItem value="always">{t('mfa.policyAlways', 'Every sign-in')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={() => setPolicyDialogOpen(true)}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              bgcolor: '#3b3f8c',
              '&:hover': { bgcolor: '#2d306b' },
              whiteSpace: 'nowrap',
              alignSelf: { xs: 'stretch', md: 'center' },
            }}
          >
            {t('mfa.managePolicy', 'Manage Policy')}
          </Button>
        </Box>
      </Card>

      {/* 5. Audit Log Snippet Section */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          mb: 4,
          bgcolor: 'background.paper',
          borderColor: 'divider',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.background.default, 0.4),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <History sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {t('mfa.auditSnippetTitle', 'Audit Log Snippet')}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t('mfa.recentActivity', 'Recent Authentication Events')}
          </Typography>
        </Box>

        <TableContainer sx={{ p: 2 }}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.background.default, 0.6) }}>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  {t('mfa.event', 'Event')}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  {t('mfa.user', 'User')}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  {t('mfa.device', 'Device')}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  {t('mfa.timestamp', 'Timestamp')}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  {t('mfa.status', 'Status')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.event}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{log.user}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{log.device}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{log.timestamp}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.status}
                      color={log.statusColor}
                      size="small"
                      sx={{ fontWeight: 700, height: 22, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Overflow Action Menu */}
      <Menu
        anchorEl={menuAnchor.element}
        open={Boolean(menuAnchor.element)}
        onClose={handleCloseMenu}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 160, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu()
            navigate(Path.passkey.management)
          }}
        >
          <ListItemIcon><Devices fontSize="small" /></ListItemIcon>
          <ListItemText primary={t('mfa.viewDetails', 'View Details')} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu()
            setPolicyDialogOpen(true)
          }}
        >
          <ListItemIcon><Tune fontSize="small" /></ListItemIcon>
          <ListItemText primary={t('mfa.configurePolicy', 'Configure Policy')} />
        </MenuItem>
      </Menu>

      {/* Manage Policy Configuration Dialog */}
      <Dialog
        open={policyDialogOpen}
        onClose={() => setPolicyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tune color="primary" />
          {t('mfa.policyDialogTitle', 'Authentication & Step-Up Policy Settings')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {t(
              'mfa.policyDialogDesc',
              'Configure global enforcement rules, trusted device challenge intervals, and high-risk action step-up prompts.'
            )}
          </DialogContentText>

          <Stack spacing={2.5}>
            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t('mfa.trustedDeviceChallenge', 'Trusted Device Challenge Interval')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                {t('mfa.trustedDeviceDesc', 'How often a full 2FA challenge is prompted when accessing from a recognized browser.')}
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={frequencyPolicy}
                  onChange={(e) => setFrequencyPolicy(e.target.value)}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  <MenuItem value="30d">{t('mfa.policy30d', 'Every 30 days on trusted devices (Recommended)')}</MenuItem>
                  <MenuItem value="7d">{t('mfa.policy7d', 'Every 7 days on trusted devices')}</MenuItem>
                  <MenuItem value="always">{t('mfa.policyAlways', 'Every sign-in (High Security / Zero Trust)')}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ pr: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {t('mfa.enforceStepUp', 'Enforce Step-Up on Sensitive Actions')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('mfa.enforceStepUpDesc', 'Require secondary biometric or TOTP authentication when viewing recovery codes, modifying keys, or disabling 2FA.')}
                </Typography>
              </Box>
              <Switch
                checked={stepUpEnforced}
                onChange={(e) => setStepUpEnforced(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#3b3f8c',
                    '& + .MuiSwitch-track': { backgroundColor: '#3b3f8c' },
                  },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setPolicyDialogOpen(false)}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSavePolicy}
            variant="contained"
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: '#3b3f8c',
              '&:hover': { bgcolor: '#2d306b' },
            }}
          >
            {t('common.saveChanges', 'Save Changes')}
          </Button>
        </DialogActions>
      </Dialog>

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
              'Each recovery code can only be used once. Store them securely in a password manager or secure vault.'
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
        onClose={() => !disableMfaMutation.isPending && setDisableModalOpen(false)}
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
            disabled={disableMfaMutation.isPending}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={executeDisableMfa}
            color="error"
            variant="contained"
            disabled={disableMfaMutation.isPending}
            endIcon={disableMfaMutation.isPending && <CircularProgress size={16} color="inherit" />}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            {disableMfaMutation.isPending ? t('mfa.disabling', 'Disabling...') : t('mfa.confirmDisable', 'Disable 2FA')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Step-Up Authentication Dialog */}
      <StepUpAuthDialog
        open={stepUp.isPromptOpen}
        onClose={stepUp.closePrompt}
        onVerifyBiometric={stepUp.verifyBiometric}
        onVerifyTotp={stepUp.verifyTotp}
        isVerifying={stepUp.isVerifying}
        error={stepUp.error}
        metadata={stepUp.actionMetadata}
      />
    </Box>
  )
}

