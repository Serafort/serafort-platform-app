import React from 'react'
import { Box, Typography, Alert } from '@mui/material'

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
  const handleChange = (token: string | null) => {
    onVerify(token)
  }

  /**
   * Production implementation:
   *
   * return (
   *   <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
   *     <ReCAPTCHA
   *       ref={recaptchaRef}
   *       sitekey={RECAPTCHA_SITE_KEY}
   *       onChange={handleChange}
   *       onErrored={handleError}
   *       onExpired={handleExpire}
   *       theme={theme}
   *       size={size}
   *     />
   *   </Box>
   * )
   */

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
          border: '2px dashed #ccc',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
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
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#45a049',
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
