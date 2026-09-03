import React from 'react'
import { Box, Paper, Typography, Button, Chip, alpha, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useNavigate } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import BarChartIcon from '@mui/icons-material/BarChart'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SpeedIcon from '@mui/icons-material/Speed'
import SecurityIcon from '@mui/icons-material/Security'

export const aboutSectionContent = {
  title: 'Transform Your Job Search Experience',
  description: `Harness the power of intelligent automation and data-driven insights. 
  Our cutting-edge platform empowers job seekers, recruiters, and market analysts 
  with real-time data aggregation, advanced analytics, and comprehensive market intelligence 
  to make smarter career decisions.`,
}

export const benefitsList = [
  {
    icon: <TrendingUpIcon />,
    title: 'Real-Time Updates',
    description: 'Stay ahead with instant job posting notifications',
  },
  {
    icon: <SpeedIcon />,
    title: 'Lightning Fast',
    description: 'Optimized performance for seamless experience',
  },
  {
    icon: <SecurityIcon />,
    title: 'Secure & Private',
    description: 'Your data is protected with enterprise-grade security',
  },
]

export const AboutWidget: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <Paper
      elevation={0}
      sx={{
        p: 5,
        bgcolor: 'background.paper',
        height: '100%',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <Chip
        label='ABOUT THE PLATFORM'
        size='small'
        sx={{
          mb: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
          fontWeight: 600,
        }}
      />
      <Typography variant='h4' gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        {aboutSectionContent.title}
      </Typography>
      <Typography
        variant='body1'
        paragraph
        sx={{ lineHeight: 1.9, color: 'text.secondary', mb: 4 }}
      >
        {aboutSectionContent.description}
      </Typography>

      {/* Benefits List */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {benefitsList.map((benefit, index) => (
          <Grid size={{ xs: 12 }} key={index}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  flexShrink: 0,
                }}
              >
                {benefit.icon}
              </Box>
              <Box>
                <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 0.5 }}>
                  {benefit.title}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {benefit.description}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant='contained'
          size='large'
          startIcon={<SearchIcon />}
          onClick={() => navigate('/jobs')}
        >
          Start Searching Jobs
        </Button>
        <Button
          variant='outlined'
          size='large'
          startIcon={<BarChartIcon />}
          onClick={() => navigate('/statistics')}
          sx={{
            borderColor: alpha(theme.palette.primary.main, 0.5),
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          View Analytics
        </Button>
      </Box>
    </Paper>
  )
}

export default AboutWidget
