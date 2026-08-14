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
  Divider,
} from '@mui/material'
import Send from '@mui/icons-material/Send';
import History from '@mui/icons-material/History';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';
import SettingsApplications from '@mui/icons-material/SettingsApplications';
import Visibility from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next'

export default function EmailTestingDashboard() {
  const { t } = useTranslation('common')
  const [testEmail, setTestEmail] = useState('')

  const emailLogs = [
    {
      id: '1',
      template: 'Welcome Email',
      recipient: 'new@user.com',
      status: 'delivered',
      time: '10m ago',
    },
    {
      id: '2',
      template: 'Password Reset',
      recipient: 'john@doe.com',
      status: 'delivered',
      time: '45m ago',
    },
    {
      id: '3',
      template: 'MFA OTP',
      recipient: 'verify@app.com',
      status: 'failed',
      time: '1h ago',
      error: 'Bounce: Invalid Recipient',
    },
  ]

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 900, mb: 1 }}>
          {t('auth.admin.emailTesting')}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {t('auth.admin.emailTesting_subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={4}>
            {/* Test Send Card */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant='h6' sx={{ fontWeight: 800, mb: 3 }}>
                  {t('auth.admin.sendTestEmail')}
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label={t('auth.admin.recipientAddress')}
                    placeholder='admin@example.com'
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    select
                    label={t('auth.admin.selectTemplate')}
                    sx={{ '& .MuiSelect-select': { fontWeight: 700 } }}
                    SelectProps={{ native: true }}
                  >
                    <option value='welcome'>Welcome Onboarding</option>
                    <option value='password_reset'>Security: Password Reset</option>
                    <option value='mfa_code'>Security: MFA Verification</option>
                    <option value='suspicious_login'>Alert: Suspicious Activity</option>
                  </TextField>
                  <Button
                    variant='contained'
                    size='large'
                    fullWidth
                    startIcon={<Send />}
                    sx={{
                      height: 50,
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: 2,
                      boxShadow: 'none',
                    }}
                  >
                    {t('auth.admin.dispatchTestEmail')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Config Status */}
            <Card
              sx={{ px: 2, py: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
            >
              <List>
                <ListItem sx={{ px: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <SettingsApplications color='action' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Relay: AWS SES'
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
                  {t('auth.admin.emailLogs')}
                </Typography>
              </Box>
              <List disablePadding>
                {emailLogs.map((log, i) => (
                  <React.Fragment key={log.id}>
                    <ListItem sx={{ py: 2, px: 3, '&:hover': { bgcolor: 'action.hover' } }}>
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
                                height: 16,
                                fontSize: '0.55rem',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                              }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Box component='span'>
                            <Typography variant='caption' sx={{ display: 'block' }}>
                              To: {log.recipient}
                            </Typography>
                            {log.error && (
                              <Typography
                                variant='caption'
                                sx={{ color: 'error.main', fontStyle: 'italic' }}
                              >
                                {log.error}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ display: 'block' }}
                        >
                          {log.time}
                        </Typography>
                        <Button
                          size='small'
                          sx={{
                            textTransform: 'none',
                            minWidth: 0,
                            p: 0,
                            mt: 0.5,
                            fontSize: '0.7rem',
                          }}
                          startIcon={<Visibility sx={{ fontSize: '0.8rem' }} />}
                        >
                          {t('auth.admin.viewDetails')}
                        </Button>
                      </Box>
                    </ListItem>
                    {i < emailLogs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button variant='text' size='small' sx={{ textTransform: 'none', fontWeight: 700 }}>
                  {t('auth.admin.exportHistory')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
