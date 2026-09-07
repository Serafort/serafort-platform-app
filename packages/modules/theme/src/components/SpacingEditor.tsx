import React from "react";
import { Box, TextField, Typography, useTheme } from "@mui/material";
import {
  PanelHeader,
  SectionLabel,
  useSurfaceSx,
} from "./studioUi";

interface SpacingEditorProps {
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  onSpacingChange: (spacing: Record<string, string>) => void;
  onBorderRadiusChange: (borderRadius: Record<string, string>) => void;
}

const spacingLabels: Record<string, string> = {
  xs: "Extra small",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
  "2xl": "2× extra large",
};

const borderRadiusLabels: Record<string, string> = {
  none: "None",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
  full: "Full",
};

export const SpacingEditor: React.FC<SpacingEditorProps> = ({
  spacing,
  borderRadius,
  onSpacingChange,
  onBorderRadiusChange,
}) => {
  const theme = useTheme();
  const surface = useSurfaceSx();

  const handleSpacingChange = (key: string, value: string) => {
    onSpacingChange({ ...spacing, [key]: value });
  };

  const handleBorderRadiusChange = (key: string, value: string) => {
    onBorderRadiusChange({ ...borderRadius, [key]: value });
  };

  /** Name on the left, the value you edit on the right - one row per token. */
  const TokenRow: React.FC<{
    label: string;
    value: string;
    placeholder: string;
    onValueChange: (value: string) => void;
    adornment?: React.ReactNode;
    isFirst: boolean;
  }> = ({ label, value, placeholder, onValueChange, adornment, isFirst }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        paddingInline: 4,
        paddingBlock: 2.5,
        borderBlockStart: isFirst
          ? "none"
          : `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography
        variant="body2"
        sx={{ flex: 1, minWidth: 0, fontWeight: 500 }}
      >
        {label}
      </Typography>
      {adornment}
      <TextField
        size="small"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        sx={{ inlineSize: 104 }}
        slotProps={{
          input: { sx: { fontFamily: "monospace", fontSize: "0.8125rem" } },
        }}
      />
    </Box>
  );

  return (
    <Box>
      <PanelHeader
        title="Spacing & radius"
        description="The scale everything else is built from. Any CSS length works — 8px, 1rem, 0.5em."
      />

      <Box sx={{ mb: 7 }}>
        <SectionLabel>Spacing scale</SectionLabel>
        <Box sx={{ ...surface, overflow: "hidden" }}>
          {Object.entries(spacingLabels).map(([key, label], index) => (
            <TokenRow
              key={key}
              label={label}
              value={spacing[key] || ""}
              placeholder="1rem"
              onValueChange={(value) => handleSpacingChange(key, value)}
              isFirst={index === 0}
            />
          ))}
        </Box>
      </Box>

      <Box>
        <SectionLabel>Corner radius</SectionLabel>
        <Box sx={{ ...surface, overflow: "hidden" }}>
          {Object.entries(borderRadiusLabels).map(([key, label], index) => (
            <TokenRow
              key={key}
              label={label}
              value={borderRadius[key] || ""}
              placeholder="8px"
              onValueChange={(value) => handleBorderRadiusChange(key, value)}
              isFirst={index === 0}
              adornment={
                // The shape itself, at the value you typed - faster to read
                // than the number, and it updates as you type.
                <Box
                  aria-hidden
                  sx={{
                    inlineSize: 28,
                    blockSize: 28,
                    flexShrink: 0,
                    bgcolor: "primary.main",
                    borderRadius: borderRadius[key] || "0px",
                  }}
                />
              }
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SpacingEditor;
