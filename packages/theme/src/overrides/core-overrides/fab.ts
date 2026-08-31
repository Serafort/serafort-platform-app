// MUI Imports
import type { Theme } from "@mui/material/styles";

const fab: Theme["components"] = {
  MuiFab: {
    styleOverrides: {
      root: {
        minWidth: "48px",
        minHeight: "48px",
        boxShadow: "var(--custom-shadow-md, 0 6px 18px rgba(0,0,0,0.15))",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px) scale(1.02)",
          boxShadow: "var(--custom-shadow-lg, 0 10px 24px rgba(0,0,0,0.22))",
        },
        "&:active": {
          transform: "translateY(0) scale(0.98)",
        },
      },
      sizeSmall: {
        minWidth: "44px",
        minHeight: "44px",
      },
      sizeMedium: {
        minWidth: "48px",
        minHeight: "48px",
      },
      extended: {
        minHeight: "48px",
        padding: "0 20px",
      },
    },
    variants: [
      {
        props: { color: "default" },
        style: {
          color: "rgb(var(--mui-mainColorChannels-light) / 0.9)",
          "&.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))": {
            backgroundColor: "var(--mui-palette-grey-A100)",
          },
        },
      },
      {
        props: { color: "primary" },
        style: {
          "&.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))": {
            backgroundColor: "var(--mui-palette-primary-dark)",
          },
        },
      },
      {
        props: { color: "secondary" },
        style: {
          "&.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))": {
            backgroundColor: "var(--mui-palette-secondary-dark)",
          },
        },
      },
      {
        props: { color: "error" },
        style: {
          "&.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))": {
            backgroundColor: "var(--mui-palette-error-dark)",
          },
        },
      },
      {
        props: { color: "warning" },
        style: {
          "&.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))": {
            backgroundColor: "var(--mui-palette-warning-dark)",
          },
        },
      },
      {
        props: { color: "info" },
        style: {
          "&.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))": {
            backgroundColor: "var(--mui-palette-info-dark)",
          },
        },
      },
      {
        props: { color: "success" },
        style: {
          "&.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))": {
            backgroundColor: "var(--mui-palette-success-dark)",
          },
        },
      },
    ],
  },
};

export default fab;
