import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography, useTheme } from '@mui/material';
import Home from '@mui/icons-material/Home';
import { AppPaths } from '@cap/shared-types';
import { useTranslation } from 'react-i18next';
import { alphaColor } from '@cap/theme';

export const NotFound: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const primaryShadow =
    (typeof theme.customShadows?.primary === 'object'
      ? theme.customShadows?.primary?.md
      : theme.customShadows?.primary) || `0 4px 14px ${alphaColor(theme.palette.primary.main, 0.4)}`;

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
        py: { xs: 6, md: 10 },
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '6rem', md: '8.5rem' },
          fontWeight: 900,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light || theme.palette.secondary.main} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
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
          px: 3.5,
          borderRadius: `${(theme.shape.borderRadius as number) * 1.5}px`,
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: primaryShadow,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow:
              (typeof theme.customShadows?.primary === 'object'
                ? theme.customShadows?.primary?.lg
                : theme.customShadows?.primary) || `0 6px 20px ${alphaColor(theme.palette.primary.main, 0.5)}`,
          },
        }}
      >
        {t('common.backToHome', 'Back to Home')}
      </Button>
    </Box>
  );
};

export default NotFound;

