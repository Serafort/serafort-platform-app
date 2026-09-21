import React from 'react'
import { Box, Typography, type SxProps, type Theme } from '@mui/material'
import type { AuthTone } from '../../authentication-core/components/shared/auth'
import { toneVars } from '../../authentication-core/components/shared/auth/authTone'
import { MONO_FONT } from './tokens'

/**
 * Admin detail-page panels pinned to the Serafort brand kit (`uikit.html`
 * cards, alerts, meta rows). These are the building blocks the token, role,
 * policy, passkey and account screens share so every one of them has the
 * same card radius, section rhythm and tint treatment.
 */

// ---------------------------------------------------------------------------
// SectionCard: bordered surface with an icon + title + description header.
// ---------------------------------------------------------------------------
export interface SectionCardProps {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  tone?: AuthTone
  /** Right-aligned header content (button, badge). */
  action?: React.ReactNode
  /** Footer band, typically the section's single save button. */
  footer?: React.ReactNode
  /** Heavy left stripe that flags the card as a destructive zone. */
  danger?: boolean
  /** Removes body padding for tables and lists that run edge to edge. */
  flush?: boolean
  children?: React.ReactNode
  id?: string
  component?: React.ElementType
  sx?: SxProps<Theme>
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  icon,
  tone = 'primary',
  action,
  footer,
  danger = false,
  flush = false,
  children,
  id,
  component = 'section',
  sx,
}) => {
  const headingId = id ? `${id}-title` : undefined
  return (
    <Box
      component={component}
      id={id}
      aria-labelledby={title ? headingId : undefined}
      sx={[
        (theme) => {
          const v = toneVars(theme, danger ? 'error' : tone)
          return {
            bgcolor: 'background.paper',
            border: 'var(--sf-border-1, 1px) solid',
            borderColor: danger ? v.border : 'divider',
            borderInlineStart: danger
              ? `var(--sf-border-4, 4px) solid ${v.dot}`
              : 'var(--sf-border-1, 1px) solid',
            borderInlineStartColor: danger ? v.dot : 'divider',
            borderRadius: 'var(--sf-radius-lg, 12px)',
            boxShadow: 'var(--sf-shadow-sm, none)',
            overflow: 'hidden',
          }
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {(title || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexWrap: 'wrap',
            gap: 2,
            px: { xs: 2.5, sm: 3 },
            pt: { xs: 2.5, sm: 3 },
            pb: children ? 0 : { xs: 2.5, sm: 3 },
          }}
        >
          {icon && (
            <Box
              aria-hidden
              sx={(theme) => {
                const v = toneVars(theme, danger ? 'error' : tone)
                return {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  bgcolor: v.bg,
                  border: `var(--sf-border-1, 1px) solid ${v.border}`,
                  color: v.text,
                }
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title && (
              <Typography
                id={headingId}
                component='h2'
                sx={{
                  fontFamily: 'var(--sf-font-display, inherit)',
                  fontSize: 'var(--sf-text-md, 0.9375rem)',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: danger
                    ? 'var(--sf-error-text, inherit)'
                    : 'text.primary',
                }}
              >
                {title}
              </Typography>
            )}
            {description && (
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 'var(--sf-text-sm, 0.8125rem)',
                  color: 'text.secondary',
                  lineHeight: 1.5,
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
          {action && <Box sx={{ flexShrink: 0, maxWidth: '100%' }}>{action}</Box>}
        </Box>
      )}
      {children && (
        <Box sx={{ p: flush ? 0 : { xs: 2.5, sm: 3 }, pt: flush ? 0 : title ? { xs: 2, sm: 2.5 } : undefined }}>
          {children}
        </Box>
      )}
      {footer && (
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 1.5,
            bgcolor: 'var(--sf-surface-sunken, transparent)',
            borderBlockStart: 'var(--sf-border-1, 1px) solid',
            borderColor: 'divider',
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  )
}

// ---------------------------------------------------------------------------
// MetaItem: mono 11px uppercase caption over a 14px value (brand table head
// recipe applied to a definition list).
// ---------------------------------------------------------------------------
export interface MetaItemProps {
  label: React.ReactNode
  children: React.ReactNode
  mono?: boolean
  sx?: SxProps<Theme>
}

export const MetaItem: React.FC<MetaItemProps> = ({ label, children, mono = false, sx }) => (
  <Box sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    <Typography
      component='dt'
      sx={{
        fontFamily: MONO_FONT,
        fontSize: 'var(--sf-text-2xs, 0.6875rem)',
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: 'var(--sf-text-tertiary, text.secondary)',
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    <Typography
      component='dd'
      sx={{
        m: 0,
        fontFamily: mono ? MONO_FONT : undefined,
        fontSize: 'var(--sf-text-base, 0.875rem)',
        fontWeight: 600,
        color: 'text.primary',
        overflowWrap: 'anywhere',
      }}
    >
      {children}
    </Typography>
  </Box>
)

/** Responsive definition-list grid for `MetaItem`s. */
export const MetaGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({
  children,
  columns = 3,
}) => (
  <Box
    component='dl'
    sx={{
      m: 0,
      display: 'grid',
      gap: 3,
      gridTemplateColumns: {
        xs: '1fr 1fr',
        md: `repeat(${columns}, minmax(0, 1fr))`,
      },
    }}
  >
    {children}
  </Box>
)

// ---------------------------------------------------------------------------
// TintAlert: brand alert. Bold lead line (what happened) then one sentence.
// ---------------------------------------------------------------------------
export interface TintAlertProps {
  tone?: Exclude<AuthTone, 'primary'>
  title?: React.ReactNode
  children?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  /** Announce assertively (errors the user must not miss). */
  assertive?: boolean
  sx?: SxProps<Theme>
}

export const TintAlert: React.FC<TintAlertProps> = ({
  tone = 'info',
  title,
  children,
  icon,
  action,
  assertive,
  sx,
}) => (
  <Box
    role={assertive || tone === 'error' ? 'alert' : 'status'}
    sx={[
      (theme) => {
        const v = toneVars(theme, tone)
        return {
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          px: 2,
          py: 1.75,
          bgcolor: v.bg,
          border: `var(--sf-border-1, 1px) solid ${v.border}`,
          borderRadius: 'var(--sf-radius-md, 8px)',
          '& .alert-icon': { color: v.text },
        }
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {icon && (
      <Box
        className='alert-icon'
        aria-hidden
        sx={{ display: 'flex', flexShrink: 0, mt: '2px', '& svg': { fontSize: 20 } }}
      >
        {icon}
      </Box>
    )}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      {title && (
        <Typography
          sx={{
            fontSize: 'var(--sf-text-base, 0.875rem)',
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1.4,
          }}
        >
          {title}
        </Typography>
      )}
      {children && (
        <Typography
          component='div'
          sx={{
            fontSize: 'var(--sf-text-sm, 0.8125rem)',
            color: 'text.secondary',
            mt: title ? 0.25 : 0,
            lineHeight: 1.5,
          }}
        >
          {children}
        </Typography>
      )}
    </Box>
    {action && <Box sx={{ flexShrink: 0, alignSelf: 'center' }}>{action}</Box>}
  </Box>
)

// ---------------------------------------------------------------------------
// MonoTag: scope / permission / IP chip in the mono badge treatment.
// ---------------------------------------------------------------------------
export const MonoTag: React.FC<{
  children: React.ReactNode
  tone?: AuthTone | 'neutral'
  onDelete?: () => void
  deleteLabel?: string
}> = ({ children, tone = 'neutral', onDelete, deleteLabel }) => (
  <Box
    component='span'
    sx={(theme) => {
      const v = tone === 'neutral' ? null : toneVars(theme, tone)
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        maxWidth: '100%',
        px: 1.25,
        py: 0.5,
        fontFamily: MONO_FONT,
        fontSize: 'var(--sf-text-xs, 0.75rem)',
        fontWeight: 500,
        lineHeight: 1.4,
        borderRadius: 'var(--sf-radius-xs, 4px)',
        border: 'var(--sf-border-1, 1px) solid',
        borderColor: v ? v.border : 'divider',
        bgcolor: v ? v.bg : 'var(--sf-surface-sunken, transparent)',
        color: v ? v.text : 'text.secondary',
        overflowWrap: 'anywhere',
      }
    }}
  >
    {children}
    {onDelete && (
      <Box
        component='button'
        type='button'
        onClick={onDelete}
        aria-label={deleteLabel}
        sx={{
          all: 'unset',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: 'var(--sf-radius-full, 9999px)',
          '&:hover': { bgcolor: 'action.hover' },
          '&:focus-visible': { outline: '2px solid var(--sf-cyan, currentColor)', outlineOffset: 2 },
        }}
      >
        <span aria-hidden>×</span>
      </Box>
    )}
  </Box>
)
