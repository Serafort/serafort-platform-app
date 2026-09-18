import React from "react";
import { useTranslation } from "react-i18next";
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

export const ComponentStyleSelector: React.FC<ComponentStyleSelectorProps> = ({
  components,
  globalEffectType,
  onChange,
  onGlobalChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const surface = useSurfaceSx();

  // Both pickers are derived from EFFECT_TYPES rather than hand-listed. They
  // used to offer three of the eight effects between them, so brutalism, bento,
  // organic, immersive and liquid-glass were selectable only by picking a
  // preset that happened to use one - and never overridable per component.
  const effectLabel = (value: string, fallback: string) =>
    t(`theme.effects.type.${value}`, fallback);

  const globalOptions = EFFECT_TYPES.map(({ value, label }) => ({
    value,
    label: effectLabel(value, label),
  }));

  const effectOptions: Array<{ value: ComponentEffectStyle; label: string }> = [
    { value: "global", label: t("theme.components.use_global", "Use global") },
    ...EFFECT_TYPES.map(({ value, label }) => ({
      value: value as ComponentEffectStyle,
      label: effectLabel(value, label),
    })),
  ];

  const componentLabel = (key: keyof ComponentStyles) =>
    t(`theme.components.label.${key}`, componentLabels[key] ?? key);

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
        title={t("theme.components.title", "Component styles")}
        description={t(
          "theme.components.description",
          "Everything follows the global effect unless you override it here.",
        )}
      />

      <Box sx={{ mb: 7 }}>
        <SectionLabel>
          {t("theme.components.global_effect", "Global effect")}
        </SectionLabel>
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
            {t(
              `theme.effects.desc.${activeEffectMeta.value}`,
              activeEffectMeta.description,
            )}
          </Typography>
        )}
      </Box>

      <SectionLabel
        action={
          overriddenCount > 0 ? (
            <Typography variant="caption" color="text.secondary">
              {t("theme.components.overridden_count", {
                n: overriddenCount,
                defaultValue: "{{n}} overridden",
              })}
            </Typography>
          ) : undefined
        }
      >
        {t("theme.components.per_component", "Per component")}
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
                {componentLabel(key)}
              </Typography>
              {isOverridden && (
                <Chip
                  size="small"
                  label={t("theme.components.override", "Override")}
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
                aria-label={t("theme.components.style_for", {
                  component: componentLabel(key),
                  defaultValue: "{{component}} effect style",
                })}
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
