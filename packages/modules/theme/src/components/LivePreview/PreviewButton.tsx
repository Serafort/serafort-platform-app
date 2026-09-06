import React from "react";
import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";
import type { EffectType } from "@cap/theme";

interface PreviewButtonProps {
  variant?: "primary" | "secondary" | "outline";
  effectStyle?: "standard" | "effect";
  /** Named for the caption only; the styling comes from --effect-*. */
  effectType?: EffectType;
  label?: string;
}

const StandardButton = styled.button<{ variant?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  ${({ variant }) => {
    switch (variant) {
      case "primary":
        return `
          background: var(--color-primary, #6366f1);
          color: white;
          border: none;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
        `;
      case "secondary":
        return `
          background: var(--color-secondary, #8b5cf6);
          color: white;
          border: none;
        `;
      default:
        return `
          background: transparent;
          color: var(--color-primary, #6366f1);
          border: 1px solid var(--color-primary, #6366f1);
        `;
    }
  }}

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

/*
 * The effect surface is read from the same --effect-* custom properties the
 * app itself paints with, rather than a hand-written glass and neumorphic
 * variant. Those two were the only effects the preview could show, and they
 * showed fixed values - not the blur, tint or shadow the user had just set.
 */
const EffectButton = styled.button<{ variant?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  color: var(--color-text, #0f172a);
  background: var(--effect-bg, var(--color-surface, #ffffff));
  backdrop-filter: var(--effect-backdrop, none);
  -webkit-backdrop-filter: var(--effect-backdrop, none);
  border: var(--effect-border, 1px solid var(--color-border, #e2e8f0));
  border-radius: var(--effect-radius, 8px);
  box-shadow: var(--effect-shadow, 0 4px 16px rgba(0, 0, 0, 0.1));

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const PreviewButton: React.FC<PreviewButtonProps> = ({
  variant = "primary",
  effectStyle = "standard",
  label,
}) => {
  const ButtonComponent =
    effectStyle === "effect" ? EffectButton : StandardButton;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label ?? (effectStyle === "effect" ? "Effect" : "Standard")} Button
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <ButtonComponent variant={variant}>Primary</ButtonComponent>
        <ButtonComponent variant="secondary">Secondary</ButtonComponent>
        <ButtonComponent variant="outline">Outline</ButtonComponent>
      </Box>
    </Box>
  );
};

export default PreviewButton;
