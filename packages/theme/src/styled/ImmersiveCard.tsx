import { styled } from '@mui/material/styles';
import React, { ReactNode, CSSProperties } from 'react';
import {
  getThemeBorderRadius,
  resolveComponentCustomProperties,
  resolveImmersiveThemeStyles,
} from '../utils/themeObjectStyles';

export interface ImmersiveCardProps {
  children: ReactNode;
  perspective?: string;
  rotationX?: string;
  rotationY?: string;
  depth?: number;
  shadowColor?: string;
  padding?: string;
  style?: CSSProperties;
  className?: string;
}

const StyledImmersiveCard = styled('div')<Omit<ImmersiveCardProps, 'children'>>(
  ({ theme, perspective, rotationX, rotationY, depth, shadowColor, padding }) => {
    const immersiveStyles = resolveImmersiveThemeStyles(theme);
    const resolvedDepth = depth ?? theme.tenantTheme?.effects.immersive?.depth ?? 20;
    const resolvedShadowColor =
      shadowColor || theme.tenantTheme?.effects.immersive?.shadowColor || 'rgba(0,0,0,0.2)';

    return {
      perspective: perspective || theme.tenantTheme?.effects.immersive?.perspective || immersiveStyles.perspective,
      transform: `rotateX(${rotationX || theme.tenantTheme?.effects.immersive?.rotationX || '0deg'}) rotateY(${
        rotationY || theme.tenantTheme?.effects.immersive?.rotationY || '0deg'
      })`,
      boxShadow: `0 ${resolvedDepth / 4}px ${resolvedDepth / 2}px ${resolvedShadowColor},
        0 ${resolvedDepth}px ${resolvedDepth * 1.5}px ${resolvedShadowColor}`,
      background: theme.palette.background.paper,
      borderRadius: getThemeBorderRadius(theme, theme.shape.customBorderRadius?.lg || 16),
      padding: padding || theme.spacing(3),
      transition: 'transform 0.4s ease-out, box-shadow 0.4s ease-out',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible',
      boxSizing: 'border-box',
      transformStyle: 'preserve-3d',
      ...resolveComponentCustomProperties(theme, 'card'),
      '&:hover': {
        transform: 'rotateX(8deg) rotateY(5deg) translateZ(10px)',
        boxShadow: `0 ${resolvedDepth / 2}px ${resolvedDepth}px ${resolvedShadowColor},
          0 ${resolvedDepth * 2}px ${resolvedDepth * 3}px ${resolvedShadowColor}`,
      },
    };
  },
);

export const ImmersiveCard: React.FC<ImmersiveCardProps> = ({ children, ...props }) => {
  return <StyledImmersiveCard {...props}>{children}</StyledImmersiveCard>;
};

export default ImmersiveCard;
