import React from 'react'
import { Box, Link as MuiLink, useTheme } from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'

export interface AuthBackLinkProps {
  label?: React.ReactNode
  children?: React.ReactNode
  onClick: () => void
  id?: string
}

/**
 * "Back to sign in" affordance.
 *
 * The arrow is swapped rather than transformed so it points the correct way in
 * RTL: `stylis-plugin-rtl` flips physical spacing but cannot flip the glyph
 * inside an icon font.
 */
const AuthBackLink: React.FC<AuthBackLinkProps> = ({ label, children, onClick, id }) => {
  const theme = useTheme()
  const isRtl = theme.direction === 'rtl'

  return (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <MuiLink
        id={id}
        component='button'
        type='button'
        onClick={onClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          minHeight: 44,
          px: 1,
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'text.secondary',
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': { color: 'primary.main' },
          '& .MuiSvgIcon-root': { fontSize: 18, transition: 'transform 0.2s' },
          '&:hover .MuiSvgIcon-root': {
            transform: isRtl ? 'translateX(4px)' : 'translateX(-4px)',
          },
        }}
      >
        {isRtl ? <ArrowForward /> : <ArrowBack />}
        {label ?? children}
      </MuiLink>
    </Box>
  )
}

export default AuthBackLink
