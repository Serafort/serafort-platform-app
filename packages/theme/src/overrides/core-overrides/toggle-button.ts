// MUI Imports
import type { Theme } from "@mui/material/styles";
import { directionalRadius } from "../../utils/directionalRadius";

/** Size prop -> radius scale key for the segmented-control outer corners. */
const radiusForSize = (size: string | undefined): "sm" | "md" | "lg" =>
  size === "small" ? "sm" : size === "large" ? "lg" : "md";

const toggleButton: Theme["components"] = {
  MuiToggleButtonGroup: {
    styleOverrides: {
      // Round only the outer corners of the strip and flatten every seam
      // between segments. `directionalRadius` emits logical radius properties,
      // so "leading corner" stays leading in RTL. The previous rule set a
      // single `borderRadius` from a `--mui-shape-*` variable that this app
      // (plain `createTheme`, no CSS-var theming) never defines, so it was
      // inert and the group fell back to MUI's default radius.
      root: ({ ownerState }) => {
        const scale = radiusForSize(ownerState.size as string | undefined);
        const vertical = ownerState.orientation === "vertical";

        return {
          "& .MuiToggleButtonGroup-grouped": {
            borderRadius: 0,
            "&:first-of-type": directionalRadius(
              scale,
              vertical ? "top" : "start",
              { resetUnset: false },
            ),
            "&:last-of-type": directionalRadius(
              scale,
              vertical ? "bottom" : "end",
              { resetUnset: false },
            ),
          },
        };
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: {
        "&:not(.Mui-selected):not(.Mui-disabled)": {
          color: "var(--mui-palette-text-secondary)",
        },
      },
      sizeSmall: {
        borderRadius: "var(--radius-sm, 4px)",
      },
      sizeLarge: {
        borderRadius: "var(--radius-lg, 12px)",
      },
    },
  },
};

export default toggleButton;
