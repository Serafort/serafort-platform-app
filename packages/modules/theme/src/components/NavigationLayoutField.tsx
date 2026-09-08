import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { LayoutModeEnum } from "@cap/shared-types";
import type { Layout } from "@cap/shared-types";
import { ChoiceChip, SectionLabel } from "./studioUi";

interface NavigationLayoutFieldProps {
  /** The layout the theme currently prefers. */
  value: Layout;
  /** Called with the picked layout; the editor persists it on the theme and
   *  mirrors it into `settings.layout` for a live shell re-render. */
  onChange: (layout: Layout) => void;
}

const LAYOUT_OPTIONS: Array<{
  value: LayoutModeEnum;
  label: string;
  hint: string;
}> = [
  {
    value: LayoutModeEnum.VERTICAL,
    label: "Sidebar",
    hint: "Navigation in a full-width vertical drawer.",
  },
  {
    value: LayoutModeEnum.COLLAPSED,
    label: "Collapsed rail",
    hint: "Vertical drawer pinned to its narrow icon rail.",
  },
  {
    value: LayoutModeEnum.HORIZONTAL,
    label: "Top bar",
    hint: "Navigation in a horizontal bar under the header.",
  },
];

/**
 * Picks the app shell's navigation orientation. The choice is saved on the
 * tenant theme (so it travels with an exported or applied theme) and applied
 * to the running shell immediately through `settings.layout`.
 */
export const NavigationLayoutField: React.FC<NavigationLayoutFieldProps> = ({
  value,
  onChange,
}) => {
  const current =
    LAYOUT_OPTIONS.find((option) => option.value === value)?.value ??
    LayoutModeEnum.VERTICAL;
  const activeHint = LAYOUT_OPTIONS.find(
    (option) => option.value === current,
  )?.hint;

  return (
    <Box sx={{ mb: 7 }}>
      <SectionLabel>Navigation layout</SectionLabel>
      <Stack direction="row" useFlexGap spacing={1.5} sx={{ flexWrap: "wrap" }}>
        {LAYOUT_OPTIONS.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={current === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </Stack>
      {activeHint && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2 }}
        >
          {activeHint}
        </Typography>
      )}
    </Box>
  );
};

export default NavigationLayoutField;
