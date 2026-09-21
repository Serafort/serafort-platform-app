// Admin console kit — the shared header, metric, state and filter primitives
// for the authorization and access-control screens. Distinct from the auth
// funnel kit in ../auth: these compose full-width management surfaces inside
// the admin shell rather than a centred card.
export {
  default as AdminPageHeader,
  type AdminPageHeaderProps,
  type AdminBreadcrumb,
} from './AdminPageHeader'
export { default as AdminStatCard, type AdminStatCardProps } from './AdminStatCard'
export { default as AdminEmptyState, type AdminEmptyStateProps } from './AdminEmptyState'
export { default as AdminDataState, type AdminDataStateProps } from './AdminDataState'
export { default as AdminSearchField, type AdminSearchFieldProps } from './AdminSearchField'
export {
  AdminTableCard,
  AdminTableHead,
  AdminTableHeadCell,
  AdminTableRow,
  AdminStatusBadge,
  AdminRowActionButton,
  type AdminTableCardProps,
  type AdminTableHeadProps,
  type AdminTableHeadCellProps,
  type AdminTableRowProps,
  type AdminStatusTone,
  type AdminStatusBadgeProps,
  type AdminRowActionButtonProps,
} from './AdminTable'
