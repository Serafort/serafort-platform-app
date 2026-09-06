import React, { useState } from "react";
import {
  Box,
  Chip,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import type { ColorToken } from "@cap/theme";
import { getWcagComplianceBadge } from "../services/aiThemePromptService";
import {
  AutoGrid,
  PanelHeader,
  SectionLabel,
  useSurfaceSx,
} from "./studioUi";

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
  textMuted: "Text muted",
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
  isFirst,
}: {
  color: ColorToken;
  label: string;
  onColorChange: (value: string) => void;
  contrastTarget?: string;
  modeKey?: PreviewMode;
  isFirst: boolean;
}) => {
  const theme = useTheme();
  const displayValue = (modeKey ? color[modeKey] : undefined) ?? color.value;
  const isInherited = Boolean(modeKey) && color[modeKey!] === undefined;
  const contrastBadge = contrastTarget
    ? getWcagComplianceBadge(displayValue, contrastTarget)
    : null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        paddingInline: 4,
        paddingBlock: 3,
        borderBlockStart: isFirst
          ? "none"
          : `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* The well is the picker: clicking anywhere on the color opens it. */}
      <Box
        component="label"
        title={`Pick ${label}`}
        sx={{
          position: "relative",
          inlineSize: 40,
          blockSize: 40,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
          overflow: "hidden",
          cursor: "pointer",
          "&:hover": { borderColor: "primary.main" },
          "&:focus-within": {
            borderColor: "primary.main",
            boxShadow: `0 0 0 3px ${theme.palette.primary.main}26`,
          },
        }}
      >
        <Box
          sx={{ position: "absolute", inset: 0, backgroundColor: displayValue }}
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

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {(contrastBadge || isInherited) && (
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mt: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {contrastBadge && (
              <Chip
                size="small"
                label={contrastBadge.label}
                color={contrastBadge.color}
                variant="outlined"
                sx={{ blockSize: 20, fontSize: "0.6875rem" }}
              />
            )}
            {isInherited && (
              <Typography variant="caption" color="text.disabled">
                inherits light
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <TextField
        size="small"
        value={displayValue}
        onChange={(e) => onColorChange(e.target.value)}
        placeholder="#000000"
        aria-label={`${label} hex value`}
        sx={{ inlineSize: 108 }}
        slotProps={{
          input: { sx: { fontFamily: "monospace", fontSize: "0.8125rem" } },
        }}
      />
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
  const surface = useSurfaceSx();

  const handleColorChange = (key: string, value: string) => {
    onChange({ ...colors, [key]: { ...colors[key], value } });
  };

  const handleChromeColorChange = (key: string, value: string) => {
    onChange({ ...colors, [key]: { ...colors[key], [previewMode]: value } });
  };

  const chromeContrastTarget =
    colors.background?.[previewMode] ?? colors.background?.value ?? "#f8fafc";

  const brandTarget = colors.background?.value || "#f8fafc";

  return (
    <Box>
      <PanelHeader
        title="Color palette"
        description="Brand and semantic colors are shared by both modes. Surface and text colors can differ."
      />

      <Box sx={{ mb: 7 }}>
        <SectionLabel>Brand</SectionLabel>
        <Box sx={{ ...surface, overflow: "hidden" }}>
          <ColorSwatch
            isFirst
            color={colors.primary || { value: "#6366f1" }}
            label={colorLabels.primary}
            contrastTarget={brandTarget}
            onColorChange={(value) => handleColorChange("primary", value)}
          />
          <ColorSwatch
            isFirst={false}
            color={colors.secondary || { value: "#8b5cf6" }}
            label={colorLabels.secondary}
            contrastTarget={brandTarget}
            onColorChange={(value) => handleColorChange("secondary", value)}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 7 }}>
        <SectionLabel
          action={
            <ToggleButtonGroup
              size="small"
              exclusive
              value={previewMode}
              onChange={(_e, next: PreviewMode | null) => {
                if (next) setPreviewMode(next);
              }}
              aria-label="Mode being edited for surface and text colors"
              sx={{ "& .MuiToggleButton-root": { paddingInline: 2.5 } }}
            >
              <ToggleButton value="light" aria-label="Light mode">
                <LightModeIcon sx={{ fontSize: 16, mr: 1 }} />
                Light
              </ToggleButton>
              <ToggleButton value="dark" aria-label="Dark mode">
                <DarkModeIcon sx={{ fontSize: 16, mr: 1 }} />
                Dark
              </ToggleButton>
            </ToggleButtonGroup>
          }
        >
          Surface & text
        </SectionLabel>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 3, lineHeight: 1.5 }}
        >
          A swatch left unset for a mode falls back to its light value — set
          dark explicitly where the light one would not survive a dark screen.
        </Typography>

        <AutoGrid min={260} gap={3}>
          <Box sx={{ ...surface, overflow: "hidden" }}>
            <ColorSwatch
              isFirst
              color={colors.background || { value: "#f8fafc" }}
              label={colorLabels.background}
              modeKey={previewMode}
              onColorChange={(value) =>
                handleChromeColorChange("background", value)
              }
            />
            <ColorSwatch
              isFirst={false}
              color={colors.surface || { value: "#ffffff" }}
              label={colorLabels.surface}
              modeKey={previewMode}
              onColorChange={(value) =>
                handleChromeColorChange("surface", value)
              }
            />
            <ColorSwatch
              isFirst={false}
              color={colors.border || { value: "#e2e8f0" }}
              label={colorLabels.border}
              modeKey={previewMode}
              onColorChange={(value) => handleChromeColorChange("border", value)}
            />
          </Box>

          <Box sx={{ ...surface, overflow: "hidden" }}>
            <ColorSwatch
              isFirst
              color={colors.text || { value: "#0f172a" }}
              label={colorLabels.text}
              modeKey={previewMode}
              contrastTarget={chromeContrastTarget}
              onColorChange={(value) => handleChromeColorChange("text", value)}
            />
            <ColorSwatch
              isFirst={false}
              color={colors.textMuted || { value: "#64748b" }}
              label={colorLabels.textMuted}
              modeKey={previewMode}
              contrastTarget={chromeContrastTarget}
              onColorChange={(value) =>
                handleChromeColorChange("textMuted", value)
              }
            />
          </Box>
        </AutoGrid>
      </Box>

      <Box>
        <SectionLabel>Semantic</SectionLabel>
        <Box sx={{ ...surface, overflow: "hidden" }}>
          <ColorSwatch
            isFirst
            color={colors.success || { value: "#22c55e" }}
            label={colorLabels.success}
            onColorChange={(value) => handleColorChange("success", value)}
          />
          <ColorSwatch
            isFirst={false}
            color={colors.warning || { value: "#f59e0b" }}
            label={colorLabels.warning}
            onColorChange={(value) => handleColorChange("warning", value)}
          />
          <ColorSwatch
            isFirst={false}
            color={colors.error || { value: "#ef4444" }}
            label={colorLabels.error}
            onColorChange={(value) => handleColorChange("error", value)}
          />
          <ColorSwatch
            isFirst={false}
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
