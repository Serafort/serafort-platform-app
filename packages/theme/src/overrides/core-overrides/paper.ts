// MUI Imports
import type { Theme } from "@mui/material/styles";

const paper: Theme["components"] = {
  MuiPaper: {
    styleOverrides: {
      // `--mui-palette-background-paper` is only ever defined when MUI's own
      // CSS-variables theming mode is enabled (`cssVariables: true` in
      // createTheme) - this app uses a plain createTheme, so that variable
      // never exists. Outside glass/brutalism/bento/organic (the effect
      // types that set --effect-bg themselves), the fallback silently
      // resolved to nothing, and an invalid var() falls back to
      // background-color's initial value - transparent - not the brand
      // surface colour. `--color-surface` (the tenant token CSS vars) isn't
      // a safe fallback either: generateThemeVariables always emits the
      // *light*-mode value there, so it would paint every Paper white even
      // in dark mode. `theme.palette.background.paper` is the one value
      // that's actually correct for the current mode - composeMuiTheme
      // rebuilds the whole theme object per mode - so it belongs innermost.
      root: ({ theme }) => ({
        backgroundImage: "none",
        backgroundColor: `var(--effect-bg, ${theme.palette.background.paper})`,
        backdropFilter: "var(--effect-backdrop, none)",
      }),
    },
  },
};

export default paper;
