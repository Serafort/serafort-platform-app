import React from 'react'
import { Box, Typography, alpha, useTheme } from '@mui/material'

export interface AuthStepProgressStep {
  /** Stable identifier, used as the React key. */
  id: string
  /** Already-translated short label, e.g. "Account". */
  label: string
}

export interface AuthStepProgressProps {
  steps: AuthStepProgressStep[]
  /** Zero-based index of the step currently in progress. */
  activeIndex: number
  /** Accessible name for the progress group, e.g. "Sign-up progress". */
  label: string
  /** Already-translated "Step {{current}} of {{total}}" caption. */
  caption?: React.ReactNode
}

/**
 * Compact segmented progress for the multi-step onboarding wizards.
 *
 * A full MUI `Stepper` does not fit a 460px auth card without wrapping, and
 * the sign-up flow previously gave no indication of how many steps remained —
 * the mode simply swapped underneath the user. Segments carry the same
 * information in the space available, and each one is labelled so the progress
 * is not conveyed by colour alone.
 */
const AuthStepProgress: React.FC<AuthStepProgressProps> = ({
  steps,
  activeIndex,
  label,
  caption,
}) => {
  const theme = useTheme()

  return (
    <Box role='group' aria-label={label} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {steps.map((step, index) => {
          const isComplete = index < activeIndex
          const isActive = index === activeIndex
          return (
            <Box
              key={step.id}
              aria-current={isActive ? 'step' : undefined}
              sx={{ flex: 1, minInlineSize: 0 }}
            >
              <Box
                sx={{
                  height: 4,
                  borderRadius: 999,
                  bgcolor:
                    isComplete || isActive
                      ? 'primary.main'
                      : alpha(theme.palette.text.primary, 0.12),
                  opacity: isComplete ? 0.55 : 1,
                  transition: 'background-color 0.3s ease, opacity 0.3s ease',
                }}
              />
              <Typography
                variant='caption'
                noWrap
                sx={{
                  display: 'block',
                  mt: 0.75,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? 'text.primary' : 'text.secondary',
                }}
              >
                {step.label}
              </Typography>
            </Box>
          )
        })}
      </Box>
      {caption && (
        <Typography
          variant='caption'
          aria-live='polite'
          sx={{ display: 'block', mt: 1, color: 'text.secondary', fontWeight: 600 }}
        >
          {caption}
        </Typography>
      )}
    </Box>
  )
}

export default AuthStepProgress
