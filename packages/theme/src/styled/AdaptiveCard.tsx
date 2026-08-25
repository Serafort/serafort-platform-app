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
  density?: 'compact' | 'standard' | 'comfortable';
  padding?: string;
  glassConfig?: React.ComponentProps<typeof GlassCard>;
  neuConfig?: React.ComponentProps<typeof NeuCard>;
  brutalismConfig?: React.ComponentProps<typeof BrutalismCard>;
  bentoConfig?: React.ComponentProps<typeof BentoCard>;
  organicConfig?: React.ComponentProps<typeof OrganicCard>;
  immersiveConfig?: React.ComponentProps<typeof ImmersiveCard>;
  className?: string;
  style?: React.CSSProperties;
}

const resolveDensityPadding = (theme: any, density?: 'compact' | 'standard' | 'comfortable', explicitPadding?: string) => {
  if (explicitPadding) return explicitPadding;
  if (density === 'compact') return theme.spacing(2);
  if (density === 'comfortable') return theme.spacing(4);
  return theme.spacing(3);
};

const StandardCard = styled('div')<{ className?: string; style?: React.CSSProperties; padding?: string; density?: 'compact' | 'standard' | 'comfortable' }>(({ theme, density, padding }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minInlineSize: 0,
  wordWrap: 'break-word',
  backgroundClip: 'border-box',
  boxSizing: 'border-box',
  borderRadius: theme.shape.customBorderRadius?.lg || theme.shape.borderRadius,
  padding: resolveDensityPadding(theme, density, padding),
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
  density,
  padding,
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
      return <GlassCard padding={padding || glassConfig?.padding} {...glassConfig} className={className} style={style}>{children}</GlassCard>;
    case 'neu':
      return <NeuCard padding={padding || neuConfig?.padding} {...neuConfig} className={className} style={style}>{children}</NeuCard>;
    case 'brutalism':
      return <BrutalismCard padding={padding || brutalismConfig?.padding} {...brutalismConfig} className={className} style={style}>{children}</BrutalismCard>;
    case 'bento':
      return <BentoCard padding={padding || bentoConfig?.padding} {...bentoConfig} className={className} style={style}>{children}</BentoCard>;
    case 'organic':
      return <OrganicCard padding={padding || organicConfig?.padding} {...organicConfig} className={className} style={style}>{children}</OrganicCard>;
    case 'immersive':
      return <ImmersiveCard padding={padding || immersiveConfig?.padding} {...immersiveConfig} className={className} style={style}>{children}</ImmersiveCard>;
    default:
      return (
        <StandardCard density={density} padding={padding} className={className} style={style}>
          {children}
        </StandardCard>
      );
  }
};

export default AdaptiveCard;
