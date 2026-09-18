import React from "react";
import { Box, TextField } from "@mui/material";
import type { EffectConfig, EffectType } from "@cap/theme";
import { EFFECT_TYPES, getEffectConfigKey } from "@cap/theme";
import { FieldLabel, PanelHeader, SliderField } from "../studioUi";

/**
 * Settings for whichever global effect is active.
 *
 * The Effects tab only ever shipped two panels - Glassmorphism and
 * Neumorphism - so the other five effects had no controls at all: a preset
 * could set brutalism or organic, and from then on the only way to change any
 * of it was to edit the preset in source. Rather than hand-write five more
 * bespoke panels, the fields are described declaratively below and rendered
 * from the schema, so adding an effect to the registry gives it an editor too.
 */

type NumericField = {
  kind: "slider";
  /** Key on the effect's config record. */
  key: string;
  label: string;
  hint?: string;
  min: number;
  max: number;
  step?: number;
  /** Suffix stored with the value, e.g. "px". Omit for a bare number. */
  unit?: string;
  /** Multiplier applied for display, e.g. 100 for a 0-1 opacity. */
  scale?: number;
  displaySuffix?: string;
  fallback: number;
};

type ColorField = {
  kind: "color";
  key: string;
  label: string;
  hint?: string;
  placeholder: string;
};

type EffectField = NumericField | ColorField;

const px = (
  key: string,
  label: string,
  fallback: number,
  max: number,
  hint?: string,
): NumericField => ({
  kind: "slider",
  key,
  label,
  hint,
  min: 0,
  max,
  unit: "px",
  fallback,
});

const color = (
  key: string,
  label: string,
  placeholder: string,
  hint?: string,
): ColorField => ({ kind: "color", key, label, placeholder, hint });

/**
 * Fields per effect config record. Glass and neumorphism keep their own
 * hand-built panels (they carry live previews), so they are absent here.
 */
const EFFECT_FIELDS: Record<string, EffectField[]> = {
  liquidGlass: [
    px("blur", "Blur", 24, 60, "How far the frost carries behind the panel"),
    {
      kind: "slider",
      key: "opacity",
      label: "Opacity",
      min: 0,
      max: 100,
      scale: 100,
      displaySuffix: "%",
      fallback: 0.85,
    },
    {
      kind: "slider",
      key: "refraction",
      label: "Refraction",
      hint: "Strength of the edge distortion",
      min: 0,
      max: 100,
      fallback: 40,
    },
    px("borderWidth", "Border width", 1, 5),
    color("background", "Tint", "rgba(255, 255, 255, 0.12)"),
    color("borderColor", "Border color", "rgba(255, 255, 255, 0.5)"),
  ],
  brutalism: [
    px("borderWidth", "Border width", 2, 12, "Brutalism lives on its outline"),
    px("shadowOffset", "Shadow offset", 4, 24, "A flat, hard-edged drop"),
    color("borderColor", "Border color", "#000000"),
    color("shadowColor", "Shadow color", "#000000"),
    color("backgroundColor", "Surface color", "#ffffff"),
  ],
  bento: [
    px("borderRadius", "Corner radius", 24, 64),
    px("borderWidth", "Border width", 1, 5),
    color("background", "Surface color", "#ffffff"),
    color("borderColor", "Border color", "rgba(0, 0, 0, 0.05)"),
    color("shadow", "Shadow", "0 4px 12px rgba(0, 0, 0, 0.05)"),
  ],
  organic: [
    {
      kind: "slider",
      key: "curvature",
      label: "Curvature",
      hint: "Above 50 the corners go asymmetric, which is the organic look",
      min: 0,
      max: 100,
      fallback: 80,
    },
    {
      kind: "slider",
      key: "fluidity",
      label: "Fluidity",
      hint: "Softens the whole surface; high values blur its own content",
      min: 0,
      max: 100,
      fallback: 50,
    },
    px("borderWidth", "Border width", 0, 5),
    color("backgroundColor", "Surface color", "#ffffff"),
    color("borderColor", "Border color", "transparent"),
  ],
  immersive: [
    {
      kind: "slider",
      key: "layers",
      label: "Layers",
      min: 1,
      max: 8,
      fallback: 3,
    },
    {
      kind: "slider",
      key: "depth",
      label: "Depth",
      hint: "Drives the length of the projected shadow",
      min: 0,
      max: 100,
      fallback: 20,
    },
    px("perspective", "Perspective", 1000, 2000),
    color("shadowColor", "Shadow color", "rgba(0, 0, 0, 0.5)"),
  ],
};

/** Effects that have a purpose-built panel of their own. */
export const EFFECTS_WITH_DEDICATED_PANEL = ["glassmorphism", "neumorphism"];

const parseNumeric = (value: unknown, fallback: number): number => {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isNaN(parsed) ? fallback : parsed;
};

interface EffectSettingsPanelProps {
  effectType: EffectType;
  effects: EffectConfig;
  onChange: (effects: EffectConfig) => void;
}

export const EffectSettingsPanel: React.FC<EffectSettingsPanelProps> = ({
  effectType,
  effects,
  onChange,
}) => {
  const configKey = getEffectConfigKey(effectType);
  const fields = configKey ? EFFECT_FIELDS[configKey] : undefined;
  const meta = EFFECT_TYPES.find((option) => option.value === effectType);

  if (!configKey || !fields) return null;

  const config = (effects[configKey] || {}) as Record<string, unknown>;

  const setValue = (key: string, value: string | number) => {
    onChange({
      ...effects,
      [configKey]: { ...config, enabled: true, [key]: value },
    } as EffectConfig);
  };

  return (
    <Box>
      <PanelHeader
        title={`${meta?.label ?? "Effect"} settings`}
        description={meta?.description}
      />

      {fields.map((field) => {
        if (field.kind === "color") {
          return (
            <Box key={field.key} sx={{ mb: 5 }}>
              <FieldLabel hint={field.hint}>{field.label}</FieldLabel>
              <TextField
                fullWidth
                size="small"
                value={(config[field.key] as string) ?? ""}
                onChange={(event) => setValue(field.key, event.target.value)}
                placeholder={field.placeholder}
                slotProps={{ input: { sx: { fontFamily: "monospace" } } }}
              />
            </Box>
          );
        }

        const scale = field.scale ?? 1;
        const raw = parseNumeric(config[field.key], field.fallback);
        const displayed = Math.round(raw * scale);
        const suffix = field.displaySuffix ?? field.unit ?? "";

        return (
          <SliderField
            key={field.key}
            label={field.label}
            hint={field.hint}
            value={displayed}
            displayValue={`${displayed}${suffix}`}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onChange={(next) =>
              setValue(
                field.key,
                field.unit ? `${next}${field.unit}` : next / scale,
              )
            }
          />
        );
      })}
    </Box>
  );
};

export default EffectSettingsPanel;
