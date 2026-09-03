import type { Theme } from "@mui/material/styles";

const cssBaseline: Theme["components"] = {
  MuiCssBaseline: {
    styleOverrides: {
      "@media (prefers-reduced-motion: reduce)": {
        "*, *::before, *::after": {
          animationDuration: "0.01ms !important",
          animationIterationCount: "1 !important",
          transitionDuration: "0.01ms !important",
          scrollBehavior: "auto !important",
        },
      },
    },
  },
};

export default cssBaseline;
