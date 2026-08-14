import React from 'react'
import { Stack as MuiStack, StackProps as MuiStackProps } from '@mui/material'

export type SpacingKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number

export interface StackProps extends Omit<MuiStackProps, 'spacing'> {
  spacing?: SpacingKey
  children?: React.ReactNode
}

const SPACING_MAP: Record<string, number> = {
  xs: 1,  // 0.25rem = 4px
  sm: 2,  // 0.5rem = 8px
  md: 4,  // 1rem = 16px
  lg: 6,  // 1.5rem = 24px
  xl: 8,  // 2rem = 32px
  '2xl': 12, // 3rem = 48px
}

/**
 * Structural Spacing Component: Stack
 * Flex container that controls gap/spacing between children automatically.
 * Children should NOT specify contextual margins.
 */
export const Stack: React.FC<StackProps> = ({ spacing = 'md', children, ...rest }) => {
  const muiSpacing = typeof spacing === 'string' ? SPACING_MAP[spacing] ?? 4 : spacing

  return (
    <MuiStack spacing={muiSpacing} {...rest}>
      {children}
    </MuiStack>
  )
}

export default Stack
