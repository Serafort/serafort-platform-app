import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  alpha,
  useTheme,
  CircularProgress,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const ResumeIntelligence: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()

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
                gap: 3,
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
                    maxWidth: 540,
                  }}
                >
                  Your resume, optimized for every job.
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    color: 'text.secondary',
                    lineHeight: 1.7,
                    maxWidth: 540,
                  }}
                >
                  Our AI scans your resume against job descriptions to identify key skills, suggest
                  improvements, and calculate a match score, ensuring you stand out to recruiters.
                </Typography>
              </Box>

              <Box>
                <Button
                  variant='contained'
                  size='large'
                  onClick={() => navigate('/profile-analyzer')}
                  sx={{
                    minHeight: 48,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: theme.palette.mode === 'dark' ? 'text.primary' : '#000',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
                    },
                  }}
                >
                  Analyze My Resume
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Resume Preview with Annotations - Right */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box
              sx={{
                position: 'relative',
                minHeight: { xs: 450, lg: 550 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Resume Document */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 400,
                  mx: 'auto',
                }}
              >
                {/* Browser Chrome */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    height: 40,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#ff5f56',
                    }}
                  />
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#ffbd2e',
                    }}
                  />
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#27c93f',
                    }}
                  />
                </Box>

                {/* Document Content */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.95) : '#fff',
                    border: 1,
                    borderColor: alpha(theme.palette.divider, 0.5),
                    borderTop: 'none',
                    borderBottomLeftRadius: 2,
                    borderBottomRightRadius: 2,
                  }}
                >
                  {/* Placeholder Content */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        height: 16,
                        width: '50%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.1),
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        height: 10,
                        width: '100%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                      }}
                    />
                    <Box
                      sx={{
                        height: 10,
                        width: '100%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                      }}
                    />
                    <Box
                      sx={{
                        height: 10,
                        width: '75%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.3),
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2, mt: 3 }}>
                    <Box
                      sx={{
                        height: 16,
                        width: '33%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.1),
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        height: 10,
                        width: '100%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                      }}
                    />
                    <Box
                      sx={{
                        height: 10,
                        width: '100%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.3),
                      }}
                    />
                    <Box
                      sx={{
                        height: 10,
                        width: '86%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2, mt: 3 }}>
                    <Box
                      sx={{
                        height: 16,
                        width: '25%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.1),
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box
                      sx={{
                        height: 10,
                        width: '100%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                      }}
                    />
                    <Box
                      sx={{
                        height: 10,
                        width: '50%',
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                      }}
                    />
                  </Box>
                </Paper>
              </Box>

              {/* Floating Annotation 1 - Top Left */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '28%',
                  left: { xs: '5%', md: '10%' },
                  transform: 'translate(-50%, -50%)',
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': {
                      transform: 'translate(-50%, -50%)',
                    },
                    '50%': {
                      transform: 'translate(-50%, -60%)',
                    },
                  },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    bgcolor: '#5c6bc0',
                    color: 'white',
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: alpha('#5c6bc0', 0.3),
                    boxShadow: `0 8px 24px ${alpha('#5c6bc0', 0.4)}`,
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                  <Typography variant='caption' fontWeight={600}>
                    Stronger Action Verb
                  </Typography>
                </Paper>
              </Box>

              {/* Floating Score - Right */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: { xs: '-5%', md: 0 },
                  transform: 'translate(25%, -50%)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: 120, md: 160 },
                    height: { xs: 120, md: 160 },
                  }}
                >
                  <CircularProgress
                    variant='determinate'
                    value={88}
                    size={160}
                    thickness={3}
                    sx={{
                      position: 'absolute',
                      color: 'primary.main',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                  <CircularProgress
                    variant='determinate'
                    value={100}
                    size={160}
                    thickness={3}
                    sx={{
                      position: 'absolute',
                      color: alpha(theme.palette.primary.main, 0.1),
                    }}
                  />
                  <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                    <Typography variant='h3' fontWeight={800} color='text.primary'>
                      88%
                    </Typography>
                    <Typography variant='body2' color='text.secondary' fontWeight={500}>
                      Match Score
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Floating Annotation 2 - Bottom Right */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  right: { xs: '10%', md: '15%' },
                  transform: 'translate(50%, 50%)',
                  animation: 'float 3s ease-in-out infinite 1s',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    bgcolor: '#26a69a',
                    color: 'white',
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: alpha('#26a69a', 0.3),
                    boxShadow: `0 8px 24px ${alpha('#26a69a', 0.4)}`,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                  <Typography variant='caption' fontWeight={600}>
                    Keyword Match
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default ResumeIntelligence
