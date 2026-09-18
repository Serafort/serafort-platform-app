import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import styled from "@emotion/styled";
import type { EffectType } from "@cap/theme";

interface PreviewCardProps {
  /** `standard` for the unstyled baseline, `effect` for the live effect. */
  variant: "standard" | "effect";
  /** Named for the caption only; the styling comes from --effect-*. */
  effectType?: EffectType;
  label?: string;
  style?: React.CSSProperties;
}

const StandardCard = styled(Paper)`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--radius-lg, 12px);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

/*
 * One preview surface for every effect, driven by the same --effect-*
 * custom properties the real app paints with.
 *
 * There used to be a GlassCardPreview and a NeuCardPreview with their values
 * written into the stylesheet - blur(16px), #e0e5ec, a fixed pair of shadows -
 * so the "live preview" showed a generic glass card no matter what blur, tint
 * or border the user had just set, and showed nothing at all for the other
 * five effects. Reading the variables means the preview is the same surface
 * the app renders, and it tracks every edit as it is made.
 */
const EffectCardPreview = styled(Paper)`
  background: var(--effect-bg, var(--color-surface, #ffffff));
  backdrop-filter: var(--effect-backdrop, none);
  -webkit-backdrop-filter: var(--effect-backdrop, none);
  border: var(--effect-border, 1px solid var(--color-border, #e2e8f0));
  border-radius: var(--effect-radius, var(--radius-lg, 12px));
  box-shadow: var(--effect-shadow, 0 8px 32px rgba(0, 0, 0, 0.1));
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const PreviewCard: React.FC<PreviewCardProps> = ({
  variant,
  label,
  style,
}) => {
  const CardComponent = variant === "effect" ? EffectCardPreview : StandardCard;
  const title = label ?? (variant === "effect" ? "Effect" : "Standard");

  return (
    <CardComponent style={style}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {title} Card
      </Typography>
      <Typography variant="body2" color="text.secondary">
        A card as the app draws it. Hover to see the interactive state.
      </Typography>
      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "primary.main",
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "secondary.main",
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "success.main",
          }}
        />
      </Box>
    </CardComponent>
  );
};

export default PreviewCard;
