import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const AuthLoadingScreen: React.FC = () => {
  const { t } = useTranslation('auth')

  return (
    <Box
      role='status'
      aria-live='polite'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minBlockSize: '100vh',
        inlineSize: '100%',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={32} thickness={4} aria-hidden />
      <Typography
        variant='body2'
        sx={{ color: (theme) => `var(--sf-text-tertiary, ${theme.palette.text.secondary})`, fontSize: 'var(--sf-text-sm, 0.8125rem)' }}
      >
        {t('common.loading', 'Loading...')}
      </Typography>
    </Box>
  )
}

export default AuthLoadingScreen
