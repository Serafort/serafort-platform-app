import React, { forwardRef } from 'react'
import { toneVars } from '../auth/authTone'
import {
  Box,
  Card,
  IconButton,
  TableCell,
  TableHead,
  TableRow,
  alpha,
  type CardProps,
  type IconButtonProps,
  type SxProps,
  type TableCellProps,
  type TableHeadProps,
  type TableRowProps,
  type Theme,
} from '@mui/material'

/**
 * Table layout primitives that pin the admin-console table surface to the
 * Serafort brand-kit reference (`uikit.html#table`): a 12px outlined card with
 * a hairline divider, an uppercase caption header row that reads through
 * typography alone (no tinted band), and body rows that can be made
 * click-through to a detail route without an eye or pencil icon in a trailing
 * action column.
 *
 * Every registry and dashboard screen had hand-rolled its own `<Card>` +
 * `<TableContainer>` + `<TableHead sx={{ bgcolor: 'action.hover' }}>`, so the
 * radius, header weight and row hover drifted between them. These wrappers are
 * deliberately thin — a screen still composes `<Table>`, `<TableBody>` and its
 * own cells — so adoption is incremental and nothing here hides MUI's API.
 */

/** Fold a caller `sx` (object OR theme callback OR array) onto a base without losing either. */
const mergeSx = (
  base: SxProps<Theme>,
  extra?: SxProps<Theme>,
): SxProps<Theme> => [base, ...(Array.isArray(extra) ? extra : [extra])] as SxProps<Theme>

export type AdminTableCardProps = CardProps

/** 16px outlined card wrapper. `overflow: hidden` clips the header tint and the last row to the radius. */
export const AdminTableCard: React.FC<AdminTableCardProps> = ({ sx, children, ...props }) => (
  <Card
    variant='outlined'
    {...props}
    sx={mergeSx(
      {
        borderRadius: 'var(--sf-radius-lg, 12px)',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        boxShadow: 'var(--sf-shadow-sm, none)',
        overflow: 'hidden',
      },
      sx,
    )}
  >
    {children}
  </Card>
)

export type AdminTableHeadProps = TableHeadProps

/**
 * `<TableHead>` with no distinct fill — it sits on the same surface as the
 * body and reads as a header through typography alone (`AdminTableHeadCell`),
 * matching the brand-kit table anatomy. The theme's `MuiTableHead` override
 * still paints an opaque background (required for `stickyHeader`), so this
 * intentionally does not add its own tint on top of it.
 */
export const AdminTableHead: React.FC<AdminTableHeadProps> = ({ sx, children, ...props }) => (
  <TableHead {...props} sx={sx}>
    {children}
  </TableHead>
)

export type AdminTableHeadCellProps = TableCellProps

/** Header cell: 11px mono, 500, uppercase, letter-spaced, tertiary/muted colour. */
export const AdminTableHeadCell: React.FC<AdminTableHeadCellProps> = ({ sx, children, ...props }) => (
  <TableCell
    {...props}
    sx={mergeSx(
      (theme: Theme) => ({
        fontFamily: 'var(--sf-font-mono, ui-monospace, monospace)',
        fontSize: 'var(--sf-text-2xs, 0.6875rem)',
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: `var(--sf-text-tertiary, ${theme.palette.text.disabled})`,
        borderColor: 'divider',
        whiteSpace: 'nowrap',
      }),
      sx,
    )}
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
      sx={mergeSx(
        {
          transition: 'background-color var(--sf-duration-fast, 120ms) var(--sf-ease-standard, ease)',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          '& > .MuiTableCell-root': { borderColor: 'divider' },
          '&:last-of-type > .MuiTableCell-root': { border: 0 },
          ...(clickable && {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: (theme: Theme) =>
                `var(--sf-surface-sunken, ${theme.palette.action.hover})`,
            },
            '&:focus-visible': {
              outline: '2px solid var(--sf-cyan, currentColor)',
              outlineOffset: '-2px',
            },
          }),
        },
        sx,
      )}
    >
      {children}
    </TableRow>
  )
}

export interface AdminRowActionButtonProps extends Omit<IconButtonProps, 'color'> {
  /**
   * `'default'` reads neutral at rest and only tints on hover — the right
   * choice for an ambiguous trigger (an overflow `MoreVert` menu). `'error'`
   * keeps a single-purpose destructive action (delete) recognisable at rest.
   */
  color?: 'default' | 'primary' | 'error'
}

/**
 * Trailing action-column icon button, forwardRef'd so it composes under
 * `<Tooltip>`. Every registry screen had rebuilt this by hand — some at the
 * 44×44 Fitts's-law minimum with a radius token, several without either, a
 * few wrapped in a permanently-outlined square. This is the one shape: a
 * 44×44 hit target, `--sf-radius-md` corners, and a flat colour that only
 * reads as a hover tint rather than a permanent outline.
 */
export const AdminRowActionButton = forwardRef<HTMLButtonElement, AdminRowActionButtonProps>(
  ({ color = 'default', sx, ...props }, ref) => (
    <IconButton
      ref={ref}
      {...props}
      sx={mergeSx(
        (theme: Theme) => {
          const swatch = color === 'default' ? theme.palette.text.secondary : theme.palette[color].main
          const hoverBg =
            color === 'default'
              ? alpha(theme.palette.text.primary, 0.05)
              : alpha(theme.palette[color].main, 0.08)
          return {
            width: 44,
            height: 44,
            borderRadius: 'var(--sf-radius-md, 8px)',
            color: swatch,
            '&:hover': { backgroundColor: hoverBg },
          }
        },
        sx,
      )}
    />
  ),
)
AdminRowActionButton.displayName = 'AdminRowActionButton'

export type AdminStatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral'

export interface AdminStatusBadgeProps {
  /** Semantic state the badge communicates. `neutral` is for inactive/unset states — no color implies risk or success. */
  tone: AdminStatusTone
  label: React.ReactNode
  sx?: SxProps<Theme>
}

/**
 * Pill status badge — dot + label — matching the brand-kit `.badge` anatomy
 * (`uikit.html#badges`): a full-radius pill with a hairline semantic border,
 * a mono label, and a solid dot that carries the state. Replaces the ad-hoc
 * filled square `Chip`s (`borderRadius: 'var(--sf-radius-xs)'`, a leading
 * icon) that status columns had drifted into — every state now reads the
 * same shape whether it is "Verified", "Suspended" or "Pending".
 */
export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({ tone, label, sx }) => (
  <Box
    component='span'
    sx={mergeSx(
      (theme: Theme) => {
        const isNeutral = tone === 'neutral'
        const vars = isNeutral ? null : toneVars(theme, tone === 'info' ? 'primary' : tone)
        const main = isNeutral ? theme.palette.text.secondary : theme.palette[tone].main
        const textColor = vars ? vars.text : theme.palette.text.secondary
        return {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--sf-font-mono, ui-monospace, monospace)',
          fontSize: 'var(--sf-text-xs, 0.75rem)',
          fontWeight: 500,
          lineHeight: 1,
          padding: '4px 10px',
          borderRadius: 'var(--sf-radius-full, 9999px)',
          border: '1px solid',
          borderColor: vars ? vars.border : 'var(--sf-border, currentColor)',
          backgroundColor: vars ? vars.bg : 'var(--sf-surface-sunken, transparent)',
          color: textColor,
          '& .dot': {
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: main,
            flex: 'none',
          },
        }
      },
      sx,
    )}
  >
    <Box component='span' className='dot' />
    {label}
  </Box>
)

