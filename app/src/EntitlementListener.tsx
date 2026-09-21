import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@mui/material'
import { toast } from 'react-toastify'
import { onEntitlementRequired } from '@cap/platform-core'
import { buildUpgradePath } from './utils/buildUpgradePath'

/**
 * Turns a 402 `feature_not_entitled` from any gated endpoint into an actionable
 * toast with an "Upgrade" button, mirroring how `ForbiddenListener` surfaces
 * 403s. It renders nothing.
 *
 * The toast is keyed by feature, so a screen that fires several gated requests
 * at once shows one notice rather than a stack. Nothing here calls the API, so a
 * 402 cannot loop: the upgrade page reads only ungated billing endpoints.
 */
const EntitlementListener: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  React.useEffect(() => {
    return onEntitlementRequired((payload) => {
      const feature = t(`billing.features.${payload.feature}`, payload.feature)
      const upgradePath = buildUpgradePath(payload)

      toast.warning(
        ({ closeToast }) => (
          <div>
            <div>
              {t('billing.prompt.message', '{{feature}} is not included in your current plan.', {
                feature,
              })}
            </div>
            <Button
              color='inherit'
              variant='outlined'
              size='small'
              sx={{ mt: 1, minHeight: 44 }}
              onClick={() => {
                closeToast?.()
                navigate(upgradePath)
              }}
            >
              {t('billing.prompt.action', 'View plans')}
            </Button>
          </div>
        ),
        {
          toastId: `entitlement-${payload.feature}`,
          position: 'top-center',
          autoClose: 10000,
          closeOnClick: false,
        },
      )
    })
  }, [navigate, t])

  return null
}

export default EntitlementListener
