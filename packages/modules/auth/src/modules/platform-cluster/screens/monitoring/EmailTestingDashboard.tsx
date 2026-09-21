import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material'
import { AdminPageHeader } from '@auth/modules/authentication-core/components/shared/admin'
import { useTheme } from '@mui/material/styles'
import Send from '@mui/icons-material/Send'
import History from '@mui/icons-material/History'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Error from '@mui/icons-material/Error'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '@cap/platform-core'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import {
  useEmailTemplatesQuery,
  useSendTestEmailMutation,
} from '../../hooks/useAdminMonitoringQuery'
import { getErrorMessage } from '../../utils/errors'

export default function EmailTestingDashboard() {
  const { t } = useTranslation('common')
  const { addNotification } = useNotifications()
  const theme = useTheme()
  const effects = getTenantThemeEffects(theme)
  const surfaceEffect = buildLayoutSurfaceEffect(effects, theme)
  const [testEmail, setTestEmail] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('welcome')
  const [testLogs, setTestLogs] = useState<
    Array<{
      id: string
      template: string
      recipient: string
      status: string
      time: string
      error?: string
    }>
  >([])

  const { data: templates, isLoading: loadingTemplates } = useEmailTemplatesQuery()
  const sendEmailMutation = useSendTestEmailMutation()

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      addNotification({
        type: 'error',
        title: t('monitoring.email.invalid_title', 'Invalid email'),
        message: t(
          'monitoring.email.invalid_body',
          'Please provide a valid recipient email address.',
        ),
      })
      return
    }

    try {
      await sendEmailMutation.mutateAsync({
        templateId: selectedTemplate,
        recipientEmail: testEmail,
      })

      addNotification({
        type: 'success',
        title: t('monitoring.email.sent_title', 'Test email dispatched'),
        message: t('monitoring.email.sent_body', 'Template "{{template}}" queued for delivery.', {
          template: selectedTemplate,
        }),
      })

      setTestLogs((prev) => [
        {
          id: String(Date.now()),
          template: selectedTemplate,
          recipient: testEmail,
          status: 'delivered',
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ])
      setTestEmail('')
    } catch (err: unknown) {
      addNotification({
        type: 'error',
        title: t('monitoring.email.failed_title', 'Dispatch failed'),
        message:
          getErrorMessage(err) ||
          t('monitoring.email.failed_body', 'The test email could not be dispatched.'),
      })

      setTestLogs((prev) => [
        {
          id: String(Date.now()),
          template: selectedTemplate,
          recipient: testEmail,
          status: 'failed',
          time: new Date().toLocaleTimeString(),
          error: getErrorMessage(err) || t('monitoring.email.delivery_error', 'Delivery error'),
        },
        ...prev,
      ])
    }
  }

  const templateOptions =
    templates && templates.length > 0
      ? templates
      : [
          { id: 'welcome', name: 'Welcome Onboarding' },
          { id: 'password_reset', name: 'Security: Password Reset' },
          { id: 'mfa_code', name: 'Security: MFA Verification' },
          { id: 'suspicious_login', name: 'Alert: Suspicious Activity' },
        ]

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <AdminPageHeader
        icon={<Send />}
        title={t('auth.admin.emailTesting', 'Transactional Email Testing')}
        description={t(
          'auth.admin.emailTesting_subtitle',
          'Validate transactional email relays, preview dynamic parameters, and inspect delivery telemetry.',
        )}
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={4}>
            {/* Test Send Card */}
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                borderRadius: 'var(--sf-radius-lg, 12px)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant='h6' sx={{ fontWeight: 800, mb: 3 }}>
                  {t('auth.admin.sendTestEmail', 'Dispatch Test Email')}
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label={t('auth.admin.recipientAddress', 'Recipient Email')}
                    placeholder='developer@example.com'
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    select
                    label={t('auth.admin.selectTemplate', 'Template')}
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    sx={{ '& .MuiSelect-select': { fontWeight: 700 } }}
                    SelectProps={{ native: true }}
                    disabled={loadingTemplates}
                  >
                    {templateOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </TextField>
                  <Button
                    variant='contained'
                    size='large'
                    fullWidth
                    startIcon={
                      sendEmailMutation.isPending ? (
                        <CircularProgress size={18} color='inherit' />
                      ) : (
                        <Send />
                      )
                    }
                    onClick={handleSendTestEmail}
                    disabled={sendEmailMutation.isPending || !testEmail}
                    sx={{
                      height: 50,
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      boxShadow: 'none',
                    }}
                  >
                    {sendEmailMutation.isPending
                      ? t('common.sending', 'Sending...')
                      : t('auth.admin.dispatchTestEmail', 'Send Test Email')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              borderRadius: 'var(--sf-radius-lg, 12px)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <History sx={{ color: 'primary.main' }} />
                <Typography variant='h6' sx={{ fontWeight: 800 }}>
                  {t('auth.admin.emailLogs', 'Recent Test Dispatches')}
                </Typography>
              </Box>
              {testLogs.length === 0 && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ py: 3, textAlign: 'center' }}
                >
                  {t(
                    'monitoring.email.logs_empty',
                    'No test emails sent in this session yet. Dispatch one from the panel to see delivery results here.',
                  )}
                </Typography>
              )}
              <List disablePadding>
                {testLogs.map((log) => (
                  <ListItem
                    key={log.id}
                    sx={{
                      py: 2,
                      px: 2,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemIcon>
                      {log.status === 'delivered' ? (
                        <CheckCircle color='success' />
                      ) : (
                        <Error color='error' />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Typography variant='body2' sx={{ fontWeight: 800 }}>
                            {log.template}
                          </Typography>
                          <Chip
                            label={log.status}
                            size='small'
                            color={log.status === 'delivered' ? 'success' : 'error'}
                            variant='outlined'
                            sx={{
                              height: 22,
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                            }}
                          />
                        </Stack>
                      }
                      secondary={`${log.recipient} • ${log.time}${log.error ? ` • ${log.error}` : ''}`}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
