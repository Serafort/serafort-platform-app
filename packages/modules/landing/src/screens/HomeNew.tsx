import { Box, Divider } from '@mui/material'
import { GuestBanner } from '@cap/layout'
import { useGuest } from '@cap/platform-core'
import { useNavigate } from 'react-router-dom'
import {
  HeroSection,
  SmartJobDiscovery,
  ResumeIntelligence,
  AutomationEngine,
  DashboardInsights,
  Testimonials,
  PricingSection,
  FAQSection,
} from '../components'

export default function Home() {
  const { isGuest } = useGuest()
  const navigate = useNavigate()

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Guest Mode Banner */}
      {isGuest && (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1100 }}>
          <GuestBanner
            variant='minimal'
            message='Create a free account to unlock all features and save your job searches!'
            isGuest={isGuest}
            onSignIn={() => navigate('/auth/sign-in')}
            onSignUp={() => navigate('/auth/register')}
          />
        </Box>
      )}

      {/* Hero Section */}
      <HeroSection />

      <Divider sx={{ opacity: 0.1 }} />

      {/* Smart Job Discovery Section */}
      <SmartJobDiscovery />

      <Divider sx={{ opacity: 0.1 }} />

      {/* Resume Intelligence Section */}
      <ResumeIntelligence />

      <Divider sx={{ opacity: 0.1 }} />

      {/* Automation Engine Section */}
      <AutomationEngine />

      <Divider sx={{ opacity: 0.1 }} />

      {/* Dashboard Insights Section */}
      <DashboardInsights />

      <Divider sx={{ opacity: 0.1 }} />

      {/* Testimonials Section */}
      <Testimonials />

      <Divider sx={{ opacity: 0.1 }} />

      {/* Pricing Section */}
      <PricingSection />

      <Divider sx={{ opacity: 0.1 }} />

      {/* FAQ Section */}
      <FAQSection />
    </Box>
  )
}
