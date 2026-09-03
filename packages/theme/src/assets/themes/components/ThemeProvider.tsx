// cspell:ignore stylis
import React, { useMemo } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import type {} from "@mui/lab/themeAugmentation";
import { useMedia } from "react-use";
import stylisRTLPlugin from "stylis-plugin-rtl";

import type { ChildrenType, Direction, SystemMode } from "@cap/shared-types";
import ModeChanger from "./ModeChanger";
import { useTenantThemeContext } from "../../../context/TenantThemeContext";
import { composeMuiTheme } from "../../../utils/composeMuiTheme";
import { useThemeSettings } from "../../../context/ThemeSettingsContext";

const ThemeProvider: React.FC<
  ChildrenType & {
    direction: Direction;
    systemMode: SystemMode;
  }
> = ({ children, direction, systemMode }) => {
  const settings = useThemeSettings();
  const isDark = useMedia("(prefers-color-scheme: dark)", false);
  const isServer = typeof window === "undefined";

  const { theme: tenantTheme } = useTenantThemeContext();

  let currentMode: SystemMode;

  const effectivePrimaryColor =
    tenantTheme?.tokens?.colors?.primary?.value || settings.primaryColor;
  const tenantMode = settings.mode;

  if (isServer) currentMode = systemMode;
  else {
    if (tenantMode === "system") currentMode = isDark ? "dark" : "light";
    else currentMode = tenantMode as SystemMode;
  }

  const theme = useMemo(() => {
    return composeMuiTheme({
      currentMode,
      direction,
      settings: {
        ...settings,
        primaryColor: effectivePrimaryColor,
        mode: tenantMode,
      },
      tenantTheme,
    });
  }, [
    settings,
    currentMode,
    direction,
    effectivePrimaryColor,
    tenantMode,
    tenantTheme,
  ]);

  const cache = useMemo(
    () =>
      createCache({
        key: direction === "rtl" ? "rtl" : "css",
        prepend: true,
        ...(direction === "rtl" && {
          stylisPlugins: [stylisRTLPlugin],
        }),
      }),
    [direction],
  );

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={theme}>
        <>
          <ModeChanger />
          <CssBaseline />
          {children}
        </>
      </MuiThemeProvider>
    </CacheProvider>
  );
};

export default ThemeProvider;
