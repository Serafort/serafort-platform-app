import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Alert, Box, Button, Card, CardContent, Stack, Tooltip, Typography } from '@mui/material'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import HighlightOff from '@mui/icons-material/HighlightOff'
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined'
import { useTranslation } from 'react-i18next'
import { useCan } from '@cap/authorization'
import { AdminDataState, AdminPageHeader } from '../../authentication-core/components/shared/admin'
import { BILLING_FEATURES, BILLING_METRICS } from '../types/billing.types'
import type { BillingEntitlements } from '../types/billing.types'
import { useEntitlementsQuery, usePortalMutation, useUsageQuery } from '../hooks/useBillingQuery'
import { describeBillingError, formatBillingDate } from '../utils/billingFormat'
import PlanStatusChip from './components/PlanStatusChip'
import UsageMeter from './components/UsageMeter'
import Path from './path'

const FEATURE_DEFAULTS: Record<(typeof BILLING_FEATURES)[number], string> = {
  allow_scim: 'SCIM provisioning',
  allow_saml_sso: 'SAML single sign-on',
  allow_jit: 'Just-in-time provisioning',
  allow_audit_anchoring: 'Audit chain anchoring',
}

const METRIC_DEFAULTS: Record<(typeof BILLING_METRICS)[number], string> = {
  mau: 'Monthly active users',
  m2m: 'Machine-to-machine tokens',
  sms: 'SMS messages',
}

const PlanNotices: React.FC<{ entitlements: BillingEntitlements; locale: string }> = ({
  entitlements,
  locale,
}) => {
  const { t } = useTranslation()
  const grace = formatBillingDate(entitlements.grace_ends_at, locale)
  const periodEnd = formatBillingDate(entitlements.current_period_end, locale)

  return (
    <Stack gap={1.5}>
      {entitlements.status === 'past_due' && (
        <Alert severity='warning' data-testid='past-due-banner'>
          {grace
            ? t(
                'billing.notice.past_due',
                'Your last payment failed. Paid features stay on until {{date}}. Update your payment method in Manage billing to avoid losing them.',
                { date: grace },
              )
            : t(
                'billing.notice.past_due_no_date',
                'Your last payment failed. Update your payment method in Manage billing to keep your paid features.',
              )}
        </Alert>
      )}
      {entitlements.downgraded && entitlements.status !== 'past_due' && (
        <Alert severity='info'>
          {t(
            'billing.notice.downgraded',
            'Your paid plan is no longer active, so paid features are switched off. Upgrade to restore them.',
          )}
        </Alert>
      )}
      {periodEnd && (
        <Typography variant='body2' color='text.secondary'>
          {entitlements.cancel_at_period_end
            ? t('billing.notice.cancels', 'Your plan ends on {{date}}.', { date: periodEnd })
            : t('billing.notice.renews', 'Renews on {{date}}.', { date: periodEnd })}
        </Typography>
      )}
    </Stack>
  )
}

export const BillingOverview: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isAdmin = useCan('access', { type: 'admin_route' })
  const entitlementsQuery = useEntitlementsQuery()
  const usageQuery = useUsageQuery()
  const portal = usePortalMutation()

  const entitlements = entitlementsQuery.data
  const usage = usageQuery.data
  const portalError = portal.error ? describeBillingError(portal.error) : null

  const manageButton = (
    <Button
      variant='outlined'
      startIcon={<CreditCardOutlined />}
      onClick={() => portal.mutate()}
      disabled={!isAdmin || portal.isPending}
      sx={{ minHeight: 44 }}
    >
      {t('billing.actions.manage', 'Manage billing')}
    </Button>
  )

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <AdminPageHeader
        title={t('billing.overview.title', 'Billing & plan')}
        description={t(
          'billing.overview.subtitle',
          'Your plan, its status and how much of each limit you have used this period.',
        )}
        icon={<CreditCardOutlined />}
        actions={
          isAdmin ? (
            manageButton
          ) : (
            <Tooltip
              title={t(
                'billing.actions.manage_admin_only',
                'Only organization admins can manage billing.',
              )}
            >
              <span>{manageButton}</span>
            </Tooltip>
          )
        }
      />

      {portalError && (
        <Alert severity='error' sx={{ mb: 2 }} data-testid='portal-error'>
          {t(portalError.key, portalError.defaultValue)}
          {portalError.code === 'no_stripe_customer' && (
            <Button
              component={RouterLink}
              to={Path.upgrade}
              size='small'
              sx={{ marginInlineStart: 1 }}
            >
              {t('billing.actions.upgrade', 'Upgrade plan')}
            </Button>
          )}
        </Alert>
      )}

      <AdminDataState
        loading={entitlementsQuery.isLoading}
        error={entitlementsQuery.error}
        onRetry={() => entitlementsQuery.refetch()}
      >
        {entitlements && (
          <Stack gap={3}>
            <Card variant='outlined'>
              <CardContent>
                <Stack direction='row' alignItems='center' justifyContent='space-between' gap={2}>
                  <Box>
                    <Typography variant='overline' color='text.secondary'>
                      {t('billing.overview.current_plan', 'Current plan')}
                    </Typography>
                    <Typography variant='h5' data-testid='current-plan-name'>
                      {entitlements.plan_name}
                    </Typography>
                  </Box>
                  <PlanStatusChip status={entitlements.status} />
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <PlanNotices entitlements={entitlements} locale={i18n.language} />
                </Box>

                <Stack component='ul' gap={0.75} sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }}>
                  {BILLING_FEATURES.map((feature) => {
                    const on = entitlements.features[feature]
                    return (
                      <Stack
                        component='li'
                        key={feature}
                        direction='row'
                        alignItems='center'
                        gap={1}
                        color={on ? 'text.primary' : 'text.disabled'}
                      >
                        {on ? (
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
                </Stack>

                <Button
                  component={RouterLink}
                  to={Path.upgrade}
                  variant='contained'
                  sx={{ mt: 3, minHeight: 44 }}
                >
                  {t('billing.actions.view_plans', 'View plans')}
                </Button>
              </CardContent>
            </Card>

            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6'>
                  {t('billing.usage.title', 'Usage this period')}
                </Typography>
                {usage && (
                  <Typography variant='caption' color='text.secondary'>
                    {t('billing.usage.period', 'Usage for {{start}} to {{end}}', {
                      start: formatBillingDate(usage.period_start, i18n.language) ?? '',
                      end: formatBillingDate(usage.period_end, i18n.language) ?? '',
                    })}
                  </Typography>
                )}
                <AdminDataState
                  loading={usageQuery.isLoading}
                  error={usageQuery.error}
                  onRetry={() => usageQuery.refetch()}
                >
                  {usage && (
                    <Stack gap={2.5} sx={{ mt: 2 }}>
                      {BILLING_METRICS.map((metric) => (
                        <UsageMeter
                          key={metric}
                          label={t(`billing.usage.${metric}`, METRIC_DEFAULTS[metric])}
                          metric={usage.usage[metric]}
                        />
                      ))}
                    </Stack>
                  )}
                </AdminDataState>
              </CardContent>
            </Card>
          </Stack>
        )}
      </AdminDataState>
    </Box>
  )
}

export default BillingOverview
