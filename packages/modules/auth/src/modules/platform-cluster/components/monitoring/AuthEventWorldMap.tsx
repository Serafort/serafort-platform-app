import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, useMediaQuery } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import PublicOff from '@mui/icons-material/PublicOff'
import LanOutlined from '@mui/icons-material/LanOutlined'
import { WORLD_COUNTRY_PATHS, WORLD_MAP_BOUNDS, WORLD_MAP_VIEWBOX } from './worldGeography'
import type { EventLocation } from '../../utils/resolveEventLocation'

/** English fallbacks for the reserved-range explanations. */
const RESERVED_SCOPE_FALLBACKS: Record<
  Extract<EventLocation, { kind: 'private' }>['scope'],
  string
> = {
  loopback: 'The request came from the loopback interface on the server itself.',
  private: 'The request came from a private network address, which maps to no public location.',
  'link-local': 'The request came from a link-local address, which never leaves its own segment.',
  shared: 'The request came through carrier-grade NAT, which hides the originating location.',
  documentation: 'This address is from a reserved documentation range, not a real network.',
}

export interface MapPoint {
  id: string
  lon: number
  lat: number
  /** Drives the marker colour, so a failed sign-in reads as red on the map. */
  tone: 'success' | 'error' | 'warning' | 'info' | 'primary'
}

export interface AuthEventWorldMapProps {
  /** Location of the selected event — the pin the map is "about". */
  location: EventLocation
  /** Recent located events, drawn faintly behind the selection. */
  trail?: ReadonlyArray<MapPoint>
  /** Tone for the selected marker. */
  tone?: MapPoint['tone']
  height?: number
}

/**
 * Projects a lon/lat pair into `WORLD_MAP_VIEWBOX` space.
 *
 * Equirectangular, matching the projection the country paths were generated
 * with — the two must stay in step, which is why both read the same bounds.
 */
const project = (lon: number, lat: number) => {
  const { lonMin, lonMax, latMin, latMax } = WORLD_MAP_BOUNDS
  const clampedLon = Math.max(lonMin, Math.min(lonMax, lon))
  const clampedLat = Math.max(latMin, Math.min(latMax, lat))
  return {
    x: ((clampedLon - lonMin) / (lonMax - lonMin)) * WORLD_MAP_VIEWBOX.width,
    y: ((latMax - clampedLat) / (latMax - latMin)) * WORLD_MAP_VIEWBOX.height,
  }
}

/**
 * A real world map, drawn from bundled Natural Earth geometry.
 *
 * No tile server is contacted, so viewing an event never tells a third party
 * where that event came from — the same reason this console keeps PII off the
 * wire elsewhere. It also means the map renders identically offline and in
 * tests.
 */
export const AuthEventWorldMap: React.FC<AuthEventWorldMapProps> = ({
  location,
  trail = [],
  tone = 'primary',
  height = 190,
}) => {
  const theme = useTheme()
  const { t } = useTranslation('common')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Land has to separate clearly from ocean in both modes without competing
  // with the event markers, which are the only saturated thing on the map.
  const isDark = theme.palette.mode === 'dark'
  const landFill = alpha(theme.palette.text.primary, isDark ? 0.22 : 0.17)
  const landStroke = alpha(theme.palette.text.primary, isDark ? 0.38 : 0.3)
  const oceanFill = alpha(theme.palette.primary.main, isDark ? 0.08 : 0.06)
  const toneColor = theme.palette[tone].main

  const selected = location.kind === 'located' ? project(location.lon, location.lat) : null

  const trailPoints = useMemo(
    () => trail.map((point) => ({ ...point, ...project(point.lon, point.lat) })),
    [trail],
  )

  const highlightCode = location.kind === 'located' ? location.countryCode : null

  // An empty state still gets a frame the same size as the map, so selecting
  // between a located and an unlocatable event does not shift the panel.
  if (location.kind !== 'located') {
    const isPrivate = location.kind === 'private'
    const Icon = isPrivate ? LanOutlined : PublicOff
    return (
      <Box
        role='note'
        sx={{
          height,
          borderRadius: 1.5,
          border: 1,
          borderColor: 'divider',
          borderStyle: 'dashed',
          bgcolor: alpha(theme.palette.text.primary, 0.02),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 1,
          px: 3,
        }}
      >
        <Icon sx={{ fontSize: 30, color: 'text.disabled' }} />
        <Typography variant='caption' fontWeight={600} color='text.secondary'>
          {isPrivate
            ? t('monitoring.map.privateTitle', 'No location to plot')
            : t('monitoring.map.unresolvedTitle', 'Location not resolved')}
        </Typography>
        <Typography variant='caption' color='text.disabled' sx={{ lineHeight: 1.5 }}>
          {isPrivate
            ? t(
                `monitoring.map.private.${location.scope}`,
                RESERVED_SCOPE_FALLBACKS[location.scope],
              )
            : t(
                'monitoring.map.unresolvedBody',
                'This address is routable, but no geolocation data was returned for it.',
              )}
        </Typography>
      </Box>
    )
  }

  const placeLabel = location.place
  const accessibleLabel =
    location.precision === 'exact'
      ? t('monitoring.map.ariaExact', 'World map showing the event origin at {{place}}', {
          place: placeLabel,
        })
      : t(
          'monitoring.map.ariaCountry',
          'World map showing the event origin in {{place}}, at country level',
          { place: placeLabel },
        )

  return (
    <Box
      sx={{
        position: 'relative',
        height,
        borderRadius: 1.5,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        bgcolor: oceanFill,
        // Geography is not a reading direction: keep the map unflipped even
        // when the surrounding shell renders right-to-left.
        direction: 'ltr',
      }}
    >
      <Box
        component='svg'
        role='img'
        aria-label={accessibleLabel}
        viewBox={`0 0 ${WORLD_MAP_VIEWBOX.width} ${WORLD_MAP_VIEWBOX.height}`}
        preserveAspectRatio='xMidYMid slice'
        sx={{ width: '100%', height: '100%', display: 'block' }}
      >
        <g>
          {WORLD_COUNTRY_PATHS.map((country) => {
            const isHighlighted = country.code === highlightCode
            return (
              <path
                key={country.code}
                d={country.d}
                fill={isHighlighted ? alpha(toneColor, 0.45) : landFill}
                stroke={isHighlighted ? toneColor : landStroke}
                strokeWidth={isHighlighted ? 1 : 0.4}
                strokeLinejoin='round'
              />
            )
          })}
        </g>

        {/* Recent activity, drawn under the selection so it never hides it. */}
        <g>
          {trailPoints.map((point) => (
            <circle
              key={point.id}
              cx={point.x}
              cy={point.y}
              r={3}
              fill={alpha(theme.palette[point.tone].main, 0.55)}
            />
          ))}
        </g>

        {selected && (
          <g>
            <circle cx={selected.x} cy={selected.y} r={5} fill={toneColor} />
            <circle
              cx={selected.x}
              cy={selected.y}
              r={5}
              fill='none'
              stroke={toneColor}
              strokeWidth={1.5}
              opacity={0.9}
            >
              {/* The ping is decoration; anyone who asked the OS to reduce
                  motion gets the static ring instead. */}
              {!prefersReducedMotion && (
                <>
                  <animate attributeName='r' values='5;18' dur='2s' repeatCount='indefinite' />
                  <animate
                    attributeName='opacity'
                    values='0.9;0'
                    dur='2s'
                    repeatCount='indefinite'
                  />
                </>
              )}
            </circle>
          </g>
        )}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          insetInlineStart: 8,
          bottom: 8,
          px: 1,
          py: 0.25,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          border: 1,
          borderColor: 'divider',
          maxWidth: 'calc(100% - 16px)',
        }}
      >
        <Typography variant='caption' fontWeight={600} color='text.primary' noWrap component='div'>
          {placeLabel}
        </Typography>
        {location.precision === 'country' && (
          <Typography variant='caption' color='text.secondary' sx={{ fontSize: 12 }}>
            {t('monitoring.map.countryPrecision', 'Country-level accuracy')}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default AuthEventWorldMap
