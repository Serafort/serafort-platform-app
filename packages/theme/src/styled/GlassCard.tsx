import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import type { CSSProperties, ReactNode } from 'react';
import {
  getThemeBorderRadius,
  resolveComponentCustomProperties,
  resolveGlassThemeStyles,
} from '../utils/themeObjectStyles';

export interface GlassCardProps {
  children: ReactNode;
  blur?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  opacity?: number;
  borderRadius?: string;
  padding?: string;
  style?: CSSProperties;
  className?: string;
}

const StyledGlassCard = styled('div')<Omit<GlassCardProps, 'children'>>(
  ({ theme, blur, background, borderColor, borderWidth, opacity, borderRadius, padding }) => {
    const glassStyles = resolveGlassThemeStyles(theme);

    return {
      background: background || glassStyles.background || alpha('#ffffff', 0.08),
      backdropFilter: blur ? `blur(${blur})` : glassStyles.backdropFilter,
      WebkitBackdropFilter: blur ? `blur(${blur})` : glassStyles.WebkitBackdropFilter,
      border: `${borderWidth || theme.tenantTheme?.effects.glassmorphism.borderWidth || '1px'} solid ${
        borderColor || theme.tenantTheme?.effects.glassmorphism.borderColor || theme.palette.divider
      }`,
      borderRadius: borderRadius || getThemeBorderRadius(theme, theme.shape.customBorderRadius?.lg || 12),
      padding: padding || theme.spacing(3),
      opacity: opacity ?? theme.tenantTheme?.effects.glassmorphism.opacity ?? glassStyles.opacity ?? 1,
      transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
      boxShadow: theme.customShadows?.lg || theme.shadows[8],
      position: 'relative',
      overflow: 'hidden',
      ...resolveComponentCustomProperties(theme, 'card'),
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
        opacity: 0.1,
        pointerEvents: 'none',
      },
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.customShadows?.xl || theme.shadows[12],
        borderColor:
          borderColor || theme.tenantTheme?.effects.glassmorphism.borderColor || alpha('#ffffff', 0.2),
      },
    };
  },
);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  ...props
}) => {
  return (
    <StyledGlassCard {...props}>
      {children}
    </StyledGlassCard>
  );
};

export default GlassCard;
