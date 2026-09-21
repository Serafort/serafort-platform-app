import React from 'react'
import { Box, Stack } from '@mui/material'
import AuthPageLayout from './AuthPageLayout'
import AuthCard from './AuthCard'
import AuthCardHeader from './AuthCardHeader'
import AuthSecurityNote from './AuthSecurityNote'
import type { AuthTone } from './authTone'

export interface AuthOutcomeScreenProps {
  icon: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  tone?: AuthTone
  /** Rendered between the description and the actions (badges, chips, timers). */
  children?: React.ReactNode
  /** Primary/secondary CTAs, stacked with consistent spacing. */
  actions?: React.ReactNode
  /** Reassurance line under the card. */
  securityNote?: React.ReactNode
  maxWidth?: number
}

/**
 * Terminal-state screen: verified, failed, expired, reset complete, and so on.
 *
 * Roughly a dozen screens each hand-rolled this same avatar/title/description/
 * button stack with their own spacing, max width and colour handling, which is
 * why "success" looked different depending on which flow you arrived from.
 * They now differ only in content.
 */
const AuthOutcomeScreen: React.FC<AuthOutcomeScreenProps> = ({
  icon,
  title,
  description,
  tone = 'primary',
  children,
  actions,
  securityNote,
  maxWidth = 460,
}) => (
  <AuthPageLayout maxWidth={maxWidth} backdrop={tone === 'error' ? 'subtle' : 'standard'}>
    <AuthCard padding='comfortable'>
      <Box sx={{ textAlign: 'center' }}>
        <AuthCardHeader
          icon={icon}
          title={title}
          subtitle={description}
          tone={tone}
          toneTitle={false}
          iconSize={64}
        />
        {children}
        {actions && (
          <Stack spacing={1.5} sx={{ mt: 3 }}>
            {actions}
          </Stack>
        )}
      </Box>
    </AuthCard>
    {securityNote && <AuthSecurityNote>{securityNote}</AuthSecurityNote>}
  </AuthPageLayout>
)

export default AuthOutcomeScreen
