import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import type { ColorToken } from "@cap/theme";
import { getWcagComplianceBadge } from "../services/aiThemePromptService";

interface ColorPaletteEditorProps {
  colors: Record<string, ColorToken>;
  onChange: (colors: Record<string, ColorToken>) => void;
}

const colorLabels: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  background: "Background",
  surface: "Surface",
  text: "Text",
  textMuted: "Text Muted",
  border: "Border",
  success: "Success",
  warning: "Warning",
  error: "Error",
  info: "Info",
};

type PreviewMode = "light" | "dark";

const ColorSwatch = ({
  color,
  label,
  onColorChange,
  contrastTarget,
  /**
   * When set, this swatch edits `color[modeKey]` (falling back to
   * `color.value` for display when unset) instead of `color.value` directly -
   * see composeMuiTheme's resolveChromeColor, which reads `.light`/`.dark`
   * before `.value`.
   */
  modeKey,
}: {
  color: ColorToken;
  label: string;
  onColorChange: (value: string) => void;
  contrastTarget?: string;
  modeKey?: PreviewMode;
}) => {
  const displayValue = (modeKey ? color[modeKey] : undefined) ?? color.value;
  const isInherited = Boolean(modeKey) && color[modeKey!] === undefined;
  const contrastBadge = contrastTarget
    ? getWcagComplianceBadge(displayValue, contrastTarget)
    : null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Box
          component="label"
          title="Pick color"
          sx={{
            position: "relative",
            width: 48,
            height: 48,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
            overflow: "hidden",
            cursor: "pointer",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundColor: displayValue,
            }}
          />
          <input
            type="color"
            value={displayValue}
            onChange={(e) => onColorChange(e.target.value)}
            aria-label={`Pick color for ${label}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
          />
        </Box>
        <TextField
          size="small"
          value={displayValue}
          onChange={(e) => onColorChange(e.target.value)}
          placeholder="#000000"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box
                  component="span"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    background: `linear-gradient(45deg, #fff 45%, #000 45%, #000 55%, #fff 55%)`,
                    backgroundSize: "8px 8px",
                    opacity: 0.3,
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {color.description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {color.description}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
        {contrastBadge && (
          <Chip
            size="small"
            label={contrastBadge.label}
            color={contrastBadge.color}
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
        )}
        {isInherited && (
          <Chip
            size="small"
            variant="outlined"
            label={`Same as light - not set for ${modeKey}`}
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
        )}
      </Box>
    </Box>
  );
};

export const ColorPaletteEditor: React.FC<ColorPaletteEditorProps> = ({
  colors,
  onChange,
}) => {
  // Which mode the chrome swatches (background/surface/text/textMuted/border)
  // are currently editing. Brand and semantic colors have no mode dimension -
  // a brand blue is a brand blue in both modes - so they ignore this toggle
  // and always edit `.value` directly.
  const [previewMode, setPreviewMode] = useState<PreviewMode>("light");

  const handleColorChange = (key: string, value: string) => {
    onChange({
      ...colors,
      [key]: {
        ...colors[key],
        value,
      },
    });
  };

  const handleChromeColorChange = (key: string, value: string) => {
    onChange({
      ...colors,
      [key]: {
        ...colors[key],
        [previewMode]: value,
      },
    });
  };

  const chromeContrastTarget =
    colors.background?.[previewMode] ?? colors.background?.value ?? "#f8fafc";

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Color Palette
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize the color scheme for your organization's theme.
      </Typography>

      {/*
        Container-responsive grid (see PresetSelector/AiThemeStudioPanel for
        the same fix) instead of MUI `Grid`'s viewport-keyed breakpoints,
        which stayed 2-up even when this panel renders inside the narrow
        theme-editor drawer on a wide monitor. The mode-toggle row spans
        every column explicitly since it's the one full-width item among
        four card-width ones.
      */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 2,
        }}
      >
        <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: "text.secondary" }}
            >
              Brand Colors
            </Typography>
            <ColorSwatch
              color={colors.primary || { value: "#6366f1" }}
              label={colorLabels.primary}
              contrastTarget={colors.background?.value || "#f8fafc"}
              onColorChange={(value) => handleColorChange("primary", value)}
            />
            <ColorSwatch
              color={colors.secondary || { value: "#8b5cf6" }}
              label={colorLabels.secondary}
              contrastTarget={colors.background?.value || "#f8fafc"}
              onColorChange={(value) => handleColorChange("secondary", value)}
            />
          </Box>

        <Box
          sx={{
            gridColumn: "1 / -1",
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              Editing surface &amp; text colors for:
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={previewMode}
              onChange={(_e, next: PreviewMode | null) => {
                if (next) setPreviewMode(next);
              }}
              aria-label="Preview mode for surface and text colors"
            >
              <ToggleButton value="light" aria-label="Light mode">
                <LightModeIcon fontSize="small" sx={{ mr: 0.5 }} />
                Light
              </ToggleButton>
              <ToggleButton value="dark" aria-label="Dark mode">
                <DarkModeIcon fontSize="small" sx={{ mr: 0.5 }} />
                Dark
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ flexBasis: "100%" }}
            >
              Background, Surface, Border, Text and Text Muted can differ
              between light and dark mode. A swatch left unset for a mode falls
              back to its Light value - set Dark explicitly if the light value
              would not suit a dark screen (e.g. white on white).
            </Typography>
        </Box>

        <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: "text.secondary" }}
            >
              Surface Colors
            </Typography>
            <ColorSwatch
              color={colors.background || { value: "#f8fafc" }}
              label={colorLabels.background}
              modeKey={previewMode}
              onColorChange={(value) =>
                handleChromeColorChange("background", value)
              }
            />
            <ColorSwatch
              color={colors.surface || { value: "#ffffff" }}
              label={colorLabels.surface}
              modeKey={previewMode}
              onColorChange={(value) =>
                handleChromeColorChange("surface", value)
              }
            />
            <ColorSwatch
              color={colors.border || { value: "#e2e8f0" }}
              label={colorLabels.border}
              modeKey={previewMode}
              onColorChange={(value) =>
                handleChromeColorChange("border", value)
              }
            />
          </Box>

        <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: "text.secondary" }}
            >
              Text Colors
            </Typography>
            <ColorSwatch
              color={colors.text || { value: "#0f172a" }}
              label={colorLabels.text}
              modeKey={previewMode}
              contrastTarget={chromeContrastTarget}
              onColorChange={(value) => handleChromeColorChange("text", value)}
            />
            <ColorSwatch
              color={colors.textMuted || { value: "#64748b" }}
              label={colorLabels.textMuted}
              modeKey={previewMode}
              contrastTarget={chromeContrastTarget}
              onColorChange={(value) =>
                handleChromeColorChange("textMuted", value)
              }
            />
          </Box>

        <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: "text.secondary" }}
            >
              Semantic Colors
            </Typography>
            <ColorSwatch
              color={colors.success || { value: "#22c55e" }}
              label={colorLabels.success}
              onColorChange={(value) => handleColorChange("success", value)}
            />
            <ColorSwatch
              color={colors.warning || { value: "#f59e0b" }}
              label={colorLabels.warning}
              onColorChange={(value) => handleColorChange("warning", value)}
            />
            <ColorSwatch
              color={colors.error || { value: "#ef4444" }}
              label={colorLabels.error}
              onColorChange={(value) => handleColorChange("error", value)}
            />
            <ColorSwatch
              color={colors.info || { value: "#3b82f6" }}
              label={colorLabels.info}
              onColorChange={(value) => handleColorChange("info", value)}
            />
          </Box>
      </Box>
    </Box>
  );
};

export default ColorPaletteEditor;
