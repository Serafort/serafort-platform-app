import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import type { GlassmorphismConfig } from "@cap/theme";
import {
  EmptyHint,
  FieldLabel,
  SliderField,
  SwitchHeader,
  useSurfaceSx,
} from "../studioUi";

interface GlassmorphismPanelProps {
  config: GlassmorphismConfig;
  onChange: (config: GlassmorphismConfig) => void;
}

export const GlassmorphismPanel: React.FC<GlassmorphismPanelProps> = ({
  config,
  onChange,
}) => {
  const surface = useSurfaceSx();

  const handleChange = <K extends keyof GlassmorphismConfig>(
    key: K,
    value: GlassmorphismConfig[K],
  ) => {
    onChange({ ...config, [key]: value });
  };

  const blur = parseInt(config.blur || "16") || 16;
  const borderWidth = parseInt(config.borderWidth || "1") || 1;

  return (
    <Box sx={{ ...surface, p: 5 }}>
      <SwitchHeader
        title="Glassmorphism"
        description="Frosted panels: a blurred view of whatever sits behind, with a bright hairline edge."
        checked={Boolean(config.enabled)}
        onChange={(checked) => handleChange("enabled", checked)}
      />

      {!config.enabled ? (
        <Box sx={{ mt: 4 }}>
          <EmptyHint>Turn glassmorphism on to tune blur and tint.</EmptyHint>
        </Box>
      ) : (
        <Box sx={{ mt: 6 }}>
          <SliderField
            label="Blur"
            value={blur}
            displayValue={`${blur}px`}
            min={0}
            max={50}
            marks={[
              { value: 0, label: "0" },
              { value: 16, label: "16" },
              { value: 32, label: "32" },
              { value: 50, label: "50" },
            ]}
            onChange={(value) => handleChange("blur", `${value}px`)}
          />

          <SliderField
            label="Opacity"
            value={(config.opacity ?? 0.8) * 100}
            displayValue={`${((config.opacity ?? 0.8) * 100).toFixed(0)}%`}
            min={0}
            max={100}
            marks={[
              { value: 0, label: "0%" },
              { value: 50, label: "50%" },
              { value: 100, label: "100%" },
            ]}
            onChange={(value) => handleChange("opacity", value / 100)}
          />

          <SliderField
            label="Border width"
            value={borderWidth}
            displayValue={`${borderWidth}px`}
            min={0}
            max={5}
            marks={[
              { value: 0, label: "0" },
              { value: 2, label: "2" },
              { value: 5, label: "5" },
            ]}
            onChange={(value) => handleChange("borderWidth", `${value}px`)}
          />

          <Box sx={{ mb: 5 }}>
            <FieldLabel hint="rgba() so the blur behind it stays visible">
              Tint
            </FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={config.background || ""}
              onChange={(e) => handleChange("background", e.target.value)}
              placeholder="rgba(255, 255, 255, 0.1)"
              slotProps={{ input: { sx: { fontFamily: "monospace" } } }}
            />
          </Box>

          <Box sx={{ mb: 6 }}>
            <FieldLabel>Border color</FieldLabel>
            <TextField
              fullWidth
              size="small"
              value={config.borderColor || ""}
              onChange={(e) => handleChange("borderColor", e.target.value)}
              placeholder="rgba(255, 255, 255, 0.2)"
              slotProps={{ input: { sx: { fontFamily: "monospace" } } }}
            />
          </Box>

          {/*
            The preview needs something behind it or there is nothing to
            frost - the previous version put near-white text on a 10%-white
            tint over white paper, which was invisible in light mode. A fixed
            colored ground makes the blur and the edge legible in either mode.
          */}
          <FieldLabel>Preview</FieldLabel>
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 1.5,
              p: 5,
              background:
                "linear-gradient(135deg, #1e3a8a 0%, #7e22ce 50%, #be185d 100%)",
            }}
          >
            {/* Detail behind the glass, so the blur has something to act on */}
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                insetBlockStart: -20,
                insetInlineEnd: -10,
                inlineSize: 120,
                blockSize: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.35)",
              }}
            />
            <Box
              sx={{
                position: "relative",
                p: 4,
                borderRadius: 1.5,
                background: config.background,
                backdropFilter: `blur(${config.blur || "16px"})`,
                WebkitBackdropFilter: `blur(${config.blur || "16px"})`,
                border: `${config.borderWidth || "1px"} solid ${config.borderColor}`,
                opacity: config.opacity ?? 0.8,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#fff" }}
              >
                Frosted surface
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                How cards read with glassmorphism on
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2 }}
          >
            Preview ground is fixed so the effect stays readable in both modes;
            your own surfaces use the tenant background.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GlassmorphismPanel;
