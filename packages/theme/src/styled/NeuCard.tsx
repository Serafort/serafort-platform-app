import React from 'react';
import { styled } from '@mui/material/styles';
import { computeNeumorphismBoxShadow } from '../utils/computeEffects';
import type { NeumorphismConfig } from '../types';
import type { CSSProperties, ReactNode } from 'react';
import { useComponentEffectConfig } from '../hooks/useComponentEffectConfig';
import { resolveComponentCustomProperties } from '../utils/themeObjectStyles';

export interface NeuCardProps {
  children: ReactNode;
  config?: NeumorphismConfig;
  backgroundColor?: string;
  borderRadius?: string;
  padding?: string;
  style?: CSSProperties;
  className?: string;
}

const StyledNeuCard = styled('div')<Omit<NeuCardProps, 'children'>>(
  ({ theme, backgroundColor, borderRadius, padding, config }) => {
    const defaultBg = backgroundColor || config?.backgroundColor || theme.palette.background.paper || '#e0e5ec';
    const defaultRadius = borderRadius || config?.borderRadius || `${theme.shape.borderRadius || 12}px`;
    const activeConfig: NeumorphismConfig = {
      enabled: true,
      backgroundColor: defaultBg,
      intensity: config?.intensity ?? 0.15,
      distance: config?.distance ?? 5,
      altitude: config?.altitude ?? 10,
      borderRadius: defaultRadius,
      ...config,
    };

    return {
      background: defaultBg,
      borderRadius: defaultRadius,
      padding: padding || theme.spacing(3),
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: computeNeumorphismBoxShadow(activeConfig),
      ...resolveComponentCustomProperties(theme, 'card'),
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: computeNeumorphismBoxShadow({
          ...activeConfig,
          distance: (activeConfig.distance ?? 6) + 2,
        }),
      },
    };
  }
);

export const NeuCard: React.FC<NeuCardProps> = ({
  children,
  config,
  ...props
}) => {
  const effectConfig = useComponentEffectConfig();
  const activeConfig = config || effectConfig.neumorphism;

  return (
    <StyledNeuCard config={activeConfig} {...props}>
      {children}
    </StyledNeuCard>
  );
};

export default NeuCard;

