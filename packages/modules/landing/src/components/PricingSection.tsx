import React from 'react'
import { Box, Container, Typography, Paper, Button, Chip, alpha, useTheme } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { useNavigate } from 'react-router-dom'

interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  ctaText: string
  ctaVariant: 'outlined' | 'contained'
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Basic job search',
      'Up to 10 applications/month',
      'Standard matching algorithm',
      'Email support',
      'Community access',
    ],
    ctaText: 'Get Started',
    ctaVariant: 'outlined',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For serious job seekers',
    features: [
      'Unlimited job searches',
      'Unlimited applications',
      'AI-powered resume optimization',
      'Priority support',
      'Advanced analytics dashboard',
      'Custom job alerts',
      'Interview preparation tools',
    ],
    highlighted: true,
    ctaText: 'Start Free Trial',
    ctaVariant: 'contained',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'Team collaboration tools',
      'API access',
      'White-label options',
      'SLA guarantee',
    ],
    ctaText: 'Contact Sales',
    ctaVariant: 'outlined',
  },
]

const PricingSection: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handlePlanClick = (planName: string) => {
    if (planName === 'Enterprise') {
      navigate('/contact')
    } else {
      navigate('/auth/sign-up')
    }
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth='lg'>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
            variant='h2'
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              mb: 2,
            }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant='body1'
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: 'text.secondary',
              lineHeight: 1.7,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Choose the perfect plan for your job search journey. All plans include 14-day free
            trial.
          </Typography>
        </Box>

        {/* Pricing Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
            alignItems: 'stretch',
          }}
        >
          {plans.map((plan, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 4,
                bgcolor: 'background.paper',
                border: plan.highlighted ? 2 : 1,
                borderColor: plan.highlighted ? 'primary.main' : 'divider',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.3s ease',
                transform: plan.highlighted ? { md: 'scale(1.05)' } : 'scale(1)',
                zIndex: plan.highlighted ? 2 : 1,
                '&:hover': {
                  transform: plan.highlighted ? { md: 'scale(1.08)' } : 'scale(1.03)',
                  borderColor: 'primary.main',
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <Chip
                  label='MOST POPULAR'
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'primary.main',
                    color: theme.palette.mode === 'dark' ? 'text.primary' : '#000',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                />
              )}

              {/* Plan Name */}
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                {plan.name}
              </Typography>

              {/* Description */}
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                }}
              >
                {plan.description}
              </Typography>

              {/* Price */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography
                    variant='h2'
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '3rem' },
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {plan.price}
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {plan.period}
                  </Typography>
                </Box>
              </Box>

              {/* Features List */}
              <Box sx={{ flexGrow: 1, mb: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {plan.features.map((feature, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                      }}
                    >
                      <CheckIcon
                        sx={{
                          fontSize: 20,
                          color: 'primary.main',
                          mt: 0.25,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant='body2'
                        sx={{
                          color: 'text.primary',
                          lineHeight: 1.6,
                        }}
                      >
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* CTA Button */}
              <Button
                variant={plan.ctaVariant}
                size='large'
                onClick={() => handlePlanClick(plan.name)}
                sx={{
                  minHeight: 48,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  ...(plan.ctaVariant === 'contained' && {
                    bgcolor: 'primary.main',
                    color: theme.palette.mode === 'dark' ? 'text.primary' : '#000',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
                    },
                  }),
                  ...(plan.ctaVariant === 'outlined' && {
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }),
                  transition: 'all 0.3s ease',
                }}
              >
                {plan.ctaText}
              </Button>
            </Paper>
          ))}
        </Box>

        {/* Bottom Note */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography
            variant='body2'
            sx={{
              color: 'text.secondary',
            }}
          >
            All plans include 14-day free trial. No credit card required. Cancel anytime.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default PricingSection
