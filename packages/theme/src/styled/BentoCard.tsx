import { styled } from '@mui/material/styles';
import React, { ReactNode, CSSProperties } from 'react';
import {
  resolveBentoThemeStyles,
  resolveComponentCustomProperties,
} from '../utils/themeObjectStyles';

export interface BentoCardProps {
  children: ReactNode;
  borderRadius?: string;
  background?: string;
  borderWidth?: string;
  borderColor?: string;
  shadow?: string;
  padding?: string;
  style?: CSSProperties;
  className?: string;
}

const StyledBentoCard = styled('div')<Omit<BentoCardProps, 'children'>>(
  ({ theme, borderRadius, background, borderWidth, borderColor, shadow, padding }) => {
    const bentoStyles = resolveBentoThemeStyles(theme);

    return {
      borderRadius: borderRadius || bentoStyles.borderRadius,
      background: background || bentoStyles.background,
      border: `${borderWidth || theme.tenantTheme?.effects.bento?.borderWidth || '1px'} solid ${
        borderColor || theme.tenantTheme?.effects.bento?.borderColor || theme.palette.divider
      }`,
      boxShadow: shadow || bentoStyles.boxShadow,
      padding: padding || theme.spacing(3),
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      ...resolveComponentCustomProperties(theme, 'card'),
      '&:hover': {
        transform: 'scale(1.01)',
        boxShadow: theme.customShadows?.lg || theme.shadows[6],
      },
    };
  },
);

export const BentoCard: React.FC<BentoCardProps> = ({ children, ...props }) => {
  return <StyledBentoCard {...props}>{children}</StyledBentoCard>;
};

export default BentoCard;
