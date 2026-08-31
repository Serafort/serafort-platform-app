import React from "react";
import {
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { TenantThemeProvider } from "./TenantThemeContext";
import { ThemeSettingsProvider } from "./ThemeSettingsContext";
import GlobalStyles from "../styles/GlobalStyles";
import type { TenantThemeConfig } from "../types";
import { useDerivedMuiTheme } from "../hooks/useDerivedMuiTheme";
import type { Settings } from "@cap/shared-types";

interface DesignSystemProviderProps {
  children: React.ReactNode;
  theme?: TenantThemeConfig | null;
  isLoading?: boolean;
  error?: string | null;
  refetch?: () => Promise<void>;
  updateTheme?: (updates: Partial<TenantThemeConfig>) => Promise<void>;
  saveTheme?: (theme: TenantThemeConfig) => Promise<void>;
  settings?: Settings;
}

const InnerDesignSystemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const theme = useDerivedMuiTheme();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      {children}
    </MuiThemeProvider>
  );
};

export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({
  children,
  theme,
  isLoading,
  error,
  refetch,
  updateTheme,
  saveTheme,
  settings,
}) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeSettingsProvider settings={settings}>
        <TenantThemeProvider
          theme={theme}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
          updateTheme={updateTheme}
          saveTheme={saveTheme}
        >
          <InnerDesignSystemProvider>{children}</InnerDesignSystemProvider>
        </TenantThemeProvider>
      </ThemeSettingsProvider>
    </StyledEngineProvider>
  );
};

export default DesignSystemProvider;
