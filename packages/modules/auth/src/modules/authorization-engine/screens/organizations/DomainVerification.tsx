import React, { useCallback, useEffect, useState } from 'react'
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
import { useNotifications } from '@cap/platform-core'

import { adminService, DomainVerification as DomainType } from '../../services/adminService'
import { normalizeDomain } from '../../../authentication-core/utils/schema'
import { useActiveOrganizationId } from '../../../authentication-core/hooks/useActiveOrganizationId'
import {
  AdminDataState,
  AdminPageHeader,
  AdminTableCard,
  AdminTableHead,
  AdminTableHeadCell,
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
 */

const DomainVerification: React.FC = () => {
  const { t } = useTranslation()
  const { addNotification } = useNotifications()
  const orgId = useActiveOrganizationId()

  const [domains, setDomains] = useState<DomainType[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [checkingId, setCheckingId] = useState<number | null>(null)

  /*
   * The backend serves POST /domains/verify and POST /domains/check, but no
   * endpoint that lists an organization's domains — see `adminService`, where
   * the org-scoped list routes are documented as never having been served.
   * The screen therefore starts empty and shows what this session adds or
   * checks, rather than the organization's full registry. It used to seed
   * itself with a hardcoded `example.com` row, which read as real data.
   */
  useEffect(() => {
    setDomains([])
  }, [orgId])

  const handleAddDomain = useCallback(async () => {
    const normalized = normalizeDomain(newDomain)
    if (!normalized) {
      addNotification({
        type: 'error',
        title: t('auth.admin.domainVerification.invalid_title', 'That does not look like a domain'),
        message: t(
          'auth.admin.domainVerification.invalid_body',
          'Enter a domain such as acme.com, or a full URL to have it normalised.',
        ),
      })
      return
    }

    setIsAdding(true)
    try {
      const response = await adminService.verifyDomain(Number(orgId), normalized)
      if (response.data) {
        setDomains((current) => [
          ...current.filter((entry) => entry.domain !== response.data!.domain),
          response.data,
        ])
        setNewDomain('')
        addNotification({
          type: 'success',
          title: t('auth.admin.domainVerification.added_title', 'Domain added'),
          message: t(
            'auth.admin.domainVerification.added_body',
            'Add the TXT record below to your DNS, then check the status.',
          ),
        })
      }
    } catch {
      addNotification({
        type: 'error',
        title: t('auth.admin.domainVerification.add_failed_title', 'The domain could not be added'),
        message: t(
          'auth.admin.domainVerification.add_failed_body',
          'Nothing has been changed. Check the domain and try again.',
        ),
      })
    } finally {
      setIsAdding(false)
    }
  }, [addNotification, newDomain, orgId, t])

  // Takes the record rather than just its id: the backend looks the pending
  // verification up by domain name, and the id is still needed to slot the
  // refreshed record back into the list.
  const handleCheckStatus = useCallback(
    async (domainId: number, domainName: string) => {
      setCheckingId(domainId)
      try {
        const response = await adminService.checkDomain(domainName)
        if (response.data) {
          const updated = response.data
          setDomains((current) =>
            current.map((entry) => (entry.id === domainId ? updated : entry)),
          )
          if (updated.status === 'verified') {
            addNotification({
              type: 'success',
              title: t('auth.admin.domainVerification.verified_title', 'Domain verified'),
              message: t(
                'auth.admin.domainVerification.verified_body',
                'This domain is now verified for your organization.',
              ),
            })
          } else {
            addNotification({
              type: 'warning',
              title: t('auth.admin.domainVerification.pending_title', 'Not verified yet'),
              message: t(
                'auth.admin.domainVerification.pending_body',
                'The TXT record was not found. DNS changes can take up to an hour to propagate.',
              ),
            })
          }
        }
      } catch {
        addNotification({
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
    [addNotification, t],
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
              skeletonColumns={4}
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
                        <Chip
                          icon={verified ? <Verified /> : <Pending />}
                          label={
                            verified
                              ? t('auth.admin.domainVerification.status_verified', 'Verified')
                              : t('auth.admin.domainVerification.status_pending', 'Pending')
                          }
                          color={verified ? 'success' : 'warning'}
                          size='small'
                          sx={{ borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 800 }}
                        />
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
                              <IconButton
                                color='primary'
                                aria-label={t(
                                  'auth.admin.domainVerification.check_action',
                                  'Check verification status',
                                )}
                                disabled={checkingId === domain.id}
                                onClick={() => handleCheckStatus(domain.id, domain.domain)}
                                sx={{ width: 44, height: 44 }}
                              >
                                {checkingId === domain.id ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <Refresh fontSize='small' />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>

                    {!verified && domain.verification_token && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ bgcolor: 'action.hover' }}>
                          <Box sx={{ py: 1 }}>
                            <Typography
                              variant='caption'
                              sx={{ fontWeight: 800, mb: 1, display: 'block' }}
                            >
                              {t('auth.admin.domainVerification.txt_required', 'Add this DNS TXT record')}
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
                              label={t(
                                'auth.admin.domainVerification.txt_label',
                                'TXT record value, on {{domain}}',
                                { domain: domain.domain },
                              )}
                              copyLabel={t('auth.admin.domainVerification.txt_copy', 'Copy TXT record')}
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
