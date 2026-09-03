import React from 'react'
import { Box } from '@mui/material'
import type { SpacingKey } from './Stack'

export interface SpacerProps {
  size?: SpacingKey
  axis?: 'vertical' | 'horizontal'
}

const SIZE_MAP: Record<string, string> = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
}

/**
 * Structural Spacing Component: Spacer
 * Used for explicit vertical or horizontal gaps in layout flows.
 */
export const Spacer: React.FC<SpacerProps> = ({ size = 'md', axis = 'vertical' }) => {
  const pixelSize = typeof size === 'number' ? `${size * 0.25}rem` : SIZE_MAP[size] ?? '1rem'

  const width = axis === 'horizontal' ? pixelSize : '1px'
  const height = axis === 'vertical' ? pixelSize : '1px'

  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        display: axis === 'horizontal' ? 'inline-block' : 'block',
        width,
        height,
        flexShrink: 0,
      }}
    />
  )
}

export default Spacer
