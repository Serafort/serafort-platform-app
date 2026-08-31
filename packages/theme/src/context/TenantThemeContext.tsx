import React, { createContext, useContext, useMemo } from "react";
import type {
  TenantThemeContextValue,
  TenantThemeState,
  TenantThemeStatus,
  TenantThemeActions,
  TenantThemeProviderProps,
} from "../types";
import { DEFAULT_THEME_CONFIG } from "../types";

const TenantThemeStateContext = createContext<TenantThemeState | null>(null);
const TenantThemeStatusContext = createContext<TenantThemeStatus | null>(null);
const TenantThemeActionsContext = createContext<TenantThemeActions | null>(
  null,
);

// Deprecated: use the granular contexts instead
const TenantThemeContext = createContext<TenantThemeContextValue | null>(null);

export const TenantThemeProvider: React.FC<TenantThemeProviderProps> = ({
  children,
  theme,
  isLoading = false,
  error = null,
  refetch = async () => {},
  updateTheme = async () => {},
  saveTheme = async () => {},
}) => {
  const currentTheme = theme || DEFAULT_THEME_CONFIG;

  const stateValue = useMemo(() => ({ theme: currentTheme }), [currentTheme]);
  const statusValue = useMemo(() => ({ isLoading, error }), [isLoading, error]);
  const actionsValue = useMemo(
    () => ({
      refetch,
      updateTheme,
      saveTheme,
    }),
    [refetch, updateTheme, saveTheme],
  );

  const contextValue = useMemo(
    () => ({
      ...stateValue,
      ...statusValue,
      ...actionsValue,
    }),
    [stateValue, statusValue, actionsValue],
  );

  return (
    <TenantThemeStateContext.Provider value={stateValue}>
      <TenantThemeStatusContext.Provider value={statusValue}>
        <TenantThemeActionsContext.Provider value={actionsValue}>
          <TenantThemeContext.Provider value={contextValue}>
            {children}
          </TenantThemeContext.Provider>
        </TenantThemeActionsContext.Provider>
      </TenantThemeStatusContext.Provider>
    </TenantThemeStateContext.Provider>
  );
};

export const useTenantThemeState = () => {
  const context = useContext(TenantThemeStateContext);
  if (!context) return { theme: DEFAULT_THEME_CONFIG };
  return context;
};

export const useTenantThemeStatus = () => {
  const context = useContext(TenantThemeStatusContext);
  if (!context) return { isLoading: false, error: null };
  return context;
};

export const useTenantThemeActions = () => {
  const context = useContext(TenantThemeActionsContext);
  if (!context)
    return {
      refetch: async () => {},
      updateTheme: async () => {},
      saveTheme: async () => {},
    };
  return context;
};

export const useTenantThemeContext = (): TenantThemeContextValue => {
  const context = useContext(TenantThemeContext);

  if (!context) {
    return {
      theme: DEFAULT_THEME_CONFIG,
      isLoading: false,
      error: null,
      refetch: async () => {},
      updateTheme: async () => {},
      saveTheme: async () => {},
    };
  }

  return context;
};

export default TenantThemeProvider;
