import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type { EffectType } from '@cap/theme';

interface PreviewCardProps {
  variant: 'standard' | 'glass' | 'neu';
  effectType?: EffectType;
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

const GlassCardPreview = styled(Paper)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  opacity: 0.9;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const NeuCardPreview = styled.div`
  background: #e0e5ec;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.15), -5px -5px 10px rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 7px 7px 14px rgba(0, 0, 0, 0.18), -7px -7px 14px rgba(255, 255, 255, 0.9);
  }
`;

import styled from '@emotion/styled';

export const PreviewCard: React.FC<PreviewCardProps> = ({
  variant,
  style,
}) => {
  const CardComponent = variant === 'glass' ? GlassCardPreview : variant === 'neu' ? NeuCardPreview : StandardCard;

  return (
    <CardComponent style={style}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {variant === 'glass' ? 'Glass' : variant === 'neu' ? 'Neumorphic' : 'Standard'} Card
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This is a preview of the {variant} card style.
        Hover to see the interactive effect.
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main' }} />
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'secondary.main' }} />
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
      </Box>
    </CardComponent>
  );
};

export default PreviewCard;
