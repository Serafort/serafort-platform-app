import React from 'react'
import { Box, Button, Skeleton, Stack, TableCell, TableRow } from '@mui/material'
import Refresh from '@mui/icons-material/Refresh'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import { useTranslation } from 'react-i18next'
import AdminEmptyState from './AdminEmptyState'

export interface AdminDataStateProps {
  loading?: boolean
  error?: unknown
  /** True when the fetch succeeded but returned nothing. */
  empty?: boolean
  /** Retry handler; the error panel hides its button when absent. */
  onRetry?: () => void
  /** Rows of skeleton to draw while loading. */
  skeletonRows?: number
  /** Columns per skeleton row. Match the table's header count. */
  skeletonColumns?: number
  /** Renders the states as `<TableRow>`s so they can sit inside a `<TableBody>`. */
  asTableRow?: boolean
  emptyIcon?: React.ReactNode
  /** Already-translated empty headline. */
  emptyTitle?: React.ReactNode
  /** Already-translated empty explanation. */
  emptyDescription?: React.ReactNode
  /** Onboarding CTA shown in the empty panel. */
  emptyAction?: React.ReactNode
  /** The success state. */
  children: React.ReactNode
}

/**
 * Resolves a collection screen into exactly one of the four UI states.
 *
 * Every table in this module hand-rolled its own ternary ladder, and each one
 * dropped a state: most rendered loading and empty but silently showed an empty
 * table on failure, so a 500 was indistinguishable from "you have no roles".
 * Routing them all through here makes the error state impossible to omit and
 * gives it the retry the ladders never had.
 *
 * Loading draws skeleton rows shaped like the real table rather than a centred
 * spinner, so the row height does not jump when data lands.
 */
const AdminDataState: React.FC<AdminDataStateProps> = ({
  loading,
  error,
  empty,
  onRetry,
  skeletonRows = 5,
  skeletonColumns = 5,
  asTableRow = false,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}) => {
  const { t } = useTranslation('auth')

  const wrap = (content: React.ReactNode) =>
    asTableRow ? (
      <TableRow>
        <TableCell colSpan={skeletonColumns} sx={{ borderBottom: 0, p: 0 }}>
          {content}
        </TableCell>
      </TableRow>
    ) : (
      <>{content}</>
    )

  if (loading) {
    if (asTableRow) {
      return (
        <>
          {Array.from({ length: skeletonRows }).map((_, row) => (
            <TableRow key={row}>
              {Array.from({ length: skeletonColumns }).map((__, col) => (
                <TableCell key={col}>
                  <Skeleton variant='text' height={24} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </>
      )
    }
    return (
      <Stack spacing={1.5} sx={{ py: 2 }} aria-busy>
        {Array.from({ length: skeletonRows }).map((_, row) => (
          <Skeleton key={row} variant='rounded' height={56} />
        ))}
      </Stack>
    )
  }

  if (error) {
    return wrap(
      <AdminEmptyState
        variant='error'
        icon={<ErrorOutline sx={{ fontSize: 32 }} />}
        title={t('admin.state.errorTitle', 'This list could not be loaded')}
        description={t(
          'admin.state.errorDescription',
          'The request did not complete. Nothing has been changed — try again, and if it keeps failing the service may be unavailable.',
        )}
        action={
          onRetry ? (
            <Button
              variant='outlined'
              startIcon={<Refresh />}
              onClick={onRetry}
              sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', fontWeight: 700, textTransform: 'none' }}
            >
              {t('admin.state.retry', 'Try again')}
            </Button>
          ) : undefined
        }
      />,
    )
  }

  if (empty) {
    return wrap(
      <AdminEmptyState
        icon={emptyIcon}
        title={emptyTitle ?? t('admin.state.emptyTitle', 'Nothing here yet')}
        description={emptyDescription}
        action={emptyAction}
      />,
    )
  }

  return <>{children}</>
}

export default AdminDataState
