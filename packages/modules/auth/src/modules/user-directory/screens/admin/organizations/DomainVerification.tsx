// DomainVerification.tsx
// High-fidelity Custom Domain & DNS Verification Dashboard matching profile.tsx design system

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

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '@cap/platform-core'
import { useVerifyDomain } from '@idaas/authentication-core/hooks/useAdminQuery'

export default function DomainVerification() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const { addNotification } = useNotifications()

  const [domain, setDomain] = useState('auth.example.com')
  const [step, setStep] = useState(0)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const verifyDomainMutation = useVerifyDomain({
    onSuccess: () => {
      setStep(2)
      addNotification?.({
        type: 'success',
        title: 'Domain Verified',
        message: `Ownership of ${domain} has been successfully validated.`,
      })
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'DNS verification failed.'
      addNotification?.({
        type: 'error',
        title: 'Verification Failed',
        message,
      })
    },
  })

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyName)
    addNotification?.({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${keyName} value copied to clipboard.`,
    })
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleVerifyDns = () => {
    verifyDomainMutation.mutate({ domain })
  }

  const steps = ['Enter Hostname', 'Configure DNS Records', 'Verify & Enable']

  return (
    <Container maxWidth='md' sx={{ py: { xs: 3, md: 5 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/organizations')}
          sx={{
            mb: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            p: 0,
            minWidth: 0,
            '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
          }}
        >
          Back to Organizations
        </Button>
        <Stack direction='row' spacing={1.5} alignItems='center' mb={0.5}>
          <Typography variant='h4' fontWeight={800} letterSpacing='-0.025em'>
            Domain Verification
          </Typography>
          <Chip
            icon={<Lock sx={{ fontSize: '14px !important' }} />}
            label='SSL Auto-Provision'
            size='small'
            color='primary'
            variant='outlined'
            sx={{ fontWeight: 700 }}
          />
        </Stack>
        <Typography variant='body2' color='text.secondary'>
          Configure and verify custom white-labeled domains for your organization&apos;s
          authentication portal.
        </Typography>
      </Box>

      {/* Stepper Header */}
      <Stepper activeStep={step} sx={{ mb: 5 }}>
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

      {/* Content Card */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          {/* STEP 0: Enter Domain */}
          {step === 0 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} mb={1}>
                  Custom Hostname
                </Typography>
                <TextField
                  fullWidth
                  placeholder='e.g. login.acme.com'
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.trim())}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Domain color='action' />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
                  }}
                  helperText='Enter the fully qualified domain name (FQDN) you want to use for SSO.'
                />
              </Box>

              <Button
                variant='contained'
                size='large'
                disabled={!domain || !domain.includes('.')}
                onClick={() => setStep(1)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Continue to DNS Configuration
              </Button>
            </Stack>
          )}

          {/* STEP 1: Configure DNS */}
          {step === 1 && (
            <Stack spacing={3.5}>
              <Alert icon={<Info fontSize='inherit' />} severity='info' sx={{ borderRadius: 2 }}>
                To verify domain ownership and provision your managed TLS certificate, add the
                following DNS records with your registrar or DNS provider (Cloudflare, Route53,
                Google Cloud DNS, etc.).
              </Alert>

              <Paper
                variant='outlined'
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderColor: alpha(theme.palette.divider, 0.15),
                }}
              >
                <Grid container spacing={2}>
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
                    <Chip label='TXT' size='small' sx={{ fontWeight: 700, height: 22 }} />
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
                      <Tooltip title={copiedKey === 'TXT' ? 'Copied!' : 'Copy Value'}>
                        <IconButton
                          size='small'
                          onClick={() => handleCopy('oneauth-verify-8f921b7c3d04', 'TXT')}
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
                      sx={{ fontWeight: 700, height: 22 }}
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
                      <Tooltip title={copiedKey === 'CNAME' ? 'Copied!' : 'Copy Value'}>
                        <IconButton
                          size='small'
                          onClick={() => handleCopy('cname.oneauth.network', 'CNAME')}
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
                  sx={{ borderRadius: 2, py: 1.3, fontWeight: 600, textTransform: 'none' }}
                >
                  Edit Hostname
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
                  sx={{ borderRadius: 2, py: 1.3, fontWeight: 700, textTransform: 'none' }}
                >
                  {verifyDomainMutation.isPending
                    ? 'Verifying DNS Records...'
                    : 'Verify DNS Records'}
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
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
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
                Domain Verified & Active
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
              >
                Your custom domain <strong>{domain}</strong> is now verified, TLS encrypted, and
                ready to route authentication traffic for your tenant.
              </Typography>
              <Button
                variant='contained'
                size='large'
                onClick={() => navigate('/admin/organizations')}
                sx={{ borderRadius: 2, px: 5, py: 1.3, fontWeight: 700, textTransform: 'none' }}
              >
                Return to Organizations
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
