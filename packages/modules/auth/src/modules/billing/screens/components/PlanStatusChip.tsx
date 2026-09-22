import React from 'react'
import { Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { BillingSubscriptionStatus } from '../../types/billing.types'

const STATUS_COLOR: Record<
  BillingSubscriptionStatus,
  'success' | 'info' | 'warning' | 'error' | 'default'
> = {
  active: 'success',
  trialing: 'info',
  past_due: 'warning',
  canceled: 'error',
  none: 'default',
}

const STATUS_DEFAULT: Record<BillingSubscriptionStatus, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Payment past due',
  canceled: 'Canceled',
  none: 'Free',
}

/** Subscription status as a chip whose colour comes from the theme palette. */
const PlanStatusChip: React.FC<{ status: BillingSubscriptionStatus }> = ({ status }) => {
  const { t } = useTranslation()
  return (
    <Chip
      size='small'
      color={STATUS_COLOR[status]}
      label={t(`billing.status.${status}`, STATUS_DEFAULT[status])}
      data-testid='plan-status-chip'
    />
  )
}

export default PlanStatusChip
