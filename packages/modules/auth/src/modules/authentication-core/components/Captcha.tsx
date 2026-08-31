import React from 'react'
import { Box, Typography, Alert } from '@mui/material'

interface CaptchaProps {
  onVerify: (token: string | null) => void
  onError?: () => void
  onExpire?: () => void
  theme?: 'light' | 'dark'
  size?: 'normal' | 'compact'
}

/**
 * Captcha — placeholder.
 *
 * SECURITY: this component is NOT a working CAPTCHA. The previous implementation
 * emitted a constant `'mock-captcha-token'`, which provides zero bot / credential
 * stuffing protection while looking production-ready. It now fails closed: it
 * renders integration instructions and never produces a token.
 *
 * To enable real protection, integrate a provider (Google reCAPTCHA v2/v3 or
 * Cloudflare Turnstile), have it call `onVerify(token)` with the provider token,
 * and ensure the backend verifies that token server-side on every guarded action.
 */
const Captcha: React.FC<CaptchaProps> = ({ onError }) => {
  React.useEffect(() => {
    // Signal to any consuming flow that verification is unavailable.
    onError?.()
  }, [onError])

  return (
    <Box sx={{ my: 2 }}>
      <Alert severity='warning'>
        <Typography variant='body2' gutterBottom>
          <strong>CAPTCHA is not configured</strong>
        </Typography>
        <Typography variant='caption' component='div'>
          Integrate a provider before relying on this control:
          <br />
          1. Install a provider SDK (e.g. <code>react-google-recaptcha</code> or Cloudflare
          Turnstile).
          <br />
          2. Add the site key via a build-time env var (site keys are public; secret keys stay on
          the backend).
          <br />
          3. Replace this component so the provider calls <code>onVerify(token)</code>.
          <br />
          4. Verify the token server-side on every protected endpoint.
        </Typography>
      </Alert>
    </Box>
  )
}

export default Captcha
