import React from "react";
import { Box, Typography, Paper, Button, Chip } from "@mui/material";
import type { ThemePresetId } from "@cap/theme";
import { PRESET_LIST } from "@cap/theme";

interface PresetSelectorProps {
  currentPreset?: ThemePresetId;
  onSelect: (presetId: ThemePresetId) => void;
}

const presetIcons: Record<ThemePresetId, string> = {
  serafort: "🛡️",
  "serafort-dark": "🌌",
  default: "🎨",
  "flat-design": "📄",
  "material-design": "🤖",
  neumorphism: "🔘",
  glassmorphism: "✨",
  "pure-brutalism": "🧱",
  minimalism: "⚪",
  "dark-ui": "🌙",
  "cyberpunk-hud": "👾",
  "liquid-organic": "💧",
  "retro-y2k": "📼",
  "immersive-3d": "🕶️",
  "neo-brutalism": "⚡",
  "modern-skeuomorphic": "📟",
  "godlio-premium": "👑",
};

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  currentPreset,
  onSelect,
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Style Presets
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Start with a predefined theme and customize it further
      </Typography>

      {/*
        A CSS grid with `auto-fit`/`minmax` sizes columns to this Paper's
        own rendered width - unlike MUI's `Grid` breakpoints (`sm`/`md`),
        which key off the browser viewport and stayed 3-up (squeezed) even
        when this panel is mounted inside the ~560px theme-editor drawer on
        a wide monitor. See AiThemeStudioPanel for the same fix.
      */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 2,
        }}
      >
        {PRESET_LIST.map((preset) => (
            <Button
              key={preset.id}
              onClick={() => onSelect(preset.id)}
              variant={currentPreset === preset.id ? "contained" : "outlined"}
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                border: currentPreset === preset.id ? 2 : 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  mb: 1,
                }}
              >
                <Typography variant="h5" sx={{ mr: 1 }}>
                  {presetIcons[preset.id]}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {preset.name}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                {preset.description}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "4px 0 0 4px",
                    backgroundColor: preset.preview.primaryColor,
                  }}
                />
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: preset.preview.secondaryColor,
                  }}
                />
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: preset.preview.backgroundColor,
                    borderRadius: "0 4px 4px 0",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
              </Box>
              {currentPreset === preset.id && (
                <Chip
                  size="small"
                  label="Active"
                  color="primary"
                  sx={{ mt: 1.5 }}
                />
              )}
            </Button>
        ))}
      </Box>

      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: "background.default",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>Tip:</strong> Applying a preset will replace your current
          settings. You can always customize the theme after selecting a preset.
        </Typography>
      </Box>
    </Paper>
  );
};

export default PresetSelector;
