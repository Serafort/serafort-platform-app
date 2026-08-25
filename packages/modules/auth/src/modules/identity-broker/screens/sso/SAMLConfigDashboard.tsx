import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Card, CardContent, Grid, TextField, Switch, FormControlLabel, alpha, useTheme, Chip, Avatar, Stack, IconButton, CircularProgress, Alert, Divider } from '@mui/material';
import Save from '@mui/icons-material/Save';
import Security from '@mui/icons-material/Security';
import Language from '@mui/icons-material/Language';
import SwapHoriz from '@mui/icons-material/SwapHoriz';
import Fingerprint from '@mui/icons-material/Fingerprint';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Add from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import ContentCopy from '@mui/icons-material/ContentCopy';
import CloudDownload from '@mui/icons-material/CloudDownload';
import Explore from '@mui/icons-material/Explore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSAMLConfig, useUpdateSAMLConfig, Path } from '@auth';

export default function SAMLConfigDashboard() {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: configResponse, isLoading, isError, error } = useSAMLConfig()
  const updateConfig = useUpdateSAMLConfig({
    onSuccess: () => {
      toast.info(t('auth.sso.config_saved', 'Configuration saved successfully'))
    },
    onError: (err: any) => {
      toast.error(err?.message || t('auth.sso.save_failed', 'Failed to save configuration'), {})
    },
  })

  const [settings, setSettings] = useState({
    enabled: true,
    entityId: '',
    acsUrl: '',
    sloUrl: '',
    ssoUrl: '',
    nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    wantAssertionsSigned: true,
    wantResponseSigned: false,
    certificate: '',
    attributeMapping: {} as Record<string, string>,
  })

  const [newMapping, setNewMapping] = useState({ saml: '', internal: '' })

  useEffect(() => {
    if (configResponse?.data) {
      const cfg = configResponse.data
      setSettings({
        enabled: cfg.enabled ?? true,
        entityId: cfg.entityId ?? '',
        acsUrl: cfg.acsUrl ?? '',
        sloUrl: cfg.sloUrl ?? '',
        ssoUrl: cfg.ssoUrl ?? '',
        nameIdFormat: cfg.nameIdFormat ?? 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        wantAssertionsSigned: cfg.wantAssertionsSigned ?? true,
        wantResponseSigned: cfg.wantResponseSigned ?? false,
        certificate: cfg.certificate ?? '',
        attributeMapping: cfg.attributeMapping ?? {},
      })
    }
  }, [configResponse])

  const handleSave = () => {
    updateConfig.mutate(settings)
  }

  const handleAddMapping = () => {
    if (!newMapping.saml || !newMapping.internal) return
    setSettings((prev) => ({
      ...prev,
      attributeMapping: {
        ...prev.attributeMapping,
        [newMapping.saml]: newMapping.internal,
      },
    }))
    setNewMapping({ saml: '', internal: '' })
  }

  const handleRemoveMapping = (key: string) => {
    setSettings((prev) => {
      const newMapping = { ...prev.attributeMapping }
      delete newMapping[key]
      return { ...prev, attributeMapping: newMapping }
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast(t('common.copied', 'Copied to clipboard'))
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error' variant='filled'>
          {error?.message || t('auth.sso.load_failed', 'Failed to load configuration')}
        </Alert>
      </Container>
    )
  }

  return (
    <Container
      maxWidth='lg'
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ py: { xs: 2, md: 4 } }}
    >
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: { xs: 56, md: 80 },
                height: { xs: 56, md: 80 },
                borderRadius: '24px',
                bgcolor: 'primary.main',
                boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Security sx={{ fontSize: { xs: '1.5rem', md: '2.5rem' } }} />
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                width: 24,
                height: 24,
                bgcolor: settings.enabled ? 'success.main' : 'text.disabled',
                borderRadius: '50%',
                border: '4px solid',
                borderColor: 'background.paper',
              }}
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  p: 0,
                  minWidth: 'auto',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.027em',
                  fontFamily: 'Outfit, Inter, sans-serif',
                  fontSize: { xs: '1.5rem', md: '2.125rem' },
                }}
              >
                {t('auth.sso.saml_config_title', 'SAML 2.0 Identity Provider')}
              </Typography>
            </Box>
            <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'auth.sso.saml_config_subtitle',
                  'Configure system-wide SAML 2.0 federation settings',
                )}
              </Typography>
              <Chip
                label='SAML IdP'
                size='small'
                color='primary'
                variant='outlined'
                sx={{ fontWeight: 700, height: 20 }}
              />
            </Stack>
          </Box>
        </Box>
        <Button
          variant='contained'
          startIcon={<Save />}
          onClick={handleSave}
          disabled={updateConfig.isPending}
          sx={{
            bgcolor: 'info.main',
            color: 'white',
            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
            '&:hover': { bgcolor: 'info.dark' },
            textTransform: 'none',
            fontWeight: 700,
            height: 44,
            borderRadius: '12px',
            px: 4,
          }}
        >
          {updateConfig.isPending ? <CircularProgress size={24} /> : t('common.save_changes', 'Save Changes')}
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* General Settings */}
            <Card
              sx={{
                borderRadius: '24px',
                bgcolor: alpha('#000', 0.2),
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                boxShadow: 'none',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), display: 'flex', alignItems: 'center', gap: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: '8px' }}>
                  <Language sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8125rem' }}>
                  {t('auth.sso.general_settings', 'General Federation Settings')}
                </Typography>
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enabled}
                          onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                          color='info'
                        />
                      }
                      label={
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {t('auth.sso.enable_saml_idp', 'Enable SAML 2.0 Identity Provider flow')}
                        </Typography>
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('auth.sso.issuer_uri', 'Issuer / Entity ID URI')}
                      value={settings.entityId}
                      onChange={(e) => setSettings({ ...settings, entityId: e.target.value })}
                      variant='outlined'
                      placeholder="https://your-domain.com/saml/metadata"
                      helperText={t('auth.sso.issuer_desc', 'Unique identifier for your Identity Provider.')}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: alpha('#000', 0.4),
                          '& fieldset': { borderColor: alpha(theme.palette.divider, 0.05) },
                          '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.2) },
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('auth.sso.acs_url', 'ACS URL (Assertion Consumer Service)')}
                      value={settings.acsUrl}
                      onChange={(e) => setSettings({ ...settings, acsUrl: e.target.value })}
                      variant='outlined'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: alpha('#000', 0.4),
                          '& fieldset': { borderColor: alpha(theme.palette.divider, 0.05) },
                          '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.2) },
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('auth.sso.sso_url', 'SSO URL (Single Sign-On)')}
                      value={settings.ssoUrl}
                      onChange={(e) => setSettings({ ...settings, ssoUrl: e.target.value })}
                      variant='outlined'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: alpha('#000', 0.4),
                          '& fieldset': { borderColor: alpha(theme.palette.divider, 0.05) },
                          '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.2) },
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Attribute Mapping */}
            <Card
              sx={{
                borderRadius: '24px',
                bgcolor: alpha('#000', 0.2),
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                boxShadow: 'none',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), display: 'flex', alignItems: 'center', gap: 2, bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', borderRadius: '8px' }}>
                  <SwapHoriz sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8125rem' }}>
                  {t('auth.sso.attribute_mapping', 'Attribute Mapping')}
                </Typography>
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 4, fontWeight: 500 }}>
                  {t('auth.sso.mapping_desc', 'Map internal user attributes to SAML assertion attributes.')}
                </Typography>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  <AnimatePresence>
                    {Object.entries(settings.attributeMapping).map(([saml, internal]) => (
                      <Box
                        key={saml}
                        component={motion.div}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 1.5,
                          borderRadius: '12px',
                          border: '1px solid',
                          borderColor: alpha(theme.palette.divider, 0.05),
                          bgcolor: alpha('#000', 0.4),
                        }}
                      >
                        <TextField
                          size='small'
                          label="SAML Attribute"
                          value={saml}
                          disabled
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              bgcolor: alpha('#000', 0.2),
                              '& fieldset': { borderColor: alpha(theme.palette.divider, 0.05) },
                            }
                          }}
                        />
                        <ArrowForward sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <TextField
                          size='small'
                          label="Internal Field"
                          value={internal}
                          disabled
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              bgcolor: alpha('#000', 0.2),
                              '& fieldset': { borderColor: alpha(theme.palette.divider, 0.05) },
                            }
                          }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveMapping(saml)}
                          sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </AnimatePresence>
                </Stack>

                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: alpha('#000', 0.4),
                    border: '1px dashed',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  }}
                >
                  <Typography variant='subtitle2' sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                    {t('auth.sso.add_new_mapping', 'Add New Attribute Mapping')}
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. email or urn:oid:..."
                        value={newMapping.saml}
                        onChange={(e) => setNewMapping({ ...newMapping, saml: e.target.value })}
                        label="SAML Attribute Name"
                        sx={{
                          bgcolor: alpha('#000', 0.4),
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: alpha(theme.palette.divider, 0.05) },
                            '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.2) },
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Local Field"
                        value={newMapping.internal}
                        onChange={(e) => setNewMapping({ ...newMapping, internal: e.target.value })}
                        label="Internal User Field"
                        sx={{
                          bgcolor: alpha('#000', 0.4),
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: alpha(theme.palette.divider, 0.05) },
                            '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.2) },
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleAddMapping}
                        disabled={!newMapping.saml || !newMapping.internal}
                        sx={{ height: 40, borderRadius: '8px', boxShadow: 'none' }}
                      >
                        <Add />
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Metadata Section */}
            <Card
              sx={{
                borderRadius: '24px',
                bgcolor: alpha('#000', 0.2),
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', borderRadius: '10px' }}>
                    <Explore sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Typography sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8125rem' }}>
                    {t('auth.sso.metadata_discovery', 'Metadata Discovery')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {t('auth.sso.metadata_discovery_desc', 'Explore and discover available Identity Provider configurations from public metadata stores.')}
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Explore />}
                  onClick={() => navigate(Path.identity.samlMetadataBrowser)}
                  sx={{
                    borderRadius: '12px',
                    height: 44,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: alpha(theme.palette.info.main, 0.3),
                    '&:hover': {
                      borderColor: 'info.main',
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                    }
                  }}
                >
                  {t('auth.sso.open_discovery', 'Open Metadata Browser')}
                </Button>

                <Divider sx={{ my: 3 }} />

                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<CloudDownload />}
                    onClick={() => window.open('/api/admin/saml/metadata', '_blank')}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {t('auth.sso.download_xml', 'Download XML')}
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => copyToClipboard(`${window.location.origin}/api/admin/saml/metadata`)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {t('auth.sso.copy_link', 'Copy Link')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Certificates Section */}
            <Card
              sx={{
                p: 3,
                borderRadius: '24px',
                bgcolor: alpha('#000', 0.2),
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                boxShadow: 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: '10px' }}>
                  <Fingerprint sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8125rem' }}>
                  {t('auth.sso.active_certificates', 'Active Certificates')}
                </Typography>
              </Box>

              <Stack spacing={2}>
                {[
                  { label: 'Prod Signing Key', expires: 'Dec 20, 2026', status: 'PRIMARY', color: 'success' },
                  { label: 'Next-Gen Rotation Key', expires: 'Pending Activation', status: 'STANDBY', color: 'info' },
                ].map((cert) => (
                  <Box
                    key={cert.label}
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.05),
                      bgcolor: alpha('#000', 0.4),
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
                        {cert.label}
                      </Typography>
                      <Chip
                        label={cert.status}
                        size='small'
                        color={cert.color as any}
                        sx={{ borderRadius: '6px', fontWeight: 900, height: 18, fontSize: '0.6rem', letterSpacing: '0.05em' }}
                      />
                    </Box>
                    <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                      {t('auth.sso.expires', 'Expires')}: {cert.expires}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Button
                fullWidth
                variant='outlined'
                onClick={() => navigate(Path.identity.jwksManagement)}
                sx={{
                  mt: 3,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  height: 44,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
              >
                {t('auth.sso.manage_keys', 'Manage Key Pairs')}
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  )
}

