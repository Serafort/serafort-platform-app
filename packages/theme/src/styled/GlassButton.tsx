import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import {
  getThemeBorderRadius,
  getThemeTextMuted,
  resolveComponentCustomProperties,
  resolveGlassThemeStyles,
} from '../utils/themeObjectStyles';

export interface GlassButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  blur?: string;
  background?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
}

const getVariantStyles = (
  theme: any,
  variant: GlassButtonProps['variant'],
  background: string,
  borderColor: string,
) => {
  switch (variant) {
    case 'secondary':
      return {
        background: alpha(theme.palette.common.white, 0.05),
        borderColor: alpha(theme.palette.common.white, 0.1),
        color: getThemeTextMuted(theme),
        '&:hover': {
          background: alpha(theme.palette.common.white, 0.1),
          color: theme.palette.text.primary,
        },
      };
    case 'outline':
      return {
        background: 'transparent',
        borderColor,
        color: theme.palette.text.primary,
        '&:hover': {
          background: alpha(theme.palette.common.white, 0.05),
          borderColor: alpha(theme.palette.common.white, 0.3),
        },
      };
    case 'ghost':
      return {
        background: 'transparent',
        borderColor: 'transparent',
        color: getThemeTextMuted(theme),
        '&:hover': {
          background: alpha(theme.palette.common.white, 0.05),
          color: theme.palette.text.primary,
        },
      };
    default:
      return {
        background,
        borderColor,
        color: theme.palette.text.primary,
        '&:hover': {
          background: alpha(theme.palette.common.white, 0.15),
          borderColor: alpha(theme.palette.common.white, 0.3),
        },
      };
  }
};

const StyledGlassButton = styled('button')<Omit<GlassButtonProps, 'children'>>(
  ({ theme, variant = 'primary', blur, background, borderColor, borderRadius, padding }) => {
    const glassStyles = resolveGlassThemeStyles(theme);
    const resolvedBackground =
      background || glassStyles.background || alpha(theme.palette.common.white, 0.1);
    const resolvedBorderColor =
      borderColor || theme.tenantTheme?.effects.glassmorphism.borderColor || alpha(theme.palette.common.white, 0.2);

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(1),
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: theme.typography.body2.fontSize,
      backdropFilter: blur ? `blur(${blur})` : glassStyles.backdropFilter,
      WebkitBackdropFilter: blur ? `blur(${blur})` : glassStyles.WebkitBackdropFilter,
      border: '1px solid',
      borderRadius: borderRadius || getThemeBorderRadius(theme),
      padding: padding || theme.spacing(1, 2),
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      ...getVariantStyles(theme, variant, resolvedBackground, resolvedBorderColor),
      ...resolveComponentCustomProperties(theme, 'button'),
      '&:active': {
        transform: 'scale(0.98)',
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none',
      },
    };
  },
);

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <StyledGlassButton {...props}>
      {children}
    </StyledGlassButton>
  );
};

export default GlassButton;
