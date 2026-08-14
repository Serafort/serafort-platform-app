import { Box, Typography, Paper, alpha } from '@mui/material';
import { AuthPageLayout } from '@idaas/authentication-core/components/shared/auth';
import Engineering from '@mui/icons-material/Engineering';
import Construction from '@mui/icons-material/Construction';
import Info from '@mui/icons-material/Info';

import { useTranslation } from 'react-i18next';
import { themeConfig } from '@cap/platform-core';

export default function MaintenanceScreen() {
  const { t } = useTranslation('auth')

  return (
    <AuthPageLayout maxWidth={600}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 5, position: 'relative' }}>
        <Engineering sx={{ fontSize: 120, color: (t) => alpha(t.palette.primary.main, 0.1) }} />
        <Construction
          sx={{ fontSize: 64, color: 'primary.main', position: 'absolute', animation: 'hammer 2s infinite ease-in-out', '@keyframes hammer': { '0%': { transform: 'rotate(0deg)' }, '50%': { transform: 'rotate(-20deg)' }, '100%': { transform: 'rotate(0deg)' } } }}
        />
      </Box>

      <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.04em' }}>
        {t('system.maintenanceHeading', 'Scheduled Maintenance')}
      </Typography>
      <Typography variant="h6" sx={{ mb: 5, color: 'text.secondary', fontWeight: 500, lineHeight: 1.6, maxWidth: 500, mx: 'auto' }}>
        {t('system.maintenanceDescription', "We're performing a planned update to improve our services. We'll be back online shortly.")}
      </Typography>

      <Paper elevation={0}
        sx={{ p: 3, borderRadius: 3, bgcolor: (t) => alpha(t.palette.info.main, 0.05), border: '1px solid', borderColor: (t) => alpha(t.palette.info.main, 0.1), display: 'flex', alignItems: 'flex-start', gap: 2, textAlign: 'left', mx: 'auto', maxWidth: 440 }}>
        <Info sx={{ color: 'info.main', flexShrink: 0, mt: 0.5 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {t('system.maintenanceExpectedTitle', 'Expected downtime')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('system.maintenanceExpectedDesc', 'The maintenance is scheduled to conclude in approximately 45 minutes. Thank you for your patience.')}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mt: 6 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {themeConfig.templateName} {t('system.statusPage', 'Status Page')}:{' '}
          <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
            status.example.com
          </Box>
        </Typography>
      </Box>
    </AuthPageLayout>
  )
}

