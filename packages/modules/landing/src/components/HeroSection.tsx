import React from 'react'
import { Box, Container, Typography, Button, alpha, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useNavigate } from 'react-router-dom'
import { AppPaths } from '@cap/shared-types'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

interface HeroSectionProps {
  onGetStarted?: () => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted()
    } else {
      navigate(AppPaths.auth.signup)
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'background.default',
        pt: { xs: 8, md: 12 },
        pb: { xs: 12, md: 16 },
        overflow: 'hidden',
      }}
    >
      {/* Animated Background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%)`,
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              opacity: 0.2,
            },
            '50%': {
              opacity: 0.3,
            },
          },
        }}
      />

      <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems='center'>
          {/* Text Content */}
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
                  variant='h1'
                  sx={{
                    fontSize: {
                      xs: '2.5rem',
                      sm: '3rem',
                      md: '3.5rem',
                      lg: '4rem',
                    },
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Unleash AI power to seek, analyze, and optimize your career journey.
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    maxWidth: { xs: '100%', lg: '540px' },
                    mx: { xs: 'auto', lg: 0 },
                  }}
                >
                  Our AI helps you find the best job matches and streamline your search process with
                  features like job matching scores, application tracking, and career path
                  analytics.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', lg: 'flex-start' },
                }}
              >
                <Button
                  variant='contained'
                  size='large'
                  startIcon={<RocketLaunchIcon />}
                  onClick={handleGetStarted}
                  sx={{
                    minHeight: 48,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
                    },
                  }}
                >
                  Get Started — It's Free
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Dashboard Preview */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                minHeight: { xs: 300, lg: 500 },
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
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                  borderRadius: 3,
                  filter: 'blur(60px)',
                }}
              />

              {/* Dashboard Preview */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: { xs: '100%', lg: 'none' },
                  aspectRatio: '4/3',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 0.5,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.1)}`,
                  overflow: 'hidden',
                }}
              >
                <Box
                  component='img'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuDaAadD9x__Nozic4Ef1OEYCSNN_LRa7ByX9MVHvbWUn360Sr76c6sfjNhA_R-G-Mo4sPTkiqk6FlWYC8HJ6-_CoD6L4gWB6PS3aVwTTq5CXZNnKU2ifktYlhR1Ldum8qe7FECN2ExoexHp6tJ2wIqulbiUN1Zx94R8Ic59jJjN7Ftxid3ZeDq9sRy04PylvbBLmtMb0ydnpyaaWv30zF-EWoyFG9gBXSHacqGrf4pUODCONbhFNksT6wEy2rDmxvUgjpmlRGftcT0'
                  alt='Dashboard Preview'
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default HeroSection
