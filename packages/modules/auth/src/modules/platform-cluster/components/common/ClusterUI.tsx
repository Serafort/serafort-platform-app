import React from 'react'
import { Box, Card, Stack, Typography, useTheme, type SxProps, type Theme } from '@mui/material'

/**
 * Brand-kit building blocks shared by the platform-cluster screens
 * (monitoring, developer, system). They sit next to the shared Admin* kit
 * rather than replacing it: the kit owns the page header, stat tile, table and
 * the four UI states; these cover what the dashboards additionally need — a
 * titled panel, a labelled meter, a donut and a bar strip — all drawn from
 * theme palette tokens so light/dark/tenant themes and RTL come for free.
 */

export type ClusterTone = 'primary' | 'success' | 'warning' | 'error' | 'info'

/** Resolve a tone to its theme colour. Used for chart fills, dots and icons only — never body text. */
export const useToneColor = (): ((tone: ClusterTone | 'neutral') => string) => {
  const theme = useTheme()
  return (tone) => (tone === 'neutral' ? theme.palette.text.disabled : theme.palette[tone].main)
}

/** Text-safe colour for a tone (AA on the surface), falling back to the palette shade. */
export const toneTextVar = (tone: ClusterTone | 'neutral'): string =>
  tone === 'neutral'
    ? 'var(--sf-text-tertiary)'
    : tone === 'primary'
      ? 'var(--sf-info-text)'
      : `var(--sf-${tone}-text)`

// ─── Panel ───────────────────────────────────────────────────────────────────

export interface ClusterPanelProps {
  /** Already-translated title. Rendered as an h2. */
  title?: React.ReactNode
  /** Already-translated qualifier under the title. */
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  /** Right-aligned control (button, badge, select). */
  action?: React.ReactNode
  /** Removes body padding so a table can run edge to edge. */
  flush?: boolean
  /** Hairline under the header. */
  divided?: boolean
  children?: React.ReactNode
  sx?: SxProps<Theme>
  id?: string
}

/**
 * The one card surface for dashboard sections: `--sf-surface`, 1px
 * `--sf-border`, `--sf-radius-lg`, `--sf-shadow-xs`. Header text is the
 * 15px display card-title from the type scale.
 */
export const ClusterPanel: React.FC<ClusterPanelProps> = ({
  title,
  subtitle,
  icon,
  action,
  flush = false,
  divided = false,
  children,
  sx,
  id,
}) => (
  <Card
    id={id}
    variant='outlined'
    sx={[
      {
        borderRadius: 'var(--sf-radius-lg, 12px)',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        boxShadow: 'var(--sf-shadow-xs, none)',
        minInlineSize: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {(title || action) && (
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        spacing={2}
        sx={{
          px: 3,
          pt: 2.5,
          pb: divided || flush ? 2 : 0,
          borderBlockEnd: divided || flush ? '1px solid' : 'none',
          borderColor: 'divider',
        }}
      >
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ minInlineSize: 0 }}>
          {icon && (
            <Box aria-hidden sx={{ display: 'flex', color: 'text.secondary' }}>
              {icon}
            </Box>
          )}
          <Box sx={{ minInlineSize: 0 }}>
            <Typography
              component='h2'
              sx={{
                fontFamily: 'var(--sf-font-display, inherit)',
                fontSize: 'var(--sf-text-md, 0.9375rem)',
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                sx={{
                  fontSize: 'var(--sf-text-xs, 0.75rem)',
                  color: 'var(--sf-text-tertiary, text.secondary)',
                  mt: 0.25,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
    )}
    <Box sx={flush ? undefined : { p: 3, pt: title || action ? 2.5 : 3 }}>{children}</Box>
  </Card>
)

// ─── Eyebrow / caption helpers ───────────────────────────────────────────────

/** Mono 11px uppercase label — the kit's caption / eyebrow style. */
export const MonoLabel: React.FC<{ children: React.ReactNode; sx?: SxProps<Theme> }> = ({
  children,
  sx,
}) => (
  <Typography
    component='span'
    sx={[
      {
        fontFamily: 'var(--sf-font-mono, ui-monospace, monospace)',
        fontSize: 'var(--sf-text-2xs, 0.6875rem)',
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: 'var(--sf-text-tertiary, text.secondary)',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Typography>
)

// ─── Meter ───────────────────────────────────────────────────────────────────

export interface MeterBarProps {
  /** 0..100. */
  value: number
  /** Already-translated name, read by assistive tech and shown as the caption. */
  label: string
  /** Formatted figure shown at the inline end; defaults to `${value}%`. */
  valueLabel?: React.ReactNode
  tone?: ClusterTone
  /** Hide the visible caption row (label stays as aria-label). */
  hideCaption?: boolean
  height?: number
}

/** A labelled horizontal meter with `role="meter"` semantics. */
export const MeterBar: React.FC<MeterBarProps> = ({
  value,
  label,
  valueLabel,
  tone = 'primary',
  hideCaption = false,
  height = 8,
}) => {
  const color = useToneColor()(tone)
  const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
  return (
    <Box>
      {!hideCaption && (
        <Stack direction='row' justifyContent='space-between' alignItems='baseline' sx={{ mb: 0.75 }}>
          <Typography sx={{ fontSize: 'var(--sf-text-sm, 0.8125rem)', fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--sf-font-mono, ui-monospace, monospace)',
              fontSize: 'var(--sf-text-sm, 0.8125rem)',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 500,
            }}
          >
            {valueLabel ?? `${Math.round(clamped)}%`}
          </Typography>
        </Stack>
      )}
      <Box
        role='meter'
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        sx={{
          height,
          borderRadius: 'var(--sf-radius-full, 9999px)',
          backgroundColor: 'var(--sf-surface-sunken, action.hover)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${clamped}%`,
            borderRadius: 'inherit',
            backgroundColor: color,
            transition: 'width var(--sf-duration-slow, 280ms) var(--sf-ease-out, ease-out)',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        />
      </Box>
    </Box>
  )
}

// ─── Donut ───────────────────────────────────────────────────────────────────

export interface DonutSegment {
  key: string
  /** Already-translated legend label. */
  label: string
  value: number
  tone: ClusterTone | 'neutral'
}

export interface DonutChartProps {
  segments: DonutSegment[]
  /** Big figure in the hole. */
  centerValue?: React.ReactNode
  /** Small caption under it. */
  centerLabel?: React.ReactNode
  /** Accessible summary of the whole chart. */
  ariaLabel: string
  size?: number
}

/**
 * SVG donut with a legend that carries the numbers, so the chart is never the
 * only place a value lives (colour + label + figure). Zero total renders a
 * neutral ring instead of dividing by zero.
 */
export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  centerValue,
  centerLabel,
  ariaLabel,
  size = 148,
}) => {
  const color = useToneColor()
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0)
  const stroke = 16
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={3}
      alignItems='center'
      justifyContent='center'
    >
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role='img'
          aria-label={ariaLabel}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill='none'
            strokeWidth={stroke}
            stroke='var(--sf-surface-sunken, currentColor)'
          />
          {total > 0 &&
            segments.map((s) => {
              const len = (Math.max(0, s.value) / total) * c
              const el = (
                <circle
                  key={s.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill='none'
                  strokeWidth={stroke}
                  stroke={color(s.tone)}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              )
              offset += len
              return len > 0 ? el : null
            })}
        </svg>
        <Stack
          alignItems='center'
          justifyContent='center'
          sx={{ position: 'absolute', inset: 0, textAlign: 'center' }}
        >
          {centerValue !== undefined && (
            <Typography
              sx={{
                fontFamily: 'var(--sf-font-display, inherit)',
                fontSize: 'var(--sf-text-2xl, 1.875rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {centerValue}
            </Typography>
          )}
          {centerLabel && <MonoLabel>{centerLabel}</MonoLabel>}
        </Stack>
      </Box>
      <Stack component='ul' spacing={1} sx={{ listStyle: 'none', m: 0, p: 0, minInlineSize: 140 }}>
        {segments.map((s) => (
          <Stack
            component='li'
            key={s.key}
            direction='row'
            alignItems='center'
            spacing={1.25}
            justifyContent='space-between'
          >
            <Stack direction='row' alignItems='center' spacing={1}>
              <Box
                aria-hidden
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 'var(--sf-radius-full, 9999px)',
                  bgcolor: color(s.tone),
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontSize: 'var(--sf-text-sm, 0.8125rem)' }}>{s.label}</Typography>
            </Stack>
            <Typography
              sx={{
                fontFamily: 'var(--sf-font-mono, ui-monospace, monospace)',
                fontSize: 'var(--sf-text-sm, 0.8125rem)',
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 500,
              }}
            >
              {s.value.toLocaleString()}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

// ─── Bar strip ───────────────────────────────────────────────────────────────

export interface BarSeries {
  key: string
  /** Already-translated legend label. */
  label: string
  tone: ClusterTone
  values: number[]
}

export interface BarStripProps {
  /** One label per bucket (already formatted). */
  labels: string[]
  series: BarSeries[]
  /** Accessible summary. */
  ariaLabel: string
  height?: number
}

/**
 * Grouped bar chart drawn as SVG. Bars are scaled to the series maximum; a
 * `<title>` on each bar carries the exact figure for hover and assistive tech,
 * and the legend names each series so colour is never the only key.
 */
export const BarStrip: React.FC<BarStripProps> = ({ labels, series, ariaLabel, height = 160 }) => {
  const color = useToneColor()
  const max = Math.max(1, ...series.flatMap((s) => s.values))
  const n = labels.length
  const groupW = 100 / Math.max(1, n)
  const barW = (groupW * 0.7) / Math.max(1, series.length)
  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio='none'
          width='100%'
          height={height}
          role='img'
          aria-label={ariaLabel}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={100}
              y1={height - f * (height - 4)}
              y2={height - f * (height - 4)}
              stroke='var(--sf-border, currentColor)'
              strokeWidth={1}
              vectorEffect='non-scaling-stroke'
              strokeDasharray='2 4'
            />
          ))}
          {labels.map((label, i) =>
            series.map((s, si) => {
              const v = s.values[i] ?? 0
              const h = (v / max) * (height - 4)
              return (
                <rect
                  key={`${i}-${s.key}`}
                  x={i * groupW + groupW * 0.15 + si * barW}
                  y={height - h}
                  width={Math.max(0.6, barW - 0.4)}
                  height={h}
                  rx={0.6}
                  fill={color(s.tone)}
                >
                  <title>{`${label} — ${s.label}: ${v.toLocaleString()}`}</title>
                </rect>
              )
            }),
          )}
        </svg>
      </Box>
      <Stack direction='row' justifyContent='space-between' sx={{ mt: 1 }}>
        {labels.map((l, i) => (
          <MonoLabel key={`${l}-${i}`} sx={{ flex: 1, textAlign: 'center', fontSize: '0.625rem' }}>
            {l}
          </MonoLabel>
        ))}
      </Stack>
      <Stack direction='row' spacing={2.5} flexWrap='wrap' useFlexGap sx={{ mt: 2 }}>
        {series.map((s) => (
          <Stack key={s.key} direction='row' spacing={1} alignItems='center'>
            <Box
              aria-hidden
              sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: color(s.tone) }}
            />
            <Typography sx={{ fontSize: 'var(--sf-text-xs, 0.75rem)', color: 'text.secondary' }}>
              {s.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

/** Short locale date for chart buckets (`Sep 18`). Undefined-safe. */
export const formatBucketDate = (iso: string, locale?: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}
