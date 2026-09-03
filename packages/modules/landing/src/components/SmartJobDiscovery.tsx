import React from 'react'
import { Box, Container, Typography, Paper, alpha, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ChecklistIcon from '@mui/icons-material/Checklist'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'

const features = [
  {
    icon: <CheckCircleIcon />,
    label: 'Personalized Job Matching',
  },
  {
    icon: <ChecklistIcon />,
    label: 'Resume Optimization Analysis',
  },
  {
    icon: <TrackChangesIcon />,
    label: 'Automated Application Tracking',
  },
]

const SmartJobDiscovery: React.FC = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth='lg'>
        <Grid container spacing={6} alignItems='center'>
          {/* Text Content - Left */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                textAlign: { xs: 'center', lg: 'left' },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  AI that hunts for you.
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    color: 'text.secondary',
                    lineHeight: 1.7,
                    maxWidth: { xs: '100%', lg: '540px' },
                    mx: { xs: 'auto', lg: 0 },
                  }}
                >
                  Our advanced AI analyzes millions of data points to find the perfect job
                  opportunities that align with your skills, experience, and career goals.
                </Typography>
              </Box>

              {/* Features List */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: { xs: 'center', lg: 'flex-start' },
                }}
              >
                {features.map((feature, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        color: 'primary.main',
                        flexShrink: 0,
                        '& svg': {
                          fontSize: '1rem',
                        },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant='body1'
                      sx={{
                        color: 'text.primary',
                        fontWeight: 500,
                      }}
                    >
                      {feature.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Animated Visualizer - Right */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box
              sx={{
                position: 'relative',
                minHeight: { xs: 300, md: 450 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Glow Effect */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
                  filter: 'blur(80px)',
                  zIndex: 0,
                }}
              />

              {/* Stacked Job Cards */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 400,
                  mx: 'auto',
                }}
              >
                {/* Card 1 (Bottom) */}
                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    p: 2.5,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                    backdropFilter: 'blur(12px)',
                    borderRadius: 3,
                    transform: 'rotate(6deg) translateY(60px) scale(0.9)',
                    transition: 'transform 0.3s ease',
                    zIndex: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography variant='subtitle1' fontWeight={700} color='text.primary'>
                        UX Designer
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Creative Agency
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        color: 'primary.main',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      72% Match
                    </Box>
                  </Box>
                </Paper>

                {/* Card 2 (Middle) */}
                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    p: 2.5,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(12px)',
                    borderRadius: 3,
                    transform: 'rotate(-4deg) translateY(20px) scale(0.95)',
                    transition: 'transform 0.3s ease',
                    zIndex: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography variant='subtitle1' fontWeight={700} color='text.primary'>
                        Product Manager
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Fintech Startup
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        color: 'primary.main',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      85% Match
                    </Box>
                  </Box>
                </Paper>

                {/* Card 3 (Top & Prominent) */}
                <Paper
                  elevation={0}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    p: 3,
                    border: 2,
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(16px)',
                    borderRadius: 3,
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                    transform: 'scale(1)',
                    transition: 'transform 0.3s ease',
                    zIndex: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant='h6' fontWeight={700} color='text.primary'>
                        Senior Frontend Engineer
                      </Typography>
                      <Typography variant='body1' color='text.secondary'>
                        AI Innovations Inc.
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: theme.palette.mode === 'dark' ? 'text.primary' : '#000',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      98% Match
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box
                    sx={{
                      height: 8,
                      width: '100%',
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: '98%',
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        transition: 'width 1s ease',
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default SmartJobDiscovery
