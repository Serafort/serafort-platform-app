import type { Theme } from "@mui/material";
import type { Skin } from "@cap/shared-types";

const drawer = (skin: Skin): Theme["components"] => ({
  MuiDrawer: {
    defaultProps: {
      ...(skin === "bordered" && {
        PaperProps: {
          elevation: 0,
        },
      }),
    },
    styleOverrides: {
      // `--mui-customShadows-lg` is never defined (no CSS-variables theming
      // here), and an invalid var() falls back to `none` rather than to the
      // theme - so this override was quietly removing the drawer's elevation
      // instead of setting it.
      paper: ({ theme }) => ({
        ...(skin !== "bordered" && {
          boxShadow: (theme as Theme).customShadows.lg,
        }),
      }),
    },
  },
});

export default drawer;
