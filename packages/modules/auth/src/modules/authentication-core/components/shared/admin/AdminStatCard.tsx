import React from 'react'
import { Box, Card, CardContent, Skeleton, Stack, Typography, alpha, useTheme } from '@mui/material'
import type { AuthTone } from '../auth/authTone'

export interface AdminStatCardProps {
  /** Already-translated metric name. */
  label: React.ReactNode
  /**
   * The measured value. Pass `undefined` while it is still being fetched — the
   * card then renders a skeleton instead of a placeholder glyph.
   */
  value?: React.ReactNode
  icon?: React.ReactNode
  tone?: AuthTone
  /** Already-translated qualifier under the value, e.g. "in the last 30 days". */
  caption?: React.ReactNode
  id?: string
}

/**
 * One metric tile in an admin summary row.
 *
 * The loading case is why this exists as a component rather than a snippet.
 * Screens were writing `stats?.total ?? '…'`, which renders a literal ellipsis
 * as though it were the measurement — indistinguishable from a real value, and
 * announced as one by a screen reader. An absent value is a loading state, so
 * it draws a skeleton and is hidden from the accessibility tree until it
 * resolves.
 */
const AdminStatCard: React.FC<AdminStatCardProps> = ({
  label,
  value,
  icon,
  tone = 'primary',
  caption,
  id,
}) => {
  const theme = useTheme()
  const color = theme.palette[tone].main
  const loading = value === undefined || value === null

  return (
    <Card
      id={id}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        borderRadius: 'var(--sf-radius-lg, 12px)',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
        '&:hover': { transform: 'translateY(-2px)', borderColor: alpha(color, 0.4) },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } },
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
        {icon && (
          <Box
            aria-hidden
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              bgcolor: alpha(color, 0.1),
              color,
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minInlineSize: 0 }}>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{
              display: 'block',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.075em',
              fontSize: '0.65rem',
              mb: 0.25,
            }}
          >
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant='text' width={72} height={32} aria-hidden />
          ) : (
            <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              {value}
            </Typography>
          )}
          {caption && !loading && (
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>
              {caption}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default AdminStatCard
