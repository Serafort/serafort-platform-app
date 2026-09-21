// MUI Imports
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

// Every value below comes from `theme`, not `var(--mui-palette-*)`: those
// variables only exist in MUI's cssVariables mode, and this app composes a
// plain createTheme (see button.ts / paper.ts). An unresolved var() left the
// unchecked track transparent, so an off switch was a white thumb on a white
// card - invisible.

const switchOverrides: Theme["components"] = {
  MuiSwitch: {
    defaultProps: {
      disableRipple: true,
    },
    styleOverrides: {
      root: ({ theme, ownerState }) => ({
        "&:has(.Mui-disabled)": {
          opacity: 0.45,
        },
        ...(ownerState.size !== "small"
          ? {
              width: 46,
              height: 36,
              padding: theme.spacing(2.25, 2),
            }
          : {
              width: 42,
              height: 30,
              padding: theme.spacing(1.75, 2),
              "& .MuiSwitch-thumb": {
                width: 12,
                height: 12,
              },
              "& .MuiSwitch-switchBase": {
                padding: 7,
                left: 3,
                "&.Mui-checked": {
                  left: -3,
                },
              },
            }),
      }),
      switchBase: ({ theme, ownerState }) => ({
        top: 2,
        left: 1,
        "&.Mui-checked": {
          left: -7,
          color: theme.palette.common.white,
          "& + .MuiSwitch-track": {
            opacity: 1,
          },
        },
        "&.Mui-checked:not(.Mui-disabled) + .MuiSwitch-track": {
          boxShadow: `0 2px 6px ${alpha(
            ownerState.color && ownerState.color !== "default"
              ? theme.palette[ownerState.color].main
              : theme.palette.text.primary,
            0.3,
          )}`,
        },
        "&:not(.Mui-checked) + .MuiSwitch-track": {
          boxShadow: `0 0 4px ${alpha(theme.palette.text.primary, 0.16)} inset`,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 1,
        },
        "&:hover:not(:has(span.MuiTouchRipple-root))": {
          backgroundColor: "transparent",
        },
      }),
      thumb: ({ theme }) => ({
        width: 14,
        height: 14,
        boxShadow: theme.shadows[1],
      }),
      track: ({ theme }) => ({
        opacity: 1,
        borderRadius: 10,
        // text.secondary at low alpha keeps the off track visible on both
        // light and dark surfaces behind the white thumb.
        backgroundColor: alpha(theme.palette.text.secondary, 0.38),
      }),
    },
  },
};

export default switchOverrides;
