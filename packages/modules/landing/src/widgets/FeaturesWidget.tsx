import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { useNavigate } from 'react-router-dom'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import SearchIcon from '@mui/icons-material/Search'
import BarChartIcon from '@mui/icons-material/BarChart'
import BusinessIcon from '@mui/icons-material/Business'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

export const featuresList = [
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 48, color: '#38bdf8' }} />,
    title: 'Chronos Mycelium',
    description: 'Gallery-quality generative art engine exploring radial time & hyphae growth',
    link: '/chronos-mycelium',
  },
  {
    icon: <SearchIcon sx={{ fontSize: 48 }} />,
    title: 'Smart Job Search',
    description: 'Advanced search algorithms to find your perfect opportunity',
    link: '/jobs',
  },
  {
    icon: <WorkOutlineIcon sx={{ fontSize: 48 }} />,
    title: 'Automated Scraper',
    description: 'AI-powered data collection from multiple platforms',
    link: '/scraper',
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 48 }} />,
    title: 'Market Analytics',
    description: 'Deep insights into job market trends and patterns',
    link: '/statistics',
  },
  {
    icon: <BusinessIcon sx={{ fontSize: 48 }} />,
    title: 'Company Insights',
    description: 'Comprehensive profiles and hiring trends analysis',
    link: '/companies',
  },
]

export const FeaturesWidget: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <Box sx={{ mb: 10 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant='h3'
          sx={{
            fontWeight: 700,
            mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Powerful Features
        </Typography>
        <Typography variant='h6' color='text.secondary' sx={{ maxWidth: 600, mx: 'auto' }}>
          Everything you need to navigate the modern job market
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {featuresList.map((feature, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible',
                cursor: 'pointer',
                '&:hover': {
                  '& .feature-icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                  },
                  '& .feature-bg': {
                    opacity: 0.15,
                  },
                },
              }}
              onClick={() => navigate(feature.link)}
            >
              {/* Background Gradient Effect */}
              <Box
                className='feature-bg'
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '120px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  opacity: 0.05,
                  transition: 'opacity 0.4s ease',
                  borderRadius: '16px 16px 0 0',
                }}
              />

              <CardContent
                sx={{
                  flexGrow: 1,
                  p: 3,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {/* Icon Container */}
                <Box
                  className='feature-icon'
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    mb: 2.5,
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {feature.icon}
                </Box>

                <Typography variant='h6' gutterBottom sx={{ fontWeight: 700, mb: 1.5 }}>
                  {feature.title}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default FeaturesWidget
