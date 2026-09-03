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
  CircularProgress,
} from '@mui/material'
import Smartphone from '@mui/icons-material/Smartphone'
import Laptop from '@mui/icons-material/Laptop'
import Visibility from '@mui/icons-material/Visibility'
import History from '@mui/icons-material/History'
import Edit from '@mui/icons-material/Edit'
import Code from '@mui/icons-material/Code'
import { useTranslation } from 'react-i18next'
import { useEmailTemplatesQuery } from '../../hooks/useAdminMonitoringQuery'

export default function EmailTemplatePreview() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [view, setView] = useState<'preview' | 'code'>('preview')
  const [selectedId, setSelectedId] = useState('welcome')

  const { data: apiTemplates, isLoading } = useEmailTemplatesQuery()

  const defaultTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Onboarding',
      version: 'v2.4',
      lastEdited: '2 days ago',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Welcome to CAP Platform!</h1>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello {{name}},</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your multi-tenant account is ready. Click below to verify your email and access your dashboard.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="{{verification_url}}" style="background: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: 700; border-radius: 8px; text-decoration: none; display: inline-block;">Verify Account</a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">If you did not request this, please ignore this message.</p>
        </div>
      `,
    },
    {
      id: 'password_reset',
      name: 'Security: Password Reset',
      version: 'v1.8',
      lastEdited: '1 week ago',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Password Reset Request</h1>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">A request was made to reset your password. Use the link below to set a new password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="{{reset_url}}" style="background: #dc2626; color: #ffffff; padding: 12px 28px; font-weight: 700; border-radius: 8px; text-decoration: none; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Link expires in 15 minutes.</p>
        </div>
      `,
    },
    {
      id: 'mfa_code',
      name: 'Security: MFA Verification',
      version: 'v3.1',
      lastEdited: '5 hours ago',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Two-Factor Authentication Code</h1>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your one-time security code is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; color: #0f172a;">849 201</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Do not share this code with anyone.</p>
        </div>
      `,
    },
  ]

  const templates = apiTemplates && apiTemplates.length > 0 ? apiTemplates : defaultTemplates
  const activeTemplate =
    templates.find((t) => t.id === selectedId) ||
    defaultTemplates.find((t) => t.id === selectedId) ||
    defaultTemplates[0]

  const templateHtml = (activeTemplate as any).html || defaultTemplates[0].html

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 900, mb: 1 }}>
            {t('auth.admin.emailPreviewTitle', 'Email Template Preview')}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {t(
              'auth.admin.emailPreviewSubtitle',
              'Inspect dynamic transactional email templates across desktop and mobile form factors.',
            )}
          </Typography>
        </Box>
        <Stack direction='row' spacing={2}>
          <Button
            variant='outlined'
            startIcon={<History />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {t('auth.admin.versionHistory', 'Version History')}
          </Button>
          <Button
            variant='contained'
            startIcon={<Edit />}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, boxShadow: 'none' }}
          >
            {t('auth.admin.editTemplate', 'Edit Template')}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Left Sidebar: Template List */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={2}>
            {isLoading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              templates.map((template) => (
                <Card
                  key={template.id}
                  onClick={() => setSelectedId(template.id)}
                  sx={{
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: template.id === selectedId ? 'primary.main' : 'divider',
                    boxShadow: 'none',
                    borderRadius: 3,
                    bgcolor:
                      template.id === selectedId
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
                        label={(template as any).version || 'v1.0'}
                        size='small'
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                      />
                      <Typography variant='caption' color='text.secondary'>
                        {(template as any).lastEdited || 'Active'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Grid>

        {/* Main Content: Preview Canvas */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              borderRadius: 3,
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
                  {t('auth.admin.preview', 'Preview')}
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
                  {t('auth.admin.source', 'Source HTML')}
                </Button>
              </Stack>

              <Stack
                direction='row'
                spacing={1}
                sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 2 }}
              >
                <Tooltip title={t('auth.admin.desktopView', 'Desktop View (600px)')}>
                  <IconButton
                    size='small'
                    color={device === 'desktop' ? 'primary' : 'default'}
                    onClick={() => setDevice('desktop')}
                  >
                    <Laptop fontSize='small' />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('auth.admin.mobileView', 'Mobile View (360px)')}>
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
                p: 4,
                flex: 1,
                bgcolor: 'action.hover',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflow: 'auto',
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  width: device === 'desktop' ? 600 : 360,
                  minHeight: 450,
                  p: 3,
                  bgcolor: '#ffffff',
                  borderRadius: 3,
                  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                }}
              >
                {view === 'preview' ? (
                  // Render server-supplied template HTML inside a fully sandboxed,
                  // same-origin-isolated iframe. `sandbox=""` blocks scripts, forms,
                  // popups and top-navigation, so untrusted markup cannot run in the
                  // admin's origin (defends against stored XSS via template content
                  // or interpolated variables).
                  <iframe
                    title='email-template-preview'
                    sandbox=''
                    srcDoc={templateHtml}
                    style={{
                      width: '100%',
                      minHeight: 420,
                      border: 0,
                      background: '#ffffff',
                    }}
                  />
                ) : (
                  <pre
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      color: '#0f172a',
                    }}
                  >
                    {templateHtml}
                  </pre>
                )}
              </Paper>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
