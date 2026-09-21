import React from 'react'
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import HighlightOff from '@mui/icons-material/HighlightOff'
import { useTranslation } from 'react-i18next'
import {
  BILLING_FEATURES,
  BILLING_LIMITS,
  type BillingLimit,
  type BillingPlan,
} from '../../types/billing.types'
import { formatBillingNumber } from '../../utils/billingFormat'

export interface PlanCardProps {
  plan: BillingPlan
  isCurrent: boolean
  /** The plan that unlocks the feature the user was sent here for. */
  isRecommended: boolean
  /** Upgrade button, "current plan" chip, or nothing. */
  action: React.ReactNode
}

const FEATURE_DEFAULTS = {
  allow_scim: 'SCIM provisioning',
  allow_saml_sso: 'SAML single sign-on',
  allow_jit: 'Just-in-time provisioning',
  allow_audit_anchoring: 'Audit chain anchoring',
} as const

const LIMIT_DEFAULTS: Record<BillingLimit, string> = {
  max_mau: 'Monthly active users',
  max_m2m_tokens: 'Machine-to-machine tokens per month',
  max_sms: 'SMS messages per month',
}

/**
 * One plan column of the comparison. The current plan gets a primary outline and
 * the plan that unlocks the requested feature a secondary one with a badge, both
 * from theme palette tokens, so the two are distinguishable without relying on
 * colour alone (each also carries a text chip).
 */
const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrent, isRecommended, action }) => {
  const { t, i18n } = useTranslation()

  const outline = isRecommended ? 'secondary.main' : isCurrent ? 'primary.main' : 'divider'

  const limitText = (value: number | null) =>
    value === null
      ? t('billing.unlimited', 'Unlimited')
      : value === 0
        ? t('billing.not_included', 'Not included')
        : formatBillingNumber(value, i18n.language)

  return (
    <Card
      variant='outlined'
      data-testid={`plan-card-${plan.key}`}
      data-current={isCurrent}
      data-recommended={isRecommended}
      sx={{
        borderColor: outline,
        borderWidth: isRecommended || isCurrent ? 2 : 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' gap={1}>
          <Typography variant='h6'>{plan.name}</Typography>
          <Stack direction='row' gap={0.5}>
            {isCurrent && (
              <Chip
                size='small'
                color='primary'
                label={t('billing.upgrade.current', 'Current plan')}
              />
            )}
            {isRecommended && (
              <Chip
                size='small'
                color='secondary'
                label={t('billing.upgrade.recommended', 'Unlocks this feature')}
              />
            )}
          </Stack>
        </Stack>

        <Box component='ul' sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 0.75 }}>
          {BILLING_FEATURES.map((feature) => {
            const included = plan.features[feature]
            return (
              <Stack
                component='li'
                key={feature}
                direction='row'
                alignItems='center'
                gap={1}
                color={included ? 'text.primary' : 'text.disabled'}
                data-feature={feature}
                data-included={included}
              >
                {included ? (
                  <CheckCircleOutline fontSize='small' color='success' />
                ) : (
                  <HighlightOff fontSize='small' color='disabled' />
                )}
                <Typography variant='body2'>
                  {t(`billing.features.${feature}`, FEATURE_DEFAULTS[feature])}
                </Typography>
              </Stack>
            )
          })}
        </Box>

        <Box component='dl' sx={{ m: 0, display: 'grid', gap: 0.75 }}>
          {BILLING_LIMITS.map((limit) => (
            <Stack key={limit} direction='row' justifyContent='space-between' gap={2}>
              <Typography component='dt' variant='body2' color='text.secondary'>
                {t(`billing.limits.${limit}`, LIMIT_DEFAULTS[limit])}
              </Typography>
              <Typography component='dd' variant='body2' sx={{ m: 0 }}>
                {limitText(plan.limits[limit])}
              </Typography>
            </Stack>
          ))}
        </Box>

        <Box sx={{ mt: 'auto' }}>{action}</Box>
      </CardContent>
    </Card>
  )
}

export default PlanCard
