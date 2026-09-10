// MUI Imports
import type { Theme } from "@mui/material/styles";

const input: Theme["components"] = {
  MuiFormControl: {
    styleOverrides: {
      root: {
        "&:has(.MuiRadio-root) .MuiFormHelperText-root, &:has(.MuiCheckbox-root) .MuiFormHelperText-root, &:has(.MuiSwitch-root) .MuiFormHelperText-root":
          {
            marginInline: 0,
          },
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: ({ theme }) => ({
        lineHeight: 1.6,
        "&:focus-visible, &.Mui-focused:has(input:focus-visible)": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 1,
        },
        "&.MuiInput-underline": {
          "&:before": {
            borderColor: "var(--mui-palette-customColors-inputBorder)",
          },
          "&:not(.Mui-disabled, .Mui-error):hover:before": {
            borderColor: "var(--mui-palette-action-active)",
          },
        },
        "&.Mui-disabled .MuiInputAdornment-root, &.Mui-disabled .MuiInputAdornment-root > *":
          {
            color: "var(--mui-palette-action-disabled)",
          },
      }),
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      root: {
        borderStartStartRadius: 4,
        borderStartEndRadius: 4,
        "&:before": {
          borderBottom: "1px solid var(--mui-palette-text-secondary)",
        },
        "&:hover:before": {
          borderBottom: "1px solid var(--mui-palette-text-primary)",
        },
        "&.Mui-disabled:before": {
          borderBottomStyle: "solid",
          opacity: 0.38,
        },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      shrink: ({ ownerState }) => ({
        ...(ownerState.variant === "outlined" && {
          transform:
            "var(--form-input-label-translate, translate(14px, -9px)) scale(var(--form-input-label-scale, 0.75))",
        }),
        ...(ownerState.variant === "filled" && {
          transform: `translate(12px, ${ownerState.size === "small" ? 4 : 7}px) scale(0.867)`,
        }),
        ...(ownerState.variant === "standard" && {
          transform: "translate(0, -1.5px) scale(0.867)",
        }),
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius:
          "var(--form-input-radius, var(--comp-input-border-radius, var(--radius-md, 8px)))",
        backgroundColor:
          "var(--form-input-bg, var(--surface-subtle, transparent))",
        minHeight: "var(--form-input-height, 48px)",
        "&:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled):hover .MuiOutlinedInput-notchedOutline":
          {
            borderColor: "var(--mui-palette-action-active)",
          },
        "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--mui-palette-divider)",
        },
        "&:not(.Mui-error).Mui-focused": {
          boxShadow:
            "var(--sf-shadow-glow, var(--form-input-focus-ring, 0 0 0 3px rgba(6, 203, 253, 0.18)))",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor:
              "var(--form-input-focus-border, var(--color-brand-500, var(--sf-blue)))",
          },
        },
        "&.Mui-error.Mui-focused": {
          boxShadow:
            "var(--state-error-focus-ring, 0 0 0 3px rgba(220, 38, 38, 0.25))",
        },
      },
      input: ({ ownerState }) => ({
        paddingInline: "var(--form-input-padding-inline, 16px)",
        ...(ownerState?.size === "medium" && {
          "&:not(.MuiInputBase-inputMultiline, .MuiInputBase-inputAdornedStart)":
            {
              padding: "var(--comp-input-padding, var(--mui-spacing-4, 16px))",
            },
          height: "var(--comp-input-height, 1.5em)",
        }),
        "& ~ .MuiOutlinedInput-notchedOutline": {
          borderColor:
            "var(--form-input-border, var(--surface-border, var(--mui-palette-customColors-inputBorder)))",
        },
      }),
      notchedOutline: {
        "& legend": {
          fontSize: "0.867em",
        },
      },
    },
  },
  MuiInputAdornment: {
    styleOverrides: {
      root: {
        color: "var(--mui-palette-text-primary)",
        "& i, & svg": {
          fontSize: "1rem !important",
        },
        "& *": {
          color: "inherit !important",
        },
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        lineHeight: 1,
        letterSpacing: "unset",
        // Inline validation copy is running text on the paper surface, so it
        // must clear WCAG 2.2 AA 4.5:1 — the `palette.error.main` fill colour
        // (#DC2626) does not. `--state-error-message-color` resolves to the
        // text-safe `--semantic-error-text` variant (dark on light, light on
        // dark) that `tokensToCssVariables` emits per mode.
        "&.Mui-error": {
          color:
            "var(--state-error-message-color, var(--semantic-error-text, #B42121))",
        },
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: "outlined",
    },
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          minHeight: "var(--form-input-height, 48px)",
        },
      },
    },
  },
};

export default input;
