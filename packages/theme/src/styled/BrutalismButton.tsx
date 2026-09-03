import { styled } from '@mui/material/styles';
import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import {
  resolveBrutalismThemeStyles,
  resolveComponentCustomProperties,
} from '../utils/themeObjectStyles';

export interface BrutalismButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  borderWidth?: string;
  borderColor?: string;
  shadowOffset?: string;
  shadowColor?: string;
  backgroundColor?: string;
  padding?: string;
}

const StyledBrutalismButton = styled('button')<Omit<BrutalismButtonProps, 'children'>>(
  ({ theme, borderWidth, borderColor, shadowOffset, shadowColor, backgroundColor, padding }) => {
    const brutalStyles = resolveBrutalismThemeStyles(theme);
    const resolvedOffset = shadowOffset || theme.tenantTheme?.effects.brutalism?.shadowOffset || '4px';
    const resolvedColor = shadowColor || theme.tenantTheme?.effects.brutalism?.shadowColor || '#000000';
    const numericOffset = Number.parseFloat(resolvedOffset) || 4;

    return {
      border: `${borderWidth || theme.tenantTheme?.effects.brutalism?.borderWidth || '2px'} solid ${
        borderColor || theme.tenantTheme?.effects.brutalism?.borderColor || '#000000'
      }`,
      boxShadow: `${resolvedOffset} ${resolvedOffset} 0px 0px ${resolvedColor}`,
      backgroundColor: backgroundColor || brutalStyles.backgroundColor,
      color: theme.palette.text.primary,
      padding: padding || theme.spacing(1.25, 2.5),
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeightBold,
      cursor: 'pointer',
      transition: 'all 0.1s ease',
      position: 'relative',
      outline: 'none',
      fontSize: theme.typography.body1.fontSize,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      ...resolveComponentCustomProperties(theme, 'button'),
      '&:hover': {
        transform: 'translate(-1px, -1px)',
        boxShadow: `${numericOffset + 1}px ${numericOffset + 1}px 0px 0px ${resolvedColor}`,
      },
      '&:active': {
        transform: 'translate(2px, 2px)',
        boxShadow: `0px 0px 0px 0px ${resolvedColor}`,
      },
    };
  },
);

export const BrutalismButton: React.FC<BrutalismButtonProps> = ({ children, ...props }) => {
  return <StyledBrutalismButton {...props}>{children}</StyledBrutalismButton>;
};

export default BrutalismButton;
