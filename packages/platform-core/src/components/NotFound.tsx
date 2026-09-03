import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Typography, alpha, useTheme } from '@mui/material'
import Home from '@mui/icons-material/Home';
import { AppPaths } from '@cap/shared-types'
import { useTranslation } from 'react-i18next'

export const NotFound: React.FC = () => {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        px: 3,
        py: 6,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '6rem', md: '8rem' },
          fontWeight: 900,
          color: theme.palette.primary.main,
          lineHeight: 1,
          mb: 2,
          letterSpacing: '-0.04em',
        }}
      >
        404
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mb: 1.5,
          color: 'text.primary',
        }}
      >
        {t('errors.pageNotFound', 'Page Not Found')}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          mb: 4,
          maxWidth: 480,
          lineHeight: 1.6,
        }}
      >
        {t('errors.pageNotFoundDesc', 'The page you are looking for does not exist or has been moved.')}
      </Typography>
      <Button
        component={Link}
        to={AppPaths.landing.home}
        variant="contained"
        size="large"
        startIcon={<Home />}
        sx={{
          py: 1.2,
          px: 3,
          borderRadius: 3,
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
        }}
      >
        {t('common.backToHome', 'Back to Home')}
      </Button>
    </Box>
  )
}

export default NotFound
