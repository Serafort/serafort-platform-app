import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import Security from '@mui/icons-material/Security'
import Sms from '@mui/icons-material/Sms'
import VpnKey from '@mui/icons-material/VpnKey'
import PhoneAndroid from '@mui/icons-material/PhoneAndroid'
import Fingerprint from '@mui/icons-material/Fingerprint'
import Check from '@mui/icons-material/Check'
import WarningAmber from '@mui/icons-material/WarningAmber'
import Download from '@mui/icons-material/Download'
import Autorenew from '@mui/icons-material/Autorenew'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Lock from '@mui/icons-material/Lock'
import Shield from '@mui/icons-material/Shield'
import History from '@mui/icons-material/History'
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
import SessionPath from '../../../session-manager/screens/path'
import {
  AuthConfirmDrawer,
  AuthCopyField,
  SecurityMethodCard,
} from '../../../authentication-core/components/shared/auth'

/**
 * Weights behind the security health score.
 *
 * A phishing-resistant factor is worth more than a shared-secret one, and SMS
 * is worth least because it is interceptable — so the score is not just a count
 * of enabled methods. Named here rather than inlined so the reasoning is
 * visible when the numbers are argued about.
 */
const SCORE = {
  baseline: 20,
  passkey: 40,
  totp: 25,
  sms: 10,
  /** Holding two independent factors is worth more than either alone. */
  defenceInDepth: 5,
}

/**
 * Semicircular gauge for the health score.
 *
 * The arcs read the palette rather than the hex literals they used to carry, so
 * a tenant that has restyled its error/warning/success channels gets a gauge
 * that matches the rest of its UI.
 */
function SecurityHealthGauge({ score, label }: { score: number; label: string }) {
  const theme = useTheme()
  const needleAngle = Math.min(Math.max((score / 100) * 180, 5), 175)

  return (
    <Box
      role='img'
      aria-label={label}
      sx={{
        position: 'relative',
        width: 120,
        height: 60,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        flexShrink: 0,
      }}
    >
      <svg viewBox='0 0 100 50' style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <path
          d='M 10 50 A 40 40 0 0 1 90 50'
          fill='none'
          stroke={theme.palette.divider}
          strokeLinecap='butt'
          strokeWidth='14'
        />
        <path
          d='M 10 50 A 40 40 0 0 1 30 15.3'
          fill='none'
          stroke={theme.palette.error.main}
          strokeLinecap='butt'
          strokeWidth='14'
        />
        <path
          d='M 30 15.3 A 40 40 0 0 1 70 15.3'
          fill='none'
          stroke={theme.palette.warning.main}
          strokeLinecap='butt'
          strokeWidth='14'
        />
        <path
          d='M 70 15.3 A 40 40 0 0 1 90 50'
          fill='none'
          stroke={theme.palette.success.main}
          strokeLinecap='butt'
          strokeWidth='14'
        />
        <g
          transform={`translate(50, 50) rotate(${needleAngle})`}
          style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <line
            x1='0'
            y1='0'
            x2='-34'
            y2='0'
            stroke={theme.palette.text.secondary}
            strokeWidth='3'
            strokeLinecap='round'
          />
          <circle cx='0' cy='0' r='4.5' fill={theme.palette.text.secondary} />
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

  const {
    data: methods = [],
    isLoading: loadingMethods,
    error: methodsError,
  } = useMfaMethodsQuery()
  const { data: passkeys = [] } = usePasskeysListQuery()

  const disableMfaMutation = useDisableMfaMutation()
  const regenerateBackupCodesMutation = useRegenerateBackupCodesMutation()
  const stepUp = useStepUpAuth()

  const [codesModalOpen, setCodesModalOpen] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [disableModalOpen, setDisableModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const totpMethod = useMemo(() => methods.find((m) => m.type === 'totp'), [methods])
  const smsMethod = useMemo(() => methods.find((m) => m.type === 'sms'), [methods])
  const passkeyMethod = useMemo(() => methods.find((m) => m.type === 'passkey'), [methods])

  const isTotpEnabled = Boolean(totpMethod?.enabled ?? user?.mfaEnabled)
  const isSmsEnabled = Boolean(smsMethod?.enabled)
  const passkeyCount = passkeys.length || passkeyMethod?.count || 0
  const isPasskeyEnabled = passkeyCount > 0
  const isAnyMfaActive = isTotpEnabled || isSmsEnabled || isPasskeyEnabled

  const healthScore = useMemo(() => {
    let score = SCORE.baseline
    if (isPasskeyEnabled) score += SCORE.passkey
    if (isTotpEnabled) score += SCORE.totp
    if (isSmsEnabled) score += SCORE.sms
    if (isPasskeyEnabled && isTotpEnabled) score += SCORE.defenceInDepth
    return Math.min(score, 100)
  }, [isPasskeyEnabled, isTotpEnabled, isSmsEnabled])

  const healthScoreLabel = useMemo(() => {
    if (healthScore >= 80)
      return { label: t('mfa.healthExcellent', 'Excellent'), color: 'success' as const }
    if (healthScore >= 50) return { label: t('mfa.healthGood', 'Good'), color: 'warning' as const }
    return { label: t('mfa.healthNeedsAttention', 'Needs attention'), color: 'error' as const }
  }, [healthScore, t])

  const executeOpenCodesModal = useCallback(
    async (regenerate = false) => {
      try {
        setCodesModalOpen(true)
        setLoadingCodes(true)
        setError(null)

        let codes: string[] = []
        if (regenerate) {
          const res = await regenerateBackupCodesMutation.mutateAsync()
          codes = res?.recoveryCodes || []
          setSuccessMsg(t('mfa.backupRegenerated', 'New recovery codes generated.'))
        } else {
          const res = await mfaService.getRecoveryCodes()
          codes = res.data?.recoveryCodes || []
        }
        setRecoveryCodes(codes)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : ''
        setError(message || t('mfa.codesError', 'The recovery codes could not be retrieved.'))
      } finally {
        setLoadingCodes(false)
      }
    },
    [regenerateBackupCodesMutation, t],
  )

  const handleOpenCodesModal = useCallback(
    (regenerate = false) => {
      stepUp.requireStepUp(() => executeOpenCodesModal(regenerate), {
        actionName: regenerate
          ? t('mfa.regenerateCodes', 'Regenerate recovery codes')
          : t('mfa.viewCodes', 'View recovery codes'),
        actionDescription: t(
          'mfa.stepUpCodesDesc',
          'Step-up authentication is required to read your recovery codes in plain text.',
        ),
        icon: 'key',
      })
    },
    [stepUp, executeOpenCodesModal, t],
  )

  const handleDownloadCodes = useCallback(() => {
    if (!recoveryCodes.length) return
    const blob = new Blob(
      [
        `${t('mfa.downloadHeading', 'MFA recovery codes')}\n` +
          `${user?.email || ''}\n${new Date().toISOString()}\n\n` +
          recoveryCodes.join('\n'),
      ],
      { type: 'text/plain;charset=utf-8' },
    )
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'mfa-recovery-codes.txt'
    // Appended before clicking: a detached anchor is ignored by Firefox, so the
    // download silently did nothing there. Revoked on the next tick rather than
    // immediately, which can cancel the download before it starts.
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }, [recoveryCodes, user?.email, t])

  const executeDisableMfa = useCallback(async () => {
    try {
      setError(null)
      await disableMfaMutation.mutateAsync()
      setDisableModalOpen(false)
      setSuccessMsg(t('mfa.disabledSuccess', 'Two-step verification has been turned off.'))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      setError(message || t('mfa.disableError', 'Two-step verification could not be turned off.'))
    }
  }, [disableMfaMutation, t])

  const handlePromptDisableMfa = useCallback(() => {
    stepUp.requireStepUp(() => setDisableModalOpen(true), {
      actionName: t('mfa.disable', 'Turn off two-step verification'),
      actionDescription: t(
        'mfa.stepUpDisableDesc',
        'Verify your identity before removing a security factor.',
      ),
      icon: 'delete',
    })
  }, [stepUp, t])

  if (loadingMethods && !methods.length) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Skeleton variant='rectangular' height={80} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant='rectangular' height={140} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant='rectangular' height={220} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant='rectangular' height={160} sx={{ borderRadius: 3 }} />
      </Box>
    )
  }

  const bannerTone = isAnyMfaActive ? theme.palette.success : theme.palette.warning

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent='space-between'
        spacing={2}
        sx={{ mb: 3.5 }}
      >
        <Stack direction='row' spacing={2} alignItems='center'>
          <Avatar
            aria-hidden
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
            <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap' useFlexGap>
              <Typography
                component='h1'
                variant='h5'
                sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}
              >
                {t('mfa.managementTitleV2', 'Two-step verification')}
              </Typography>
              {stepUp.isElevated && (
                <Chip
                  icon={<Lock fontSize='small' />}
                  label={t('mfa.elevatedSession', {
                    minutes: Math.floor(stepUp.remainingSeconds / 60),
                    defaultValue: 'Elevated access · {{minutes}}m',
                  })}
                  color='info'
                  size='small'
                  sx={{ fontWeight: 700, height: 24 }}
                />
              )}
            </Stack>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              {t(
                'mfa.managementSubtitleV2',
                'The factors that protect your account, and the recovery codes that get you back in if you lose them.',
              )}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {successMsg && (
        <Alert
          severity='success'
          sx={{ mb: 3, borderRadius: 2.5 }}
          onClose={() => setSuccessMsg(null)}
        >
          {successMsg}
        </Alert>
      )}
      {(error || methodsError) && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setError(null)}>
          {error ||
            (methodsError instanceof Error ? methodsError.message : '') ||
            t('mfa.loadError', 'Your security settings could not be loaded.')}
        </Alert>
      )}

      {/* ── Score and protection banner ────────────────────────────────────── */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }} alignItems='stretch'>
        <Card
          variant='outlined'
          sx={{
            p: 3,
            borderRadius: 3,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            minWidth: { lg: 320 },
          }}
        >
          <SecurityHealthGauge
            score={healthScore}
            label={t('mfa.healthGaugeLabel', {
              score: healthScore,
              rating: healthScoreLabel.label,
              defaultValue: 'Security health {{score}} out of 100 — {{rating}}',
            })}
          />
          <Box>
            <Typography
              variant='caption'
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {t('mfa.healthScore', 'Security health')}
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 800, my: 0.2 }}>
              {healthScore}%
            </Typography>
            <Chip
              label={healthScoreLabel.label}
              color={healthScoreLabel.color}
              size='small'
              sx={{ fontWeight: 700, height: 22, width: 'fit-content' }}
            />
          </Box>
        </Card>

        {/*
          The banner colours were `#279051` / `#d97706` with `#ffffff` text.
          Reading the palette keeps it on the tenant's own success and warning
          channels, and `contrastText` is the colour guaranteed to be legible
          against them — white is not, if a tenant picks a pale warning.
        */}
        <Card
          sx={{
            flex: 1,
            p: 3,
            borderRadius: 3,
            bgcolor: bannerTone.main,
            color: bannerTone.contrastText,
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <Avatar
            aria-hidden
            sx={{
              width: 44,
              height: 44,
              bgcolor: bannerTone.contrastText,
              color: bannerTone.main,
            }}
          >
            {isAnyMfaActive ? <Check sx={{ fontSize: 26 }} /> : <WarningAmber sx={{ fontSize: 26 }} />}
          </Avatar>
          <Box sx={{ flex: 1, minInlineSize: 0 }}>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
              {isAnyMfaActive
                ? t('mfa.statusProtected', 'Your account uses two-step verification')
                : t('mfa.statusUnprotected', 'Two-step verification is off')}
            </Typography>
            <Typography variant='body2' sx={{ opacity: 0.92 }}>
              {isAnyMfaActive
                ? t(
                    'mfa.statusProtectedDesc',
                    'A second factor is required whenever you sign in from a new device.',
                  )
                : t(
                    'mfa.statusUnprotectedDesc',
                    'Anyone with your password can sign in. Add a passkey or an authenticator app.',
                  )}
            </Typography>
          </Box>
          {!isAnyMfaActive && (
            <Button
              variant='contained'
              onClick={() => navigate(Path.mfa.setup)}
              sx={{
                minHeight: 44,
                bgcolor: bannerTone.contrastText,
                color: bannerTone.main,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                px: 2.5,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: alpha(bannerTone.contrastText, 0.88) },
              }}
            >
              {t('mfa.enableButton', 'Turn on')}
            </Button>
          )}
        </Card>
      </Stack>

      {/* ── Factors ────────────────────────────────────────────────────────── */}
      <Card variant='outlined' sx={{ borderRadius: 3, mb: 4, borderColor: 'divider' }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.background.default, 0.4),
          }}
        >
          <Typography component='h2' variant='subtitle1' sx={{ fontWeight: 700 }}>
            {t('mfa.factorsTitle', 'Your factors')}
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
          {/*
            Four near-identical hand-rolled cards became four SecurityMethodCard
            instances — the component built for exactly this in Phase 2 and left
            unused. Each also carried a fabricated "last used" line ("Last used
            4d ago on Android", "Last used recently on macOS"), invented in the
            JSX with no field behind it. There is no last-used timestamp on the
            methods endpoint, so those lines are gone rather than reworded.
          */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SecurityMethodCard
                id='factor-passkey'
                icon={<VpnKey />}
                tone='primary'
                enabled={isPasskeyEnabled}
                title={t('mfa.yubikeyPasskeys', 'Passkeys and security keys')}
                description={t(
                  'mfa.fido2Desc',
                  'FIDO2 / WebAuthn. Phishing-resistant, and the strongest factor available.',
                )}
                status={
                  <Chip
                    label={
                      passkeyCount > 0
                        ? t('mfa.enrolledCount', {
                            count: passkeyCount,
                            defaultValue: '{{count}} enrolled',
                          })
                        : t('mfa.unconfigured', 'Not set up')
                    }
                    color={passkeyCount > 0 ? 'success' : 'default'}
                    size='small'
                    sx={{ fontWeight: 700 }}
                  />
                }
                actions={
                  <Button
                    fullWidth
                    variant='outlined'
                    onClick={() => navigate(Path.passkey.management)}
                    endIcon={<ArrowForward fontSize='small' />}
                    sx={{ minHeight: 44, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                  >
                    {t('mfa.managePasskeys', 'Manage passkeys')}
                  </Button>
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <SecurityMethodCard
                id='factor-totp'
                icon={<PhoneAndroid />}
                tone='info'
                enabled={isTotpEnabled}
                title={t('mfa.authenticatorApp', 'Authenticator app')}
                description={t(
                  'mfa.totpDescShort',
                  'Rotating six-digit codes from an app such as Google Authenticator or 1Password.',
                )}
                status={
                  <Chip
                    label={
                      isTotpEnabled
                        ? t('common.enabled', 'On')
                        : t('common.disabled', 'Off')
                    }
                    color={isTotpEnabled ? 'success' : 'default'}
                    size='small'
                    sx={{ fontWeight: 700 }}
                  />
                }
                actions={
                  isTotpEnabled ? (
                    <Button
                      fullWidth
                      variant='outlined'
                      color='error'
                      onClick={handlePromptDisableMfa}
                      startIcon={<DeleteOutline fontSize='small' />}
                      sx={{ minHeight: 44, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                    >
                      {t('mfa.disable', 'Turn off')}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant='outlined'
                      onClick={() => navigate(Path.mfa.setup)}
                      sx={{ minHeight: 44, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                    >
                      {t('mfa.setup', 'Set up')}
                    </Button>
                  )
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {/*
                Biometrics is not a separate enrolment here: a platform
                authenticator registers as a passkey, which is why this card
                reads the same state. It stays as its own card because that is
                how people look for Touch ID or Windows Hello, but it no longer
                claims an independent status.
              */}
              <SecurityMethodCard
                id='factor-biometric'
                icon={<Fingerprint />}
                tone='primary'
                enabled={isPasskeyEnabled}
                title={t('mfa.biometricTitle', 'Touch ID and Windows Hello')}
                description={t(
                  'mfa.biometricDesc',
                  'A built-in sensor registers as a passkey on this device.',
                )}
                status={
                  <Chip
                    label={
                      isPasskeyEnabled
                        ? t('common.active', 'Active')
                        : t('mfa.available', 'Available')
                    }
                    color={isPasskeyEnabled ? 'success' : 'default'}
                    size='small'
                    sx={{ fontWeight: 700 }}
                  />
                }
                actions={
                  <Button
                    fullWidth
                    variant='outlined'
                    onClick={() => navigate(Path.passkey.management)}
                    sx={{ minHeight: 44, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                  >
                    {isPasskeyEnabled
                      ? t('mfa.configure', 'Configure')
                      : t('mfa.enableSensor', 'Set up')}
                  </Button>
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <SecurityMethodCard
                id='factor-sms'
                icon={<Sms />}
                tone='warning'
                enabled={isSmsEnabled}
                title={t('mfa.smsBackup', 'SMS')}
                description={t(
                  'mfa.smsDescShort',
                  'Codes by text message. The weakest option — use it only as a fallback.',
                )}
                status={
                  <Chip
                    label={
                      isSmsEnabled ? t('common.enabled', 'On') : t('common.disabled', 'Off')
                    }
                    color={isSmsEnabled ? 'success' : 'default'}
                    size='small'
                    sx={{ fontWeight: 700 }}
                  />
                }
                actions={
                  <Button
                    fullWidth
                    variant='outlined'
                    onClick={() => navigate(Path.mfa.setup)}
                    sx={{ minHeight: 44, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                  >
                    {isSmsEnabled ? t('mfa.configure', 'Configure') : t('mfa.addPhone', 'Add a phone')}
                  </Button>
                }
              />
            </Grid>
          </Grid>

          {/* ── Recovery codes ───────────────────────────────────────────── */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent='space-between'
            spacing={2}
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.warning.main, 0.04),
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.25),
            }}
          >
            <Stack direction='row' spacing={2} alignItems='center'>
              <Avatar
                aria-hidden
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.12),
                  color: 'warning.main',
                  borderRadius: 2,
                }}
              >
                <Shield />
              </Avatar>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                  {t('mfa.backupTitle', 'Recovery codes')}
                </Typography>
                {/*
                  The chip beside this heading read "10 Codes Available" as a
                  literal, whatever the account actually held. The count is only
                  known once the codes are fetched, so it is shown then and not
                  guessed at before.
                */}
                <Typography variant='caption' color='text.secondary'>
                  {t(
                    'mfa.backupDesc',
                    'Single-use codes that sign you in if you lose your other factors.',
                  )}
                </Typography>
              </Box>
            </Stack>

            <Stack direction='row' spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant='outlined'
                onClick={() => handleOpenCodesModal(false)}
                sx={{
                  minHeight: 44,
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  flex: { xs: 1, sm: 'none' },
                }}
              >
                {t('mfa.viewCodes', 'View codes')}
              </Button>
              <Button
                variant='outlined'
                onClick={() => handleOpenCodesModal(true)}
                startIcon={<Autorenew fontSize='small' />}
                sx={{
                  minHeight: 44,
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  flex: { xs: 1, sm: 'none' },
                }}
              >
                {t('mfa.regenerateCodes', 'Regenerate')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Card>

      {/*
        What stood here:

        A "Sign-In Frequency Policy" card and a "Manage Policy" dialog — a
        toggle, a challenge-interval dropdown and a step-up switch — none of
        which were persisted anywhere. They were local useState, and saving them
        called `setPolicyDialogOpen(false)` then displayed "MFA sign-in and
        step-up frequency policy updated successfully". There is no policy
        endpoint on `mfaService` or in the hooks. So the screen told users their
        security policy had been saved, and it had not been; reloading silently
        restored the defaults. Removed rather than left, because a security
        control that lies about persisting is worse than no control.

        An "Audit Log Snippet" table of three rows — "MFA Challenge Success" on
        "macOS (Chrome)" at "2026-08-29 10:15:32 AM" and so on — built as a
        hardcoded array. It read as a genuine record of who accessed the
        account. It is replaced below by a link to the activity timeline, which
        renders the real events.
      */}
      <Card variant='outlined' sx={{ borderRadius: 3, mb: 4, borderColor: 'divider' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent='space-between'
          spacing={2}
          sx={{ p: 3 }}
        >
          <Stack direction='row' spacing={2} alignItems='center'>
            <Avatar
              aria-hidden
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.12),
                color: 'info.main',
                borderRadius: 2,
              }}
            >
              <History />
            </Avatar>
            <Box>
              <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                {t('mfa.auditSnippetTitle', 'Sign-in and security activity')}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {t(
                  'mfa.auditSnippetDesc',
                  'Every verification, sign-in and security change on this account.',
                )}
              </Typography>
            </Box>
          </Stack>
          <Button
            variant='outlined'
            onClick={() => navigate(SessionPath.activityTimeline)}
            endIcon={<ArrowForward fontSize='small' />}
            sx={{
              minHeight: 44,
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {t('mfa.viewActivity', 'View activity')}
          </Button>
        </Stack>
      </Card>

      {/* ── Recovery codes dialog ──────────────────────────────────────────── */}
      <Dialog
        open={codesModalOpen}
        onClose={() => setCodesModalOpen(false)}
        maxWidth='sm'
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {t('mfa.dialogRecoveryTitle', 'Your recovery codes')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {t(
              'mfa.dialogRecoveryDesc',
              'Each code works once. Store them in a password manager — not in the same place as your password.',
            )}
          </DialogContentText>

          {loadingCodes ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2}>
              {recoveryCodes.length > 0 && (
                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
                  {t('mfa.codesRemaining', {
                    count: recoveryCodes.length,
                    defaultValue: '{{count}} codes',
                  })}
                </Typography>
              )}
              {/*
                Copying went through a bare `navigator.clipboard.writeText` with
                no failure path and a `setTimeout` that was never cleared, so a
                dialog closed inside the two-second window set state on an
                unmounted component. AuthCopyField was built in Phase 2 for
                exactly this, and announces the copy rather than only swapping
                an icon.
              */}
              <AuthCopyField
                value={recoveryCodes.join('\n')}
                label={t('mfa.recoveryCodesLabel', 'Recovery codes')}
                copyLabel={t('mfa.copyCodes', 'Copy all codes')}
              />
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
                {recoveryCodes.map((code) => (
                  <Chip
                    key={code}
                    label={code}
                    variant='outlined'
                    // Attribute rather than a CSS declaration: stylis rewrites
                    // the value under RTL, which would reverse a code.
                    dir='ltr'
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
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            variant='outlined'
            onClick={handleDownloadCodes}
            disabled={loadingCodes || !recoveryCodes.length}
            startIcon={<Download />}
            sx={{ minHeight: 44, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            {t('mfa.downloadCodes', 'Download')}
          </Button>
          <Button
            onClick={() => setCodesModalOpen(false)}
            variant='contained'
            sx={{ minHeight: 44, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            {t('common.done', 'Done')}
          </Button>
        </DialogActions>
      </Dialog>

      {/*
        The disable confirmation was a centred dialog; it is now the shared
        slide-over used for every other destructive account action, so
        confirming a revoke looks the same wherever it happens.
      */}
      <AuthConfirmDrawer
        id='disable-mfa'
        open={disableModalOpen}
        onClose={() => setDisableModalOpen(false)}
        onConfirm={executeDisableMfa}
        loading={disableMfaMutation.isPending}
        tone='error'
        title={t('mfa.disableDialogTitle', 'Turn off two-step verification?')}
        description={t(
          'mfa.disableDialogDesc',
          'Your password alone will be enough to sign in. Anyone who learns it can reach your account.',
        )}
        confirmLabel={t('mfa.confirmDisable', 'Turn it off')}
      />

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
