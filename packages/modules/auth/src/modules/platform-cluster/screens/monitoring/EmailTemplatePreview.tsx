import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Paper,
  Chip,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material'
import Smartphone from '@mui/icons-material/Smartphone';
import Laptop from '@mui/icons-material/Laptop';
import Visibility from '@mui/icons-material/Visibility';
import History from '@mui/icons-material/History';
import Edit from '@mui/icons-material/Edit';
import Code from '@mui/icons-material/Code';
import { useTranslation } from 'react-i18next'

export default function EmailTemplatePreview() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [view, setView] = useState<'preview' | 'code'>('preview')

  const templates = [
    { id: 'welcome', name: 'Welcome Onboarding', version: 'v2.4', lastEdited: '2 days ago' },
    {
      id: 'password_reset',
      name: 'Security: Password Reset',
      version: 'v1.8',
      lastEdited: '1 week ago',
    },
    {
      id: 'mfa_code',
      name: 'Security: MFA Verification',
      version: 'v3.1',
      lastEdited: '5 hours ago',
    },
  ]

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 900, mb: 1 }}>
            {t('auth.admin.emailPreviewTitle')}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {t('auth.admin.emailPreviewSubtitle')}
          </Typography>
        </Box>
        <Stack direction='row' spacing={2}>
          <Button
            variant='outlined'
            startIcon={<History />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {t('auth.admin.versionHistory')}
          </Button>
          <Button
            variant='contained'
            startIcon={<Edit />}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, boxShadow: 'none' }}
          >
            {t('auth.admin.editTemplate')}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Left Sidebar: Template List */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={2}>
            {templates.map((template) => (
              <Card
                key={template.id}
                sx={{
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: template.id === 'mfa_code' ? 'primary.main' : 'divider',
                  boxShadow: 'none',
                  bgcolor:
                    template.id === 'mfa_code'
                      ? alpha(theme.palette.primary.main, 0.05)
                      : 'background.paper',
                  transition: '0.2s',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
                    {template.name}
                  </Typography>
                  <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label={template.version}
                      size='small'
                      sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700 }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      {template.lastEdited}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        {/* Main Content: Preview Canvas */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              minHeight: 600,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Canvas Toolbar */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Stack direction='row' spacing={1}>
                <Button
                  size='small'
                  startIcon={<Visibility />}
                  variant={view === 'preview' ? 'contained' : 'text'}
                  onClick={() => setView('preview')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: 'none',
                  }}
                >
                  {t('auth.admin.preview')}
                </Button>
                <Button
                  size='small'
                  startIcon={<Code />}
                  variant={view === 'code' ? 'contained' : 'text'}
                  onClick={() => setView('code')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: 'none',
                  }}
                >
                  {t('auth.admin.source')}
                </Button>
              </Stack>

              <Stack
                direction='row'
                spacing={1}
                sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 2 }}
              >
                <Tooltip title={t('auth.admin.desktopView')}>
                  <IconButton
                    size='small'
                    color={device === 'desktop' ? 'primary' : 'default'}
                    onClick={() => setDevice('desktop')}
                  >
                    <Laptop fontSize='small' />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('auth.admin.mobileView')}>
                  <IconButton
                    size='small'
                    color={device === 'mobile' ? 'primary' : 'default'}
                    onClick={() => setDevice('mobile')}
                  >
                    <Smartphone fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            {/* Preview Area */}
            <Box
              sx={{
                flexGrow: 1,
                bgcolor: alpha(theme.palette.action.hover, 0.2),
                p: 4,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Paper
                elevation={4}
                sx={{
                  width: device === 'mobile' ? 375 : '100%',
                  maxWidth: 800,
                  height: 'fit-content',
                  minHeight: 500,
                  bgcolor: 'white',
                  borderRadius: device === 'mobile' ? 6 : 1,
                  border: device === 'mobile' ? '12px solid #1a1a1a' : 'none',
                  overflow: 'hidden',
                  transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Mock Email Content */}
                <Box sx={{ p: 4, color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant='h5' sx={{ fontWeight: 900, color: 'primary.main' }}>
                      ACME CORP
                    </Typography>
                  </Box>
                  <Typography variant='h6' sx={{ mb: 2, fontWeight: 800 }}>
                    MFA Verification Code
                  </Typography>
                  <Typography variant='body2' sx={{ mb: 4, color: '#666', lineHeight: 1.6 }}>
                    A sign-in attempt was made from a new device. Please use the following code to
                    verify your identity. If this wasn&rsquo;t you, secure your account immediately.
                  </Typography>
                  <Box
                    sx={{ p: 3, bgcolor: '#f4f7f9', borderRadius: 2, textAlign: 'center', mb: 4 }}
                  >
                    <Typography
                      variant='h3'
                      sx={{ letterSpacing: 8, fontWeight: 900, color: 'primary.main' }}
                    >
                      829 104
                    </Typography>
                    <Typography variant='caption' sx={{ mt: 1, display: 'block', color: '#999' }}>
                      Code expires in 10 minutes
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 4 }} />
                  <Typography
                    variant='caption'
                    sx={{ display: 'block', color: '#999', textAlign: 'center' }}
                  >
                    © 2023 Acme Corp Security Team • 123 Tech Lane, Silicon Valley
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
