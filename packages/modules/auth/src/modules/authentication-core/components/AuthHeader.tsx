import { Box, Typography, Button, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import { useTranslation } from 'react-i18next'

const AuthHeader = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Box
      component='header'
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? '#222831' : '#dbdfe6',
        px: { xs: 4, sm: 10 },
        py: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#101622' : '#ffffff',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            color: '#135bec',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <VerifiedUser sx={{ fontSize: '1.875rem' }} />
        </Box>
        <Typography
          variant='h6'
          sx={{
            fontSize: '1.125rem',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#111318',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          {t('auth.common.appName')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          onClick={() => navigate('/contact')}
          sx={{
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: theme.palette.mode === 'dark' ? '#9ca3af' : '#616f89',
            fontFamily: "'Manrope', sans-serif",
            '&:hover': {
              color: '#135bec',
              bgcolor: 'transparent',
            },
          }}
        >
          {t('auth.common.helpCenter')}
        </Button>
      </Box>
    </Box>
  )
}

export default AuthHeader
