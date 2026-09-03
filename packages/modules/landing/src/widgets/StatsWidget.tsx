import React from 'react'
import { Box, Paper, Typography, alpha, useTheme } from '@mui/material'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import BusinessIcon from '@mui/icons-material/Business'
import SpeedIcon from '@mui/icons-material/Speed'

export const statsList = [
  {
    number: '10,000+',
    label: 'Active Job Listings',
    icon: <WorkOutlineIcon />,
  },
  {
    number: '500+',
    label: 'Partner Companies',
    icon: <BusinessIcon />,
  },
  {
    number: '24/7',
    label: 'Real-Time Monitoring',
    icon: <SpeedIcon />,
  },
]

export const StatsWidget: React.FC = () => {
  const theme = useTheme()

  return (
    <Paper
      elevation={0}
      sx={{
        p: 5,
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.08)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant='h5'
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 4,
            color: 'white',
          }}
        >
          Platform Statistics
        </Typography>

        {/* Stat Items */}
        {statsList.map((stat, index) => (
          <Box
            key={index}
            sx={{
              mb: 4,
              pb: index < 2 ? 4 : 0,
              borderBottom: index < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                }}
              >
                {stat.icon}
              </Box>
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-1px',
                  color: 'white',
                }}
              >
                {stat.number}
              </Typography>
            </Box>
            <Typography
              variant='body1'
              sx={{
                opacity: 0.95,
                fontWeight: 500,
                color: 'white',
              }}
            >
              {stat.label}
            </Typography>
          </Box>
        ))}

        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant='body2'
            sx={{
              fontWeight: 500,
              mb: 1,
              color: 'white',
            }}
          >
            🚀 Updated in real-time
          </Typography>
          <Typography
            variant='caption'
            sx={{
              opacity: 0.9,
              color: 'white',
            }}
          >
            Our platform continuously monitors and updates job listings to ensure you never miss an
            opportunity
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default StatsWidget
