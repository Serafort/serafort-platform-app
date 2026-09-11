import React from 'react'
import { Box, Breadcrumbs, Link, Stack, Typography, alpha, useTheme } from '@mui/material'
import NavigateNext from '@mui/icons-material/NavigateNext'
import { Link as RouterLink } from 'react-router-dom'
import type { AuthTone } from '../auth/authTone'

export interface AdminBreadcrumb {
  /** Already-translated label. */
  label: React.ReactNode
  /** In-app route. Omit on the trailing crumb, which renders as plain text. */
  to?: string
}

export interface AdminPageHeaderProps {
  /** Already-translated page title. */
  title: React.ReactNode
  /** Already-translated one-line description of what the screen manages. */
  description?: React.ReactNode
  /** Badge icon rendered ahead of the title. */
  icon?: React.ReactNode
  /** Tints the icon badge. */
  tone?: AuthTone
  /** Trail above the title. The last entry should omit `to`. */
  breadcrumbs?: AdminBreadcrumb[]
  /** Primary action(s) for the screen, aligned to the inline-end edge. */
  actions?: React.ReactNode
  /**
   * Pin the header to the top of the scroll region so the title and its
   * actions stay reachable while a long table or form scrolls beneath it.
   * The pinned bar gets a translucent blurred ground and a hairline underline
   * so scrolled content reads clearly as it passes under.
   */
  sticky?: boolean
  id?: string
}

/**
 * Standard heading for an admin console screen.
 *
 * Every registry, dashboard and management screen opened with its own
 * hand-rolled banner, so the title size, badge radius and action placement
 * drifted between them. This fixes the anatomy in one place.
 *
 * Crumbs route through `RouterLink` rather than a bare `href`. The screens that
 * previously used `href` dropped the SPA out to a full document load on every
 * click, which discards the query cache and re-runs the whole auth bootstrap.
 */
const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  icon,
  tone = 'primary',
  breadcrumbs,
  actions,
  sticky = false,
  id,
}) => {
  const theme = useTheme()
  const color = theme.palette[tone].main

  return (
    <Box
      id={id}
      sx={{
        mb: 4,
        ...(sticky && {
          position: 'sticky',
          insetBlockStart: 0,
          zIndex: theme.zIndex.appBar - 1,
          // Bleed to the content padding edges so the blurred ground spans the
          // full width while the header content keeps the page rhythm.
          marginInline: {
            xs: `calc(-1 * ${theme.spacing(4)})`,
            sm: `calc(-1 * ${theme.spacing(6)})`,
          },
          paddingInline: { xs: theme.spacing(4), sm: theme.spacing(6) },
          paddingBlock: 2,
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'var(--form-modal-backdrop-filter, blur(8px))',
          WebkitBackdropFilter: 'var(--form-modal-backdrop-filter, blur(8px))',
          borderBlockEnd: `1px solid ${theme.palette.divider}`,
        }),
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          // Flips to a back-pointing chevron under RTL: the separator encodes
          // reading direction, and stylis cannot rewrite an icon glyph.
          separator={
            <NavigateNext
              fontSize='small'
              sx={{ transform: theme.direction === 'rtl' ? 'scaleX(-1)' : 'none' }}
            />
          }
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, idx) =>
            crumb.to ? (
              <Link
                key={idx}
                component={RouterLink}
                to={crumb.to}
                underline='hover'
                color='inherit'
                sx={{ fontWeight: 600, fontSize: '0.875rem' }}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography
                key={idx}
                color='text.primary'
                sx={{ fontWeight: 700, fontSize: '0.875rem' }}
              >
                {crumb.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent='space-between'
      >
        <Stack direction='row' spacing={2} alignItems='center' sx={{ minInlineSize: 0 }}>
          {icon && (
            <Box
              aria-hidden
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 52, md: 60 },
                height: { xs: 52, md: 60 },
                flexShrink: 0,
                borderRadius: 'var(--sf-radius-lg, 12px)',
                bgcolor: alpha(color, 0.1),
                color,
                boxShadow: `0 8px 24px ${alpha(color, 0.12)}`,
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minInlineSize: 0 }}>
            <Typography
              component='h1'
              variant='h4'
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.027em',
                fontSize: { xs: '1.5rem', md: '2.125rem' },
                lineHeight: 1.15,
              }}
            >
              {title}
            </Typography>
            {description && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 0.5, fontWeight: 500, lineHeight: 1.6 }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Stack>

        {actions && (
          <Stack
            direction='row'
            spacing={1.5}
            flexWrap='wrap'
            useFlexGap
            sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
          >
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

export default AdminPageHeader
