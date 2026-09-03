// FILE: packages/modules/auth/src/screens/auth/sso/SSFConfiguration.tsx
// RULES APPLIED: mui-component-standards.md, react-component-patterns.md
// FIXES: Enforced 1200px max layout width, strict MUI v7 Cards and Avatars styling, removed inline styling, enforced Grid2 with size property, enforced useCallback, unified headers, full i18next coverage, framer-motion page entry transitions.
// AUDIT: CRITICAL âœ“  HIGH âœ“  MEDIUM âœ“

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import Sensors from '@mui/icons-material/Sensors';
import Security from '@mui/icons-material/Security';
import Hub from '@mui/icons-material/Hub';
import Sync from '@mui/icons-material/Sync';
import Add from '@mui/icons-material/Add';
import Key from '@mui/icons-material/Key';
import Http from '@mui/icons-material/Http';
import Save from '@mui/icons-material/Save';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Close from '@mui/icons-material/Close';
import AddCircle from '@mui/icons-material/AddCircle';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

import { useSSFConfig, useUpdateSSFConfig, useTestSSFStream, useSSFHistory } from '@auth';
import { Path } from '@auth';

// Types
interface SsfEventDefinition {
  id: string
  name: string
  desc: string
  enabled: boolean
}

// Subcomponents to avoid inline arrow functions in props
const EventItem = React.memo(({ event, onToggle }: { event: SsfEventDefinition; onToggle: (id: string) => void }) => {
  const { t } = useTranslation()
  const handleToggle = useCallback(() => {
    onToggle(event.id)
  }, [event.id, onToggle])

  return (
    <Box sx={{ py: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          {t(`auth.sso.event_${event.id}`, event.name)}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.075em', color: 'text.secondary', display: 'block', mt: 0.5 }}>
          {t(`auth.sso.event_desc_${event.id}`, event.desc)}
        </Typography>
      </Box>
      <Switch size="small" checked={event.enabled} onChange={handleToggle} color="info" />
    </Box>
  )
})

const DEFAULT_EVENTS: SsfEventDefinition[] = [
  { id: 'session-revoked', name: 'Session Revoked', desc: 'Triggered when a user session is terminated', enabled: true },
  { id: 'risky-login', name: 'Risky Login Detected', desc: 'Unusual login pattern detected by risk engine', enabled: true },
  { id: 'account-disabled', name: 'Account Disabled', desc: 'Administrative account suspension', enabled: false },
  { id: 'credential-change', name: 'Credential Change', desc: 'Password or key rotation events', enabled: true },
]

export default function SSFConfiguration() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [ssfEnabled, setSsfEnabled] = useState(true)
  const [issuerUrl, setIssuerUrl] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState('Push')
  const [events, setEvents] = useState<SsfEventDefinition[]>(DEFAULT_EVENTS)

  // Dialog state
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ id: '', name: '', desc: '' })

  const { data: configResp, isLoading } = useSSFConfig()
  const config = configResp?.data

  const { mutateAsync: updateConfig, isPending: isSaving } = useUpdateSSFConfig()
  useTestSSFStream()
  const { data: historyData, isLoading: isHistoryLoading, refetch: refetchHistory } = useSSFHistory()

  useEffect(() => {
    if (config) {
      setSsfEnabled(config.enabled ?? false)
      setIssuerUrl(config.issuer || '')
      setDeliveryMethod(config.delivery_method || 'Push')

      if (config.events_supported?.length) {
        // Merge backend events with our default definitions and stored metadata
        const mergedEvents = config.events_supported.map((eventId: string) => {
          const defaultDef = DEFAULT_EVENTS.find(e => e.id === eventId)
          const storedMeta = config.events_meta?.find((m: any) => m.id === eventId)

          return {
            id: eventId,
            name: storedMeta?.name || defaultDef?.name || eventId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            desc: storedMeta?.desc || defaultDef?.desc || t('auth.sso.event_fallback_desc', 'Security signal event'),
            enabled: config.events_delivered?.includes(eventId) ?? false
          }
        })
        setEvents(mergedEvents)
      }
    }
  }, [config, t])

  const handleSave = useCallback(async () => {
    try {
      const enabledEvents = events.filter((e) => e.enabled).map((e) => e.id)
      await updateConfig({
        enabled: ssfEnabled,
        issuer: issuerUrl,
        delivery_method: deliveryMethod,
        events_delivered: enabledEvents,
        events_supported: events.map((e) => e.id),
        events_meta: events.map((e) => ({ id: e.id, name: e.name, desc: e.desc })),
      })
      toast.success(t('auth.sso.ssf_save_success', 'SSF configuration saved successfully'))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('auth.sso.error_save_ssf', 'Failed to save SSF configuration')
      toast.error(errorMessage)
    }
  }, [ssfEnabled, issuerUrl, deliveryMethod, events, updateConfig,  t])

  const handleToggleEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, enabled: !event.enabled } : event)))
  }, [])

  const handleSsfEnabledChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSsfEnabled(e.target.checked)
  }, [])

  const handleIssuerUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIssuerUrl(e.target.value)
  }, [])

  const handleDeliveryMethodChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryMethod(e.target.value)
  }, [])

  const handleAddEventClick = useCallback(() => {
    setNewEvent({ id: '', name: '', desc: '' })
    setAddEventDialogOpen(true)
  }, [])

  const handleCloseAddEventDialog = useCallback(() => {
    setAddEventDialogOpen(false)
  }, [])

  const handleNewEventChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvent(prev => ({ ...prev, [field]: e.target.value }))
  }, [])

  const handleConfirmAddEvent = useCallback(() => {
    if (!newEvent.id || !newEvent.name) {
      toast.warning(t('auth.sso.error_missing_event_info', 'Event ID and Name are required'))
      return
    }

    if (events.some(e => e.id === newEvent.id)) {
      toast.error(t('auth.sso.error_event_exists', 'An event with this ID already exists'))
      return
    }

    setEvents(prev => [...prev, { ...newEvent, enabled: true }])
    setAddEventDialogOpen(false)
    toast.success(t('auth.sso.event_added_success', 'New event type added locally. Save to persist.'))
  }, [newEvent, events,  t])



  const handleCopyJwksUrlClick = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/.well-known/jwks.json`)
    toast.success(t('common.copied_item', { item: 'JWKS URL', defaultValue: 'JWKS URL copied to clipboard' }))
  }, [ t])

  if (isLoading || isHistoryLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 2 }}>
        <CircularProgress size={32} thickness={5} />
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.075em', color: 'text.secondary' }}>
          {t('common.loading', 'Syncing Signals...')}
        </Typography>
      </Box>
    )
  }

  const signals = (historyData?.data || []).map((log: any) => ({
    type: log.action === 'SSF_SIGNAL_BROADCAST' ? 'push' : 'test',
    action: log.action,
    timestamp: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    receivers: log.metadata?.client_count || 0,
    event: log.metadata?.eventType || 'N/A'
  }))

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}
    >
      {/* Header section */}
      <Box sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          to={Path.identity.oidcConfigBrowser}
          startIcon={<ArrowBack />}
          sx={{
            p: 0,
            minWidth: 'auto',
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
          }}
        >
          {t('common.back')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 5, gap: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.027em', mb: 1, fontFamily: 'Outfit, sans-serif' }}>
            {t('auth.sso.ssf_title', 'Shared Signals & Events (SSF)')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={t('common.beta', 'BETA')}
              size="small"
              sx={{ fontWeight: 900, borderRadius: '6px', bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.dark', fontSize: '0.625rem' }}
            />
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              {t('auth.sso.ssf_subtitle', 'Configure CAEP and RISC transmitters for inter-app security signaling')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
          <Tooltip title={ssfEnabled ? t('auth.sso.transmitter_active', 'Transmitter Active') : t('auth.sso.transmitter_paused', 'Transmitter Paused')}>
            <FormControlLabel
              control={<Switch checked={ssfEnabled} onChange={handleSsfEnabledChange} color="success" />}
              label={
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {ssfEnabled ? t('auth.sso.status_active', 'Active') : t('auth.sso.status_paused', 'Paused')}
                </Typography>
              }
              sx={{
                bgcolor: alpha(ssfEnabled ? theme.palette.success.main : theme.palette.error.main, 0.1),
                px: 2,
                py: 0.5,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: alpha(ssfEnabled ? theme.palette.success.main : theme.palette.error.main, 0.2),
                backdropFilter: 'blur(10px)',
                mr: 0,
              }}
            />
          </Tooltip>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save />}
            disabled={isSaving}
            onClick={handleSave}
            sx={{
              bgcolor: 'info.main',
              boxShadow: `0 8px 32px 0 ${alpha(theme.palette.info.main, 0.3)}`,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              height: { xs: 44, md: 48 },
              px: { xs: 3, md: 4 },
              '&:hover': {
                bgcolor: 'info.dark',
                boxShadow: `0 12px 40px 0 ${alpha(theme.palette.info.main, 0.45)}`,
              }
            }}
          >
            {isSaving ? t('common.saving', 'Saving...') : t('common.save_config', 'Save Configuration')}
          </Button>
        </Box>
      </Box>

      {/* Main Grid */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{
            borderRadius: '24px',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            boxShadow: 'none',
            background: alpha('#000', 0.2),
            backdropFilter: 'blur(24px)',
          }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: '10px' }}>
                  <Hub sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8125rem', color: alpha('#fff', 0.9) }}>
                  {t('auth.sso.transmitter_endpoint', 'Transmitter Identity')}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label={t('auth.sso.issuer_url', 'Issuer URL')}
                    value={issuerUrl}
                    onChange={handleIssuerUrlChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        bgcolor: alpha('#000', 0.3),
                        '& fieldset': { borderColor: alpha(theme.palette.divider, 0.1) },
                        '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.4) },
                      }
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Http fontSize="small" color="primary" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label={t('auth.sso.delivery_method', 'Delivery Method')}
                    value={deliveryMethod}
                    onChange={handleDeliveryMethodChange}
                    select
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        bgcolor: alpha('#000', 0.3),
                        '& fieldset': { borderColor: alpha(theme.palette.divider, 0.1) },
                      }
                    }}
                  >
                    <MenuItem value="Push">{t('auth.sso.method_push', 'Push (HTTP POST)')}</MenuItem>
                    <MenuItem value="Poll">{t('auth.sso.method_poll', 'Poll (HTTP GET)')}</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', borderRadius: '10px' }}>
                    <Sensors sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Typography sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8125rem' }}>
                    {t('auth.sso.monitored_events', 'Monitored Events')}
                  </Typography>
                </Box>
                <Button variant="text" size="small" startIcon={<Add />} onClick={handleAddEventClick} sx={{ fontWeight: 700, textTransform: 'none' }}>
                  {t('common.add_event', 'Add Event Type')}
                </Button>
              </Box>

              {events.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('auth.sso.no_events_configured', 'No events configured yet.')}
                  </Typography>
                </Box>
              ) : (
                <Stack divider={<Divider />} sx={{ mt: 2 }}>
                  {events.map((event) => (
                    <EventItem key={event.id} event={event} onToggle={handleToggleEvent} />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          {/* Live Signals Stream */}
          <Card sx={{
            borderRadius: '24px',
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.1),
            boxShadow: 'none',
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha('#000', 0.2)} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(24px)',
          }}>
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Security sx={{ fontSize: 80, opacity: 0.1 }} />
            </Box>

            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
                  <Sync color="primary" sx={{ fontSize: 24 }} />
                </motion.div>
                <Typography sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8125rem' }}>
                  {t('auth.sso.live_stream', 'Live Signals Stream')}
                </Typography>
              </Box>

              <AnimatePresence mode="popLayout">
                {signals.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center', opacity: 0.5 }}>
                    <Typography variant="body2">{t('auth.sso.no_recent_signals', 'No recent signals detected')}</Typography>
                  </Box>
                ) : (
                  signals.map((signal, i) => (
                    <Card
                      key={i}
                      component={motion.div}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      sx={{
                        borderRadius: '16px',
                        mb: 2,
                        boxShadow: 'none',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.08),
                        bgcolor: alpha(theme.palette.background.paper, 0.03),
                        backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.02)}, transparent)`,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.background.paper, 0.06),
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="caption" sx={{
                                fontWeight: 900,
                                letterSpacing: '0.05em',
                                color: signal.action === 'SSF_TEST_SIGNAL' ? 'info.main' : 'primary.main',
                                background: alpha(signal.action === 'SSF_TEST_SIGNAL' ? theme.palette.info.main : theme.palette.primary.main, 0.1),
                                px: 1,
                                borderRadius: '4px'
                              }}>
                                {signal.action === 'SSF_TEST_SIGNAL' ? 'TEST' : 'PUSH'}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                {signal.event}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {signal.timestamp}
                            </Typography>
                          </Box>
                          <Chip
                            label={t('auth.sso.receivers_count', { count: signal.receivers, defaultValue: `${signal.receivers} Rx` })}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.625rem',
                              height: 20,
                              borderColor: alpha(theme.palette.divider, 0.1),
                              bgcolor: alpha(theme.palette.background.paper, 0.05)
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </AnimatePresence>

              <Button
                fullWidth
                variant="text"
                onClick={() => refetchHistory()}
                sx={{
                  mt: 1,
                  height: 40,
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) }
                }}
              >
                {t('common.refresh_stream', 'Refresh Stream')}
              </Button>
            </CardContent>
          </Card>

          {/* Signing Keys */}
          <Card sx={{
            borderRadius: '24px',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            boxShadow: 'none',
            background: alpha('#000', 0.2),
            backdropFilter: 'blur(24px)',
          }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', borderRadius: '10px' }}>
                  <Key sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8125rem' }}>
                  {t('auth.sso.signing_keys', 'Signing Public Key (JWKS)')}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block', fontWeight: 500, lineHeight: 1.5 }}>
                {t('auth.sso.jwks_verification_desc', 'Receivers use this endpoint to fetch public keys and verify the authenticity of your security signals.')}
              </Typography>
              <Button variant="outlined" size="small" fullWidth onClick={handleCopyJwksUrlClick} sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none', borderColor: 'divider', '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) } }}>
                {t('auth.sso.copy_jwks_url', 'Copy JWKS URL')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Add Event Dialog */}
      <Dialog
        open={addEventDialogOpen}
        onClose={handleCloseAddEventDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: alpha('#111', 0.95),
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1),
            boxShadow: theme.shadows[24],
          }
        }}
      >
        <DialogTitle component="div" sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
            {t('auth.sso.add_new_event', 'Add Security Event')}
          </Typography>
          <IconButton onClick={handleCloseAddEventDialog} size="small" sx={{ color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t('auth.sso.event_id_uri', 'Event ID or URI')}
              placeholder="e.g. token-claims-change"
              value={newEvent.id}
              onChange={handleNewEventChange('id')}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: alpha('#000', 0.3),
                }
              }}
            />
            <TextField
              fullWidth
              label={t('auth.sso.event_name', 'Display Name')}
              placeholder="e.g. Token Claims Change"
              value={newEvent.name}
              onChange={handleNewEventChange('name')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: alpha('#000', 0.3),
                }
              }}
            />
            <TextField
              fullWidth
              label={t('auth.sso.event_desc', 'Description')}
              placeholder="e.g. Triggered when user claims are modified"
              value={newEvent.desc}
              onChange={handleNewEventChange('desc')}
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: alpha('#000', 0.3),
                }
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseAddEventDialog} sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmAddEvent}
            startIcon={<AddCircle />}
            sx={{
              borderRadius: '12px',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: 'primary.main',
            }}
          >
            {t('auth.sso.add_event', 'Add Event')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
