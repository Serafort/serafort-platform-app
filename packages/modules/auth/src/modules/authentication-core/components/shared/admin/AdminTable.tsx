import React from 'react'
import {
  Card,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  alpha,
  type CardProps,
  type TableCellProps,
  type TableHeadProps,
  type TablePaginationProps,
  type TableRowProps,
} from '@mui/material'

/**
 * Table layout primitives that pin the admin-console table surface to the same
 * anatomy `AccountOverview.tsx` established: a 16px outlined card with a hairline
 * divider and the faint `0 1px 3px rgba(0,0,0,0.03)` shadow, an uppercase
 * caption header row, and body rows that can be made click-through to a detail
 * route without an eye or pencil icon in a trailing action column.
 *
 * Every registry and dashboard screen had hand-rolled its own `<Card>` +
 * `<TableContainer>` + `<TableHead sx={{ bgcolor: 'action.hover' }}>`, so the
 * radius, header weight and row hover drifted between them. These wrappers are
 * deliberately thin — a screen still composes `<Table>`, `<TableBody>` and its
 * own cells — so adoption is incremental and nothing here hides MUI's API.
 */

export type AdminTableCardProps = CardProps

/** 16px outlined card wrapper. `overflow: hidden` clips the header tint and the last row to the radius. */
export const AdminTableCard: React.FC<AdminTableCardProps> = ({ sx, children, ...props }) => (
  <Card
    variant='outlined'
    {...props}
    sx={{
      borderRadius: '16px',
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      overflow: 'hidden',
      ...sx,
    }}
  >
    {children}
  </Card>
)

export type AdminTableHeadProps = TableHeadProps

/** `<TableHead>` with the standard faint tint. Pair its cells with `AdminTableHeadCell`. */
export const AdminTableHead: React.FC<AdminTableHeadProps> = ({ sx, children, ...props }) => (
  <TableHead
    {...props}
    sx={{
      bgcolor: (theme) => alpha(theme.palette.action.hover, 0.5),
      ...sx,
    }}
  >
    {children}
  </TableHead>
)

export type AdminTableHeadCellProps = TableCellProps

/** Header cell: 0.75rem, 700, uppercase, letter-spaced, `text.secondary`. */
export const AdminTableHeadCell: React.FC<AdminTableHeadCellProps> = ({ sx, children, ...props }) => (
  <TableCell
    {...props}
    sx={{
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: 'text.secondary',
      borderColor: 'divider',
      whiteSpace: 'nowrap',
      ...sx,
    }}
  >
    {children}
  </TableCell>
)

export interface AdminTableRowProps extends TableRowProps {
  /**
   * Marks the whole row as a navigation/edit target: pointer cursor, a hover
   * tint, and — when `onClick` is set — keyboard operability (Enter / Space,
   * `role="button"`, `tabIndex=0`). Put `stopPropagation` on any nested menu or
   * destructive button so it does not also trigger the row.
   */
  clickable?: boolean
}

/** Body row with a consistent hover transition; opt into `clickable` for whole-row navigation. */
export const AdminTableRow: React.FC<AdminTableRowProps> = ({
  clickable = false,
  onClick,
  onKeyDown,
  sx,
  children,
  ...props
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    onKeyDown?.(event)
    if (!clickable || !onClick || event.defaultPrevented) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(event as unknown as React.MouseEvent<HTMLTableRowElement>)
    }
  }

  return (
    <TableRow
      hover
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={clickable && onClick ? 'button' : undefined}
      tabIndex={clickable && onClick ? 0 : undefined}
      {...props}
      sx={{
        transition: 'background-color 0.15s ease',
        '& > .MuiTableCell-root': { borderColor: 'divider' },
        '&:last-of-type > .MuiTableCell-root': { border: 0 },
        ...(clickable && {
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.04),
          },
          '&:focus-visible': {
            outline: (theme) => `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '-2px',
          },
        }),
        ...sx,
      }}
    >
      {children}
    </TableRow>
  )
}

export type AdminTablePaginationProps = TablePaginationProps

/** Pagination footer with the standard `borderTop` divider. */
export const AdminTablePagination: React.FC<AdminTablePaginationProps> = ({ sx, ...props }) => (
  <TablePagination
    {...props}
    sx={{
      borderTop: '1px solid',
      borderColor: 'divider',
      ...sx,
    }}
  />
)
