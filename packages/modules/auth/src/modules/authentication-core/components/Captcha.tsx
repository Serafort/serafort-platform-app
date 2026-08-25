import React from 'react'
import { Box, Typography, Alert, useTheme } from '@mui/material'

interface CaptchaProps {
  onVerify: (token: string | null) => void
  onError?: () => void
  onExpire?: () => void
  theme?: 'light' | 'dark'
  size?: 'normal' | 'compact'
}

const Captcha: React.FC<CaptchaProps> = ({
  onVerify,
  // onError,
  // onExpire,
  theme = 'light',
}) => {
  const muiTheme = useTheme()
  const handleChange = (token: string | null) => {
    onVerify(token)
  }

  // Temporary mock implementation for development
  return (
    <Box sx={{ my: 2 }}>
      <Alert severity='info' sx={{ mb: 2 }}>
        <Typography variant='body2' gutterBottom>
          <strong>CAPTCHA Integration Required</strong>
        </Typography>
        <Typography variant='caption' component='div'>
          To enable CAPTCHA:
          <br />
          1. Install: <code>npm install react-google-recaptcha</code>
          <br />
          2. Get reCAPTCHA site key from{' '}
          <a
            href='https://www.google.com/recaptcha/admin'
            target='_blank'
            rel='noopener noreferrer'
          >
            Google reCAPTCHA
          </a>
          <br />
          3. Add to .env: <code>REACT_APP_RECAPTCHA_SITE_KEY=your_key</code>
          <br />
          4. Uncomment production code in Captcha.tsx
        </Typography>
      </Alert>

      {/* Mock CAPTCHA for development */}
      <Box
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          CAPTCHA Placeholder (Development Mode)
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
          Click below to simulate verification
        </Typography>
        <Box
          component='button'
          onClick={() => handleChange('mock-captcha-token')}
          sx={{
            mt: 2,
            px: 3,
            py: 1,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            border: 'none',
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'success.dark',
            },
          }}
        >
          Verify (Mock)
        </Box>
      </Box>
    </Box>
  )
}

export default Captcha
