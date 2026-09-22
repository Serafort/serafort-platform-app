import React from 'react'
import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  usageSeverity,
  type BillingUsageMetric,
  type UsageSeverity,
} from '../../types/billing.types'
import { formatBillingNumber } from '../../utils/billingFormat'

export interface UsageMeterProps {
  /** Already-translated metric name. */
  label: string
  metric: BillingUsageMetric
}

/** Theme palette slot for each severity. No colour literals: tokens only. */
const SEVERITY_COLOR: Record<UsageSeverity, 'primary' | 'warning' | 'error' | 'inherit'> = {
  ok: 'primary',
  warning: 'warning',
  error: 'error',
  unlimited: 'primary',
  excluded: 'inherit',
}

/**
 * One metered limit as a labelled progress bar.
 *
 * Amber (`warning`) from 80% and red (`error`) at 100%, the same thresholds the
 * backend uses to send its usage e-mails, so the screen and the notification
 * agree about when a limit is "close". A limit of 0 means the plan does not
 * include the metric, and an unlimited one has no ceiling to fill towards, so
 * neither draws a bar that could be misread as a percentage.
 */
const UsageMeter: React.FC<UsageMeterProps> = ({ label, metric }) => {
  const { t, i18n } = useTranslation()
  const severity = usageSeverity(metric)
  const locale = i18n.language
  const used = formatBillingNumber(metric.used, locale)

  const detail =
    severity === 'unlimited'
      ? t('billing.usage.used_only', '{{used}} used', { used })
      : severity === 'excluded'
        ? t('billing.not_included', 'Not included')
        : t('billing.usage.of', '{{used}} of {{limit}}', {
            used,
            limit: formatBillingNumber(metric.limit ?? 0, locale),
          })

  const hint =
    severity === 'error'
      ? t('billing.usage.exhausted', 'Limit reached. Upgrade to keep going.')
      : severity === 'warning'
        ? t('billing.usage.warning', 'Approaching your limit.')
        : null

  const rawPercent = metric.percent ?? (metric.limit ? (metric.used / metric.limit) * 100 : 0)
  const value = Math.max(0, Math.min(100, rawPercent))
  const showBar = severity !== 'unlimited' && severity !== 'excluded'

  return (
    <Box data-testid='usage-meter' data-severity={severity}>
      <Stack direction='row' justifyContent='space-between' alignItems='baseline' gap={2}>
        <Typography variant='subtitle2' component='span'>
          {label}
        </Typography>
        <Typography variant='body2' color='text.secondary' component='span'>
          {detail}
        </Typography>
      </Stack>
      {showBar && (
        <LinearProgress
          variant='determinate'
          value={value}
          color={SEVERITY_COLOR[severity]}
          aria-label={label}
          sx={{ mt: 1, height: 8, borderRadius: 4 }}
        />
      )}
      {hint && (
        <Typography
          variant='caption'
          role='status'
          sx={{ mt: 0.5, display: 'block' }}
          color={severity === 'error' ? 'error.main' : 'warning.main'}
        >
          {hint}
        </Typography>
      )}
    </Box>
  )
}

export default UsageMeter
