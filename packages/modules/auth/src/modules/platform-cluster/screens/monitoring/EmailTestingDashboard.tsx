import React, { useState } from 'react'
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
  Alert,
} from '@mui/material'
import Send from '@mui/icons-material/Send'
import History from '@mui/icons-material/History'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Error from '@mui/icons-material/Error'
import SettingsApplications from '@mui/icons-material/SettingsApplications'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '@cap/platform-core'
import {
  useEmailTemplatesQuery,
  useSendTestEmailMutation,
} from '../../hooks/useAdminMonitoringQuery'

export default function EmailTestingDashboard() {
  const { t } = useTranslation('common')
  const { addNotification } = useNotifications()
  const [testEmail, setTestEmail] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('welcome')
  const [testLogs, setTestLogs] = useState<
    Array<{ id: string; template: string; recipient: string; status: string; time: string; error?: string }>
  >([
    {
      id: '1',
      template: 'Welcome Email',
      recipient: 'admin@cap-saas.com',
      status: 'delivered',
      time: 'Just now',
    },
  ])

  const { data: templates, isLoading: loadingTemplates } = useEmailTemplatesQuery()
  const sendEmailMutation = useSendTestEmailMutation()

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      addNotification({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please provide a valid recipient email address.',
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
        title: 'Test Email Dispatched',
        message: `Template "${selectedTemplate}" queued for delivery to ${testEmail}.`,
      })

      setTestLogs((prev) => [
        {
          id: String(Date.now()),
          template: selectedTemplate,
          recipient: testEmail,
          status: 'delivered',
          time: 'Just now',
        },
        ...prev,
      ])
      setTestEmail('')
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Dispatch Failed',
        message: err?.message || 'Failed to dispatch test email.',
      })

      setTestLogs((prev) => [
        {
          id: String(Date.now()),
          template: selectedTemplate,
          recipient: testEmail,
          status: 'failed',
          time: 'Just now',
          error: err?.message || 'Delivery error',
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
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 900, mb: 1 }}>
          {t('auth.admin.emailTesting', 'Transactional Email Testing')}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {t(
            'auth.admin.emailTesting_subtitle',
            'Validate transactional email relays, preview dynamic parameters, and inspect delivery telemetry.',
          )}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={4}>
            {/* Test Send Card */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 3 }}>
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
                    startIcon={sendEmailMutation.isPending ? <CircularProgress size={18} color='inherit' /> : <Send />}
                    onClick={handleSendTestEmail}
                    disabled={sendEmailMutation.isPending || !testEmail}
                    sx={{
                      height: 50,
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: 2,
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

            {/* Config Status */}
            <Card
              sx={{ px: 2, py: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }}
            >
              <List>
                <ListItem sx={{ px: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <SettingsApplications color='action' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Relay: AdonisJS Mail (SMTP / SES)'
                    primaryTypographyProps={{ variant: 'caption', fontWeight: 800 }}
                  />
                  <Chip
                    label='Operational'
                    size='small'
                    color='success'
                    sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900 }}
                  />
                </ListItem>
              </List>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <History sx={{ color: 'primary.main' }} />
                <Typography variant='h6' sx={{ fontWeight: 800 }}>
                  {t('auth.admin.emailLogs', 'Recent Test Dispatches')}
                </Typography>
              </Box>
              <List disablePadding>
                {testLogs.map((log) => (
                  <ListItem
                    key={log.id}
                    sx={{ py: 2, px: 2, borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'action.hover' } }}
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
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 900,
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
