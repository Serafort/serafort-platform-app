import { alpha, type Theme } from "@mui/material/styles";

const PALETTE_COLORS = [
  "primary",
  "secondary",
  "error",
  "warning",
  "info",
  "success",
] as const;

const chip: Theme["components"] = {
  MuiChip: {
    variants: [
      ...PALETTE_COLORS.map((color) => ({
        props: { variant: "filled" as const, color },
        style: ({ theme }: { theme: unknown }) => {
          const swatch = (theme as Theme).palette[color];
          return {
            backgroundColor: `var(--mui-palette-${color}-lightOpacity, ${alpha(swatch.main, 0.12)})`,
            color: `var(--mui-palette-${color}-main, ${swatch.main})`,
            "&.Mui-focusVisible": {
              backgroundColor: `var(--mui-palette-${color}-mainOpacity, ${alpha(swatch.main, 0.24)})`,
            },
            "& .MuiChip-deleteIcon": {
              color: alpha(swatch.main, 0.7),
              "&:hover": {
                color: swatch.main,
              },
            },
          };
        },
      })),
      ...PALETTE_COLORS.map((color) => ({
        props: { variant: "outlined" as const, color },
        style: ({ theme }: { theme: unknown }) => {
          const swatch = (theme as Theme).palette[color];
          return {
            borderColor: `var(--mui-palette-${color}-main, ${swatch.main})`,
            color: `var(--mui-palette-${color}-main, ${swatch.main})`,
            backgroundColor: "transparent",
            "&.Mui-focusVisible": {
              backgroundColor: `var(--mui-palette-${color}-lighterOpacity, ${alpha(swatch.main, 0.08)})`,
            },
            "& .MuiChip-deleteIcon": {
              color: alpha(swatch.main, 0.7),
              "&:hover": {
                color: swatch.main,
              },
            },
          };
        },
      })),
    ],
    styleOverrides: {
      root: ({ ownerState, theme }) => ({
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.fontWeightMedium,
        lineHeight: theme.typography.body2.lineHeight,

        ...(ownerState.size === "small"
          ? {
              borderRadius: "var(--mui-shape-customBorderRadius-sm)",
            }
          : {
              borderRadius: "var(--mui-shape-borderRadius)",
            }),

        "& .MuiChip-deleteIcon": {
          ...(ownerState.size === "small"
            ? {
                fontSize: "1rem",
                marginInlineEnd: theme.spacing(1),
                marginInlineStart: theme.spacing(-2),
              }
            : {
                fontSize: "1.25rem",
                marginInlineEnd: theme.spacing(1.5),
                marginInlineStart: theme.spacing(-2),
              }),
        },
        "& .MuiChip-avatar, & .MuiChip-icon": {
          blockSize: 20,
          inlineSize: 20,
          "& i, & svg": {
            ...(ownerState.size === "small"
              ? {
                  fontSize: 13,
                }
              : {
                  fontSize: 15,
                }),
          },
          ...(ownerState.size === "small"
            ? {
                marginInlineStart: theme.spacing(1),
                marginInlineEnd: theme.spacing(-2),
              }
            : {
                marginInlineStart: theme.spacing(1.5),
                marginInlineEnd: theme.spacing(-2),
              }),
        },
        "&.Mui-disabled": {
          opacity: 0.45,
        },
      }),
      label: ({ ownerState, theme }) => ({
        ...(ownerState.size === "small"
          ? {
              paddingInline: theme.spacing(2.5),
              paddingBlock: theme.spacing(0.5),
            }
          : {
              paddingInline: theme.spacing(3),
            }),
      }),
      iconMedium: {
        fontSize: "1.25rem",
      },
      iconSmall: {
        fontSize: "1rem",
      },
    },
  },
};

export default chip;
