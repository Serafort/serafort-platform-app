import React from 'react';
import { styled } from '@mui/material/styles';
import { GlassCard } from './GlassCard';
import { NeuCard } from './NeuCard';
import { BrutalismCard } from './BrutalismCard';
import { BentoCard } from './BentoCard';
import { OrganicCard } from './OrganicCard';
import { ImmersiveCard } from './ImmersiveCard';
import type { ComponentEffectStyle, EffectType } from '../types';
import { useComponentEffectConfig } from '../hooks/useComponentEffectConfig';
import { resolveComponentCustomProperties } from '../utils/themeObjectStyles';

export interface AdaptiveCardProps {
  children: React.ReactNode;
  effectStyle?: ComponentEffectStyle;
  globalEffectType?: EffectType;
  glassConfig?: React.ComponentProps<typeof GlassCard>;
  neuConfig?: React.ComponentProps<typeof NeuCard>;
  brutalismConfig?: React.ComponentProps<typeof BrutalismCard>;
  bentoConfig?: React.ComponentProps<typeof BentoCard>;
  organicConfig?: React.ComponentProps<typeof OrganicCard>;
  immersiveConfig?: React.ComponentProps<typeof ImmersiveCard>;
  className?: string;
  style?: React.CSSProperties;
}

const StandardCard = styled('div')<{ className?: string; style?: React.CSSProperties }>(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minInlineSize: 0,
  wordWrap: 'break-word',
  backgroundClip: 'border-box',
  boxSizing: 'border-box',
  borderRadius: theme.shape.customBorderRadius?.lg || theme.shape.borderRadius,
  padding: theme.spacing(3),
  margin: 0,
  background: theme.palette.background.paper,
  boxShadow: theme.customShadows?.md || theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  fontSize: 'inherit',
  fontWeight: 'inherit',
  transition: 'all 0.2s ease',
  ...resolveComponentCustomProperties(theme, 'card'),
  '&:hover': {
    boxShadow: theme.customShadows?.lg || theme.shadows[4],
  },
}));

export const AdaptiveCard: React.FC<AdaptiveCardProps> = ({
  children,
  effectStyle = 'global',
  globalEffectType,
  glassConfig,
  neuConfig,
  brutalismConfig,
  bentoConfig,
  organicConfig,
  immersiveConfig,
  className,
  style,
}) => {
  const styleConfig = useComponentEffectConfig('card');
  const activeGlobalType = globalEffectType || styleConfig.globalType;

  const getActiveStyle = (): ComponentEffectStyle => {
    if (effectStyle === 'global') {
      return activeGlobalType;
    }
    return effectStyle as EffectType;
  };

  const activeStyle = getActiveStyle();

  switch (activeStyle) {
    case 'glass':
      return <GlassCard {...glassConfig} className={className} style={style}>{children}</GlassCard>;
    case 'neu':
      return <NeuCard {...neuConfig} className={className} style={style}>{children}</NeuCard>;
    case 'brutalism':
      return <BrutalismCard {...brutalismConfig} className={className} style={style}>{children}</BrutalismCard>;
    case 'bento':
      return <BentoCard {...bentoConfig} className={className} style={style}>{children}</BentoCard>;
    case 'organic':
      return <OrganicCard {...organicConfig} className={className} style={style}>{children}</OrganicCard>;
    case 'immersive':
      return <ImmersiveCard {...immersiveConfig} className={className} style={style}>{children}</ImmersiveCard>;
    default:
      return (
        <StandardCard className={className} style={style}>
          {children}
        </StandardCard>
      );
  }
};

export default AdaptiveCard;
