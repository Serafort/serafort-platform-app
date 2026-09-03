import React from 'react'
import { Box, Container, Typography, Button, Paper, alpha, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const DashboardInsights: React.FC = () => {
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            textAlign: 'center',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Typography
              variant='h2'
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              See your job hunt like data
            </Typography>
            <Typography
              variant='h6'
              sx={{
                fontSize: { xs: '1rem', md: '1.125rem' },
                color: 'text.secondary',
                lineHeight: 1.7,
                maxWidth: 700,
              }}
            >
              Our AI-powered dashboard visualizes your entire job search, revealing insights to help
              you land your next role faster.
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Button
                variant='contained'
                size='large'
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/dashboard')}
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
                View Demo Dashboard
              </Button>
            </Box>
          </Box>

          {/* Dashboard Preview */}
          <Box sx={{ mt: 4, width: '100%' }}>
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                width: '100%',
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                p: 0.5,
                boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.2)}`,
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  padding: 1,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(
                    theme.palette.secondary.main,
                    0.3,
                  )} 100%)`,
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                },
              }}
            >
              <Box
                component='img'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuD5_TszWUdDZgJ5RjodI-nI1HZBebyrwUSUYxVP9Nvb_3CAYwEEJ-wunDetFNs4BCW8-Z4fEw5n0G5aQCZ8FndjhhPcW4Fn-AaNYdf5FrbFv4rBzgsQ1XjsftTjNxkgHN2kSW-yzu4BPUf3T1JCsir5EJ5U4X8Fs_9VCP93Ztaqr0lqfsCtTx2XIRH7XtWdiruwvd6ek3c7v9PsfGLthsLBmq63oWjxuk3jOzm4sGsaoxHNXx1B4erpCbl7GivW2E-PGOTD2xHWTQU'
                alt='Analytics Dashboard Preview'
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  display: 'block',
                }}
              />
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default DashboardInsights
