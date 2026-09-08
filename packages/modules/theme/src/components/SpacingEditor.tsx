import React from "react";
import { Box, TextField, Typography, useTheme } from "@mui/material";
import { directionalRadius } from "@cap/theme";
import { PanelHeader, SectionLabel, useSurfaceSx } from "./studioUi";

interface SpacingEditorProps {
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  /** Optional: the five tenant shadow anchors (xs..xl). */
  shadows?: Record<string, string>;
  /** Optional: viewport-responsive clamp() spacing. */
  fluidSpacing?: Record<string, string>;
  onSpacingChange: (spacing: Record<string, string>) => void;
  onBorderRadiusChange: (borderRadius: Record<string, string>) => void;
  onShadowsChange?: (shadows: Record<string, string>) => void;
  onFluidSpacingChange?: (fluidSpacing: Record<string, string>) => void;
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

/** The five indices composeMuiTheme wires to `var(--shadow-*)`. */
const shadowLabels: Record<string, string> = {
  xs: "Extra small",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
};

const fluidSpacingLabels: Record<string, string> = {
  gutterInline: "Page gutter (inline)",
  gutterBlock: "Page gutter (block)",
  sectionGap: "Section gap",
  stackGap: "Stack gap",
  cardPadding: "Card padding",
  clusterGap: "Cluster gap",
};

export const SpacingEditor: React.FC<SpacingEditorProps> = ({
  spacing,
  borderRadius,
  shadows,
  fluidSpacing,
  onSpacingChange,
  onBorderRadiusChange,
  onShadowsChange,
  onFluidSpacingChange,
}) => {
  const theme = useTheme();
  const surface = useSurfaceSx();

  const patch =
    (
      current: Record<string, string>,
      commit: (next: Record<string, string>) => void,
    ) =>
    (key: string, value: string) =>
      commit({ ...current, [key]: value });

  const handleSpacingChange = patch(spacing, onSpacingChange);
  const handleBorderRadiusChange = patch(borderRadius, onBorderRadiusChange);
  const handleShadowChange = patch(shadows ?? {}, onShadowsChange ?? (() => {}));
  const handleFluidChange = patch(
    fluidSpacing ?? {},
    onFluidSpacingChange ?? (() => {}),
  );

  /** Name on the left, the value you edit on the right - one row per token. */
  const TokenRow: React.FC<{
    label: string;
    value: string;
    placeholder: string;
    onValueChange: (value: string) => void;
    adornment?: React.ReactNode;
    isFirst: boolean;
    wide?: boolean;
  }> = ({
    label,
    value,
    placeholder,
    onValueChange,
    adornment,
    isFirst,
    wide,
  }) => (
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
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0, fontWeight: 500 }}>
        {label}
      </Typography>
      {adornment}
      <TextField
        size="small"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        sx={{ inlineSize: wide ? 220 : 104 }}
        slotProps={{
          input: { sx: { fontFamily: "monospace", fontSize: "0.8125rem" } },
        }}
      />
    </Box>
  );

  return (
    <Box>
      <PanelHeader
        title="Spacing, radius & elevation"
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

      {onFluidSpacingChange && (
        <Box sx={{ mb: 7 }}>
          <SectionLabel>Fluid spacing</SectionLabel>
          <Typography
            variant="caption"
            sx={{ display: "block", color: "text.secondary", mb: 1.5 }}
          >
            Viewport-responsive. Use a{" "}
            <Box component="code" sx={{ fontFamily: "monospace" }}>
              clamp(min, preferred, max)
            </Box>{" "}
            so layout tightens on small screens and opens up on large ones.
          </Typography>
          <Box sx={{ ...surface, overflow: "hidden" }}>
            {Object.entries(fluidSpacingLabels).map(([key, label], index) => (
              <TokenRow
                key={key}
                label={label}
                value={(fluidSpacing ?? {})[key] || ""}
                placeholder="clamp(1rem, 0.6rem + 2vw, 2.5rem)"
                onValueChange={(value) => handleFluidChange(key, value)}
                isFirst={index === 0}
                wide
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ mb: onShadowsChange ? 7 : 0 }}>
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

        {/* How the radius scale reads on a grouped control: only the outer
            corners round, and they follow writing direction (RTL-safe) via
            the directionalRadius helper. */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mt: 2,
            paddingInline: 4,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Grouped controls
          </Typography>
          <Box sx={{ display: "flex" }} aria-hidden>
            {["a", "b", "c"].map((seg, i) => (
              <Box
                key={seg}
                sx={{
                  inlineSize: 34,
                  blockSize: 26,
                  bgcolor: "action.selected",
                  borderBlock: `1px solid ${theme.palette.divider}`,
                  borderInlineStart: `1px solid ${theme.palette.divider}`,
                  ...(i === 2 && {
                    borderInlineEnd: `1px solid ${theme.palette.divider}`,
                  }),
                  ...(i === 0 &&
                    directionalRadius(borderRadius.md || "8px", "start", {
                      resetUnset: false,
                    })),
                  ...(i === 2 &&
                    directionalRadius(borderRadius.md || "8px", "end", {
                      resetUnset: false,
                    })),
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {onShadowsChange && (
        <Box>
          <SectionLabel>Elevation</SectionLabel>
          <Typography
            variant="caption"
            sx={{ display: "block", color: "text.secondary", mb: 1.5 }}
          >
            The five shadow steps surfaces use for depth. Any{" "}
            <Box component="code" sx={{ fontFamily: "monospace" }}>
              box-shadow
            </Box>{" "}
            value works.
          </Typography>
          <Box sx={{ ...surface, overflow: "hidden" }}>
            {Object.entries(shadowLabels).map(([key, label], index) => (
              <TokenRow
                key={key}
                label={label}
                value={(shadows ?? {})[key] || ""}
                placeholder="0px 4px 18px rgba(0,0,0,0.16)"
                onValueChange={(value) => handleShadowChange(key, value)}
                isFirst={index === 0}
                wide
                adornment={
                  <Box
                    aria-hidden
                    sx={{
                      inlineSize: 28,
                      blockSize: 28,
                      flexShrink: 0,
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      boxShadow: (shadows ?? {})[key] || "none",
                    }}
                  />
                }
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SpacingEditor;
