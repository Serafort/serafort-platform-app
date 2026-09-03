// Apply standard: useTranslation('auth'), scale anim, namespace keys, theme-based shadows
// All complex HRD/SSO discovery logic preserved intact.
import { useState, useMemo, useCallback } from 'react';
import { Box, Button, Typography, Card, CardContent, Avatar, alpha, useTheme, Grid, TextField, InputAdornment, Paper, Divider, Tooltip, IconButton, CircularProgress } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ShieldIcon from '@mui/icons-material/Shield';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from 'react-use';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useSsoDiscovery } from '@auth/authentication-core/hooks/useAuthQuery';
import { Path } from '@auth/routes/path';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
interface SSODiscoveryResult {
  provider: 'oidc' | 'saml' | 'google' | 'github' | 'microsoft' | 'password'
  clientId?: string; organizationId?: number; loginUrl?: string; name?: string; type?: string; url?: string
}
const MANUAL_PROVIDERS = [
  { id: 'okta', name: 'Okta', color: '#F26122', initials: 'OK' },
  { id: 'onelogin', name: 'OneLogin', color: '#000000', initials: 'OL' },
  { id: 'ping', name: 'Ping Identity', color: '#CC1619', initials: 'PI' },
] as const

export default function SSOProviderSelection() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [debouncedEmail, setDebouncedEmail] = useState('')
  const isValidEmail = useMemo(() => EMAIL_REGEX.test(email), [email])
  const emailDomain = useMemo(() => (isValidEmail ? email.split('@')[1] : ''), [email, isValidEmail])

  useDebounce(() => { if (isValidEmail) setDebouncedEmail(email); else setDebouncedEmail('') }, 400, [email, isValidEmail])

  const { data: discoveryResponse, isLoading: isDiscovering } = useSsoDiscovery(debouncedEmail)
  const discoveryData = discoveryResponse?.data as SSODiscoveryResult | undefined
  const detectedProvider = useMemo(() => {
    if (!discoveryData || discoveryData.provider === 'password') return null
    return { name: discoveryData.name || discoveryData.provider, type: (discoveryData.type || discoveryData.provider || 'SAML').toUpperCase(), url: discoveryData.url || discoveryData.loginUrl, organizationId: discoveryData.organizationId, clientId: discoveryData.clientId, icon: <BusinessIcon /> }
  }, [discoveryData])

  const handleContinue = useCallback(() => {
    if (detectedProvider?.url) { window.location.assign(detectedProvider.url) }
    else if (detectedProvider?.type === 'SAML') { navigate(`${Path.identity.samlSSOInitiation}?domain=${emailDomain}${detectedProvider.organizationId ? `&organizationId=${detectedProvider.organizationId}` : ''}`) }
    else if (detectedProvider?.type === 'OIDC') { navigate(`${Path.identity.oidcLoginPrompt}?domain=${emailDomain}${detectedProvider.clientId ? `&clientId=${detectedProvider.clientId}` : ''}`) }
    else { toast.info(t('sso.noProviderDetected', 'No SSO provider could be identified')) }
  }, [detectedProvider, emailDomain, navigate,  t])

  const handleManualProviderClick = (provider: (typeof MANUAL_PROVIDERS)[number]) => {
    if (!isValidEmail) { toast.warning(t('sso.enterEmailFirst', 'Please enter your work email first')); return }
    navigate(`${Path.identity.samlSSOInitiation}?provider=${provider.id}&domain=${emailDomain}`)
  }

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 520, mx: 'auto', p: { xs: 2, md: 4 } }}
    >
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Avatar variant="square" sx={{ width: 56, height: 56, mx: 'auto', mb: 3, bgcolor: 'transparent', color: 'primary.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
          <ShieldIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.027em', mb: 1 }}>
          {t('sso.enterpriseLoginTitle', 'Enterprise Sign-In')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('sso.hrdSubtitle', 'Enter your work email to continue to your provider')}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
              {t('common.workEmail', 'Work Email Address')}
            </Typography>
          </Box>
          <TextField fullWidth placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 4 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon color="primary" sx={{ fontSize: 20 }} /></InputAdornment>, sx: { borderRadius: 3, height: 56, fontSize: '1rem', fontWeight: 600, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />

          <AnimatePresence mode="wait">
            {detectedProvider ? (
              <motion.div key="detected" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Paper elevation={0}
                  sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Avatar sx={{ bgcolor: 'background.paper', color: 'primary.main', width: 52, height: 52, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>{detectedProvider.icon}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{detectedProvider.name}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.075em', color: 'primary.dark' }}>
                        {t('sso.detectedLabel', 'Detected')} {detectedProvider.type}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton color="primary" onClick={handleContinue} aria-label={t('sso.continueProvider', 'Continue with detected provider')}
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15), transform: 'translateX(4px)' }, transition: 'all 0.2s' }}>
                    <ArrowForwardIcon />
                  </IconButton>
                </Paper>
              </motion.div>
            ) : (
              <motion.div key="not-detected" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button fullWidth variant="contained" disabled={!isValidEmail || isDiscovering} onClick={handleContinue}
                  sx={{ height: 52, borderRadius: 3, fontSize: '1rem', fontWeight: 900, textTransform: 'none', mb: 4, bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' }, '&.Mui-disabled': { bgcolor: alpha(theme.palette.info.main, 0.12), color: alpha(theme.palette.text.primary, 0.3) } }}>
                  {isDiscovering ? <CircularProgress size={24} color="inherit" /> : t('sso.findProvider', 'Find My Provider')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Divider sx={{ mb: 4, borderStyle: 'dashed' }}>
            <Typography variant="caption" sx={{ px: 3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.disabled' }}>
              {t('sso.orSelectManually', 'Or select manually')}
            </Typography>
          </Divider>

          <Grid container spacing={2}>
            {MANUAL_PROVIDERS.map((p) => (
              <Grid key={p.id} size={{ xs: 12, sm: 4 }}>
                <Button fullWidth variant="outlined" onClick={() => handleManualProviderClick(p)}
                  sx={{ height: 80, borderRadius: 3, borderColor: 'divider', textTransform: 'none', transition: 'all 0.25s', '&:hover': { bgcolor: alpha(p.color, theme.palette.mode === 'dark' ? 0.12 : 0.06), borderColor: alpha(p.color, 0.4), transform: 'translateY(-4px)', boxShadow: `0 8px 24px ${alpha(p.color, 0.1)}` }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 900, bgcolor: alpha(p.color, theme.palette.mode === 'dark' ? 0.2 : 0.1), color: p.color, borderRadius: '8px' }}>{p.initials}</Avatar>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>{p.name}</Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Tooltip title={t('sso.whatIsSsoDesc', 'Single Sign-On allows you to access multiple applications with one set of credentials managed by your organization.')}>
          <Box tabIndex={0} role="button" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, p: 1.5, px: 3, borderRadius: '50px', bgcolor: alpha(theme.palette.action.hover, 0.04), color: 'text.secondary', cursor: 'help', transition: 'all 0.2s', '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) } }}>
            <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.075em' }}>
              {t('sso.whatIsSso', 'What is Enterprise SSO?')}
            </Typography>
          </Box>
        </Tooltip>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: 0.8 }}>
          <ShieldIcon sx={{ fontSize: 16, color: 'success.main' }} />
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'success.dark' }}>
            {t('sso.secureEncryptionTag', 'Verified & Protected')}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
