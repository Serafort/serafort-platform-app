import React from "react";
import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";

interface PreviewInputProps {
  effectStyle?: "standard" | "glass" | "neu";
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

const GlassInput = styled.input`
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.95);
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: rgba(139, 92, 246, 0.8);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  }
`;

const NeuInput = styled.input`
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  background: #e0e5ec;
  border: none;
  border-radius: 8px;
  color: #374151;
  box-shadow:
    inset 4px 4px 8px rgba(0, 0, 0, 0.1),
    inset -4px -4px 8px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    box-shadow:
      inset 2px 2px 4px rgba(0, 0, 0, 0.1),
      inset -2px -2px 4px rgba(255, 255, 255, 0.8);
  }
`;

export const PreviewInput: React.FC<PreviewInputProps> = ({
  effectStyle = "standard",
}) => {
  const InputComponent =
    effectStyle === "glass"
      ? GlassInput
      : effectStyle === "neu"
        ? NeuInput
        : StandardInput;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {effectStyle === "glass"
          ? "Glass"
          : effectStyle === "neu"
            ? "Neumorphic"
            : "Standard"}{" "}
        Input
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <InputComponent placeholder="Default input placeholder" />
        <InputComponent defaultValue="Filled input" />
      </Box>
    </Box>
  );
};

export default PreviewInput;
