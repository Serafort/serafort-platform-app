import React from 'react'
import { Box, Button, alpha, type ButtonProps } from '@mui/material'

export type AuthSocialProvider = 'google' | 'github' | 'sso'

export interface AuthSocialButtonProps extends Omit<ButtonProps, 'children' | 'startIcon'> {
  /** Selects the built-in brand glyph. Omit and pass `icon` for a custom mark. */
  provider?: AuthSocialProvider
  /** Already-translated button text, e.g. `t('auth.login.google', 'Google')`. */
  label: React.ReactNode
  /** Overrides the provider glyph — used for a tenant's own SSO badge. */
  icon?: React.ReactNode
}

/**
 * The single social / federated sign-in button used by both the sign-in and
 * sign-up screens.
 *
 * The two screens had drifted: sign-in rendered full-colour brand SVGs inside a
 * 48px `height` button, sign-up rendered monochrome `@mui/icons-material`
 * glyphs inside a `py: 1.2` button with a different hover tint. They sat side by
 * side in the same funnel and looked like two different design systems. This
 * fixes the height (48px, the Fitts's Law floor), the 12px radius, the border,
 * the hover tint and the focus ring in one place, and bakes in the colour brand
 * marks so every entry point shows the same glyph.
 */
const GoogleGlyph = () => (
  <Box
    component='svg'
    aria-hidden
    sx={{ height: 20, width: 20, display: 'flex' }}
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
      fill='#4285F4'
    />
    <path
      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
      fill='#34A853'
    />
    <path
      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
      fill='#FBBC05'
    />
    <path
      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
      fill='#EA4335'
    />
  </Box>
)

const GitHubGlyph = () => (
  <Box
    component='svg'
    aria-hidden
    sx={{ height: 20, width: 20, display: 'flex', color: 'text.primary' }}
    fill='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.05-.015-2.055-3.33.72-4.035-1.605-4.035-1.605-.54-1.38-1.335-1.755-1.335-1.755-1.085-.735.09-.72.09-.72 1.2.09 1.83 1.23 1.83 1.23 1.065 1.815 2.805 1.29 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.28-1.56 3.3-1.245 3.3-1.245.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z' />
  </Box>
)

const PROVIDER_GLYPH: Record<AuthSocialProvider, React.ReactNode> = {
  google: <GoogleGlyph />,
  github: <GitHubGlyph />,
  sso: null,
}

const AuthSocialButton: React.FC<AuthSocialButtonProps> = ({
  provider,
  label,
  icon,
  sx,
  ...props
}) => (
  <Button
    fullWidth
    variant='outlined'
    startIcon={icon ?? (provider ? PROVIDER_GLYPH[provider] : undefined)}
    {...props}
    sx={{
      height: 48,
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 700,
      fontSize: '0.875rem',
      borderColor: 'divider',
      color: 'text.primary',
      fontFamily: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease-in-out',
      '& .MuiButton-startIcon': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        m: 0,
        mr: 1,
      },
      '&:hover': {
        bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05),
        borderColor: 'text.secondary',
      },
      '&:focus': {
        boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
      },
      ...sx,
    }}
  >
    {label}
  </Button>
)

export default AuthSocialButton
