import { useTenantThemeContext } from '@cap/theme';

/**
 * useLayoutTokens provides dynamic structural tokens from the tenant theme.
 * - layoutPadding: driven by theme spacing.lg (24px by default)
 * - compactContentWidth / headerHeight: structural constants (not in TenantThemeConfig)
 */
export const useLayoutTokens = () => {
  const { theme } = useTenantThemeContext();
  const spacing = theme?.tokens?.spacing;

  return {
    layoutPadding: spacing?.lg ?? '1.5rem', // resolves to 24px
    compactContentWidth: 1440,              // structural — no theme token exists
    headerHeight: 64,                       // structural — no theme token exists
  };
};
