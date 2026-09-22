import React from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Alert, Box, Button, Chip, Stack } from '@mui/material'
import WorkspacePremiumOutlined from '@mui/icons-material/WorkspacePremiumOutlined'
import { useTranslation } from 'react-i18next'
import { useCan } from '@cap/authorization'
import { AdminDataState, AdminPageHeader } from '../../authentication-core/components/shared/admin'
import {
  BILLING_FEATURES,
  BILLING_PLAN_KEYS,
  BILLING_PURCHASABLE_PLANS,
  type BillingFeature,
  type BillingPlanKey,
  type BillingPurchasablePlan,
} from '../types/billing.types'
import {
  useCheckoutMutation,
  useEntitlementsQuery,
  usePlansQuery,
  usePortalMutation,
} from '../hooks/useBillingQuery'
import { describeBillingError } from '../utils/billingFormat'
import { pickRecommendedPlan } from '../utils/recommendPlan'
import PlanCard from './components/PlanCard'
import Path from './path'

const FEATURE_DEFAULTS: Record<BillingFeature, string> = {
  allow_scim: 'SCIM provisioning',
  allow_saml_sso: 'SAML single sign-on',
  allow_jit: 'Just-in-time provisioning',
  allow_audit_anchoring: 'Audit chain anchoring',
}

/** Query params are user-editable, so only known values are ever honoured. */
const asFeature = (value: string | null): BillingFeature | null =>
  value && (BILLING_FEATURES as readonly string[]).includes(value)
    ? (value as BillingFeature)
    : null
const asPlanKey = (value: string | null): BillingPlanKey | null =>
  value && (BILLING_PLAN_KEYS as readonly string[]).includes(value)
    ? (value as BillingPlanKey)
    : null
const isPurchasable = (key: BillingPlanKey): key is BillingPurchasablePlan =>
  (BILLING_PURCHASABLE_PLANS as readonly string[]).includes(key)

export const BillingUpgrade: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const isAdmin = useCan('access', { type: 'admin_route' })
  const plansQuery = usePlansQuery()
  const entitlementsQuery = useEntitlementsQuery()
  const checkout = useCheckoutMutation()
  const portal = usePortalMutation()

  const feature = asFeature(searchParams.get('feature'))
  const requiredPlan = asPlanKey(searchParams.get('required_plan'))

  const plans = React.useMemo(
    () => [...(plansQuery.data?.plans ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [plansQuery.data],
  )
  const currentKey = entitlementsQuery.data?.plan
  const currentOrder = plans.find((plan) => plan.key === currentKey)?.sort_order ?? -1
  const recommendedKey = pickRecommendedPlan(plans, currentKey, feature, requiredPlan)
  const recommendedName = plans.find((plan) => plan.key === recommendedKey)?.name

  const error = checkout.error ?? portal.error
  const errorMessage = error ? describeBillingError(error) : null
  const pendingPlan = checkout.isPending ? checkout.variables : undefined

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <AdminPageHeader
        title={t('billing.upgrade.title', 'Choose a plan')}
        description={t('billing.upgrade.subtitle', 'Compare plans and upgrade when you need more.')}
        icon={<WorkspacePremiumOutlined />}
        breadcrumbs={[
          { label: t('billing.overview.title', 'Billing & plan'), to: Path.overview },
          { label: t('billing.upgrade.title', 'Choose a plan') },
        ]}
      />

      {feature && (
        <Alert severity='info' sx={{ mb: 2 }} data-testid='feature-required-banner'>
          {recommendedName
            ? t(
                'billing.upgrade.feature_required',
                '{{feature}} is not part of your plan. It is available on the {{plan}} plan.',
                {
                  feature: t(`billing.features.${feature}`, FEATURE_DEFAULTS[feature]),
                  plan: recommendedName,
                },
              )
            : t(
                'billing.upgrade.feature_required_generic',
                'That feature is not part of your plan.',
              )}
        </Alert>
      )}

      {!isAdmin && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          {t('billing.actions.manage_admin_only', 'Only organization admins can manage billing.')}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          severity='error'
          sx={{ mb: 2 }}
          data-testid='billing-error'
          action={
            errorMessage.code === 'already_subscribed' && isAdmin ? (
              <Button color='inherit' size='small' onClick={() => portal.mutate()}>
                {t('billing.actions.manage', 'Manage billing')}
              </Button>
            ) : undefined
          }
        >
          {t(errorMessage.key, errorMessage.defaultValue)}
        </Alert>
      )}

      <AdminDataState
        loading={plansQuery.isLoading}
        error={plansQuery.error}
        onRetry={() => plansQuery.refetch()}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: `repeat(${Math.max(plans.length, 1)}, 1fr)` },
          }}
        >
          {plans.map((plan) => {
            const isCurrent = plan.key === currentKey
            const canPurchase = isPurchasable(plan.key) && plan.sort_order > currentOrder
            return (
              <PlanCard
                key={plan.key}
                plan={plan}
                isCurrent={isCurrent}
                isRecommended={plan.key === recommendedKey}
                action={
                  canPurchase ? (
                    <Button
                      fullWidth
                      variant={plan.key === recommendedKey ? 'contained' : 'outlined'}
                      disabled={!isAdmin || checkout.isPending}
                      onClick={() => checkout.mutate(plan.key as BillingPurchasablePlan)}
                      sx={{ minHeight: 44 }}
                    >
                      {pendingPlan === plan.key
                        ? '…'
                        : t('billing.upgrade.select', 'Upgrade to {{plan}}', { plan: plan.name })}
                    </Button>
                  ) : isCurrent ? (
                    <Chip label={t('billing.upgrade.current', 'Current plan')} color='primary' />
                  ) : null
                }
              />
            )
          })}
        </Box>
        <Stack direction='row' sx={{ mt: 3 }}>
          <Button component={RouterLink} to={Path.overview}>
            {t('billing.overview.title', 'Billing & plan')}
          </Button>
        </Stack>
      </AdminDataState>
    </Box>
  )
}

export default BillingUpgrade
