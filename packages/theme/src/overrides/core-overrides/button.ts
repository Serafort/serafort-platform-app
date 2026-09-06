import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

const themeConfig = { disableRipple: false };

/** Palette colors that get per-color button variants. */
const PALETTE_COLORS = [
  "primary",
  "secondary",
  "error",
  "warning",
  "info",
  "success",
] as const;

const iconStyles = (size?: string) => ({
  "& > *:nth-of-type(1)": {
    ...(size === "small"
      ? {
          fontSize: "14px",
        }
      : {
          ...(size === "medium"
            ? {
                fontSize: "16px",
              }
            : {
                fontSize: "20px",
              }),
        }),
  },
});

const button: Theme["components"] = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: themeConfig.disableRipple,
    },
  },
  MuiButton: {
    styleOverrides: {
      root: ({ theme, ownerState }) => ({
        borderRadius:
          "var(--form-button-radius, var(--comp-button-border-radius, var(--radius-md, 8px)))",
        minHeight:
          ownerState.size === "large"
            ? "var(--form-button-height-large, 52px)"
            : ownerState.size === "small"
              ? "44px"
              : "var(--form-button-height-primary, 48px)",
        minWidth: "44px",
        "&.Mui-disabled": {
          opacity: "var(--form-button-disabled-opacity, 0.45)" as any,
        },
        "&:focus-visible, &.Mui-focusVisible": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        transform: "scale(1.001)",
        transition:
          "all var(--motion-duration-quick, 120ms) var(--motion-easing-standard, cubic-bezier(0.4, 0.0, 0.2, 1))",
        "&:not(.Mui-disabled):active": {
          transform: "scale(0.98)",
        },
        ...(ownerState.variant === "text"
          ? {
              ...(ownerState.size === "small" && {
                padding: "var(--comp-button-padding-small, 6px 9px)", // theme.spacing(1.5, 2.25)
              }),
              ...(ownerState.size === "medium" && {
                padding: "var(--comp-button-padding-medium, 8px 12px)", // theme.spacing(2, 3)
              }),
              ...(ownerState.size === "large" && {
                padding: "var(--comp-button-padding-large, 11px 16px)", // theme.spacing(2.75, 4)
              }),
            }
          : {
              ...(ownerState.variant === "outlined"
                ? {
                    ...(ownerState.size === "small" && {
                      padding: "var(--comp-button-padding-small, 5px 13px)", // theme.spacing(1.25, 3.25)
                    }),
                    ...(ownerState.size === "medium" && {
                      padding: "var(--comp-button-padding-medium, 7px 19px)", // theme.spacing(1.75, 4.75)
                    }),
                    ...(ownerState.size === "large" && {
                      padding: "var(--comp-button-padding-large, 10px 25px)", // theme.spacing(2.5, 6.25)
                    }),
                  }
                : {
                    ...(ownerState.size === "small" && {
                      padding: "var(--comp-button-padding-small, 6px 14px)", // theme.spacing(1.5, 3.5)
                    }),
                    ...(ownerState.size === "medium" && {
                      padding: "var(--comp-button-padding-medium, 8px 20px)", // theme.spacing(2, 5)
                    }),
                    ...(ownerState.size === "large" && {
                      padding: "var(--comp-button-padding-large, 11px 26px)", // theme.spacing(2.75, 6.5)
                    }),
                  }),
            }),
      }),
      sizeSmall: ({ theme: _theme }) => ({
        lineHeight: 1.38462,
        fontSize: "var(--comp-button-font-size-small, 0.8125rem)",
        borderRadius:
          "var(--comp-button-border-radius-small, var(--mui-shape-customBorderRadius-sm))",
      }),
      sizeLarge: {
        fontSize: "var(--comp-button-font-size-large, 1.0625rem)",
        lineHeight: 1.529412,
        borderRadius:
          "var(--comp-button-border-radius-large, var(--mui-shape-customBorderRadius-lg))",
      },
      startIcon: ({ theme, ownerState }) => ({
        ...(ownerState.size === "small"
          ? {
              marginInlineEnd: theme.spacing(1.5),
            }
          : {
              ...(ownerState.size === "medium"
                ? {
                    marginInlineEnd: theme.spacing(2),
                  }
                : {
                    marginInlineEnd: theme.spacing(2.5),
                  }),
            }),
        ...iconStyles(ownerState.size),
      }),
      endIcon: ({ theme, ownerState }) => ({
        ...(ownerState.size === "small"
          ? {
              marginInlineStart: theme.spacing(1.5),
            }
          : {
              ...(ownerState.size === "medium"
                ? {
                    marginInlineStart: theme.spacing(2),
                  }
                : {
                    marginInlineStart: theme.spacing(2.5),
                  }),
            }),
        ...iconStyles(ownerState.size),
      }),
    },
    variants: [
      {
        props: { variant: "text", color: "primary" },
        style: {
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-primary-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-primary-main)",
          },
        },
      },
      {
        props: { variant: "text", color: "secondary" },
        style: {
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-secondary-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-secondary-main)",
          },
        },
      },
      {
        props: { variant: "text", color: "error" },
        style: {
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-error-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-error-main)",
          },
        },
      },
      {
        props: { variant: "text", color: "warning" },
        style: {
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-warning-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-warning-main)",
          },
        },
      },
      {
        props: { variant: "text", color: "info" },
        style: {
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-info-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-info-main)",
          },
        },
      },
      {
        props: { variant: "text", color: "success" },
        style: {
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-success-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-success-main)",
          },
        },
      },
      {
        props: { variant: "outlined", color: "primary" },
        style: {
          borderColor: "var(--mui-palette-primary-main)",
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-primary-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-primary-main)",
            borderColor: "var(--mui-palette-primary-main)",
          },
        },
      },
      {
        props: { variant: "outlined", color: "secondary" },
        style: {
          borderColor: "var(--mui-palette-secondary-main)",
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-secondary-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-secondary-main)",
            borderColor: "var(--mui-palette-secondary-main)",
          },
        },
      },
      {
        props: { variant: "outlined", color: "error" },
        style: {
          borderColor: "var(--mui-palette-error-main)",
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-error-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-error-main)",
            borderColor: "var(--mui-palette-error-main)",
          },
        },
      },
      {
        props: { variant: "outlined", color: "warning" },
        style: {
          borderColor: "var(--mui-palette-warning-main)",
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-warning-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-warning-main)",
            borderColor: "var(--mui-palette-warning-main)",
          },
        },
      },
      {
        props: { variant: "outlined", color: "info" },
        style: {
          borderColor: "var(--mui-palette-info-main)",
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-info-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-info-main)",
            borderColor: "var(--mui-palette-info-main)",
          },
        },
      },
      {
        props: { variant: "outlined", color: "success" },
        style: {
          borderColor: "var(--mui-palette-success-main)",
          "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
            {
              backgroundColor: "var(--mui-palette-success-lighterOpacity)",
            },
          "&.Mui-disabled": {
            color: "var(--mui-palette-success-main)",
            borderColor: "var(--mui-palette-success-main)",
          },
        },
      },
      // Contained: MUI already paints the base fill from the palette, so
      // these entries only add the pressed and disabled treatments on top of
      // it. Generated from PALETTE_COLORS rather than written out six times
      // each - the hand-copied version had drifted (one tonal entry below was
      // still labelled `outlined`).
      ...PALETTE_COLORS.map((color) => ({
        props: { variant: "contained" as const, color },
        // `variants[].style` is typed against MUI's BaseTheme, which lacks
        // this app's augmented members, so the palette is read through a cast
        // rather than by annotating the parameter (annotating it fails with
        // TS2322 against Interpolation<{ theme: BaseTheme }>).
        style: ({ theme }: { theme: unknown }) => {
          const swatch = (theme as Theme).palette[color];
          return {
            "&:not(.Mui-disabled)": {
              boxShadow: "var(--comp-button-box-shadow, none)",
            },
            "&:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
              {
                backgroundColor: swatch.dark,
              },
            // Disabled keeps the button's own fill; the root rule's opacity is
            // what communicates the disabled state.
            "&.Mui-disabled": {
              color: swatch.contrastText,
              backgroundColor: swatch.main,
            },
          };
        },
      })),

      // Tonal: a soft tint of the palette color, with that color as the text.
      // This now sits under its own `tonal` variant (already registered in
      // ButtonPropsVariantOverrides). It previously sat under `contained`,
      // where it both overrode the real contained fill and referenced
      // `--mui-palette-*` variables that only exist when MUI's cssVariables
      // mode is enabled - this app composes a plain createTheme, so those
      // resolved to nothing and left every contained button in the app with a
      // transparent background and inherited text color.
      ...PALETTE_COLORS.map((color) => ({
        props: { variant: "tonal" as const, color },
        style: ({ theme }: { theme: unknown }) => {
          const swatch = (theme as Theme).palette[color];
          return {
            backgroundColor: alpha(swatch.main, 0.12),
            color: swatch.main,
            "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))":
              {
                backgroundColor: alpha(swatch.main, 0.2),
              },
            "&.Mui-disabled": {
              color: swatch.main,
            },
          };
        },
      })),
    ],
  },
};

export default button;
