import React from 'react'
import { Box, Container, Typography, Paper, alpha, useTheme } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TargetIcon from '@mui/icons-material/GpsFixed'
import SendIcon from '@mui/icons-material/Send'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

const stages = [
  {
    icon: <SearchIcon sx={{ fontSize: 28 }} />,
    title: 'Search',
    description: 'Our AI scours thousands of job boards to find the perfect opportunities for you.',
  },
  {
    icon: <TargetIcon sx={{ fontSize: 28 }} />,
    title: 'Match',
    description: 'We intelligently match jobs to your unique profile, skills, and resume.',
  },
  {
    icon: <SendIcon sx={{ fontSize: 28 }} />,
    title: 'Apply',
    description:
      'Apply to jobs with a single click or let our system handle the entire process for you.',
  },
  {
    icon: <CalendarMonthIcon sx={{ fontSize: 28 }} />,
    title: 'Interview',
    description:
      'Receive notifications and easily schedule interviews directly through the platform.',
  },
]

const AutomationEngine: React.FC = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth='lg'>
        {/* Section Header */}
        <Box
          sx={{
            mb: { xs: 6, md: 8 },
            textAlign: 'center',
          }}
        >
          <Typography
            variant='h2'
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'text.primary',
            }}
          >
            From searching to applying — automated
          </Typography>
        </Box>

        {/* Desktop Timeline */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'relative', px: 4 }}>
            {/* Connecting Line */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 48,
                height: 2,
                bgcolor: 'divider',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 48,
                height: 2,
                bgcolor: 'primary.main',
                zIndex: 1,
              }}
            />

            {/* Stages Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 4,
                position: 'relative',
                zIndex: 2,
              }}
            >
              {stages.map((stage, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  {/* Icon Circle */}
                  <Paper
                    elevation={0}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      border: 2,
                      borderColor: 'primary.main',
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      mb: 2,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    {stage.icon}
                  </Paper>

                  {/* Title */}
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    {stage.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                    }}
                  >
                    {stage.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Mobile Timeline */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            {stages.map((stage, index) => (
              <Box
                key={index}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 2,
                  mb: index < stages.length - 1 ? 4 : 0,
                }}
              >
                {/* Left Column - Icon & Line */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Icon Circle */}
                  <Paper
                    elevation={0}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      border: 2,
                      borderColor: 'primary.main',
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      flexShrink: 0,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                      '& svg': {
                        fontSize: 24,
                      },
                    }}
                  >
                    {stage.icon}
                  </Paper>

                  {/* Connecting Line */}
                  {index < stages.length - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        flexGrow: 1,
                        mt: 1,
                        bgcolor: 'divider',
                      }}
                    />
                  )}
                </Box>

                {/* Right Column - Content */}
                <Box sx={{ pt: 1, pb: index < stages.length - 1 ? 4 : 0 }}>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      color: 'text.primary',
                    }}
                  >
                    {stage.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                    }}
                  >
                    {stage.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default AutomationEngine
