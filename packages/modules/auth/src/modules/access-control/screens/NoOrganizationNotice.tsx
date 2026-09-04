import { Alert, AlertTitle, Container } from '@mui/material'
import { useTranslation } from 'react-i18next'

/**
 * Shown when no organization can be resolved from the session.
 *
 * Every access-control route is organization-scoped, so without an id there is
 * nothing to fetch. Saying so is better than firing a request at
 * `/organizations/null/nfc/cards` and rendering whatever error comes back — the
 * cause is the session, not the endpoint, and the operator needs to be told to
 * select an organization rather than to report a fault.
 */
export const NoOrganizationNotice: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Container maxWidth='sm' sx={{ py: 6 }}>
      <Alert severity='info'>
        <AlertTitle>
          {t('accessControl.common.no_org_title', 'No organization selected')}
        </AlertTitle>
        {t(
          'accessControl.common.no_org_body',
          'Physical access control is managed per organization. Select one to see its badges, readers and entry logs.',
        )}
      </Alert>
    </Container>
  )
}

export default NoOrganizationNotice
