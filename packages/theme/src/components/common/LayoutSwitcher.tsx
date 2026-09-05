import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import VerticalSplitOutlined from "@mui/icons-material/VerticalSplitOutlined";
import HorizontalSplitOutlined from "@mui/icons-material/HorizontalSplitOutlined";
import { useSettings } from "@cap/platform-store";
import { LayoutModeEnum } from "@cap/shared-types";

/**
 * Lets the user switch the app shell between the vertical (sidebar) and
 * horizontal (top nav) layouts.
 *
 * Writes `settings.layout` through `updateSettings`, which
 * `LayoutWrapper` (`@cap/layout`) reads to pick which shell to render and
 * which mirrors the choice back to the settings cookie so it survives a
 * reload. `settings.layout` also has a third value, `"collapsed"` - the
 * vertical sidebar's own collapse toggle sets that - so this control only
 * ever writes `"vertical"` or `"horizontal"` explicitly; picking "Vertical"
 * from a collapsed state un-collapses it rather than leaving it collapsed.
 *
 * Rendered in both `VerticalNavbarContent` and `HorizontalNavbarContent` (in
 * `@cap/layout`) so there is always a way back to the other layout,
 * whichever one is currently active.
 */
export const LayoutSwitcher = () => {
  const { settings, updateSettings } = useSettings();

  const currentLayout =
    settings.layout === LayoutModeEnum.HORIZONTAL
      ? LayoutModeEnum.HORIZONTAL
      : LayoutModeEnum.VERTICAL;

  // Typed contextually from ToggleButtonGroup's onChange prop below - no
  // explicit React import needed under the automatic JSX runtime.
  const handleChange = (_event: unknown, next: LayoutModeEnum | null) => {
    if (next && next !== currentLayout) {
      updateSettings({ layout: next });
    }
  };

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={currentLayout}
      onChange={handleChange}
      aria-label="Navigation layout"
      sx={{
        "& .MuiToggleButton-root": {
          border: "none",
          borderRadius: 1,
          padding: "6px",
          color: "text.secondary",
          "&.Mui-selected": {
            color: "primary.main",
            backgroundColor: "action.selected",
          },
        },
      }}
    >
      <Tooltip title="Vertical layout">
        <ToggleButton
          value={LayoutModeEnum.VERTICAL}
          aria-label="Vertical layout"
        >
          <VerticalSplitOutlined fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Horizontal layout">
        <ToggleButton
          value={LayoutModeEnum.HORIZONTAL}
          aria-label="Horizontal layout"
        >
          <HorizontalSplitOutlined fontSize="small" />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

export default LayoutSwitcher;
