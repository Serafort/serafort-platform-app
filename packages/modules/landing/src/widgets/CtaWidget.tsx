import React from 'react'
import { Box, Paper, Typography, Button, alpha, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export const CtaWidget: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'background.paper',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant='h4'
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 2,
            color: 'text.primary',
          }}
        >
          Ready to Get Started?
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Join thousands of job seekers and recruiters who trust our platform for their career
          journey
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button variant='contained' size='large' onClick={() => navigate('/scraper')}>
            Start Scraping
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={() => navigate('/jobs')}
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.5),
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Browse Jobs
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default CtaWidget
