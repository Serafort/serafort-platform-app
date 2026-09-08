import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Card,
  Alert,
  AlertTitle,
  Skeleton,
} from '@mui/material'
import Refresh from '@mui/icons-material/Refresh'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Email from '@mui/icons-material/Email'
import MarkEmailUnreadOutlined from '@mui/icons-material/MarkEmailUnreadOutlined'
import { useTranslation } from 'react-i18next'
import { Empty } from '@cap/theme'
import { Path } from '@cap/module-auth/routes/path'
import { useEmailChanges } from '@auth/user-directory/hooks/useUserQuery'
import { EmailChangeRequest } from '../../types/api.types'
import {
  AuthPageLayout,
  AuthCardHeader,
  AuthStatusBadge,
  type AuthStatus,
} from '../../components/shared/auth'

/**
 * Maps the backend's request lifecycle onto the shared status vocabulary, so a
 * pending email change reads identically here and on the verification screens.
 */
const STATUS_MAP: Record<string, { status: AuthStatus; labelKey: string; fallback: string }> = {
  completed: { status: 'verified', labelKey: 'email.statusCompleted', fallback: 'Completed' },
  pending_authorization: {
    status: 'pending',
    labelKey: 'email.statusPending',
    fallback: 'Pending Auth',
  },
  expired: { status: 'expired', labelKey: 'email.statusExpired', fallback: 'Expired' },
  failed: { status: 'failed', labelKey: 'email.statusFailed', fallback: 'Failed' },
  cancelled: { status: 'revoked', labelKey: 'email.statusCancelled', fallback: 'Cancelled' },
}

const COLUMN_COUNT = 3

export default function EmailChangeStatus() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { data: response, isLoading, isError, refetch } = useEmailChanges()
  const requests: EmailChangeRequest[] = response?.data || []

  const renderStatus = (rawStatus: string) => {
    const config = STATUS_MAP[rawStatus]
    if (!config) {
      return <AuthStatusBadge status='pending' label={rawStatus} size='small' />
    }
    return (
      <AuthStatusBadge
        status={config.status}
        label={t(config.labelKey, config.fallback)}
        size='small'
      />
    )
  }

  const hasRequests = requests.length > 0
  const pendingCount = requests.filter((r) => r.status === 'pending_authorization').length

  return (
    // Declared `noLayout`, so this screen renders without the admin shell and
    // has to supply its own page frame. Top-aligned rather than centred: the
    // request table grows with the number of requests, and a centred tall
    // table pushes its own heading above the fold.
    <AuthPageLayout maxWidth={900} align='top' backdrop='subtle'>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <AuthCardHeader
          icon={<Email sx={{ fontSize: 32 }} />}
          title={t('email.statusHeading', 'Email Management')}
          subtitle={t(
            'email.statusDescription',
            'Track and manage your email address change requests.',
          )}
          align='start'
        />

        <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <Tooltip title={t('common.refresh', 'Refresh')}>
            <span>
              <IconButton
                onClick={() => refetch()}
                disabled={isLoading}
                aria-label={t('common.refresh', 'Refresh')}
                sx={{ width: 44, height: 44, border: '1px solid', borderColor: 'divider' }}
              >
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant='contained'
            component={Link}
            to={Path.account.overview}
            endIcon={<ArrowForward />}
            sx={{
              minHeight: 44,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 800,
            }}
          >
            {t('email.newRequest', 'New Request')}
          </Button>
        </Box>
      </Box>

      {/*
        A pending change invalidates the previous verification token, and users
        who request twice otherwise get a silently dead link in their inbox.
      */}
      {pendingCount > 0 && (
        <Alert
          severity='warning'
          icon={<MarkEmailUnreadOutlined />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <AlertTitle sx={{ fontWeight: 800 }}>
            {t('email.pendingWarningTitle', 'Verification pending')}
          </AlertTitle>
          {t(
            'email.pendingWarningBody',
            'Requesting another change invalidates the link already sent to your inbox.',
          )}
        </Alert>
      )}

      {isError && (
        <Alert
          severity='error'
          role='alert'
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color='inherit' size='small' onClick={() => refetch()}>
              {t('common.retry', 'Retry')}
            </Button>
          }
        >
          {t('common.errorLoading', 'Failed to load changes.')}
        </Alert>
      )}

      <Card
        sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
      >
        {!isLoading && !isError && !hasRequests ? (
          <Box sx={{ py: 6 }}>
            <Empty
              title={t('email.noRequests', 'No email change requests found.')}
              description={t(
                'email.noRequestsDescription',
                'When you request a new email address, its verification progress appears here.',
              )}
              action={{
                label: t('email.newRequest', 'New Request'),
                onClick: () => navigate(Path.account.overview),
              }}
            />
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  {[
                    t('email.colEmails', 'Email Addresses'),
                    t('email.colDate', 'Date Requested'),
                    t('email.colStatus', 'Status'),
                  ].map((heading) => (
                    <TableCell key={heading}>
                      <Typography
                        variant='caption'
                        sx={{
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: 'text.secondary',
                        }}
                      >
                        {heading}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {Array.from({ length: COLUMN_COUNT }).map((__, cell) => (
                        <TableCell key={cell}>
                          <Skeleton variant='text' height={28} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {!isLoading &&
                  requests.map((request) => (
                    <TableRow key={request.id} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {request.newEmail}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {t('email.from', 'from')}: {request.oldEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {request.date}
                        </Typography>
                      </TableCell>
                      <TableCell>{renderStatus(request.status)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Box sx={{ mt: 4 }}>
        <Button
          onClick={() => navigate(Path.account.profile)}
          startIcon={<ArrowBack />}
          sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
        >
          {t('common.backToDashboard', 'Back to Dashboard')}
        </Button>
      </Box>
    </AuthPageLayout>
  )
}
