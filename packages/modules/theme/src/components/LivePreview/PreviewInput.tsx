import React from "react";
import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";

interface PreviewInputProps {
  effectStyle?: "standard" | "effect";
  label?: string;
}

const StandardInput = styled.input`
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  color: var(--color-text, #0f172a);
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--color-text-muted, #64748b);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary, #6366f1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

/*
 * The effect surface is read from the same --effect-* custom properties the
 * app itself paints with, rather than a hand-written glass and neumorphic
 * variant. Those two were the only effects the preview could show, and they
 * showed fixed values - not the blur, tint or shadow the user had just set.
 */
const EffectInput = styled.input`
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  background: var(--effect-bg, var(--color-surface, #ffffff));
  backdrop-filter: var(--effect-backdrop, none);
  -webkit-backdrop-filter: var(--effect-backdrop, none);
  border: var(--effect-border, 1px solid var(--color-border, #e2e8f0));
  border-radius: var(--effect-radius, 8px);
  box-shadow: var(--effect-shadow, none);
  color: var(--color-text, #0f172a);
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--color-textMuted, #64748b);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary, #6366f1);
  }
`;

export const PreviewInput: React.FC<PreviewInputProps> = ({
  effectStyle = "standard",
  label,
}) => {
  const InputComponent = effectStyle === "effect" ? EffectInput : StandardInput;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label ?? (effectStyle === "effect" ? "Effect" : "Standard")} Input
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <InputComponent placeholder="Default input placeholder" />
        <InputComponent defaultValue="Filled input" />
      </Box>
    </Box>
  );
};

export default PreviewInput;
