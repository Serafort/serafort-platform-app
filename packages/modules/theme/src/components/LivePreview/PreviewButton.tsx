import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';
import type { EffectType } from '@cap/theme';

interface PreviewButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  effectStyle?: 'standard' | 'glass' | 'neu';
  effectType?: EffectType;
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
      case 'primary':
        return `
          background: var(--color-primary, #6366f1);
          color: white;
          border: none;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
        `;
      case 'secondary':
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

const GlassButton = styled.button<{ variant?: string }>`
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
  background: rgba(139, 92, 246, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.5);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NeuButton = styled.button`
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
  background: #e0e5ec;
  border: none;
  color: #374151;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.8);

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.8);
    transform: translateY(0);
  }
`;

export const PreviewButton: React.FC<PreviewButtonProps> = ({
  variant = 'primary',
  effectStyle = 'standard',
}) => {
  const ButtonComponent = effectStyle === 'glass' ? GlassButton : effectStyle === 'neu' ? NeuButton : StandardButton;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {effectStyle === 'glass' ? 'Glass' : effectStyle === 'neu' ? 'Neumorphic' : 'Standard'} Button
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <ButtonComponent variant={variant}>
          Primary
        </ButtonComponent>
        <ButtonComponent variant="secondary">
          Secondary
        </ButtonComponent>
        <ButtonComponent variant="outline">
          Outline
        </ButtonComponent>
      </Box>
    </Box>
  );
};

export default PreviewButton;
