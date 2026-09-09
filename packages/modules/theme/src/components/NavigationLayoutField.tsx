import React from "react";
import { useTranslation } from "react-i18next";
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
  labelKey: string;
  labelDefault: string;
  hintKey: string;
  hintDefault: string;
}> = [
  {
    value: LayoutModeEnum.VERTICAL,
    labelKey: "theme.layout.sidebar",
    labelDefault: "Sidebar",
    hintKey: "theme.layout.sidebar_hint",
    hintDefault: "Navigation in a full-width vertical drawer.",
  },
  {
    value: LayoutModeEnum.COLLAPSED,
    labelKey: "theme.layout.collapsed",
    labelDefault: "Collapsed rail",
    hintKey: "theme.layout.collapsed_hint",
    hintDefault: "Vertical drawer pinned to its narrow icon rail.",
  },
  {
    value: LayoutModeEnum.HORIZONTAL,
    labelKey: "theme.layout.topbar",
    labelDefault: "Top bar",
    hintKey: "theme.layout.topbar_hint",
    hintDefault: "Navigation in a horizontal bar under the header.",
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
  const { t } = useTranslation();
  const current =
    LAYOUT_OPTIONS.find((option) => option.value === value)?.value ??
    LayoutModeEnum.VERTICAL;
  const activeOption = LAYOUT_OPTIONS.find((option) => option.value === current);

  return (
    <Box sx={{ mb: 7 }}>
      <SectionLabel>
        {t("theme.layout.section_label", "Navigation layout")}
      </SectionLabel>
      <Stack direction="row" useFlexGap spacing={1.5} sx={{ flexWrap: "wrap" }}>
        {LAYOUT_OPTIONS.map((option) => (
          <ChoiceChip
            key={option.value}
            label={t(option.labelKey, option.labelDefault)}
            selected={current === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </Stack>
      {activeOption && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2 }}
        >
          {t(activeOption.hintKey, activeOption.hintDefault)}
        </Typography>
      )}
    </Box>
  );
};

export default NavigationLayoutField;
