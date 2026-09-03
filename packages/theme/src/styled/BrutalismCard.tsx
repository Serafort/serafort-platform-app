import { styled } from '@mui/material/styles';
import React, { ReactNode, CSSProperties } from 'react';
import {
  resolveBrutalismThemeStyles,
  resolveComponentCustomProperties,
} from '../utils/themeObjectStyles';

export interface BrutalismCardProps {
  children: ReactNode;
  borderWidth?: string;
  borderColor?: string;
  shadowOffset?: string;
  shadowColor?: string;
  backgroundColor?: string;
  padding?: string;
  style?: CSSProperties;
  className?: string;
}

const StyledBrutalismCard = styled('div')<Omit<BrutalismCardProps, 'children'>>(
  ({ theme, borderWidth, borderColor, shadowOffset, shadowColor, backgroundColor, padding }) => {
    const brutalStyles = resolveBrutalismThemeStyles(theme);
    const resolvedOffset = shadowOffset || theme.tenantTheme?.effects.brutalism?.shadowOffset || '6px';
    const resolvedColor = shadowColor || theme.tenantTheme?.effects.brutalism?.shadowColor || '#000000';
    const numericOffset = Number.parseFloat(resolvedOffset) || 6;

    return {
      border: `${borderWidth || theme.tenantTheme?.effects.brutalism?.borderWidth || '3px'} solid ${
        borderColor || theme.tenantTheme?.effects.brutalism?.borderColor || '#000000'
      }`,
      boxShadow: `${resolvedOffset} ${resolvedOffset} 0px 0px ${resolvedColor}`,
      backgroundColor: backgroundColor || brutalStyles.backgroundColor,
      padding: padding || theme.spacing(3),
      transition: 'all 0.2s ease',
      position: 'relative',
      boxSizing: 'border-box',
      ...resolveComponentCustomProperties(theme, 'card'),
      '&:hover': {
        transform: 'translate(-2px, -2px)',
        boxShadow: `${numericOffset + 2}px ${numericOffset + 2}px 0px 0px ${resolvedColor}`,
      },
      '&:active': {
        transform: 'translate(2px, 2px)',
        boxShadow: `${Math.max(numericOffset - 2, 0)}px ${Math.max(numericOffset - 2, 0)}px 0px 0px ${resolvedColor}`,
      },
    };
  },
);

export const BrutalismCard: React.FC<BrutalismCardProps> = ({ children, ...props }) => {
  return <StyledBrutalismCard {...props}>{children}</StyledBrutalismCard>;
};

export default BrutalismCard;
