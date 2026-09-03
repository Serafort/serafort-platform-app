import { styled } from '@mui/material/styles';
import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import {
  getThemeBorderRadius,
  resolveComponentCustomProperties,
  resolveImmersiveThemeStyles,
} from '../utils/themeObjectStyles';

export interface ImmersiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  perspective?: string;
  rotationX?: string;
  rotationY?: string;
  depth?: number;
  shadowColor?: string;
  padding?: string;
}

const StyledImmersiveButton = styled('button')<Omit<ImmersiveButtonProps, 'children'>>(
  ({ theme, perspective, rotationX, rotationY, depth, shadowColor, padding }) => {
    const immersiveStyles = resolveImmersiveThemeStyles(theme);
    const resolvedDepth = depth ?? theme.tenantTheme?.effects.immersive?.depth ?? 10;
    const resolvedShadowColor =
      shadowColor || theme.tenantTheme?.effects.immersive?.shadowColor || 'rgba(0,0,0,0.2)';

    return {
      perspective: perspective || theme.tenantTheme?.effects.immersive?.perspective || immersiveStyles.perspective,
      transform: `rotateX(${rotationX || theme.tenantTheme?.effects.immersive?.rotationX || '0deg'}) rotateY(${
        rotationY || theme.tenantTheme?.effects.immersive?.rotationY || '0deg'
      })`,
      boxShadow: `0 ${resolvedDepth / 4}px ${resolvedDepth / 2}px ${resolvedShadowColor},
        0 ${resolvedDepth}px ${resolvedDepth * 1.5}px ${resolvedShadowColor}`,
      background: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      border: 'none',
      borderRadius: getThemeBorderRadius(theme),
      padding: padding || theme.spacing(1.25, 3),
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeightBold,
      cursor: 'pointer',
      transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
      transformStyle: 'preserve-3d',
      ...resolveComponentCustomProperties(theme, 'button'),
      '&:hover': {
        transform: 'rotateX(10deg) rotateY(10deg) translateZ(5px)',
        boxShadow: `0 ${resolvedDepth / 2}px ${resolvedDepth}px ${resolvedShadowColor},
          0 ${resolvedDepth * 2}px ${resolvedDepth * 3}px ${resolvedShadowColor}`,
      },
      '&:active': {
        transform: 'rotateX(0) rotateY(0) translateZ(-2px)',
      },
    };
  },
);

export const ImmersiveButton: React.FC<ImmersiveButtonProps> = ({ children, ...props }) => {
  return <StyledImmersiveButton {...props}>{children}</StyledImmersiveButton>;
};

export default ImmersiveButton;
