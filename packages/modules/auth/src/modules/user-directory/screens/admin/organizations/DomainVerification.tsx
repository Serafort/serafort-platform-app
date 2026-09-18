import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  IconButton,
  Tooltip,
  Container,
  Grid,
  useTheme,
  alpha,
  Paper,
  Chip,
} from '@mui/material'
import Domain from '@mui/icons-material/Domain'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Info from '@mui/icons-material/Info'
import Dns from '@mui/icons-material/Dns'
import Verified from '@mui/icons-material/Verified'
import ArrowBack from '@mui/icons-material/ArrowBack'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Lock from '@mui/icons-material/Lock'
import { motion } from 'framer-motion'

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '@cap/platform-core'
import { useVerifyDomain } from '@idaas/authentication-core/hooks/useAdminQuery'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import { Path } from '@cap/module-auth/routes/path'

export default function DomainVerification() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const { addNotification } = useNotifications()

  const effects = getTenantThemeEffects(theme)
  const surfaceEffect = buildLayoutSurfaceEffect(effects, theme)

  const [domain, setDomain] = useState('auth.example.com')
  const [step, setStep] = useState(0)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const verifyDomainMutation = useVerifyDomain({
    onSuccess: () => {
      setStep(2)
      addNotification?.({
        type: 'success',
        title: t('auth.domainVerification.successTitle', 'Domain Verified'),
        message: t(
          'auth.domainVerification.successMessage',
          'Ownership of {{domain}} has been successfully validated.',
          { domain }
        ),
      })
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t('auth.domainVerification.errorDns', 'DNS verification failed.')
      addNotification?.({
        type: 'error',
        title: t('auth.domainVerification.errorTitle', 'Verification Failed'),
        message,
      })
    },
  })

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyName)
    addNotification?.({
      type: 'info',
      title: t('common.copiedToClipboard', 'Copied to Clipboard'),
      message: `${keyName} ${t('common.copiedValue', 'value copied to clipboard.')}`,
    })
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleVerifyDns = () => {
    verifyDomainMutation.mutate({ domain })
  }

  const steps = [
    t('auth.domainVerification.step1', 'Enter Hostname'),
    t('auth.domainVerification.step2', 'Configure DNS Records'),
    t('auth.domainVerification.step3', 'Verify & Enable'),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Container maxWidth='md' sx={{ py: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(Path.admin.organizations)}
            sx={{
              mb: 2.5,
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 44,
              px: 2,
              borderRadius: 'var(--sf-radius-md, 8px)',
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.action.active, 0.04),
              '&:hover': {
                bgcolor: alpha(theme.palette.action.active, 0.08),
                color: 'text.primary',
              },
            }}
          >
            {t('common.backToOrganizations', 'Back to Organizations')}
          </Button>

          <Stack direction='row' spacing={2.5} alignItems='center'>
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
              <Domain sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Stack direction='row' spacing={1.5} alignItems='center' mb={0.5} flexWrap='wrap'>
                <Typography variant='h4' fontWeight={800} letterSpacing='-0.025em'>
                  {t('auth.domainVerification.title', 'Domain Verification')}
                </Typography>
                <Chip
                  icon={<Lock sx={{ fontSize: '14px !important' }} />}
                  label={t('auth.domainVerification.sslBadge', 'SSL Auto-Provision')}
                  size='small'
                  color='primary'
                  variant='outlined'
                  sx={{ fontWeight: 700, borderRadius: 'var(--sf-radius-sm, 6px)' }}
                />
              </Stack>
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'auth.domainVerification.subtitle',
                  "Configure and verify custom white-labeled domains for your organization's authentication portal."
                )}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Stepper Header */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            px: { xs: 2, sm: 4 },
            py: 2.5,
            borderRadius: 'var(--sf-radius-md, 12px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            ...surfaceEffect,
          }}
        >
          <Stepper activeStep={step}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': { color: 'primary.main' },
                      '&.Mui-completed': { color: 'success.main' },
                    },
                  }}
                >
                  <Typography variant='body2' fontWeight={index === step ? 700 : 500}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Content Card */}
        <Card
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            ...surfaceEffect,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {/* STEP 0: Enter Domain */}
            {step === 0 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant='subtitle2' fontWeight={700} mb={1}>
                    {t('auth.domainVerification.hostnameLabel', 'Custom Hostname')}
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder='e.g. login.acme.com'
                    value={domain}
                    onChange={(e) => setDomain(e.target.value.trim())}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Domain color='action' />
                          </InputAdornment>
                        ),
                        sx: {
                          minHeight: 48,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                        },
                      },
                    }}
                    helperText={t(
                      'auth.domainVerification.hostnameHelp',
                      'Enter the fully qualified domain name (FQDN) you want to use for SSO.'
                    )}
                  />
                </Box>

                <Button
                  variant='contained'
                  size='large'
                  disabled={!domain || !domain.includes('.')}
                  onClick={() => setStep(1)}
                  sx={{
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    minHeight: 48,
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  {t('auth.domainVerification.continueToDns', 'Continue to DNS Configuration')}
                </Button>
              </Stack>
            )}

            {/* STEP 1: Configure DNS */}
            {step === 1 && (
              <Stack spacing={3.5}>
                <Alert
                  icon={<Info fontSize='inherit' />}
                  severity='info'
                  sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }}
                >
                  {t(
                    'auth.domainVerification.dnsInstructions',
                    'To verify domain ownership and provision your managed TLS certificate, add the following DNS records with your registrar or DNS provider (Cloudflare, Route53, Google Cloud DNS, etc.).'
                  )}
                </Alert>

                <Paper
                  variant='outlined'
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 'var(--sf-radius-md, 12px)',
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderColor: alpha(theme.palette.divider, 0.12),
                  }}
                >
                  <Grid container spacing={2} alignItems='center'>
                    {/* Table Header */}
                    <Grid size={{ xs: 2 }}>
                      <Typography variant='caption' fontWeight={700} color='text.secondary'>
                        TYPE
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <Typography variant='caption' fontWeight={700} color='text.secondary'>
                        HOST / NAME
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 7 }}>
                      <Typography variant='caption' fontWeight={700} color='text.secondary'>
                        VALUE / TARGET
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ opacity: 0.6 }} />
                    </Grid>

                    {/* TXT Record */}
                    <Grid size={{ xs: 2 }}>
                      <Chip
                        label='TXT'
                        size='small'
                        sx={{ fontWeight: 700, height: 24, borderRadius: 'var(--sf-radius-xs, 4px)' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <Typography variant='body2' fontFamily='monospace' fontWeight={600}>
                        _oneauth-challenge
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 7 }}>
                      <Stack
                        direction='row'
                        alignItems='center'
                        justifyContent='space-between'
                        spacing={1}
                      >
                        <Typography variant='body2' fontFamily='monospace' noWrap>
                          oneauth-verify-8f921b7c3d04
                        </Typography>
                        <Tooltip title={copiedKey === 'TXT' ? t('common.copied', 'Copied!') : t('common.copyValue', 'Copy Value')}>
                          <IconButton
                            size='small'
                            onClick={() => handleCopy('oneauth-verify-8f921b7c3d04', 'TXT')}
                            sx={{
                              minWidth: 44,
                              minHeight: 44,
                              borderRadius: 'var(--sf-radius-md, 8px)',
                            }}
                          >
                            <ContentCopy fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ opacity: 0.6 }} />
                    </Grid>

                    {/* CNAME Record */}
                    <Grid size={{ xs: 2 }}>
                      <Chip
                        label='CNAME'
                        size='small'
                        color='primary'
                        variant='outlined'
                        sx={{ fontWeight: 700, height: 24, borderRadius: 'var(--sf-radius-xs, 4px)' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <Typography variant='body2' fontFamily='monospace' fontWeight={600}>
                        {domain.split('.')[0] || 'auth'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 7 }}>
                      <Stack
                        direction='row'
                        alignItems='center'
                        justifyContent='space-between'
                        spacing={1}
                      >
                        <Typography variant='body2' fontFamily='monospace' noWrap>
                          cname.oneauth.network
                        </Typography>
                        <Tooltip title={copiedKey === 'CNAME' ? t('common.copied', 'Copied!') : t('common.copyValue', 'Copy Value')}>
                          <IconButton
                            size='small'
                            onClick={() => handleCopy('cname.oneauth.network', 'CNAME')}
                            sx={{
                              minWidth: 44,
                              minHeight: 44,
                              borderRadius: 'var(--sf-radius-md, 8px)',
                            }}
                          >
                            <ContentCopy fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    fullWidth
                    variant='outlined'
                    onClick={() => setStep(0)}
                    disabled={verifyDomainMutation.isPending}
                    sx={{
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      minHeight: 48,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    {t('auth.domainVerification.editHostname', 'Edit Hostname')}
                  </Button>
                  <Button
                    fullWidth
                    variant='contained'
                    onClick={handleVerifyDns}
                    disabled={verifyDomainMutation.isPending}
                    startIcon={
                      verifyDomainMutation.isPending ? (
                        <CircularProgress size={18} color='inherit' />
                      ) : (
                        <Dns />
                      )
                    }
                    sx={{
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      minHeight: 48,
                      fontWeight: 700,
                      textTransform: 'none',
                    }}
                  >
                    {verifyDomainMutation.isPending
                      ? t('auth.domainVerification.verifying', 'Verifying DNS Records...')
                      : t('auth.domainVerification.verifyBtn', 'Verify DNS Records')}
                  </Button>
                </Stack>
              </Stack>
            )}

            {/* STEP 2: Verified */}
            {step === 2 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 'var(--sf-radius-lg, 12px)',
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    color: theme.palette.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2.5,
                  }}
                >
                  <Verified sx={{ fontSize: 44 }} />
                </Box>
                <Typography variant='h5' fontWeight={800} gutterBottom>
                  {t('auth.domainVerification.completedTitle', 'Domain Verified & Active')}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
                >
                  {t('auth.domainVerification.completedMessagePrefix', 'Your custom domain')}{' '}
                  <strong>{domain}</strong>{' '}
                  {t(
                    'auth.domainVerification.completedMessageSuffix',
                    'is now verified, TLS encrypted, and ready to route authentication traffic for your tenant.'
                  )}
                </Typography>
                <Button
                  variant='contained'
                  size='large'
                  onClick={() => navigate(Path.admin.organizations)}
                  sx={{
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    px: 5,
                    minHeight: 48,
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  {t('auth.domainVerification.returnBtn', 'Return to Organizations')}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </motion.div>
  )
}
