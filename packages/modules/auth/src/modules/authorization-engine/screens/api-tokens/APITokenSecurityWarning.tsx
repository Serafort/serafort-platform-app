import React from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Breadcrumbs,
  Link,
  Stack,
  Paper,
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import VerifiedIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Path } from "@auth/routes/path"

const APITokenSecurityWarning: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const bestPractices = [
    {
      icon: <LockIcon color='primary' />,
      title: 'Never Hardcode Tokens',
      description:
        'Do not commit API tokens to version control. Use environment variables or secret management tools.',
    },
    {
      icon: <SecurityIcon color='primary' />,
      title: 'Principle of Least Privilege',
      description:
        'Only grant the minimal scopes required for the specific task the token will perform.',
    },
    {
      icon: <VisibilityIcon color='primary' />,
      title: 'Regular Rotation',
      description: 'Rotate your tokens periodically and immediately if you suspect a leak.',
    },
    {
      icon: <VerifiedIcon color='primary' />,
      title: 'IP Whitelisting',
      description:
        'Restrict token usage to specific IP addresses of your servers whenever possible.',
    },
  ]

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize='small' />} sx={{ mb: 3 }}>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(Path.apiTokens.dashboard)}
          sx={{ cursor: 'pointer' }}
        >
          {t('api_tokens:title', 'API Tokens')}
        </Link>
        <Typography color='text.primary'>
          {t('api_tokens:security_guide_title', 'Security Guide')}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        <Typography variant='h3' fontWeight='bold' gutterBottom>
          {t('api_tokens:security_title', 'Protect Your API Tokens')}
        </Typography>
        <Typography variant='h6' color='text.secondary' sx={{ maxWidth: 600, mx: 'auto' }}>
          {t(
            'api_tokens:security_subtitle',
            'API tokens grant broad access to your account. Treat them as securely as your password.',
          )}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            {t('api_tokens:best_practices', 'Security Best Practices')}
          </Typography>
          <Stack spacing={3} sx={{ mt: 3 }}>
            {bestPractices.map((practice, index) => (
              <Paper key={index} variant='outlined' sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex' }}>
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'flex-start', pt: 0.5 }}>
                    {practice.icon}
                  </Box>
                  <Box>
                    <Typography variant='subtitle1' fontWeight='bold'>
                      {practice.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {practice.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            variant='outlined'
            sx={{ borderRadius: 3, mb: 4, bgcolor: 'error.lighter', borderColor: 'error.main' }}
          >
            <CardContent>
              <Typography
                variant='subtitle1'
                fontWeight='bold'
                color='error.main'
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <InfoIcon sx={{ mr: 1 }} />
                {t('api_tokens:detected_leak', 'What if a token is leaked?')}
              </Typography>
              <Typography variant='body2' sx={{ mb: 2 }}>
                {t('api_tokens:if_exposed', 'If you accidentally expose an API token:')}
              </Typography>
              <Stack component='ul' spacing={1} sx={{ pl: 2, mb: 0 }}>
                <li>
                  <Typography variant='body2' fontWeight='bold'>
                    {t('api_tokens:immediately_revoke', 'Immediately revoke')}
                  </Typography>
                  <Typography variant='caption' display='block'>
                    {t('api_tokens:revoke_desc', 'Go to the token details and click "Revoke".')}
                  </Typography>
                </li>
                <li>
                  <Typography variant='body2' fontWeight='bold'>
                    {t('api_tokens:audit_activity', 'Audit recent activity')}
                  </Typography>
                  <Typography variant='caption' display='block'>
                    {t(
                      'api_tokens:audit_desc',
                      'Check the usage logs for any unauthorized actions.',
                    )}
                  </Typography>
                </li>
                <li>
                  <Typography variant='body2' fontWeight='bold'>
                    {t('api_tokens:replace_systems', 'Replace in all systems')}
                  </Typography>
                  <Typography variant='caption' display='block'>
                    {t(
                      'api_tokens:replace_desc',
                      'Generate a new token and update your environment variables.',
                    )}
                  </Typography>
                </li>
              </Stack>
            </CardContent>
          </Card>

          <Card variant='outlined' sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                {t('api_tokens:help_resources', 'Need help?')}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                {t(
                  'api_tokens:help_desc',
                  'Check our developer portal for more information on securing your integration.',
                )}
              </Typography>
              <Button fullWidth variant='outlined'>
                {t('api_tokens:view_docs', 'View Documentation')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Button
          variant='contained'
          size='large'
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(Path.apiTokens.dashboard)}
          sx={{ px: 4, borderRadius: 2 }}
        >
          {t('common:return_to_dashboard', 'Return to API Tokens')}
        </Button>
      </Box>
    </Box>
  )
}

export default APITokenSecurityWarning
