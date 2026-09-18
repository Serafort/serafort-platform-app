// MUI Imports
import type { Theme } from "@mui/material/styles";

/**
 * Matches the brand-kit reference (`uikit.html#tooltip`): a small, always-
 * dark bubble — `background: var(--ink)` / `color: #fff` are static brand
 * primitives, not role tokens, so the tooltip stays the same dark chip in
 * both light and dark mode rather than flipping with the page.
 *
 * `packages/theme/src/assets/themes/{light,dark}.ts` each carry their own
 * `MuiTooltip.styleOverrides.tooltip` (ink bg in light, `surfaceMixed[600]`
 * in dark) — those are unreachable: `composeMuiTheme.ts` does
 * `theme.components = { ...theme.components, ...getComponentOverrides(...) }`,
 * a shallow spread, so whichever object last defines the `MuiTooltip` key
 * wins outright. This file's export (via `core-overrides`) is spread last,
 * so it was the one actually rendering: no `backgroundColor` here meant
 * every tooltip fell back to MUI's stock translucent grey bubble, and the
 * `color` override alone then swapped in whatever
 * `--mui-palette-customColors-tooltipText` resolved to for the *previous*
 * (unreachable) background — dark navy text over MUI's grey in dark mode,
 * not the intended white-on-ink chip.
 */
const tooltip: Theme["components"] = {
  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }) => ({
        backgroundColor: `var(--sf-ink, #031433)`,
        color: "var(--sf-white, #fff)",
        borderRadius: "var(--sf-radius-sm, 6px)",
        fontSize: "var(--sf-text-xs, 0.75rem)",
        fontWeight: 500,
        lineHeight: 1.4,
        paddingBlock: "7px",
        paddingInline: "11px",
        boxShadow: `var(--sf-shadow-lg, ${(theme as Theme).customShadows.lg})`,
      }),
      arrow: {
        color: "var(--sf-ink, #031433)",
      },
      popper: {
        '&[data-popper-placement*="bottom"] .MuiTooltip-tooltip': {
          marginTop: "6px !important",
        },
        '&[data-popper-placement*="top"] .MuiTooltip-tooltip': {
          marginBottom: "6px !important",
        },
        '&[data-popper-placement*="left"] .MuiTooltip-tooltip': {
          marginRight: "6px !important",
        },
        '&[data-popper-placement*="right"] .MuiTooltip-tooltip': {
          marginLeft: "6px !important",
        },
      },
    },
  },
};

export default tooltip;
