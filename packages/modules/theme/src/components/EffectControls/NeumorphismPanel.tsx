import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import type { NeumorphismConfig } from "@cap/theme";
import { computeNeumorphismBoxShadow } from "@cap/theme";
import {
  EmptyHint,
  FieldLabel,
  SliderField,
  SwatchReadout,
  SwitchHeader,
  useSurfaceSx,
} from "../studioUi";

interface NeumorphismPanelProps {
  config: NeumorphismConfig;
  onChange: (config: NeumorphismConfig) => void;
}

export const NeumorphismPanel: React.FC<NeumorphismPanelProps> = ({
  config,
  onChange,
}) => {
  const { t } = useTranslation();
  const surface = useSurfaceSx();

  const handleChange = <K extends keyof NeumorphismConfig>(
    key: K,
    value: NeumorphismConfig[K],
  ) => {
    onChange({ ...config, [key]: value });
  };

  const shadow = computeNeumorphismBoxShadow(config);
  const radius = parseInt(config.borderRadius || "12") || 12;

  return (
    <Box sx={{ ...surface, p: 5 }}>
      <SwitchHeader
        title={t("theme.effects.neu.title", "Neumorphism")}
        description={t(
          "theme.effects.neu.description",
          "Soft extruded surfaces: one light shadow and one dark, from a single light source.",
        )}
        checked={Boolean(config.enabled)}
        onChange={(checked) => handleChange("enabled", checked)}
      />

      {!config.enabled ? (
        <Box sx={{ mt: 4 }}>
          <EmptyHint>
            {t(
              "theme.effects.neu.empty",
              "Turn neumorphism on to tune depth and light angle.",
            )}
          </EmptyHint>
        </Box>
      ) : (
        <Box sx={{ mt: 6 }}>
          <Box sx={{ mb: 6 }}>
            <FieldLabel
              hint={t(
                "theme.effects.neu.base_hint",
                "Neumorphism only reads on a surface that matches this color",
              )}
            >
              {t("theme.effects.neu.base_surface", "Base surface")}
            </FieldLabel>
            <SwatchReadout
              label={t("theme.effects.neu.background", "Background")}
              hex={config.backgroundColor || "#e0e5ec"}
              size={32}
            />
          </Box>

          <SliderField
            label={t("theme.effects.neu.intensity", "Intensity")}
            value={(config.intensity ?? 0.15) * 100}
            displayValue={`${((config.intensity ?? 0.15) * 100).toFixed(0)}%`}
            hint={t(
              "theme.effects.neu.intensity_hint",
              "Shadow darkness and spread",
            )}
            min={5}
            max={40}
            marks={[
              { value: 5, label: "5%" },
              { value: 20, label: "20%" },
              { value: 40, label: "40%" },
            ]}
            onChange={(value) => handleChange("intensity", value / 100)}
          />

          <SliderField
            label={t("theme.effects.neu.distance", "Distance")}
            value={config.distance || 10}
            displayValue={`${config.distance || 10}px`}
            hint={t(
              "theme.effects.neu.distance_hint",
              "How far the shadows sit from the shape",
            )}
            min={0}
            max={20}
            marks={[
              { value: 0, label: "0" },
              { value: 10, label: "10" },
              { value: 20, label: "20" },
            ]}
            onChange={(value) => handleChange("distance", value)}
          />

          <SliderField
            label={t("theme.effects.neu.light_angle", "Light angle")}
            value={config.altitude ?? 45}
            displayValue={`${config.altitude ?? 45}°`}
            hint={t(
              "theme.effects.neu.light_angle_hint",
              "Elevation of the light above the horizon: 0° lights the surface from the side, 90° from directly above, 45° gives the classic diagonal",
            )}
            min={0}
            max={90}
            marks={[
              { value: 0, label: "0°" },
              { value: 45, label: "45°" },
              { value: 90, label: "90°" },
            ]}
            onChange={(value) => handleChange("altitude", value)}
          />

          <SliderField
            label={t("theme.effects.neu.corner_radius", "Corner radius")}
            value={radius}
            displayValue={`${radius}px`}
            min={0}
            max={32}
            step={2}
            marks={[
              { value: 0, label: "0" },
              { value: 12, label: "12" },
              { value: 32, label: "32" },
            ]}
            onChange={(value) => handleChange("borderRadius", `${value}px`)}
          />

          <FieldLabel>{t("theme.effects.preview_label", "Preview")}</FieldLabel>
          {/* Preview surface uses the user's own neumorphism base color; the
              text colors below are fixed for contrast against that light-grey
              ground, which is the only surface neumorphism reads on. */}
          <Box
            sx={{
              p: 6,
              borderRadius: 1.5,
              backgroundColor: config.backgroundColor,
            }}
          >
            <Box
              sx={{
                p: 5,
                backgroundColor: config.backgroundColor,
                borderRadius: `${radius}px`,
                boxShadow: shadow,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#31344b" }}
              >
                {t("theme.effects.neu.extruded_surface", "Extruded surface")}
              </Typography>
              <Typography variant="caption" sx={{ color: "#61667d" }}>
                {t(
                  "theme.effects.neu.extruded_caption",
                  "How buttons and cards read with neumorphism on",
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NeumorphismPanel;
