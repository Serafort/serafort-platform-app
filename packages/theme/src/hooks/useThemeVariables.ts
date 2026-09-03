import { useState, useEffect, useRef } from 'react';
import type { TenantThemeConfig } from '../types';
import { applyThemeVariables } from '../utils/applyThemeVariables';

interface UseThemeVariablesOptions {
  theme: TenantThemeConfig | null;
  enabled?: boolean;
}

interface UseThemeVariablesReturn {
  isApplied: boolean;
  lastAppliedTheme: TenantThemeConfig | null;
  error: Error | null;
}

/**
 * @deprecated Internal theme rendering now reads from the MUI theme object.
 * This hook is kept only as a compatibility shim for external consumers that
 * still expect CSS-variable side effects.
 */
export const useThemeVariables = ({
  theme,
  enabled = true,
}: UseThemeVariablesOptions): UseThemeVariablesReturn => {
  const [isApplied, setIsApplied] = useState(false);
  const [lastAppliedTheme, setLastAppliedTheme] = useState<TenantThemeConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !theme) {
      return;
    }

    try {
      applyThemeVariables(theme);

      if (mountedRef.current) {
        setIsApplied(true);
        setLastAppliedTheme(theme);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to apply theme'));
      }
    }
  }, [theme, enabled]);

  return {
    isApplied,
    lastAppliedTheme,
    error,
  };
};

export default useThemeVariables;
