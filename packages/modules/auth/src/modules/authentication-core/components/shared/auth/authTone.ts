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
