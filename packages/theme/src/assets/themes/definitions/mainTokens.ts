/**
 * Main Layout Design Tokens
 * Structural layout rules for the primary application content shell.
 */

export interface MainTokens {
  layout: {
    flexGrow: number;
    minHeight: string;
    compactMarginInline: string;
    paddingXs: number;
    paddingSm: number;
    paddingLg: number;
    transitionDuration: number;
  };
}

export const mainTokens: MainTokens = {
  layout: {
    flexGrow: 1,
    minHeight: "100vh",
    compactMarginInline: "auto",
    paddingXs: 2, // 16px (2 * 8px)
    paddingSm: 3, // 24px (3 * 8px)
    paddingLg: 4, // 32px (4 * 8px)
    transitionDuration: 300,
  },
};
