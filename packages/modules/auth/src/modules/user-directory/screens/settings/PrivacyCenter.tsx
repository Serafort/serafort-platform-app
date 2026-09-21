import React, { useState } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useTheme,
  alpha,
} from '@mui/material'
import PrivacyTip from '@mui/icons-material/PrivacyTip'
import Download from '@mui/icons-material/Download'
import DeleteForever from '@mui/icons-material/DeleteForever'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import {
  useConsentsQuery,
  useRequestDataExportMutation,
  useUpdateConsentMutation,
} from '../../hooks/useComplianceQuery'
import Path from '../path'
import { CONSENT_PURPOSES, type ConsentPurpose } from '../../types/compliance.types'

/**
 * Privacy centre — the data subject's own view of what they have agreed to and
 * what they can ask for.
 *
 * Consent purposes are fixed by the backend (`UserConsent.purpose` is a union
 * and `updateConsentValidator` enforces it), so the screen offers exactly those
 * four rather than free text that would be rejected.
 *
 * Two absences are deliberate and stated rather than papered over:
 *
 * - **No terms / privacy-policy checkboxes.** Acceptance of those is not
 *   modelled as a consent record in this backend, so a toggle for them would
 *   write nothing while looking authoritative.
 * - **No re-consent prompt on a policy change.** There is no consent- or
 *   policy-version column anywhere in the backend, so a version bump cannot be
 *   detected. Rendering a "you are up to date" badge would be an assertion the
 *   system cannot actually make.
 *
 * Each decision shows when and from where it was made: the backend stamps the
 * request IP and user agent, and that record is the evidence half of Article
 * 7(1), not decoration.
 */

const PURPOSE_COPY: Record<ConsentPurpose, { title: string; body: string }> = {
  marketing: {
    title: 'Marketing',
    body: 'Product announcements and offers, sent to you directly.',
  },
  analytics: {
    title: 'Analytics',
    body: 'Usage measurement, so the product can be improved. Not used to target you.',
  },
  data_sharing: {
    title: 'Data sharing',
    body: 'Sharing your data with third parties outside what a contract or the law requires.',
  },
  newsletter: {
    title: 'Newsletter',
    body: 'The periodic newsletter. Separate from transactional email, which is not optional.',
  },
}

export const PrivacyCenter: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const effects = getTenantThemeEffects(theme)
  const surfaceEffect = buildLayoutSurfaceEffect(effects, theme)

  const consentsQuery = useConsentsQuery()
  const updateConsent = useUpdateConsentMutation()
  const exportRequest = useRequestDataExportMutation()
  const [pendingPurpose, setPendingPurpose] = useState<ConsentPurpose | null>(null)

  const consents = consentsQuery.data ?? []
  const byPurpose = new Map(consents.map((consent) => [consent.purpose, consent]))

  if (consentsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Container maxWidth='md' sx={{ py: { xs: 3, md: 5 } }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(Path.profile.view)}
          sx={{
            mb: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            minHeight: 44,
            px: 2,
            borderRadius: 'var(--sf-radius-md, 8px)',
            bgcolor: alpha(theme.palette.action.active, 0.04),
            '&:hover': {
              bgcolor: alpha(theme.palette.action.active, 0.08),
              color: 'text.primary',
            },
          }}
        >
          {t('common.backToProfile', 'Back to Profile')}
        </Button>

        <Stack direction='row' alignItems='center' spacing={2.5} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 'var(--sf-radius-lg, 16px)',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PrivacyTip sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant='h4' fontWeight={800} letterSpacing='-0.025em'>
              {t('user.privacy.title', 'Privacy & Consent')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              {t(
                'user.privacy.subtitle',
                'What you have agreed to, and the rights you can exercise over the data held about you.'
              )}
            </Typography>
          </Box>
        </Stack>

        {updateConsent.error && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 8px)' }}>
            {t('user.privacy.consent_failed', 'That preference could not be saved.')}
          </Alert>
        )}

        <Card
          variant='outlined'
          sx={{
            mb: 3,
            borderRadius: 'var(--sf-radius-lg, 16px)',
            borderColor: alpha(theme.palette.divider, 0.1),
            ...surfaceEffect,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Typography variant='h6' fontWeight={700} sx={{ mb: 0.5 }}>
              {t('user.privacy.consent_title', 'Your consent')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {t(
                'user.privacy.consent_help',
                'Each choice is recorded with the time it was made. Transactional email — sign-in codes, security alerts — is not consent-based and cannot be switched off here.'
              )}
            </Typography>
          <Divider sx={{ mb: 1 }} />

          <Stack divider={<Divider flexItem />}>
            {CONSENT_PURPOSES.map((purpose) => {
              const consent = byPurpose.get(purpose)
              const granted = consent?.isGranted ?? false
              const copy = PURPOSE_COPY[purpose]
              const busy = updateConsent.isPending && pendingPurpose === purpose

              return (
                <Stack
                  key={purpose}
                  direction='row'
                  spacing={2}
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ py: 1.5 }}
                >
                  <Box>
                    <Typography variant='body1'>
                      {t(`user.privacy.purpose.${purpose}.title`, copy.title)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {t(`user.privacy.purpose.${purpose}.body`, copy.body)}
                    </Typography>
                    {consent ? (
                      <Tooltip
                        title={
                          consent.ipAddress
                            ? t('user.privacy.recorded_from', 'Recorded from {{ip}}', {
                                ip: consent.ipAddress,
                              })
                            : ''
                        }
                      >
                        <Typography variant='caption' color='text.secondary'>
                          {t('user.privacy.decided_on', 'Last changed {{date}}', {
                            date: new Date(consent.updatedAt).toLocaleString(),
                          })}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Chip
                        size='small'
                        variant='outlined'
                        sx={{ mt: 0.5 }}
                        label={t('user.privacy.never_asked', 'No decision recorded')}
                      />
                    )}
                  </Box>
                  <Switch
                    checked={granted}
                    disabled={busy}
                    inputProps={{
                      'aria-label': t(`user.privacy.purpose.${purpose}.title`, copy.title),
                    }}
                    onChange={(event) => {
                      setPendingPurpose(purpose)
                      updateConsent.mutate({ purpose, isGranted: event.target.checked })
                    }}
                  />
                </Stack>
              )
            })}
          </Stack>
        </CardContent>
      </Card>

        <Card
          variant='outlined'
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            borderColor: alpha(theme.palette.divider, 0.1),
            ...surfaceEffect,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Typography variant='h6' fontWeight={700} sx={{ mb: 0.5 }}>
              {t('user.privacy.rights_title', 'Your data')}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent='space-between'
                alignItems={{ sm: 'center' }}
              >
                <Box>
                  <Typography variant='body1' fontWeight={600}>
                    {t('user.privacy.export_title', 'Download your data')}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t(
                      'user.privacy.export_body',
                      'Prepared in the background. You will be emailed when it is ready.'
                    )}
                  </Typography>
                </Box>
                <Button
                  startIcon={<Download />}
                  variant='outlined'
                  disabled={exportRequest.isPending}
                  onClick={() => exportRequest.mutate()}
                  sx={{
                    minHeight: 44,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {t('user.privacy.export', 'Request export')}
                </Button>
              </Stack>

              {exportRequest.data && (
                <Alert severity='success' sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }}>
                  {t(
                    'user.privacy.export_queued',
                    'Export started. You will receive an email when it is ready.'
                  )}
                </Alert>
              )}

              <Divider />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent='space-between'
                alignItems={{ sm: 'center' }}
              >
                <Box>
                  <Typography variant='body1' fontWeight={600} color='error.main'>
                    {t('user.privacy.erasure_title', 'Erase your data')}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t(
                      'user.privacy.erasure_body',
                      'Permanent and irreversible. You will be asked to confirm in writing and re-enter your password.'
                    )}
                  </Typography>
                </Box>
                <Button
                  component={RouterLink}
                  to={Path.settings.erasure}
                  color='error'
                  variant='outlined'
                  startIcon={<DeleteForever />}
                  sx={{
                    minHeight: 44,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {t('user.privacy.erasure', 'Continue')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Alert severity='info' sx={{ mt: 3, borderRadius: 'var(--sf-radius-md, 8px)' }}>
          <AlertTitle sx={{ fontWeight: 700 }}>
            {t('user.privacy.policy_versions_title', 'Policy changes')}
          </AlertTitle>
          {t(
            'user.privacy.policy_versions_body',
            'This system records what you chose and when, but does not yet version the policy those choices were made against, so it cannot tell you whether a policy has changed since. Re-consent prompts will appear here once it does.'
          )}
        </Alert>
      </Container>
    </motion.div>
  )
}

export default PrivacyCenter
