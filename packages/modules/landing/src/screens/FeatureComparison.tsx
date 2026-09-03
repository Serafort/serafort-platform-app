/**
 * Feature Comparison Page
 *
 * Displays a comparison table showing features available for
 * Guest users vs Registered users
 */

import React from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { useNavigate } from 'react-router-dom'
import { useGuest, useAuth } from '@cap/platform-core'

interface Feature {
  name: string
  guest: boolean | string
  registered: boolean | string
  category: 'core' | 'profile' | 'jobs' | 'automation' | 'analytics'
}

const features: Feature[] = [
  // Core Features
  {
    name: 'Browse Job Listings',
    guest: '10 jobs',
    registered: 'Unlimited',
    category: 'core',
  },
  { name: 'View Job Details', guest: true, registered: true, category: 'core' },
  {
    name: 'Search Jobs',
    guest: 'Basic',
    registered: 'Advanced',
    category: 'core',
  },

  // Profile Features
  {
    name: 'Upload Resume',
    guest: '1 per session',
    registered: 'Unlimited',
    category: 'profile',
  },
  {
    name: 'Save Resume Analysis',
    guest: false,
    registered: true,
    category: 'profile',
  },
  {
    name: 'Multiple Resume Profiles',
    guest: false,
    registered: true,
    category: 'profile',
  },
  {
    name: 'Career Role Recommendations',
    guest: true,
    registered: true,
    category: 'profile',
  },
  {
    name: 'Profile History',
    guest: false,
    registered: true,
    category: 'profile',
  },

  // Job Features
  { name: 'Apply to Jobs', guest: false, registered: true, category: 'jobs' },
  { name: 'Save Jobs', guest: false, registered: true, category: 'jobs' },
  {
    name: 'Job Recommendations',
    guest: 'Limited',
    registered: 'Unlimited',
    category: 'jobs',
  },
  {
    name: 'Track Applications',
    guest: false,
    registered: true,
    category: 'jobs',
  },
  {
    name: 'Export Job Listings',
    guest: false,
    registered: true,
    category: 'jobs',
  },

  // Automation
  {
    name: 'Automated Job Scraping',
    guest: false,
    registered: true,
    category: 'automation',
  },
  {
    name: 'Scheduled Searches',
    guest: false,
    registered: true,
    category: 'automation',
  },
  {
    name: 'Email Alerts',
    guest: false,
    registered: true,
    category: 'automation',
  },
  {
    name: 'Auto-Apply Features',
    guest: false,
    registered: true,
    category: 'automation',
  },

  // Analytics
  {
    name: 'Job Market Statistics',
    guest: false,
    registered: true,
    category: 'analytics',
  },
  {
    name: 'Salary Insights',
    guest: false,
    registered: true,
    category: 'analytics',
  },
  {
    name: 'Company Analytics',
    guest: false,
    registered: true,
    category: 'analytics',
  },
  {
    name: 'Skills Gap Analysis',
    guest: 'Basic',
    registered: 'Detailed',
    category: 'analytics',
  },
]

const categoryNames = {
  core: 'Core Features',
  profile: 'Profile & Resume',
  jobs: 'Job Management',
  automation: 'Automation',
  analytics: 'Analytics & Insights',
}

export const FeatureComparison: React.FC = () => {
  const navigate = useNavigate()
  const { isGuest } = useGuest()
  const { isAuthenticated } = useAuth()

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? <CheckCircleIcon color='success' /> : <CancelIcon color='error' />
    }
    return <Chip label={value} size='small' color='primary' variant='outlined' />
  }

  const groupedFeatures = features.reduce(
    (acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = []
      }
      acc[feature.category].push(feature)
      return acc
    },
    {} as Record<string, Feature[]>,
  )

  return (
    <Container maxWidth='lg' sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant='h3' fontWeight='bold' gutterBottom>
          Feature Comparison
        </Typography>
        <Typography variant='h6' color='text.secondary' paragraph>
          See what you get with a free account
        </Typography>

        {isGuest && (
          <Button
            variant='contained'
            size='large'
            startIcon={<LockOpenIcon />}
            onClick={() => navigate('/auth/signup')}
            sx={{ mt: 2 }}
          >
            Sign Up Free - Unlock All Features
          </Button>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant='outlined'>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Chip label='Guest Mode' color='warning' size='small' sx={{ mb: 1 }} />
                  <Typography variant='h5' fontWeight='bold'>
                    Try Before You Sign Up
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  Perfect for exploring the platform and testing basic features. Your session data
                  is temporary and will be cleared when you close your browser.
                </Typography>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    ✓ No account required • Limited features • Session-based
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant='outlined' sx={{ borderColor: 'primary.main', borderWidth: 2 }}>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Chip label='Registered User' color='success' size='small' sx={{ mb: 1 }} />
                  <Typography variant='h5' fontWeight='bold'>
                    Full Access - 100% Free
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  Get complete access to all features including job automation, analytics, and
                  unlimited profile analysis. Your data is securely saved and synced across devices.
                </Typography>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    ✓ Free forever • All features • Cloud sync
                  </Typography>
                </Box>
                {!isAuthenticated && (
                  <Button variant='contained' onClick={() => navigate('/auth/signup')} fullWidth>
                    Create Free Account
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Comparison Table */}
      <Paper elevation={0} variant='outlined'>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Feature
                  </Typography>
                </TableCell>
                <TableCell align='center' sx={{ bgcolor: 'warning.50' }}>
                  <Stack alignItems='center' spacing={0.5}>
                    <Typography variant='subtitle1' fontWeight='bold'>
                      Guest
                    </Typography>
                    <Chip label='No Account' size='small' color='warning' variant='outlined' />
                  </Stack>
                </TableCell>
                <TableCell align='center' sx={{ bgcolor: 'success.50' }}>
                  <Stack alignItems='center' spacing={0.5}>
                    <Typography variant='subtitle1' fontWeight='bold'>
                      Registered
                    </Typography>
                    <Chip label='Free Account' size='small' color='success' variant='outlined' />
                  </Stack>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <TableRow>
                    <TableCell colSpan={3} sx={{ bgcolor: 'grey.100', py: 1 }}>
                      <Typography variant='subtitle2' fontWeight='bold' color='primary'>
                        {categoryNames[category as keyof typeof categoryNames]}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {/* Category Features */}
                  {categoryFeatures.map((feature, index) => (
                    <TableRow key={`${category}-${index}`} hover>
                      <TableCell>
                        <Typography variant='body2'>{feature.name}</Typography>
                      </TableCell>
                      <TableCell align='center'>{renderFeatureValue(feature.guest)}</TableCell>
                      <TableCell align='center'>{renderFeatureValue(feature.registered)}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Bottom CTA */}
      {!isAuthenticated && (
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Paper sx={{ p: 4, bgcolor: 'primary.50' }}>
            <Typography variant='h5' fontWeight='bold' gutterBottom>
              Ready to unlock all features?
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              Sign up for free in less than 30 seconds. No credit card required.
            </Typography>
            <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 3 }}>
              <Button variant='outlined' size='large' onClick={() => navigate('/auth/signin')}>
                Sign In
              </Button>
              <Button
                variant='contained'
                size='large'
                startIcon={<LockOpenIcon />}
                onClick={() => navigate('/auth/signup')}
              >
                Create Free Account
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* FAQ Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant='h5' fontWeight='bold' gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Box>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              Is it really free?
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Yes! All features are completely free for registered users. We believe everyone should
              have access to powerful job search tools.
            </Typography>
          </Box>

          <Box>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              What happens to my guest session data?
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Guest session data is stored temporarily in your browser and will be cleared when you
              close the browser. If you want to save your data, create a free account.
            </Typography>
          </Box>

          <Box>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              Can I upgrade my guest session to a registered account?
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              While we can't automatically transfer guest data, you can easily re-upload your resume
              and recreate your profile after signing up. It only takes a minute!
            </Typography>
          </Box>

          <Box>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              How long does sign up take?
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Less than 30 seconds! Just provide your email and password, verify your email, and
              you're ready to go. No lengthy forms or credit card required.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Container>
  )
}

export default FeatureComparison
