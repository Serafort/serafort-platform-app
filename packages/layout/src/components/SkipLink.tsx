import React from 'react'
import { styled } from '@mui/material/styles'

const StyledSkipLink = styled('a')(({ theme }) => ({
  position: 'fixed',
  top: '-9999px',
  left: '-9999px',
  zIndex: 99999,
  padding: theme.spacing(1, 2.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  fontSize: '0.875rem',
  textDecoration: 'none',
  boxShadow: theme.shadows[6],
  borderRadius: theme.shape.borderRadius,
  transition: 'none',
  '&:focus-visible': {
    top: 16,
    left: 16,
    outline: `3px solid ${theme.palette.common.white}`,
    outlineOffset: 2,
  },
}))

export interface SkipLinkProps {
  targetId?: string
  label?: string
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  label = 'Skip to main content',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.tabIndex = -1
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <StyledSkipLink href={`#${targetId}`} onClick={handleClick} aria-label={label}>
      {label}
    </StyledSkipLink>
  )
}

export default SkipLink
