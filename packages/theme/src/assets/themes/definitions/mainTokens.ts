/**
 * Main Layout Design Tokens
 * Structural layout rules for the primary application content shell.
 */

export interface MainTokens {
  layout: {
    flexGrow: number
    minHeight: string
    compactMarginInline: string
  }
}

export const mainTokens: MainTokens = {
  layout: {
    flexGrow: 1,
    minHeight: '100vh',
    compactMarginInline: 'auto',
  },
}
