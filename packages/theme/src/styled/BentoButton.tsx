import { styled } from '@mui/material/styles';
import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import {
  getThemeBorderRadius,
  resolveBentoThemeStyles,
  resolveComponentCustomProperties,
} from '../utils/themeObjectStyles';

export interface BentoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  borderRadius?: string;
  background?: string;
  borderColor?: string;
  padding?: string;
}

const StyledBentoButton = styled('button')<Omit<BentoButtonProps, 'children'>>(
  ({ theme, borderRadius, background, borderColor, padding }) => {
    const bentoStyles = resolveBentoThemeStyles(theme);

    return {
      borderRadius: borderRadius || bentoStyles.borderRadius || getThemeBorderRadius(theme),
      background: background || theme.tenantTheme?.effects.bento?.background || theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      border: `1px solid ${borderColor || theme.tenantTheme?.effects.bento?.borderColor || 'transparent'}`,
      padding: padding || theme.spacing(1.5, 3),
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeightBold,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      boxShadow: bentoStyles.boxShadow,
      ...resolveComponentCustomProperties(theme, 'button'),
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.customShadows?.lg || theme.shadows[6],
        filter: 'brightness(1.1)',
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: theme.customShadows?.sm || theme.shadows[2],
      },
    };
  },
);

export const BentoButton: React.FC<BentoButtonProps> = ({ children, ...props }) => {
  return <StyledBentoButton {...props}>{children}</StyledBentoButton>;
};

export default BentoButton;
