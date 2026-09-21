import React, { useCallback, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Language from '@mui/icons-material/Language'
import Refresh from '@mui/icons-material/Refresh'
import Add from '@mui/icons-material/Add'
import Verified from '@mui/icons-material/Verified'
import Pending from '@mui/icons-material/Pending'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { useCheckDomain, useDomains, useVerifyDomain } from '../../hooks/useAdminQuery'
import { normalizeDomain } from '../../../authentication-core/utils/schema'
import { useActiveOrganizationId } from '../../../authentication-core/hooks/useActiveOrganizationId'
import {
  AdminDataState,
  AdminPageHeader,
  AdminTableCard,
  AdminTableHead,
  AdminTableHeadCell,
  AdminStatusBadge,
  AdminRowActionButton,
} from '../../../authentication-core/components/shared/admin'
import { AuthCopyField } from '../../../authentication-core/components/shared/auth'

/*
 * The backend compares the published TXT record against the token with a plain
 * equality check — `resolveTxt(domain)`, then `txtRecord === verification_token`
 * in `domains_controller.verify`. There is no prefix, so the value to publish
 * is the bare token.
 *
 * This screen previously told the user to publish `opencode-verification=<token>`.
 * That record could never match, so following the instructions exactly meant
 * verification always failed.
 *
 * Note the record goes on the apex domain: the controller resolves `domain`
 * itself, even though `DomainVerification.getDnsRecord()` in the backend model
 * names `_verification.<domain>`. The controller is what runs on verify.
 *
 * `http` records are checked by fetching `/.well-known/oneauth-verification`
 * on the domain instead, so their instructions differ.
 */

const HTTP_VERIFICATION_PATH = '/.well-known/oneauth-verification'

/*
 * Feedback goes through a toast. It used to go to `useNotifications`, which
 * only files an entry in the header's notification inbox, so adding or
 * checking a domain gave no visible response on the page itself.
 */
function notify({
  type,
  title,
  message,
}: {
  type: 'success' | 'warning' | 'error'
  title: string
  message: string
}) {
  toast[type](
    <Box>
      <Typography variant='subtitle2' component='p' sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant='body2' component='p'>
        {message}
      </Typography>
    </Box>,
  )
}

const DomainVerification: React.FC = () => {
  const { t } = useTranslation()
  const orgId = useActiveOrganizationId()

  const [newDomain, setNewDomain] = useState('')
  const [checkingId, setCheckingId] = useState<string | null>(null)

  /*
   * The organization's full registry, from GET /api/admin/domains. This screen
   * used to start empty on every visit and show only what the current session
   * had added, because no list endpoint existed.
   */
  const domainsQuery = useDomains(orgId)
  const domains = domainsQuery.data ?? []
  const verifyDomain = useVerifyDomain()
  const checkDomain = useCheckDomain()
  const isAdding = verifyDomain.isPending

  const handleAddDomain = useCallback(async () => {
    const normalized = normalizeDomain(newDomain)
    if (!normalized) {
      notify({
        type: 'error',
        title: t('auth.admin.domainVerification.invalid_title', 'That does not look like a domain'),
        message: t(
          'auth.admin.domainVerification.invalid_body',
          'Enter a domain such as acme.com, or a full URL to have it normalised.',
        ),
      })
      return
    }

    try {
      // No organization id is sent: the backend resolves it from the session.
      // This used to send `Number(orgId)`, which is NaN for the UUID ids the
      // backend uses, so every add failed with "No organization found".
      const response = await verifyDomain.mutateAsync({ domain: normalized })
      if (response.data) {
        setNewDomain('')
        notify({
          type: 'success',
          title: t('auth.admin.domainVerification.added_title', 'Domain added'),
          message: t(
            'auth.admin.domainVerification.added_body',
            'Add the TXT record below to your DNS, then check the status.',
          ),
        })
      }
    } catch (error) {
      const conflict = (error as { status?: number } | null)?.status === 409
      notify({
        type: 'error',
        title: t('auth.admin.domainVerification.add_failed_title', 'The domain could not be added'),
        message: conflict
          ? t(
              'auth.admin.domainVerification.add_conflict_body',
              'This domain is already registered to another organization.',
            )
          : t(
              'auth.admin.domainVerification.add_failed_body',
              'Nothing has been changed. Check the domain and try again.',
            ),
      })
    }
  }, [newDomain, t, verifyDomain])

  // Takes the record rather than just its id: the backend looks the pending
  // verification up by domain name, and the id is still needed to slot the
  // refreshed record back into the list.
  const handleCheckStatus = useCallback(
    async (domainId: string, domainName: string) => {
      setCheckingId(domainId)
      try {
        const response = await checkDomain.mutateAsync({ domain: domainName })
        if (response.data) {
          const updated = response.data
          if (updated.status === 'verified') {
            notify({
              type: 'success',
              title: t('auth.admin.domainVerification.verified_title', 'Domain verified'),
              message: t(
                'auth.admin.domainVerification.verified_body',
                'This domain is now verified for your organization.',
              ),
            })
          } else {
            notify({
              type: 'warning',
              title: t('auth.admin.domainVerification.pending_title', 'Not verified yet'),
              message: t(
                'auth.admin.domainVerification.pending_body',
                'The verification record was not found. DNS changes can take up to an hour to propagate.',
              ),
            })
          }
        }
      } catch {
        notify({
          type: 'error',
          title: t('auth.admin.domainVerification.check_failed_title', 'The status could not be checked'),
          message: t(
            'auth.admin.domainVerification.check_failed_body',
            'The request did not complete. Try again in a moment.',
          ),
        })
      } finally {
        setCheckingId(null)
      }
    },
    [checkDomain, t],
  )

  const verifiedCount = domains.filter((entry) => entry.status === 'verified').length
  const totalCount = domains.length

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <AdminPageHeader
        icon={<Language sx={{ fontSize: 28 }} />}
        title={t('auth.admin.domainVerification.title', 'Domain verification')}
        description={t(
          'auth.admin.domainVerification.subtitle',
          'Verify that you own a domain to enable SSO, email branding and automated provisioning for its addresses.',
        )}
        actions={
          totalCount > 0 ? (
            <Chip
              icon={
                verifiedCount === totalCount ? (
                  <Verified sx={{ fontSize: '1rem' }} />
                ) : (
                  <Pending sx={{ fontSize: '1rem' }} />
                )
              }
              label={t('auth.admin.domainVerification.progress', {
                verified: verifiedCount,
                total: totalCount,
                defaultValue: '{{verified}} of {{total}} verified',
              })}
              color={verifiedCount === totalCount ? 'success' : 'warning'}
              variant='outlined'
              sx={{ fontWeight: 800, borderRadius: 'var(--sf-radius-full, 9999px)', px: 1, height: 36 }}
            />
          ) : undefined
        }
      />

      <Alert severity='info' sx={{ mb: 4, borderRadius: 'var(--sf-radius-md, 10px)' }}>
        {t(
          'auth.admin.domainVerification.how_it_works',
          'Add a domain to receive a verification token, publish it as a TXT record in that domain’s DNS, then check the status here.',
        )}
      </Alert>

      <Card
        sx={{
          borderRadius: 'var(--sf-radius-lg, 16px)',
          mb: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography component='h2' variant='h6' sx={{ fontWeight: 800, mb: 2 }}>
            {t('auth.admin.domainVerification.add_title', 'Add a domain')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems='flex-start'>
            <TextField
              fullWidth
              label={t('auth.admin.domainVerification.field_label', 'Domain')}
              placeholder={t('auth.admin.domainVerification.field_placeholder', 'acme.com')}
              value={newDomain}
              onChange={(event) => setNewDomain(event.target.value)}
              helperText={t(
                'auth.admin.domainVerification.field_help',
                'A full URL works too — it is reduced to its domain automatically.',
              )}
              disabled={isAdding}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && newDomain && !isAdding) handleAddDomain()
              }}
              sx={{ '& .MuiOutlinedInput-root': { minHeight: 48 } }}
            />
            <Button
              variant='contained'
              onClick={handleAddDomain}
              disabled={!newDomain || isAdding}
              startIcon={isAdding ? <CircularProgress size={18} color='inherit' /> : <Add />}
              sx={{
                minHeight: 48,
                px: 4,
                borderRadius: 'var(--sf-radius-md, 8px)',
                textTransform: 'none',
                fontWeight: 700,
                flexShrink: 0,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {t('auth.admin.domainVerification.add_action', 'Add domain')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <AdminTableCard>
        <TableContainer>
          <Table>
            <AdminTableHead>
              <TableRow>
                <AdminTableHeadCell>
                  {t('auth.admin.domainVerification.col_domain', 'Domain')}
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  {t('auth.admin.domainVerification.col_status', 'Status')}
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  {t('auth.admin.domainVerification.col_method', 'Method')}
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  {t('auth.admin.domainVerification.col_added', 'Added')}
                </AdminTableHeadCell>
                <AdminTableHeadCell align='right'>
                  {t('auth.admin.domainVerification.col_actions', 'Actions')}
                </AdminTableHeadCell>
              </TableRow>
            </AdminTableHead>
            <TableBody>
            <AdminDataState
              asTableRow
              skeletonColumns={5}
              loading={domainsQuery.isLoading}
              error={domainsQuery.error}
              onRetry={() => domainsQuery.refetch()}
              empty={domains.length === 0}
              emptyIcon={<Language sx={{ fontSize: 32 }} />}
              emptyTitle={t('auth.admin.domainVerification.empty_title', 'No domains added yet')}
              emptyDescription={t(
                'auth.admin.domainVerification.empty_body',
                'Add a domain above to get its verification token.',
              )}
            >
              {domains.map((domain) => {
                const verified = domain.status === 'verified'
                const isHttp = domain.method === 'http'
                return (
                  <React.Fragment key={domain.id}>
                    <TableRow hover>
                      <TableCell>
                        <Stack direction='row' spacing={1.5} alignItems='center'>
                          <Language color='primary' aria-hidden />
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>
                            {domain.domain}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge
                          tone={verified ? 'success' : 'warning'}
                          label={
                            verified
                              ? t('auth.admin.domainVerification.status_verified', 'Verified')
                              : t('auth.admin.domainVerification.status_pending', 'Pending')
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {isHttp
                            ? t('auth.admin.domainVerification.method_http', 'HTTP file')
                            : t('auth.admin.domainVerification.method_dns', 'DNS TXT')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption' color='text.secondary'>
                          {domain.created_at
                            ? new Date(domain.created_at).toLocaleDateString()
                            : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        {/*
                          The delete control that used to sit here had no
                          onClick and no endpoint behind it, so it did nothing
                          when pressed. Removed rather than left as a control
                          that looks operable.
                        */}
                        {!verified && (
                          <Tooltip
                            title={t('auth.admin.domainVerification.check_action', 'Check verification status')}
                          >
                            <span>
                              <AdminRowActionButton
                                aria-label={t(
                                  'auth.admin.domainVerification.check_action',
                                  'Check verification status',
                                )}
                                disabled={checkingId === domain.id}
                                onClick={() => handleCheckStatus(domain.id, domain.domain)}
                              >
                                {checkingId === domain.id ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <Refresh fontSize='small' />
                                )}
                              </AdminRowActionButton>
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>

                    {!verified && domain.verification_token && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ bgcolor: 'action.hover' }}>
                          <Box sx={{ py: 1 }}>
                            <Typography
                              variant='caption'
                              sx={{ fontWeight: 800, mb: 1, display: 'block' }}
                            >
                              {isHttp
                                ? t('auth.admin.domainVerification.http_required', {
                                    url: `https://${domain.domain}${HTTP_VERIFICATION_PATH}`,
                                    defaultValue: 'Serve this value as the only content of {{url}}',
                                  })
                                : t('auth.admin.domainVerification.txt_required', 'Add this DNS TXT record')}
                            </Typography>
                            {/*
                              Was a hand-rolled code box on `grey.900` with a
                              bare clipboard write — a fixed dark surface that
                              ignores the tenant theme, and no feedback if the
                              browser denied clipboard access. The shared field
                              handles the copied state and announces it.
                            */}
                            <AuthCopyField
                              value={domain.verification_token}
                              label={
                                isHttp
                                  ? t('auth.admin.domainVerification.http_label', 'File content')
                                  : t(
                                      'auth.admin.domainVerification.txt_label',
                                      'TXT record value, on {{domain}}',
                                      { domain: domain.domain },
                                    )
                              }
                              copyLabel={
                                isHttp
                                  ? t('auth.admin.domainVerification.http_copy', 'Copy file content')
                                  : t('auth.admin.domainVerification.txt_copy', 'Copy TXT record')
                              }
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })}
            </AdminDataState>
            </TableBody>
          </Table>
        </TableContainer>
      </AdminTableCard>
    </Box>
  )
}

export default DomainVerification
