import React from "react";
import { Box, Chip, Typography, useTheme } from "@mui/material";
import type { ThemePresetId } from "@cap/theme";
import { PRESET_LIST } from "@cap/theme";
import {
  AutoGrid,
  PanelHeader,
  clamp2,
  ellipsis,
  useFocusRingSx,
  useSurfaceSx,
} from "./studioUi";

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
  const theme = useTheme();
  const surface = useSurfaceSx();
  const focusRing = useFocusRingSx();

  return (
    <Box>
      <PanelHeader
        title="Style presets"
        description="A complete starting point. Applying one replaces your current settings — you can keep tuning afterwards."
      />

      {/*
        Same card shape as the AI Studio's suggestions: a miniature of the
        theme on its own background, then the name and a two-line description
        so every card is the same height. The two tabs offer the same kind of
        thing, so they should look like the same kind of thing.
      */}
      <AutoGrid min={220} gap={3}>
        {PRESET_LIST.map((preset) => {
          const isActive = currentPreset === preset.id;
          return (
            <Box
              key={preset.id}
              component="button"
              type="button"
              onClick={() => onSelect(preset.id)}
              aria-pressed={isActive}
              sx={{
                ...surface,
                display: "block",
                inlineSize: "100%",
                p: 0,
                font: "inherit",
                color: "inherit",
                textAlign: "start",
                overflow: "hidden",
                cursor: "pointer",
                borderColor: isActive
                  ? theme.palette.primary.main
                  : theme.palette.divider,
                boxShadow: isActive
                  ? `0 0 0 1px ${theme.palette.primary.main}`
                  : "none",
                transition: theme.transitions.create(
                  ["border-color", "transform", "box-shadow"],
                  { duration: 150 },
                ),
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
                "&:focus-visible": focusRing,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  blockSize: 56,
                  paddingInline: 3,
                  bgcolor: preset.preview.backgroundColor,
                  borderBlockEnd: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    inlineSize: 38,
                    blockSize: 8,
                    borderRadius: 4,
                    bgcolor: preset.preview.primaryColor,
                  }}
                />
                <Box
                  sx={{
                    inlineSize: 20,
                    blockSize: 8,
                    borderRadius: 4,
                    bgcolor: preset.preview.secondaryColor,
                  }}
                />
              </Box>

              <Box sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box component="span" aria-hidden sx={{ fontSize: "1rem" }}>
                    {presetIcons[preset.id]}
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, flex: 1, minWidth: 0, ...ellipsis }}
                  >
                    {preset.name}
                  </Typography>
                  {isActive && (
                    <Chip
                      size="small"
                      color="primary"
                      label="Active"
                      sx={{
                        blockSize: 20,
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ...clamp2, mt: 1, lineHeight: 1.5 }}
                >
                  {preset.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </AutoGrid>
    </Box>
  );
};

export default PresetSelector;
