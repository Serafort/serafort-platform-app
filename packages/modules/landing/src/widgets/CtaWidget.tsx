import React from 'react'
import { Box, Paper, Typography, Button, alpha, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppPaths } from '@cap/shared-types'

export const CtaWidget: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation()

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
          {t('landing.cta.title', 'Ready to get started?')}
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          {t(
            'landing.cta.subtitle',
            'Create your workspace and bring your team onto a single, secure identity platform.',
          )}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant='contained'
            size='large'
            onClick={() => navigate(AppPaths.auth.signup)}
          >
            {t('landing.cta.primary', 'Create an account')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={() => navigate(AppPaths.landing.pricing)}
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.5),
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            {t('landing.cta.secondary', 'See pricing')}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default CtaWidget
