import type { Theme } from '@mui/material'

/**
 * Semantic tone shared by the auth screen primitives. Every tone maps onto a
 * MUI palette channel so nothing in the auth funnel needs a colour literal.
 */
export type AuthTone = 'primary' | 'success' | 'error' | 'warning' | 'info'

export const resolveToneColor = (theme: Theme, tone: AuthTone): string => theme.palette[tone].main

export const resolveToneDark = (theme: Theme, tone: AuthTone): string => theme.palette[tone].dark

export const isAuthTone = (value: unknown): value is AuthTone =>
  value === 'primary' ||
  value === 'success' ||
  value === 'error' ||
  value === 'warning' ||
  value === 'info'

/**
 * Brand-kit semantic CSS variables for a tone (`uikit.html` badges/alerts).
 * `text` is the AA-safe variant to use whenever the colour is applied to TEXT;
 * `bg` / `border` are the tint pair a badge or alert sits on; `dot` is the
 * saturated colour for dots and icons. `primary` maps onto the info scale.
 * Each carries a palette fallback so a tenant theme that omits the `--sf-*`
 * layer still renders.
 */
export const toneVars = (
  theme: Theme,
  tone: AuthTone,
): { text: string; bg: string; border: string; dot: string } => {
  const key = tone === 'primary' ? 'info' : tone
  const main = theme.palette[tone].main
  return {
    text: `var(--sf-${key}-text, ${theme.palette[tone].dark})`,
    bg: `var(--sf-${key}-bg, ${main}1a)`,
    border: `var(--sf-${key}-border, ${main}59)`,
    dot: main,
  }
}
