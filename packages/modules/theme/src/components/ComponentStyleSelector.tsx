import React from "react";
import {
  Box,
  Chip,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { ComponentStyles, ComponentEffectStyle } from "@cap/theme";
import type { EffectType } from "@cap/theme";
import { EFFECT_TYPES } from "@cap/theme";
import {
  ChoiceChip,
  PanelHeader,
  SectionLabel,
  ellipsis,
  useSurfaceSx,
} from "./studioUi";

interface ComponentStyleSelectorProps {
  components: ComponentStyles;
  globalEffectType: EffectType;
  onChange: (components: ComponentStyles) => void;
  onGlobalChange: (type: EffectType) => void;
}

const componentLabels: Record<keyof ComponentStyles, string> = {
  button: "Buttons",
  card: "Cards",
  input: "Input fields",
  navbar: "Navigation bar",
  footer: "Footer",
  modal: "Modals",
  drawer: "Drawers",
  stepper: "Steppers",
  table: "Tables",
  tabs: "Tabs",
  nav: "Sidebars",
};

// Both pickers are derived from EFFECT_TYPES rather than hand-listed. They
// used to offer three of the eight effects between them, so brutalism, bento,
// organic, immersive and liquid-glass were selectable only by picking a preset
// that happened to use one - and never overridable per component at all.
const globalOptions: Array<{ value: EffectType; label: string }> =
  EFFECT_TYPES.map(({ value, label }) => ({ value, label }));

const effectOptions: Array<{ value: ComponentEffectStyle; label: string }> = [
  { value: "global", label: "Use global" },
  ...EFFECT_TYPES.map(({ value, label }) => ({
    value: value as ComponentEffectStyle,
    label,
  })),
];

export const ComponentStyleSelector: React.FC<ComponentStyleSelectorProps> = ({
  components,
  globalEffectType,
  onChange,
  onGlobalChange,
}) => {
  const theme = useTheme();
  const surface = useSurfaceSx();

  const activeEffectMeta = EFFECT_TYPES.find(
    (option) => option.value === globalEffectType,
  );

  const handleComponentChange = (
    key: keyof ComponentStyles,
    style: ComponentEffectStyle,
  ) => {
    onChange({
      ...components,
      [key]: { ...components[key], style },
    });
  };

  const keys = Object.keys(components) as Array<keyof ComponentStyles>;
  const overriddenCount = keys.filter(
    (key) => components[key]?.style && components[key].style !== "global",
  ).length;

  return (
    <Box>
      <PanelHeader
        title="Component styles"
        description="Everything follows the global effect unless you override it here."
      />

      <Box sx={{ mb: 7 }}>
        <SectionLabel>Global effect</SectionLabel>
        <Stack direction="row" useFlexGap spacing={1.5} sx={{ flexWrap: "wrap" }}>
          {globalOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={globalEffectType === option.value}
              onClick={() => onGlobalChange(option.value)}
            />
          ))}
        </Stack>
        {activeEffectMeta && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2 }}
          >
            {activeEffectMeta.description}
          </Typography>
        )}
      </Box>

      <SectionLabel
        action={
          overriddenCount > 0 ? (
            <Typography variant="caption" color="text.secondary">
              {overriddenCount} overridden
            </Typography>
          ) : undefined
        }
      >
        Per component
      </SectionLabel>

      {/*
        One compact row per component instead of eleven radio groups of four.
        Forty-four radios for what is a single choice per row was most of this
        tab's height, and made the handful of actual overrides impossible to
        spot - the select shows the current value in place, and the badge marks
        the rows that no longer follow the global setting.
      */}
      <Box sx={{ ...surface, overflow: "hidden" }}>
        {keys.map((key, index) => {
          const value = components[key]?.style ?? "global";
          const isOverridden = value !== "global";
          return (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                minHeight: 52,
                paddingInline: 4,
                paddingBlock: 2,
                borderBlockStart:
                  index === 0
                    ? "none"
                    : `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{ flex: 1, minWidth: 0, fontWeight: 500, ...ellipsis }}
              >
                {componentLabels[key] ?? key}
              </Typography>
              {isOverridden && (
                <Chip
                  size="small"
                  label="Override"
                  sx={{ blockSize: 20, fontSize: "0.6875rem", fontWeight: 600 }}
                />
              )}
              <Select
                size="small"
                value={value}
                onChange={(e) =>
                  handleComponentChange(
                    key,
                    e.target.value as ComponentEffectStyle,
                  )
                }
                aria-label={`${componentLabels[key] ?? key} effect style`}
                sx={{
                  minInlineSize: 132,
                  "& .MuiSelect-select": { paddingBlock: 1.5 },
                }}
              >
                {effectOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ComponentStyleSelector;
